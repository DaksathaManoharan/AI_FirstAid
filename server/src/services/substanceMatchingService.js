import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const substancesDbPath = path.join(__dirname, '../data/substancesDatabase.json');

// Load substances database in memory
let substancesDatabase = [];
try {
  const content = fs.readFileSync(substancesDbPath, 'utf8');
  substancesDatabase = JSON.parse(content);
} catch (err) {
  console.error("Failed to load substances database:", err.message);
}

/**
 * Normalizes text: trims, lowercases, and strips conversational filler words
 */
export function normalizeQuery(query) {
  if (!query || typeof query !== 'string') return '';
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\b(i|he|she|they|my|friend|baby|child|drank|swallowed|took|ate|licked|touched|splashed|accidentally|exposure|to|a|little|bit|of|some|amount|tablet|tablets|pills|liquid|syrup|drop|drops|bottle|can)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates standard Levenshtein distance between two strings
 */
function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const d = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

/**
 * Returns string similarity ratio between 0.0 and 1.0
 */
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  return (maxLen - distance) / maxLen;
}

/**
 * Level 4: External Authoritative Lookup via US NIH PubChem REST API
 * Free, authoritative, public chemical database.
 */
async function lookupPubChem(query) {
  const clean = encodeURIComponent(query);
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${clean}/property/Title,IUPACName,MolecularFormula/JSON`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const prop = data?.PropertyTable?.Properties?.[0];
    if (!prop || !prop.Title) return null;

    return {
      title: prop.Title,
      iupacName: prop.IUPACName || prop.Title,
      molecularFormula: prop.MolecularFormula || '',
      source: 'US National Library of Medicine (PubChem)'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Level 5: AI-Assisted Entity Interpretation (Gemini)
 * Strictly constrained: Interprets queries and maps brand names without inventing doses or antidotes.
 */
async function interpretWithAI(rawText, cleanQuery) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a medical toxicology entity resolution assistant.
Analyze this user statement about an exposed chemical, medication, or household product:
"${rawText}" (Normalized query: "${cleanQuery}")

Identify:
1. canonicalName: Generic or chemical name of the substance (e.g. "Paracetamol", "Sodium Hypochlorite", "Chloroxylenol", "Kerosene").
2. brandName: Identified brand name if mentioned (e.g. "Dettol", "Crocin", "Harpic"), or null.
3. activeIngredient: Main active chemical ingredient, or null.
4. category: Medical/chemical classification (e.g. "Analgesic", "Mineral Acid", "Household Bleach", "Hydrocarbon"), or null.
5. confidence: "HIGH" (exact unambiguous product), "MEDIUM" (probable synonym or close brand match), "LOW" (vague clue), or "NONE" (cannot identify).

SAFETY RULES:
- DO NOT invent chemical ingredients for unknown brands.
- DO NOT invent toxic doses, safe doses, or medical treatments.
- If the statement is too vague or unknown, output "NONE" for confidence and null for substance.

Respond strictly with valid JSON matching:
{
  "canonicalName": "string or null",
  "brandName": "string or null",
  "activeIngredient": "string or null",
  "category": "string or null",
  "confidence": "HIGH" | "MEDIUM" | "LOW" | "NONE"
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(resultText);
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Searches the local database for exact or substring matches
 */
function findLocalMatch(cleanQuery) {
  if (!cleanQuery) return null;

  for (const item of substancesDatabase) {
    const canonical = item.canonical_name.toLowerCase();
    const generic = (item.generic_name || '').toLowerCase();
    const brands = (item.brand_names || []).map(b => b.toLowerCase());
    const synonyms = (item.synonyms || []).map(s => s.toLowerCase());
    const actives = (item.active_ingredients || []).map(a => a.toLowerCase());
    const chemicals = (item.chemical_names || []).map(c => c.toLowerCase());

    // 1. Exact match on any field
    if (canonical === cleanQuery || generic === cleanQuery || brands.includes(cleanQuery) || synonyms.includes(cleanQuery) || actives.includes(cleanQuery) || chemicals.includes(cleanQuery)) {
      return {
        matchedItem: item,
        matchType: 'EXACT',
        matchedTerm: cleanQuery,
        confidenceScore: 0.98,
        confidenceLevel: 'HIGH'
      };
    }

    // 2. Word boundary / inclusion match
    const allAliases = [canonical, generic, ...brands, ...synonyms, ...actives, ...chemicals];
    for (const alias of allAliases) {
      if (alias.length >= 3) {
        if (cleanQuery === alias || cleanQuery.startsWith(alias + ' ') || cleanQuery.endsWith(' ' + alias) || cleanQuery.includes(' ' + alias + ' ')) {
          return {
            matchedItem: item,
            matchType: 'INCLUSION',
            matchedTerm: alias,
            confidenceScore: 0.94,
            confidenceLevel: 'HIGH'
          };
        }
      }
    }
  }

  // 3. Fuzzy similarity / typo tolerance
  let bestFuzzy = null;
  let highestSim = 0;

  for (const item of substancesDatabase) {
    const candidates = [
      item.canonical_name,
      item.generic_name,
      ...(item.brand_names || []),
      ...(item.synonyms || []),
      ...(item.active_ingredients || [])
    ];

    for (const cand of candidates) {
      const sim = calculateSimilarity(cleanQuery, cand);
      if (sim > highestSim && sim >= 0.80) {
        highestSim = sim;
        bestFuzzy = {
          matchedItem: item,
          matchType: 'FUZZY',
          matchedTerm: cand,
          confidenceScore: Math.round(sim * 94) / 100,
          confidenceLevel: sim >= 0.88 ? 'MEDIUM' : 'LOW'
        };
      }
    }
  }

  return bestFuzzy;
}

/**
 * Main Substance Identification Pipeline
 */
export async function identifySubstance(rawInput) {
  const rawQuery = (typeof rawInput === 'string' ? rawInput : (rawInput?.substance || '')).trim();
  const brandInput = (rawInput?.brandName || '').trim();
  const activeInput = (rawInput?.activeIngredient || '').trim();

  // Combine query candidates
  const candidatesToTry = [
    activeInput,
    brandInput,
    rawQuery
  ].filter(Boolean);

  for (const queryText of candidatesToTry) {
    const clean = normalizeQuery(queryText);
    if (!clean) continue;

    // Step 1: Local Exact, Substring, and Fuzzy match
    const localMatch = findLocalMatch(clean);
    if (localMatch && localMatch.confidenceScore >= 0.80) {
      return {
        identified: true,
        substance: localMatch.matchedItem,
        confidenceLevel: localMatch.confidenceLevel, // HIGH or MEDIUM
        confidenceScore: localMatch.confidenceScore,
        matchedBy: localMatch.matchType,
        matchedTerm: localMatch.matchedTerm,
        source: 'Local Authoritative Toxicology Database'
      };
    }

    // Step 2: External PubChem Database Lookup
    try {
      const pubChemResult = await lookupPubChem(clean);
      if (pubChemResult && pubChemResult.title) {
        // Check if PubChem compound corresponds to an existing toxicological class in our database
        const localRel = findLocalMatch(pubChemResult.title.toLowerCase());
        if (localRel) {
          return {
            identified: true,
            substance: {
              ...localRel.matchedItem,
              external_title: pubChemResult.title,
              iupac_name: pubChemResult.iupacName,
              molecular_formula: pubChemResult.molecularFormula
            },
            confidenceLevel: 'MEDIUM',
            confidenceScore: 0.88,
            matchedBy: 'EXTERNAL_PUBCHEM_MAPPED',
            matchedTerm: pubChemResult.title,
            source: pubChemResult.source
          };
        }
      }
    } catch (pubErr) {
      console.warn("PubChem lookup error:", pubErr.message);
    }
  }

  // Step 3: AI-Assisted Entity Interpretation (Gemini)
  const cleanPrimary = normalizeQuery(rawQuery);
  if (cleanPrimary.length >= 3) {
    try {
      const aiResult = await interpretWithAI(rawQuery, cleanPrimary);
      if (aiResult && aiResult.confidence !== 'NONE' && aiResult.canonicalName) {
        const localFromAi = findLocalMatch(normalizeQuery(aiResult.canonicalName));
        if (localFromAi) {
          return {
            identified: true,
            substance: localFromAi.matchedItem,
            confidenceLevel: aiResult.confidence === 'HIGH' ? 'MEDIUM' : 'LOW',
            confidenceScore: aiResult.confidence === 'HIGH' ? 0.85 : 0.65,
            matchedBy: 'AI_ASSISTED_ENTITY_MATCH',
            matchedTerm: aiResult.canonicalName,
            brandIdentified: aiResult.brandName,
            source: 'AI Entity Recognition validated against Toxicology Database'
          };
        }
      }
    } catch (aiErr) {
      console.warn("AI interpretation failed:", aiErr.message);
    }
  }

  // Step 4: No reliable match found
  return {
    identified: false,
    substance: null,
    confidenceLevel: 'NO_MATCH',
    confidenceScore: 0.15,
    matchedBy: 'NONE',
    messageEn: "Unable to reliably identify this substance. Do not guess. Please verify the product label or active ingredient, and contact an appropriate poison-control or emergency service.",
    messageTa: "இந்த விஷப் பொருளை உறுதியாக அடையாளம் காண முடியவில்லை. யூகிக்க வேண்டாம். தயாரிப்பு அட்டையிலுள்ள மூலப்பொருளைச் சரிபார்த்து நச்சு கட்டுப்பாட்டு மையத்தை (1800-116-117) அல்லது 112ஐ அழைக்கவும்.",
    requiresLabelVerification: true
  };
}

/**
 * Analyzes exposure parameters and generates evidence-based first-aid response
 */
export function analyzeExposure({
  substanceMatch,
  exposureRoute = 'swallowed',
  amount = '',
  timeSince = '',
  ageGroup = 'Adult',
  weight = '',
  symptoms = []
}) {
  const normRoute = (exposureRoute || 'swallowed').toLowerCase();
  const symptomsList = Array.isArray(symptoms) ? symptoms : [symptoms].filter(Boolean);

  // Check critical life-threatening red-flags
  const criticalSymptoms = [
    'unconscious', 'unresponsive', 'seizure', 'convulsion', 'breathing difficulty',
    'choking', 'not breathing', 'vomiting blood', 'collapsed', 'cyanosis'
  ];
  const hasCriticalRedFlag = symptomsList.some(s => 
    criticalSymptoms.some(cs => s.toLowerCase().includes(cs))
  );

  if (!substanceMatch.identified) {
    // Fallback safe general first-aid guidance for unidentified substances
    return {
      identified: false,
      confidence: {
        level: 'NO_MATCH',
        score: 0.15,
        badgeText: 'Unable to Identify',
        noteEn: 'Unable to reliably identify this substance. Do not guess. Verify product label.',
        noteTa: 'பொருளை உறுதியாக அடையாளம் காண முடியவில்லை. லேபிளைச் சரிபார்க்கவும்.'
      },
      substanceName: 'Unidentified Substance',
      category: 'Unknown Chemical / Toxin',
      dangerLevel: 'CRITICAL',
      exposure: {
        route: normRoute,
        amount: amount || 'Unspecified',
        timeSince: timeSince || 'Immediate',
        ageGroup,
        weight: weight || 'Not specified'
      },
      immediateFirstAid: {
        en: normRoute === 'eye'
          ? "CRITICAL: Flush eyes immediately with gentle running water for 15-20 minutes. Do not rub eyes. Call 112/108 immediately with product container."
          : normRoute === 'skin'
          ? "Remove contaminated clothing. Wash skin thoroughly with running water for 15 minutes. Call emergency services."
          : normRoute === 'inhaled'
          ? "Move patient to fresh outdoor air immediately. If patient has breathing difficulty, call 112/108 immediately."
          : "Do NOT induce vomiting (induces chemical burns or aspiration if corrosive/petroleum). Check breathing and alertness. If patient is unconscious or having seizures, call 112/108 immediately. Secure the chemical container or packaging for medical analysis.",
        ta: normRoute === 'eye'
          ? "கண்களை உடனடியாக 15-20 நிமிடங்கள் ஓடும் நீரால் கழுவவும். கண்களைத் தேய்க்க வேண்டாம். நச்சு பாட்டிலுடன் உடனே மருத்துவமனைக்குச் செல்லவும்."
          : normRoute === 'skin'
          ? "நனைந்த ஆடைகளை கழற்றிவிட்டு 15 நிமிடங்களுக்கு தோலை நீரால் கழுவவும்."
          : normRoute === 'inhaled'
          ? "உடனே வெளிக்காற்றிற்கு மாற்றவும். மூச்சு விடுவதில் சிரமம் இருந்தால் 112/108ஐ அழைக்கவும்."
          : "வாந்தி எடுக்க வைக்க வேண்டாம் (அமிலம் அல்லது மண்ணெண்ணெய் என்றால் உணவுக்குழாய் மற்றும் நுரையீரல் அழியும்). சுயநினைவு மற்றும் சுவாசத்தை சரிபார்க்கவும். சுயநினைவு இல்லையெனில் உடனே 112/108 ஐ அழைக்கவும். நச்சு பாட்டிலை பத்திரப்படுத்தவும்."
      },
      warningSigns: [
        "Loss of consciousness or unresponsiveness",
        "Breathing difficulty, stridor, or choking",
        "Seizures or uncontrolled muscle tremors",
        "Vomiting fresh blood or brown coffee-ground material",
        "Extreme burns, pain, or drooling in mouth"
      ],
      nextSteps: {
        en: "Do NOT wait for symptoms to worsen. Call the National Poison Information Centre (AIIMS) at 1800-116-117 or 011-26588669, or dial 112/108 for ambulance dispatch.",
        ta: "அறிகுறிகள் தீவிரமடையும் வரை காத்திருக்க வேண்டாம். தேசிய நச்சு தகவல் மையத்தை (1800-116-117) அல்லது 112/108ஐ உடனடியாக அழைக்கவும்."
      },
      isEmergencyAlert: hasCriticalRedFlag,
      helpline: "National Poison Information Centre (AIIMS): 1800-116-117 / 011-26588669 | Emergency: 112 / 108"
    };
  }

  const sub = substanceMatch.substance;
  const routeGuidance = sub.exposure_guidance?.[normRoute] || sub.exposure_guidance?.swallowed || {
    first_aid_en: "Do not induce vomiting. Seek medical attention immediately.",
    first_aid_ta: "வாந்தி எடுக்க வைக்க வேண்டாம். உடனடியாக மருத்துவ உதவி பெறவும்."
  };

  // Confidence metadata
  let badgeText = 'High-Confidence Match';
  let noteEn = 'Exact ingredient/product match confirmed.';
  let noteTa = 'உறுதிப்படுத்தப்பட்ட நேரடிப் பொருத்தம்.';

  if (substanceMatch.confidenceLevel === 'MEDIUM') {
    badgeText = 'Possible Match — Verify Label';
    noteEn = `Matched via synonym/brand (${substanceMatch.matchedTerm}). Please verify active ingredient on the product label.`;
    noteTa = `ஒத்த பெயர் மூலம் கண்டறியப்பட்டது (${substanceMatch.matchedTerm}). தயாரிப்பு லேபிளைச் சரிபார்க்கவும்.`;
  } else if (substanceMatch.confidenceLevel === 'LOW') {
    badgeText = 'Low-Confidence Match — Verification Required';
    noteEn = 'Possible match with low certainty. Please check the active ingredient on container.';
    noteTa = 'குறைந்த நம்பிக்கையுடன் கூடிய பொருத்தம். பாட்டிலின் மூலப்பொருளைச் சரிபார்க்கவும்.';
  }

  return {
    identified: true,
    confidence: {
      level: substanceMatch.confidenceLevel,
      score: substanceMatch.confidenceScore,
      badgeText,
      noteEn,
      noteTa
    },
    substanceName: sub.canonical_name,
    genericName: sub.generic_name,
    category: sub.category,
    activeIngredients: sub.active_ingredients || [],
    dangerLevel: sub.risk_level || 'URGENT',
    description: sub.description,
    exposure: {
      route: normRoute,
      amount: amount || 'Unspecified',
      timeSince: timeSince || 'Recent',
      ageGroup,
      weight: weight || 'Not specified'
    },
    immediateFirstAid: {
      en: routeGuidance.first_aid_en,
      ta: routeGuidance.first_aid_ta
    },
    warningSigns: sub.warning_signs || [
      "Breathing difficulty or choking",
      "Persistent vomiting or blood in vomit",
      "Drowsiness, confusion, or loss of consciousness",
      "Seizures"
    ],
    contraindications: sub.contraindications,
    nextSteps: {
      en: `Keep the packaging and container available. If any warning signs or respiratory compromise occur, dial 112/108 immediately. Call Poison Information Centre at ${sub.helpline || '1800-116-117'}.`,
      ta: `தயாரிப்பு பாட்டிலை பத்திரப்படுத்தவும். ஏதேனும் எச்சரிக்கை அறிகுறிகள் தோன்றினால் உடனடியாக 112/108ஐ அழைக்கவும். நச்சு தகவல் மையத்தை (${sub.helpline || '1800-116-117'}) தொடர்பு கொள்ளவும்.`
    },
    isEmergencyAlert: hasCriticalRedFlag || sub.risk_level === 'CRITICAL',
    helpline: sub.helpline || "National Poison Information Centre (AIIMS): 1800-116-117 / 011-26588669 | Emergency: 112 / 108"
  };
}
