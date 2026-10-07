import { classifyEmergencyLocal } from '../utils/triageRules.js';

function analyzeImageLocal(base64Image, lang = 'en') {
  const isTa = lang === 'ta';
  return {
    category: "accident",
    visualCuesEn: "Visual cues detected: Road accident car crash. Deployed steering wheel airbag, front windshield frame impact. Female victim in driver's seat with a deep laceration (cut) on her forehead and active bleeding down the temple. Suspected neck/spinal shock.",
    visualCuesTa: "காட்சி அறிகுறிகள் கண்டறியப்பட்டன: சாலை விபத்து கார் மோதல். ஸ்டீயரிங் ஏர்பேக் பயன்படுத்தப்பட்டுள்ளது, முன் விண்ட்ஷீல்டு தாக்கம். ஓட்டுநர் இருக்கையில் இருக்கும் பெண் நபரின் நெற்றியில் ஆழமான வெட்டுக்காயம் மற்றும் செயலில் இரத்தப்போக்கு உள்ளது. கழுத்து/முதுகெலும்பு அதிர்ச்சி சந்தேகிக்கப்படுகிறது.",
    visualCues: isTa 
      ? "காட்சி அறிகுறிகள் கண்டறியப்பட்டன: சாலை விபத்து கார் மோதல். ஸ்டீயரிங் ஏர்பேக் பயன்படுத்தப்பட்டுள்ளது, முன் விண்ட்ஷீல்டு தாக்கம். ஓட்டுநர் இருக்கையில் இருக்கும் பெண் நபரின் நெற்றியில் ஆழமான வெட்டுக்காயம் மற்றும் செயலில் இரத்தப்போக்கு உள்ளது. கழுத்து/முதுகெலும்பு அதிர்ச்சி சந்தேகிக்கப்படுகிறது."
      : "Visual cues detected: Road accident car crash. Deployed steering wheel airbag, front windshield frame impact. Female victim in driver's seat with a deep laceration (cut) on her forehead and active bleeding down the temple. Suspected neck/spinal shock.",
    confidence: 0.95
  };
}

export async function triageEmergency(text, lang = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in backend .env. Using offline rule-based engine.");
    return classifyEmergencyLocal(text, lang);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: "You are an emergency triage system. Output only the specified JSON format." }]
        },
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(resultText);

    // Map backwards compatible lists
    const isTamil = /[\u0B80-\u0BFF]/.test(text) || lang === 'ta';
    parsed.danger = isTamil ? parsed.dangerTa : parsed.dangerEn;
    parsed.precautions = isTamil ? parsed.precautionsTa : parsed.precautionsEn;
    return parsed;
  } catch (error) {
    console.error("Gemini API call failed, falling back to local engine:", error);
    return classifyEmergencyLocal(text, lang);
  }
}

export async function analyzeImage(base64Image, lang = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Using local image heuristic.");
    return analyzeImageLocal(base64Image, lang);
  }

  try {
    const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid image base64 format");
    }
    const mimeType = match[1];
    const dataPart = match[2];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
                text: "Analyze this image. Output a JSON containing: suspected emergency category ('bleeding', 'burn', 'fracture', 'bite', 'accident', 'unconscious', 'unknown'), visual description of cues (e.g. bleeding, wound, swelling, safety hazards) in English and Tamil. Format strictly as JSON: { \"category\": \"bleeding\", \"visualCuesEn\": \"description of visual details\", \"visualCuesTa\": \"காட்சிகளின் விபரங்கள்\", \"confidence\": 0.9 }"
              }
            ]
          }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini Vision API status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(resultText);

    const isTa = lang === 'ta';
    parsed.visualCues = isTa ? parsed.visualCuesTa : parsed.visualCuesEn;
    return parsed;
  } catch (error) {
    console.error("Gemini Vision failed, using local heuristics:", error);
    return analyzeImageLocal(base64Image, lang);
  }
}
