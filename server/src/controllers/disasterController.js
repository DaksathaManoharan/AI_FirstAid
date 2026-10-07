import prisma from '../config/prisma.js';

// Static timeline and checklist definitions for disasters
const disasterData = {
  flood: {
    nameEn: "Floods & Inundation",
    nameTa: "வெள்ளப் பெருக்கு",
    icon: "🌊",
    timelineEn: {
      before: [
        "Prepare a disaster supply kit: water, non-perishable food, flashlights, medicines.",
        "Store critical personal and financial documents in waterproof containers.",
        "Identify high-ground routes and local evacuation shelters in your zone.",
        "Install check valves in plumbing to prevent floodwater backflow."
      ],
      during: [
        "Move to higher ground immediately. Do not wait for evacuation instructions.",
        "Avoid walking, swimming, or driving through moving floodwater.",
        "If trapped, climb to the roof; do not enter closed attics where water can trap you.",
        "Turn off the electricity main switch and gas valves if the house is inundated."
      ],
      after: [
        "Do not return home until local authorities declare it safe.",
        "Avoid drinking tap water; drink boiled or bottled water only.",
        "Watch out for electrical lines, submerged wires, and gas leaks.",
        "Clean and disinfect everything that got wet to prevent mold/infection."
      ]
    },
    timelineTa: {
      before: [
        "பேரிடர் தேவைகளுக்கான கிட் தயார் செய்க: தண்ணீர், கெட்டுப்போகாத உணவு, மாத்திரைகள்.",
        "முக்கிய ஆவணங்களை நீர்புகா பெட்டிகளில் அல்லது டிஜிட்டல் முறையில் சேமிக்கவும்.",
        "உங்கள் பகுதியில் உள்ள உயரமான பகுதிகள் மற்றும் தங்குமிடங்களை அறிந்து கொள்ளுங்கள்.",
        "வெள்ளநீர் வீட்டிற்குள் வருவதைத் தடுக்க குழாய்களில் தடுப்பு வால்வுகளை நிறுவவும்."
      ],
      during: [
        "உடனடியாக உயரமான இடத்திற்கு செல்லவும். அறிவிப்புகளுக்காக காத்திருக்க வேண்டாம்.",
        "வெள்ளநீரில் நடக்கவோ, நீந்தவோ அல்லது வாகனங்களை ஓட்டவோ வேண்டாம்.",
        "வீட்டிற்குள் மாட்டிக்கொண்டால் கூரைக்குச் செல்லவும்; பூட்டிய அறைகளில் இருக்க வேண்டாம்.",
        "வீட்டிற்குள் வெள்ளநீர் வந்தால் மின்சார மெயின் சுவிட்ச் மற்றும் எரிவாயு வால்வுகளை அணைக்கவும்."
      ],
      after: [
        "அதிகாரிகள் பாதுகாப்பு என்று அறிவிக்கும் வரை வீட்டிற்கு திரும்ப வேண்டாம்.",
        "குழாய் நீரை குடிக்க வேண்டாம்; காய்ச்சிய அல்லது பாட்டில் தண்ணீரை மட்டுமே குடிக்கவும்.",
        "அறுந்து கிடக்கும் மின்கம்பிகள் மற்றும் எரிவாயு கசிவுகள் குறித்து எச்சரிக்கையாக இருக்கவும்.",
        "தொற்று நோய் பரவாமல் இருக்க வெள்ளநீர் பட்ட அனைத்து பொருட்களையும் கிருமிநாசினி கொண்டு சுத்தம் செய்யவும்."
      ]
    },
    checklist: [
      "Emergency kit prepared with 3 days of water and rations",
      "Critical documents secured in waterproof containers",
      "High ground evacuation route identified",
      "Power main breaker and gas valves closed"
    ]
  },
  cyclone: {
    nameEn: "Cyclones & High Winds",
    nameTa: "புயல் & பலத்த காற்று",
    icon: "🌪️",
    timelineEn: {
      before: [
        "Board up windows, secure loose roof sheets, and clear drains.",
        "Trim dead tree branches near the house that could crash during storms.",
        "Stockpile 3-5 days of drinking water and dry rations.",
        "Keep heavy objects low on shelves and verify battery-powered radio operations."
      ],
      during: [
        "Stay indoors in the strongest, central room of the house.",
        "Keep away from glass windows and doors. Cover yourself with mattresses.",
        "Do not go outside during the storm eye (temporary calm).",
        "Disconnect all electrical appliances to prevent damage from surges."
      ],
      after: [
        "Beware of fallen power lines and dangling electrical poles.",
        "Drink only boiled or filtered water, as water grids may be compromised.",
        "Clear fallen debris around your property using protective gloves.",
        "Check structural walls for cracks before re-occupying rooms."
      ]
    },
    timelineTa: {
      before: [
        "ஜன்னல்களைப் பூட்டி, தளர்வான கூரைகளை சரிசெய்து, வடிகால்களை சுத்தம் செய்யவும்.",
        "வீட்டின் அருகில் விழுந்து கிடக்கக்கூடிய காய்ந்த மரக்கிளைகளை வெட்டி அகற்றவும்.",
        "3-5 நாட்களுக்குத் தேவையான குடிநீர் மற்றும் உலர் உணவுகளை சேமிக்கவும்.",
        "கனமான பொருட்களை அலமாரிகளின் கீழ் பகுதியில் வைக்கவும், ரேடியோவை தயார் நிலையில் வைக்கவும்."
      ],
      during: [
        "வீட்டின் நடுவில் உள்ள பாதுகாப்பான அறையிலேயே இருக்கவும்.",
        "கண்ணாடி ஜன்னல்கள் மற்றும் கதவுகளுக்கு அருகில் செல்ல வேண்டாம்.",
        "புயலின் மையம் கடக்கும் போது (தற்காலிக அமைதி) வெளியே செல்ல வேண்டாம்; மீண்டும் பலத்த காற்று வீசும்.",
        "மின்சார சாதனங்களை துண்டித்து மின் இணைப்புகளை துண்டிக்கவும்."
      ],
      after: [
        "அறுந்து கிடக்கும் மின்கம்பிகள் குறித்து எச்சரிக்கையாக இருக்கவும். 112க்கு தகவல் தெரிவிக்கவும்.",
        "காய்ச்சிய அல்லது வடிகட்டிய நீரை மட்டுமே குடிக்கவும்.",
        "கைமுறையாக இடிபாடுகளை அகற்றும் போது பாதுகாப்பு கையுறைகளை அணியவும்.",
        "வீட்டிற்குள் செல்லும் முன் சுவர்களில் விரிசல் உள்ளதா என்று சோதிக்கவும்."
      ]
    },
    checklist: [
      "Window shutter boards secured",
      "Dead branches trimmed near roof",
      "Batteries in emergency radio and flashlight checked",
      "Secure yard items that could blow away"
    ]
  },
  earthquake: {
    nameEn: "Earthquakes",
    nameTa: "நிலநடுக்கம்",
    icon: "🌍",
    timelineEn: {
      before: [
        "Secure tall, heavy furniture to the walls with brackets.",
        "Do not hang heavy mirrors or pictures above beds.",
        "Establish a family meeting point outside the building zone.",
        "Know where your gas, water, and electrical shut-offs are located."
      ],
      during: [
        "DROP, COVER, and HOLD: Take cover under a sturdy table.",
        "If inside: Stay inside. Do not run out during shaking.",
        "Stay away from windows, glass, and exterior building walls.",
        "If outside: Move to an open area away from buildings and wires."
      ],
      after: [
        "Expect aftershocks. Exit structures carefully.",
        "Check for gas leaks: If you smell gas, turn off the main valve.",
        "Wear sturdy shoes and leather gloves to protect against broken glass.",
        "Listen to emergency broadcasts."
      ]
    },
    timelineTa: {
      before: [
        "உயரமான அலமாரிகளை சுவருடன் இறுக்கமாக பொருத்தவும்.",
        "படுக்கைக்கு மேலே கனமான கண்ணாடிகள் அல்லது படங்களை மாட்ட வேண்டாம்.",
        "வீட்டிற்கு வெளியே குடும்பத்தினர் சந்திக்கும் இடத்தை முடிவு செய்து கொள்ளவும்.",
        "மின்சாரம், தண்ணீர் மற்றும் எரிவாயு இணைப்புகளை அணைக்கும் வழிகளை அறிந்து கொள்ளவும்."
      ],
      during: [
        "DROP, COVER, HOLD: தரையில் அமர்ந்து, பலமான மேசைக்கு கீழே சென்று கெட்டியாக பிடித்துக்கொள்ளவும்.",
        "வீட்டிற்குள் இருந்தால் உள்ளேயே இருக்கவும். நிலநடுக்கத்தின் போது வெளியே ஓட வேண்டாம்.",
        "ஜன்னல்கள், கண்ணாடி மற்றும் வெளிப்புற சுவர்களிலிருந்து விலகி இருக்கவும்.",
        "வெளியே இருந்தால்: கட்டிடங்கள், மின் கம்பங்கள் இல்லாத திறந்தவெளிக்கு செல்லவும்."
      ],
      after: [
        "மீண்டும் அதிர்வுகள் (Aftershocks) ஏற்பட வாய்ப்புள்ளதால் கட்டிடங்களை விட்டு வெளியேறவும்.",
        "எரிவாயு கசிவு உள்ளதா எனப் பார்க்கவும்; வாசனை வந்தால் மெயின் வால்வை அணைக்கவும்.",
        "கண்ணாடித் துண்டுகளிலிருந்து தற்காத்துக் கொள்ள தடிமனான காலணிகள் மற்றும் கையுறைகளை அணியவும்.",
        "அவசர கால வானொலி செய்திகளைக் கேட்கவும்."
      ]
    },
    checklist: [
      "Heavy shelves anchored to walls",
      "Clear exit path maintained in all rooms",
      "Gas leak shutoff valve location known",
      "Family exterior assembly area agreed upon"
    ]
  },
  fire: {
    nameEn: "Fire Emergency",
    nameTa: "தீ விபத்து",
    icon: "🔥",
    timelineEn: {
      before: [
        "Install smoke alarms on every level of the house and test them monthly.",
        "Draw up a fire escape map showing two exits from each room.",
        "Keep a working fire extinguisher in the kitchen (P.A.S.S. method).",
        "Never overload electrical outlets or leave heating elements unattended."
      ],
      during: [
        "Crawl low under smoke: Clean air is near the floor. Cover mouth.",
        "Feel door handles; if hot, do NOT open the door. Use your secondary exit.",
        "If clothes catch fire: STOP, DROP, and ROLL immediately.",
        "Once outside, stay outside. Call 112 immediately."
      ],
      after: [
        "Do not enter a burned structure until authorities declare it safe.",
        "Have a doctor examine all burns, even minor ones.",
        "Discard any food, beverages, or medicines exposed to heat or smoke.",
        "Notify utility companies of any damages."
      ]
    },
    timelineTa: {
      before: [
        "வீட்டின் அனைத்து தளங்களிலும் புகை எச்சரிக்கை கருவிகளை (Smoke Alarms) நிறுவவும்.",
        "ஒவ்வொரு அறையிலிருந்தும் வெளியேற இரண்டு வழிகளைக் கொண்ட வரைபடத்தை உருவாக்கவும்.",
        "சமையலறையில் தீயணைப்பு கருவியை தயார் நிலையில் வைத்திருக்கவும்.",
        "மின்சார பிளக்குகளை ஓவர்லோடு செய்ய வேண்டாம்."
      ],
      during: [
        "புகைக்கு கீழே தவழ்ந்து செல்லவும்: தூய்மையான காற்று தரைக்கு அருகில் இருக்கும்.",
        "கதவு கைப்பிடிகளை தொட்டுப் பார்க்கவும்; சூடாக இருந்தால் கதவைத் திறக்க வேண்டாம்.",
        "உடலில் தீப்பிடித்தால்: உடனே நில்லுங்கள், தரையில் விழுந்து உருளுங்கள் (STOP, DROP, ROLL).",
        "வெளியே வந்ததும் உள்ளே செல்ல வேண்டாம். உடனடியாக 112ஐ அழைக்கவும்."
      ],
      after: [
        "தீயணைப்புத் துறையினர் அனுமதிக்கும் வரை வீட்டிற்குள் செல்ல வேண்டாம்.",
        "சிறிய தீக்காயமாக இருந்தாலும் மருத்துவரிடம் காட்டி சிகிச்சை பெறவும்.",
        "தீயில் சிக்கிய உணவுகள், பானங்கள் அல்லது மருந்துகளை அப்புறப்படுத்தவும்.",
        "மின்சார மற்றும் எரிவாயு இணைப்புகளை சரிபார்க்கவும்."
      ]
    },
    checklist: [
      "Smoke detector alarms tested and working",
      "Fire extinguisher stored in accessible kitchen spot",
      "Household escape plan drafted and practiced",
      "Matches and lighters stored safely out of reach of children"
    ]
  },
  lightning: {
    nameEn: "Lightning & Thunderstorms",
    nameTa: "மின்னல் & இடிமழை",
    icon: "⚡",
    timelineEn: {
      before: [
        "Monitor weather warnings. If thunder is heard, seek shelter.",
        "Unplug computer routers, televisions, and air conditioners.",
        "Bring pets indoors."
      ],
      during: [
        "Seek shelter inside a substantial building or hard-topped car.",
        "Avoid using corded phones, water faucets, baths, or showers.",
        "If caught outdoors: Avoid tall trees, metal fences. Crouch low.",
        "Stay away from windows and concrete floors."
      ],
      after: [
        "Remain indoors for at least 30 minutes after the last thunder.",
        "Lightning strike victims do NOT carry a charge. Render CPR immediately.",
        "Check for local electrical fires."
      ]
    },
    timelineTa: {
      before: [
        "வானிலை எச்சரிக்கைகளைக் கண்காணிக்கவும். இடி சத்தம் கேட்டால் பாதுகாப்பான இடத்திற்குச் செல்லவும்.",
        "கணினி, ரூட்டர், தொலைக்காட்சி மற்றும் குளிரூட்டி மின் இணைப்புகளைத் துண்டிக்கவும்.",
        "வீட்டு விலங்குகளை வீட்டிற்குள் கொண்டு வரவும்."
      ],
      during: [
        "உறுதியான கட்டிடம் அல்லது மூடப்பட்ட காரினுள் தஞ்சமடையவும்.",
        "நீர் குழாய்கள், குளியல் தொட்டிகள் அல்லது லேண்ட்லைன் தொலைபேசிகளைப் பயன்படுத்துவதைத் தவிர்க்கவும்.",
        "வெளியில் சிக்கிக்கொண்டால்: உயரமான மரங்கள், இரும்பு வேலிகளைத் தவிர்க்கவும். குனிந்து உட்காரவும்.",
        "ஜன்னல்கள் மற்றும் சிமெண்ட் தரையிலிருந்து விலகி இருக்கவும்."
      ],
      after: [
        "கடைசி இடி சத்தம் கேட்டு 30 நிமிடங்கள் வரை வீட்டிற்குள்ளேயே இருக்கவும்.",
        "மின்னல் தாக்கிய நபர் உடலில் மின்சாரம் இருக்காது. உடனடியாக அவருக்கு CPR செய்யவும்.",
        "மின்சார தீ விபத்து ஏதும் ஏற்பட்டுள்ளதா எனப் பார்க்கவும்."
      ]
    },
    checklist: [
      "Household surge protectors installed",
      "Dead trees/branches that can fall on power lines cleared",
      "Flashlight batteries verified",
      "Unplugged sensitive electronics during active weather advisory"
    ]
  },
  heatwave: {
    nameEn: "Extreme Heat & Heatwave",
    nameTa: "வெப்ப அலை",
    icon: "🌡️",
    timelineEn: {
      before: [
        "Install window reflectors and check air conditioning filters.",
        "Stockpile oral rehydration salts (ORS), glucose, and electrolytes.",
        "Keep pets shaded and ensure they have ample water."
      ],
      during: [
        "Stay hydrated: Drink water frequently, even if you are not thirsty.",
        "Avoid direct sunlight, outdoor strenuous activities between 11 AM and 4 PM.",
        "Wear loose, light-colored, cotton clothing.",
        "Never leave children or pets inside locked parked vehicles."
      ],
      after: [
        "Monitor vulnerable neighbors (elderly/infants) for heat stroke symptoms.",
        "Continue hydration and avoid immediate intense outdoor physical labor.",
        "Gradually re-acclimatize to cooler indoor spaces."
      ]
    },
    timelineTa: {
      before: [
        "ஜன்னல்களில் வெப்பப் பிரதிபலிப்பான்களை நிறுவவும், காற்றோட்ட வடிகட்டிகளை சரிபார்க்கவும்.",
        "ORS பாக்கெட்டுகள், குளுக்கோஸ் மற்றும் எலக்ட்ரோலைட்டுகளை சேமித்து வைக்கவும்.",
        "வீட்டு விலங்குகளுக்கு நிழல் மற்றும் குடிநீரை உறுதி செய்யவும்."
      ],
      during: [
        "உடலில் நீர்ச்சத்தைப் பேணவும்: தாகம் எடுக்காவிட்டாலும் அடிக்கடி தண்ணீர் குடிக்கவும்.",
        "காலை 11 மணி முதல் மாலை 4 மணி வரை நேரடி வெயில் மற்றும் கடுமையான வேலைகளைத் தவிர்க்கவும்.",
        "இறுக்கமில்லாத, வெளிர் நிற பருத்தி ஆடைகளை அணியவும்.",
        "குழந்தைகள் அல்லது வீட்டு விலங்குகளை பூட்டிய வாகனங்களில் விட்டுச் செல்ல வேண்டாம்."
      ],
      after: [
        "முதியவர்கள் மற்றும் குழந்தைகளுக்கு வெப்ப பக்கவாத அறிகுறிகள் உள்ளதா எனக் கண்காணிக்கவும்.",
        "தொடர்ந்து நீர்ச்சத்து பானங்களை அருந்தவும்.",
        "உடல் வெப்பநிலையை சீராக பராமரிக்கவும்."
      ]
    },
    checklist: [
      "ORS packs and glucose tablets stocked in first aid kit",
      "Air conditioning filters cleaned",
      "Thick window curtains installed to block afternoon sun",
      "Insulated thermos water bottles prepared"
    ]
  }
};

