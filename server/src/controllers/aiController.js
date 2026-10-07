import { triageEmergency, analyzeImage } from '../services/aiService.js';

// Pre-screen keywords for immediate safety warnings
const CRITICAL_KEYWORDS = [
  "not breathing", "unconscious", "passed out", "heavy bleeding", "bleeding heavily",
  "choking", "chest pain", "allergic reaction", "electric shock", "poisoning", "poison",
  "snake bite", "animal bite", "accident", "no pulse", "heart attack", "stroke",
  "மூச்சு இல்லை", "சுயநினைவு இல்லை", "மயக்கம்", "பாம்பு", "இரத்தப்போக்கு", "விபத்து"
];

function checkCriticalSafety(text) {
  const query = (text || '').toLowerCase();
  return CRITICAL_KEYWORDS.some(kw => query.includes(kw));
}

export async function triage(req, res, next) {
  try {
    const { description, language } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: "Request body must contain 'description'." });
    }

    const isCritical = checkCriticalSafety(description);
    
    // Call Gemini API triage (with local rules fallback internally)
    const result = await triageEmergency(description, language || 'en');

    // Override or assert safety if critical keywords are present
    if (isCritical) {
      result.severity = "CRITICAL";
      result.whenToCallEmergency = true;
    } else {
      result.whenToCallEmergency = result.severity === 'CRITICAL' || result.severity === 'URGENT';
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function analyzeIncidentImage(req, res, next) {
  try {
    const { image, language } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Request body must contain 'image' as base64 data URL." });
    }

    const result = await analyzeImage(image, language || 'en');
    res.json(result);
  } catch (error) {
    next(error);
  }
}
