import { identifySubstance, analyzeExposure } from '../services/substanceMatchingService.js';

/**
 * Controller to search and analyze an exposed substance
 * Supports GET (query params) and POST (rich JSON body)
 */
export async function searchPoison(req, res, next) {
  try {
    const rawSubstance = req.method === 'POST'
      ? req.body.substance
      : req.query.substance;

    const brandName = req.method === 'POST' ? req.body.brandName : req.query.brandName;
    const activeIngredient = req.method === 'POST' ? req.body.activeIngredient : req.query.activeIngredient;
    const amount = req.method === 'POST' ? req.body.amount : req.query.amount;
    const timeSince = req.method === 'POST' ? req.body.timeSince : req.query.timeSince;
    const ageGroup = (req.method === 'POST' ? req.body.ageGroup : req.query.ageGroup) || 'Adult';
    const weight = req.method === 'POST' ? req.body.weight : req.query.weight;
    const exposureRoute = (req.method === 'POST' ? req.body.exposureRoute : req.query.exposureRoute) || 'swallowed';
    const symptoms = req.method === 'POST' ? (req.body.symptoms || []) : (req.query.symptoms ? [req.query.symptoms] : []);

    if (!rawSubstance && !brandName && !activeIngredient) {
      return res.status(400).json({
        error: "Please provide a substance name, brand name, or active ingredient."
      });
    }

    // 1. Identify substance via the pipeline
    const matchResult = await identifySubstance({
      substance: rawSubstance,
      brandName,
      activeIngredient
    });

    // 2. Perform exposure risk and first-aid analysis
    const analysis = analyzeExposure({
      substanceMatch: matchResult,
      exposureRoute,
      amount,
      timeSince,
      ageGroup,
      weight,
      symptoms
    });

    return res.json(analysis);
  } catch (error) {
    console.error("Poison search error:", error);
    next(error);
  }
}

/**
 * Controller to extract label details from an uploaded product label or medicine package image
 * POST /api/poison/analyze-label
 */
export async function analyzeProductLabel(req, res, next) {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image data is required as base64 string." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Default response if vision AI is unavailable
    let extracted = {
      productName: "",
      brandName: "",
      activeIngredients: [],
      concentration: "",
      warnings: "",
      detectedText: "Label analysis performed."
    };

    if (apiKey) {
      try {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        const mimeType = match ? match[1] : 'image/jpeg';
        const dataPart = match ? match[2] : image;

        const prompt = `Analyze this image of a product label, medicine package, cleaning chemical, or pesticide container.
Extract only the text clearly visible on the label:
1. productName: Name of the product (e.g. "Dolo 650", "Clorox Bleach", "Harpic Power Plus").
2. brandName: Brand or manufacturer (e.g. "Micro Labs", "Clorox", "Reckitt").
3. activeIngredients: List of active ingredients printed on the label (e.g. ["Paracetamol", "Sodium Hypochlorite 4%"]).
4. concentration: Any concentration or strength printed (e.g. "650 mg", "5%", "100 ml").
5. warnings: Warning statements or hazard symbols visible (e.g. "Keep out of reach of children", "Corrosive", "Poison").

IMPORTANT:
- Extract ONLY what is visible on the label.
- Do NOT guess or invent missing ingredients.
- If text is blurred or unreadable, leave the fields empty and set confidence to "LOW".

Respond strictly with valid JSON:
{
  "productName": "string",
  "brandName": "string",
  "activeIngredients": ["string"],
  "concentration": "string",
  "warnings": "string",
  "confidence": "HIGH" | "MEDIUM" | "LOW"
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType, data: dataPart } },
                  { text: prompt }
                ]
              }
            ],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          extracted = { ...extracted, ...parsed };
        }
      } catch (visionErr) {
        console.warn("Vision AI label extraction error:", visionErr.message);
      }
    }

    // Now run extracted product name / active ingredients through the substance pipeline
    const queryCandidate = (extracted.activeIngredients && extracted.activeIngredients[0]) || extracted.productName || extracted.brandName;
    let pipelineMatch = null;
    if (queryCandidate) {
      pipelineMatch = await identifySubstance({
        substance: queryCandidate,
        brandName: extracted.brandName,
        activeIngredient: (extracted.activeIngredients || [])[0]
      });
    }

    return res.json({
      extracted,
      pipelineMatch
    });

  } catch (error) {
    console.error("Label analysis error:", error);
    next(error);
  }
}
