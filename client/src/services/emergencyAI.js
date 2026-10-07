/**
 * AI First Aid Emergency Severity Engine & Gemini Connector (Bilingual Fields Enabled)
 */

// Local rule-based classifier (offline/no-API fallback)
export function classifyEmergencyLocal(text, lang = 'en') {
  const query = text.toLowerCase();
  const isTamil = /[\u0B80-\u0BFF]/.test(text) || lang === 'ta';
  
  let emergencyType = "unknown";
  let severity = "MODERATE";
  let conscious = isTamil ? "தெரியவில்லை" : "Unsure";
  let breathing = isTamil ? "தெரியவில்லை" : "Unsure";
  let bleeding = isTamil ? "இல்லை" : "None";
  let ageGroup = isTamil ? "பெரியவர்" : "Adult"; // Default

  // Declare both languages variables
  let dangerEn = "Assess immediate environment safety.";
  let dangerTa = "சுற்றுப்புறப் பாதுகாப்பு மற்றும் நோயாளி நிலையை மதிப்பிடவும்.";
  let precautionsEn = ["Call 112/108 emergency services immediately."];
  let precautionsTa = ["உடனடியாக 112/108 அவசர சேவைகளை அழைக்கவும்."];

  // Age group detection (English & Tamil keywords)
  if (/\b(baby|infant|newborn|toddler)\b/i.test(query) || /குழந்தை|பாப்பா/i.test(query)) {
    ageGroup = isTamil ? "குழந்தை" : "Infant";
  } else if (/\b(child|kid|boy|girl|son|daughter)\b/i.test(query) || /சிறுவன்|சிறுமி|மகன்|மகள்/i.test(query)) {
    ageGroup = isTamil ? "சிறுவர்" : "Child";
  } else if (/\b(elderly|old|grandpa|grandma|senior)\b/i.test(query) || /முதியவர்|தாத்தா|பாட்டி/i.test(query)) {
    ageGroup = isTamil ? "முதியவர்" : "Elderly";
  }

  // Conscious status
  if (/\b(unconscious|passed out|fainted|knocked out|not awake|not responding|no response)\b/i.test(query) || /மயக்கம்|நினைவிழந்த|மயங்கி|சுயநினைவு இல்லை/i.test(query)) {
    conscious = isTamil ? "இல்லை" : "No";
  } else if (/\b(conscious|awake|talking)\b/i.test(query) || /சுயநினைவு உள்ளது|விழிப்புடன்/i.test(query)) {
    conscious = isTamil ? "உள்ளது" : "Yes";
  }

  // Breathing status
  if (/\b(not breathing|no breath|stopped breathing|blue lips)\b/i.test(query) || /மூச்சு இல்லை|சுவாசிக்கவில்லை/i.test(query)) {
    breathing = isTamil ? "இல்லை" : "None";
  } else if (/\b(gasping|choking|difficulty breathing|breathless)\b/i.test(query) || /மூச்சுத்திணறல்|மூச்சுவிட சிரமம்/i.test(query)) {
    breathing = isTamil ? "சீரற்றது" : "Abnormal";
  } else if (/\b(breathing normally|breathing okay)\b/i.test(query) || /சுவாசிக்கிறார்/i.test(query)) {
    breathing = isTamil ? "சாதாரணமானது" : "Normal";
  }

  // Bleeding status
  if (/\b(bleeding heavily|gushing|blood everywhere|cut artery|spurting|severed)\b/i.test(query) || /அதிக இரத்தம்|இரத்தம் கொட்டுகிறது/i.test(query)) {
    bleeding = isTamil ? "கடுமையானது" : "Severe";
  } else if (/\b(bleeding|blood|cut|scrape|wound|injured)\b/i.test(query) || /இரத்தம்|காயம்|வெட்டு/i.test(query)) {
    bleeding = isTamil ? "லேசானது" : "Minor";
  }

  // Emergency category detection
  if (/\b(cpr|heart attack|cardiac|unconscious|no pulse|not breathing)\b/i.test(query) || /மாரடைப்பு|சுயநினைவில்லை|மூச்சு இல்லை|சிபிஆர்|நெஞ்சு வலி/i.test(query)) {
    emergencyType = "cpr";
    severity = (conscious === "No" || conscious === "இல்லை" || breathing === "None" || breathing === "இல்லை") ? "CRITICAL" : "URGENT";
    
    dangerEn = "Brain damage can occur within 4 minutes without oxygen.";
    dangerTa = "ஆக்சிஜன் இல்லாமல் 4 நிமிடங்களில் மூளை பாதிப்பு ஏற்படலாம்.";
    
    precautionsEn = [
      "Ensure the scene is safe for you and the victim.",
      "Check responsiveness: tap shoulders and shout.",
      "Call 112/108 or direct someone to do so.",
      "Begin chest compressions immediately if not breathing."
    ];
    precautionsTa = [
      "உங்களுக்கும் நோயாளிக்கும் சுற்றுப்புறம் பாதுகாப்பானது என்பதை உறுதிப்படுத்தவும்.",
      "நோயாளிக்கு தோள்களைத் தட்டி சத்தமாக அழைத்து சுயநினைவை சரிபார்க்கவும்.",
      "உடனடியாக 112/108 அவசர எண்ணை அழைக்கவும்.",
      "மூச்சு இல்லாவிட்டால் உடனே மார்பு அழுத்தங்களை (CPR) தொடங்கவும்."
    ];
  } else if (/\b(choke|choking|gasp|airway|swallowed toy|throat)\b/i.test(query) || /தொண்டை அடைப்பு|மூச்சுத்திணறல்|பொருள் அடைப்பு/i.test(query)) {
    emergencyType = "choking";
    severity = "CRITICAL";
    
    dangerEn = "Complete airway obstruction leading to asphyxiation.";
    dangerTa = "சுவாசப்பாதை அடைப்பு மூச்சுத்திணறலுக்கு வழிவகுக்கும்.";
    
    precautionsEn = [
      "Ask 'Are you choking?'",
      "If they can cough or speak, encourage them to cough.",
      "If they cannot cough, speak, or breathe, act immediately.",
      "Prepare to give abdominal thrusts (Heimlich maneuver) or back blows."
    ];
    precautionsTa = [
      "அடைப்பு ஏற்பட்டுள்ளதா என்று கேட்டு தலையை அசைக்கச் சொல்லவும்.",
      "அவர்களால் பேசவோ இருமவோ முடிந்தால், தொடர்ந்து இரும ஊக்குவிக்கவும்.",
      "பேசவோ சுவாசிக்கவோ முடியாவிட்டால், உடனடியாக நடவடிக்கை எடுக்கவும்.",
      "முதுகு தட்டுகள் மற்றும் வயிற்று அழுத்தங்களை (ஹெய்ம்லிச் முறை) கொடுக்கவும்."
    ];
  } else if (/\b(bleed|bleeding|blood|wound|cut|laceration)\b/i.test(query) || /இரத்தம்|இரத்தப்போக்கு|காயம்|வெட்டுக்காயம்/i.test(query)) {
    emergencyType = "bleeding";
    severity = (bleeding === "Severe" || bleeding === "கடுமையானது") ? "CRITICAL" : "URGENT";
    
    dangerEn = "Severe blood loss leads to hypovolemic shock.";
    dangerTa = "அதிக இரத்த இழப்பு உயிருக்கு ஆபத்தான அதிர்ச்சியை (Shock) ஏற்படுத்தும்.";
    
    precautionsEn = [
      "Apply direct pressure to the wound with a clean cloth/bandage.",
      "Elevate the injured limb above heart level if possible.",
      "Do not remove embedded objects; stabilize them in place.",
      "Keep the person warm and lying down if showing signs of shock."
    ];
    precautionsTa = [
      "சுத்தமான துணி அல்லது மலட்டு பஞ்சு கொண்டு காயத்தின் மீது நேரடியாக அழுத்தம் கொடுக்கவும்.",
      "முடிந்தால், காயம் பட்ட இடத்தை இதய மட்டத்திற்கு மேல் உயர்த்தவும்.",
      "உடலில் குத்தியிருக்கும் பொருட்களை எடுக்க வேண்டாம்; அவற்றை நிலையாக வைக்கவும்.",
      "நோயாளியை படுக்கவைத்து உடலை கதகதப்பாக வைத்திருக்கவும்."
    ];
  } else if (/\b(burn|burned|fire|scald|acid|steam|heat)\b/i.test(query) || /தீக்காயம்|நெருப்பு|சுடுதண்ணீர்|அமிலம்/i.test(query)) {
    emergencyType = "burn";
    severity = /\b(severe|third degree|chemical|face)\b/i.test(query) ? "CRITICAL" : "URGENT";
    
    dangerEn = "Infection, dehydration, and airway swelling (if inhalation occurred).";
    dangerTa = "நீர்ச்சத்து இழப்பு மற்றும் தோலில் தொற்று கிருமி பரவும் அபாயம்.";
    
    precautionsEn = [
      "Cool the burn immediately with cool running water for 10-20 minutes.",
      "Do NOT apply ice, butter, toothpaste, or ointments.",
      "Remove tight clothing/jewelry before swelling begins.",
      "Cover loosely with a clean, non-stick sterile dressing or plastic wrap."
    ];
    precautionsTa = [
      "உடனடியாக குளிர்ந்த ஓடும் நீரில் காயத்தை 10-15 நிமிடங்கள் குளிரூட்டவும். பனிக்கட்டி பயன்படுத்த வேண்டாம்.",
      "தீக்காயத்தின் மீது வெண்ணெய், எண்ணெய் அல்லது பற்பசையை பூச வேண்டாம்.",
      "வீக்கம் ஏற்படுவதற்கு முன் மோதிரம் அல்லது இறுக்கமான ஆபரணங்களை அகற்றவும்.",
      "ஒட்டாத சுத்தமான பிளாஸ்டிக் ஷீட் அல்லது மலட்டு துணியால் லேசாக மூடவும்."
    ];
  } else if (/\b(shock|electric|electrocution|lightning|wire)\b/i.test(query) || /மின்சாரம்|மின் அதிர்ச்சி|சாக்கு|மின் கம்பி/i.test(query)) {
    emergencyType = "shock";
    severity = "CRITICAL";
    
    dangerEn = "Cardiac arrest, severe internal burns, and muscle damage.";
    dangerTa = "இதய செயலிழப்பு மற்றும் கடுமையான உட்புற தசை பாதிப்புகள்.";
    
    precautionsEn = [
      "Do NOT touch the person if they are still in contact with the source.",
      "Turn off the power source or use a dry wooden stick to separate them.",
      "Once safe, check breathing and begin CPR if needed.",
      "Keep them lying down, elevate legs if possible, keep warm."
    ];
    precautionsTa = [
      "நோயாளி இன்னும் மின் கம்பியுடன் இணைப்பில் இருந்தால் அவரை நேரடியாகத் தொட வேண்டாம்.",
      "மின்சார சுவிட்சை அணைக்கவும் அல்லது உலர்ந்த மரக்கட்டை கொண்டு தள்ளிவிடவும்.",
      "பாதுகாப்பான இடத்திற்கு வந்ததும், மூச்சை சரிபார்த்து CPR தொடங்கவும்.",
      "அவர்களை படுக்கவைத்து உடலை போர்வையால் மூடவும்."
    ];
  } else if (/\b(fracture|broken|bone|sprain|joint|fall)\b/i.test(query) || /எலும்பு முறிவு|முறிவு|காயம்|கால் முறிவு/i.test(query)) {
    emergencyType = "fracture";
    severity = /\b(head|neck|spine)\b/i.test(query) ? "CRITICAL" : "URGENT";
    
    dangerEn = "Internal bleeding, nerve damage, or spinal cord injury.";
    dangerTa = "உட்புற இரத்தப்போக்கு மற்றும் தண்டுவட எலும்பு முறிவு அபாயம்.";
    
    precautionsEn = [
      "Do NOT move the person if head, neck, or spinal injury is suspected.",
      "Immobilize the injured area; do not try to realign the bone.",
      "Apply a cold pack wrapped in a cloth to reduce swelling.",
      "If bone is protruding, cover with a clean dressing; do not push it back."
    ];
    precautionsTa = [
      "தலை, கழுத்து அல்லது முதுகெலும்பு காயம் இருந்தால் நோயாளியை நகர்த்த வேண்டாம்.",
      "முறிந்த எலும்பை நேராக்கவோ அல்லது உள்ளே தள்ளவோ முயற்சிக்க வேண்டாம்.",
      "ஒரு அட்டை அல்லது மரப்பலகை கொண்டு முறிந்த பகுதியை அசையாமல் கட்டவும்.",
      "வீக்கத்தை குறைக்க துணியில் சுற்றிய பனிக்கட்டியை வைக்கவும்."
    ];
  } else if (/\b(bite|snake|dog|venom)\b/i.test(query) || /பாம்பு|கடி|விஷப்பாம்பு|நாய் கடி/i.test(query)) {
    emergencyType = "bite";
    severity = "CRITICAL";
    
    dangerEn = "Rapid systemic envenomation leading to paralysis or necrosis.";
    dangerTa = "விஷம் உடலுக்குள் வேகமாக பரவி நரம்புகளை செயலிழக்கச் செய்யும்.";
    
    precautionsEn = [
      "Keep the victim calm and absolutely still (movement spreads venom).",
      "Remove rings or constricting items (swelling occurs fast).",
      "Immobilize the bitten limb and keep it below heart level.",
      "Do NOT cut the wound, do NOT try to suck out venom, do NOT apply ice."
    ];
    precautionsTa = [
      "பாதிக்கப்பட்டவரை அசையாமல் அமைதியாக படுக்கவைக்கவும் (நகர்வு விஷத்தை வேகமாக பரப்பும்).",
      "விரல் மோதிரம், ஆபரணங்களை உடனடியாக அகற்றவும் (வீக்கம் ஏற்படும்).",
      "கடித்த இடத்தை இதய மட்டத்திற்கு கீழே அசையாமல் வைக்கவும்.",
      "வாயால் விஷத்தை உறிஞ்சவோ, காயத்தை வெட்டவோ முயற்சிக்க வேண்டாம்."
    ];
  } else if (/\b(poison|poisoning|overdose)\b/i.test(query) || /விஷம்|பூச்சிக்கொல்லி|மருந்து மாத்திரை/i.test(query)) {
    emergencyType = "poison";
    severity = "CRITICAL";
    
    dangerEn = "Organ damage, respiratory failure, or chemical burns to esophagus.";
    dangerTa = "உட்புற உறுப்புகள் செயலிழப்பு மற்றும் மூச்சு திணறல்.";
    
    precautionsEn = [
      "Try to identify what was swallowed and save the container.",
      "Do NOT induce vomiting unless instructed by medical professionals.",
      "If on skin/eyes, flush with copious amounts of water for 15 minutes.",
      "Monitor airway and responsiveness closely."
    ];
    precautionsTa = [
      "உட்கொண்ட விஷத்தின் பாட்டிலை பத்திரப்படுத்தவும். வாந்தி எடுக்க வைக்க முயற்சிக்க வேண்டாம்.",
      "கண்களில் அல்லது தோலில் பட்டிருந்தால், 15 நிமிடங்கள் சுத்தமான நீரால் கழுவவும்.",
      "நோயாளி சுயநினைவுடன் இருந்தால் சில சிப்ஸ் தண்ணீர் கொடுக்கவும்.",
      "உடனடியாக 112ஐ அழைத்து நச்சு விவரங்களை தெரிவிக்கவும்."
    ];
  } else if (/\b(faint|fainted|dizzy)\b/i.test(query) || /மயக்கம்|தலைச்சுற்றல்|மயங்கி விழுந்தார்/i.test(query)) {
    emergencyType = "fainting";
    severity = "URGENT";
    
    dangerEn = "Fall injuries, dehydration, or underlying cardiovascular issues.";
    dangerTa = "விழுவதால் ஏற்படும் காயங்கள் மற்றும் குறைந்த இரத்த அழுத்தம்.";
    
    precautionsEn = [
      "Lay the person flat on their back and elevate feet 12 inches.",
      "Loosen tight clothing (collar, belt).",
      "Ensure fresh air; fan the person if it's hot.",
      "Do not let them get up quickly when they regain consciousness."
    ];
    precautionsTa = [
      "நோயாளியை தட்டையாக படுக்கவைத்து, கால்களை 12 அங்குலம் தூக்கி வைக்கவும்.",
      "இறுக்கமான ஆடை மற்றும் காலரை தளர்த்தவும்.",
      "நல்ல காற்றோட்டம் இருப்பதை உறுதிப்படுத்தவும், விசிறியால் விசிறவும்.",
      "விழித்தவுடன் உடனடியாக எழுந்து நிற்க அனுமதிக்க வேண்டாம்."
    ];
  } else if (/\b(accident|crash|car)\b/i.test(query) || /விபத்து|சாலை விபத்து|வண்டி மோதியது/i.test(query)) {
    emergencyType = "accident";
    severity = "CRITICAL";
    
    dangerEn = "Multiple internal injuries, spinal damage, and severe shock.";
    dangerTa = "உட்புற இரத்தப்போக்கு மற்றும் தண்டுவட எலும்பு முறிவு அபாயம்.";
    
    precautionsEn = [
      "Secure the accident scene: warn traffic, turn off ignitions.",
      "Do NOT move victims unless there is immediate danger (e.g., fire).",
      "Prioritize breathing status and heavy bleeding control.",
      "Keep victims warm and talk to them to keep them calm."
    ];
    precautionsTa = [
      "விபத்து நடந்த இடத்தை சுற்றி மற்ற வாகனங்களுக்கு எச்சரிக்கை பலகை வைக்கவும்.",
      "உடனடி தீ விபத்து போன்ற ஆபத்து இல்லையென்றால் காயம்பட்டவர்களை நகர்த்த வேண்டாம்.",
      "தலையையும் கழுத்தையும் நேராக அசையாமல் பிடித்துக் கொள்ளவும்.",
      "இரத்தப்போக்கு உள்ள இடங்களை துணிகொண்டு அழுத்தி பிடிக்கவும்."
    ];
  }

  return {
    emergencyType,
    severity,
    conscious,
    breathing,
    bleeding,
    ageGroup,
    danger: isTamil ? dangerTa : dangerEn,
    precautions: isTamil ? precautionsTa : precautionsEn,
    dangerEn,
    dangerTa,
    precautionsEn,
    precautionsTa
  };
}

