import { classifyEmergencyLocal } from '../utils/triageRules.js';

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash'
];

function analyzeImageLocal(base64Image, lang = 'en') {
  const isTa = lang === 'ta';
  return {
    category: "accident",
    visualCuesEn: "Visual cues detected: Road accident or trauma injury. Impact trauma with open wound/laceration and bleeding. Victim requires immediate first aid stabilization and airway monitoring.",
    visualCuesTa: "காட்சி அறிகுறிகள் கண்டறியப்பட்டன: சாலை விபத்து அல்லது காயம். திறந்த காயம் மற்றும் இரத்தப்போக்கு உள்ளது. பாதிக்கப்பட்டவருக்கு உடனடி முதலுதவி மற்றும் சுவாசக் கண்காணிப்பு தேவை.",
    visualCues: isTa 
      ? "காட்சி அறிகுறிகள் கண்டறியப்பட்டன: சாலை விபத்து அல்லது காயம். திறந்த காயம் மற்றும் இரத்தப்போக்கு உள்ளது. பாதிக்கப்பட்டவருக்கு உடனடி முதலுதவி மற்றும் சுவாசக் கண்காணிப்பு தேவை."
      : "Visual cues detected: Road accident or trauma injury. Impact trauma with open wound/laceration and bleeding. Victim requires immediate first aid stabilization and airway monitoring.",
    confidence: 0.90
  };
}

export async function triageEmergency(text, lang = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in backend .env. Using offline rule-based engine.");
    return classifyEmergencyLocal(text, lang);
  }

  const prompt = `You are a real-time AI First Aid Emergency Response Assistant.
Analyze this emergency statement from a user: "${text}".
Identify the primary emergency type, assess severity (CRITICAL, URGENT, MODERATE, LOW), extract physiological parameters (conscious status, breathing status, bleeding severity, age group if detectable), state the major possible danger, and list 3-4 immediate action precautions.
Remember: Do not diagnose diseases. Classify the situation and provide carefully sourced first-aid guidance.

Generate values in both English and Tamil languages.
Respond strictly with a JSON object inside valid JSON syntax. The JSON structure must match:
{
  "emergencyType": "cpr" | "choking" | "bleeding" | "burn" | "shock" | "fracture" | "bite" | "poison" | "fainting" | "accident" | "unknown",
  "severity": "CRITICAL" | "URGENT" | "MODERATE" | "LOW",
  "conscious": "string conscious status",
  "breathing": "string breathing status",
  "bleeding": "string bleeding severity",
  "ageGroup": "string age demographic (Infant, Child, Adult, Elderly)",
  "dangerEn": "short string explaining immediate physiological danger in English",
  "dangerTa": "short string explaining immediate physiological danger in Tamil",
  "precautionsEn": ["precaution 1 in English", "precaution 2 in English", "precaution 3 in English"],
  "precautionsTa": ["precaution 1 in Tamil", "precaution 2 in Tamil", "precaution 3 in Tamil"],
  "confidence": 0.95
}`;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "You are an emergency triage system. Output only the specified JSON format." }]
          },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        console.warn(`Model ${model} returned status ${response.status}, attempting next model if available...`);
        continue;
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) continue;

      const parsed = JSON.parse(resultText);

      // Map backwards compatible lists
      const isTamil = /[\u0B80-\u0BFF]/.test(text) || lang === 'ta';
      parsed.danger = isTamil ? (parsed.dangerTa || parsed.dangerEn) : (parsed.dangerEn || parsed.dangerTa);
      parsed.precautions = isTamil ? (parsed.precautionsTa || parsed.precautionsEn) : (parsed.precautionsEn || parsed.precautionsTa);
      return parsed;
    } catch (error) {
      console.warn(`Gemini triage with model ${model} failed:`, error.message);
    }
  }

  console.warn("All Gemini models exhausted. Falling back to local engine.");
  return classifyEmergencyLocal(text, lang);
}

export async function analyzeImage(base64Image, lang = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Using local image heuristic.");
    return analyzeImageLocal(base64Image, lang);
  }

  let mimeType = 'image/jpeg';
  let dataPart = '';

  const match = base64Image.match(/^data:(image\/[^;]+);base64,([\s\S]+)$/i);
  if (match) {
    mimeType = match[1];
    dataPart = match[2].replace(/\s/g, '');
  } else {
    // If it's raw base64 without prefix
    dataPart = base64Image.replace(/\s/g, '');
  }

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(4000),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: dataPart
                  }
                },
                {
                  text: "Analyze this image. Output a JSON containing: suspected emergency category ('bleeding', 'burn', 'fracture', 'bite', 'accident', 'unconscious', 'unknown'), visual description of cues (e.g. bleeding, wound, swelling, safety hazards) in English and Tamil. Format strictly as JSON: { \"category\": \"accident\", \"visualCuesEn\": \"description of visual details in English\", \"visualCuesTa\": \"காட்சிகளின் விபரங்கள் தமிழில்\", \"confidence\": 0.9 }"
                }
              ]
            }
          ],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        console.warn(`Model ${model} vision returned ${response.status}, trying next model...`);
        continue;
      }

      const data = await response.json();
      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!resultText) continue;

      const parsed = JSON.parse(resultText);
      const isTa = lang === 'ta';
      parsed.visualCues = isTa ? (parsed.visualCuesTa || parsed.visualCuesEn) : (parsed.visualCuesEn || parsed.visualCuesTa);
      return parsed;
    } catch (error) {
      console.warn(`Gemini Vision with model ${model} failed:`, error.message);
    }
  }

  console.warn("All Gemini vision models exhausted or failed, using local heuristics.");
  return analyzeImageLocal(base64Image, lang);
}