export function getDisasters(req, res) {
  const summary = Object.keys(disasterData).map(key => ({
    type: key,
    nameEn: disasterData[key].nameEn,
    nameTa: disasterData[key].nameTa,
    icon: disasterData[key].icon
  }));
  res.json(summary);
}

export function getDisasterByType(req, res) {
  const { type } = req.params;
  const data = disasterData[type.toLowerCase()];
  if (!data) {
    return res.status(404).json({ error: `Disaster type '${type}' not found.` });
  }
  res.json(data);
}

// Relational Checklists in Postgres
export async function getChecklist(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required to fetch checklist." });
    }

    const checklists = await prisma.disasterChecklist.findMany({
      where: { userId }
    });

    res.json(checklists);
  } catch (error) {
    next(error);
  }
}

export async function updateChecklist(req, res, next) {
  try {
    const userId = req.userId;
    const { disasterType, item, completed } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required to update checklist." });
    }
    if (!disasterType || !item) {
      return res.status(400).json({ error: "Fields 'disasterType' and 'item' are required." });
    }

    const updated = await prisma.disasterChecklist.findMany({
      where: { userId, disasterType, item }
    });

    let result;
    if (updated.length > 0) {
      // Update existing item
      result = await prisma.disasterChecklist.update({
        where: { id: updated[0].id },
        data: { completed }
      });
    } else {
      // Create new checklist log
      result = await prisma.disasterChecklist.create({
        data: {
          userId,
          disasterType,
          item,
          completed: completed !== undefined ? completed : false
        }
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
}