// Gemini API Content generation
export async function classifyEmergencyAI(text, apiKey, lang = 'en') {
  try {
    const isTamil = /[\u0B80-\u0BFF]/.test(text) || lang === 'ta';

    const prompt = `You are a real-time AI First Aid Emergency Response Assistant.
Analyze this emergency statement from a user: "${text}".
Identify the primary emergency type, assess severity (🔴 Critical, 🟠 Urgent, 🟡 Moderate), extract physiological parameters (conscious status, breathing status, bleeding severity, age group if detectable), state the major possible danger, and list 3-4 immediate action precautions.
Remember: Do not diagnose diseases. Classify the situation and provide carefully sourced first-aid guidance.

Generate values in both English and Tamil languages.
Respond strictly with a JSON object inside valid JSON syntax. Do not wrap in markdown quotes. The JSON structure must match:
{
  "emergencyType": "cpr" | "choking" | "bleeding" | "burn" | "shock" | "fracture" | "bite" | "poison" | "fainting" | "accident" | "unknown",
  "severity": "CRITICAL" | "URGENT" | "MODERATE",
  "conscious": "string conscious value",
  "breathing": "string breathing status value",
  "bleeding": "string bleeding severity value",
  "ageGroup": "string age demographic value",
  "dangerEn": "short string explaining immediate physiological danger in English",
  "dangerTa": "short string explaining immediate physiological danger in Tamil",
  "precautionsEn": ["precaution 1 in English", "precaution 2 in English", "precaution 3 in English"],
  "precautionsTa": ["precaution 1 in Tamil", "precaution 2 in Tamil", "precaution 3 in Tamil"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }]
          }
        ],
        systemInstruction: {
          parts: [{ text: "You are an emergency triage system. Output only the specified JSON format." }]
        },
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(resultText);
    
    // Bind backward compatibility variables
    parsed.danger = isTamil ? parsed.dangerTa : parsed.dangerEn;
    parsed.precautions = isTamil ? parsed.precautionsTa : parsed.precautionsEn;
    return parsed;
  } catch (error) {
    console.error("Gemini API call failed, falling back to local engine:", error);
    return classifyEmergencyLocal(text, lang);
  }
}

// Camera-Assisted Image Assessment
export async function analyzeIncidentImage(imageSrc, apiKey = null, lang = 'en') {
  const isTamil = lang === 'ta';
  
  if (apiKey && imageSrc) {
    try {
      const base64Data = imageSrc.split(",")[1];
      const mimeType = imageSrc.split(";")[0].split(":")[1];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                  }
                },
                {
                  text: "Analyze this image and output a JSON containing the suspected emergency category ('bleeding', 'burn', 'fracture', 'bite', 'accident', 'unconscious', 'unknown') and a description of visual cues (like bleeding, wounds, burns, safety hazards). Respond in English. Format: { \"category\": \"bleeding\", \"visualCues\": \"description of cues\", \"confidence\": 0.8 }"
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text;
        return JSON.parse(resultText);
      }
    } catch (e) {
      console.warn("Vision model request failed, falling back to client-side heuristics.", e);
    }
  }

  // Client-Side Canvas-based red pixel heuristic (to detect bleeding/wounds)
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        const imgData = ctx.getImageData(0, 0, 100, 100).data;

        let redPixelCount = 0;
        let totalPixels = 10000;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          
          if (r > 130 && g < 70 && b < 70) {
            redPixelCount++;
          }
        }

        const redRatio = redPixelCount / totalPixels;

        if (redRatio > 0.05) {
          resolve({
            category: "bleeding",
            visualCues: isTamil 
              ? `இரத்தப்போக்கு காயம் இருக்கலாம் (இரத்த நிற அளவீடு: ${(redRatio * 100).toFixed(1)}%).`
              : `Possible open wound or bleeding detected (blood-like color index: ${(redRatio * 100).toFixed(1)}%).`,
            confidence: Math.min(0.6 + redRatio, 0.95)
          });
        } else {
          resolve({
            category: "unknown",
            visualCues: isTamil 
              ? "இரத்தக் கசிவு அறிகுறி கண்டறியப்படவில்லை. விரிவான விபரங்களை உள்ளிடவும்."
              : "Visual features analyzed. No high-severity blood indicators detected. Please describe the injury in detail.",
            confidence: 0.5
          });
        }
      } catch (err) {
        resolve({
          category: "unknown",
          visualCues: isTamil
            ? "படம் பிடிக்கப்பட்டது. வகைப்படுத்த விபரங்களை உள்ளிடவும்."
            : "Image captured successfully. Awaiting user description for classification.",
          confidence: 0.5
        });
      }
    };
    img.onerror = () => {
      resolve({
        category: "unknown",
        visualCues: isTamil ? "படத்தை பகுப்பாய்வு செய்ய முடியவில்லை." : "Failed to process image content.",
        confidence: 0
      });
    };
  });
}
