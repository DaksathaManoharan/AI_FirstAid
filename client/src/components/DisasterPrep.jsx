import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { translations } from '../services/translations';

const disasterBank = {
  en: {
    flood: {
      icon: "🌊",
      name: "Floods & Inundation",
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
    cyclone: {
      icon: "🌪️",
      name: "Cyclones & High Winds",
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
    fire: {
      icon: "🔥",
      name: "Fire Emergencies",
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
    earthquake: {
      icon: "🌍",
      name: "Earthquakes",
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
    lightning: {
      icon: "⚡",
      name: "Lightning & Storms",
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
    }
  },
  ta: {
    flood: {
      icon: "🌊",
      name: "வெள்ளப் பெருக்கு",
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
    cyclone: {
      icon: "🌪️",
      name: "புயல் & பலத்த காற்று",
      before: [
        "ஜன்னல்களைப் பூட்டி, தளர்வான கூரைகளை சரிசெய்து, வடிகால்களை சுத்தம் செய்யவும்.",
        "வீட்டின் அருகில் விழுந்து கிடக்கக்கூடிய காய்ந்த மரக்கிளைகளை வெட்டி அகற்றவும்.",
        "3-5 நாட்களுக்குத் தேவையான குடிநீர் மற்றும் உலர் உணவுகளை சேமிக்கவும்.",
        "கனமான பொருட்களை அலமாரிகளின் கீழ் பகுதியில் வைக்கவும், ரேடியோவை தயார் நிலையில் வைக்கவும்."
      ],
      during: [
        "வீட்டின் நடுவில் உள்ள பாதுகாப்பான அறையிலேயே இருக்கவும் (எ.கா. குளியலறை/ஹால்).",
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
    fire: {
      icon: "🔥",
      name: "தீ விபத்து",
      before: [
        "வீட்டின் அனைத்து தளங்களிலும் புகை எச்சரிக்கை கருவிகளை (Smoke Alarms) நிறுவவும்.",
        "ஒவ்வொரு அறையிலிருந்தும் வெளியேற இரண்டு வழிகளைக் கொண்ட வரைபடத்தை உருவாக்கவும்.",
        "சமையலறையில் தீயணைப்பு கருவியை தயார் நிலையில் வைத்திருக்கவும்.",
        "மின்சார பிளக்குகளை ஓவர்லோடு செய்ய வேண்டாம்."
      ],
      during: [
        "புகைக்கு கீழே தவழ்ந்து செல்லவும்: தூய்மையான காற்று தரைக்கு அருகில் இருக்கும்.",
        "கதவு கைப்பிடிகளை தொட்டுப் பார்க்கவும்; சூடாக இருந்தால் கதவைத் திறக்க வேண்டாம்.",
        "உடையில் தீப்பிடித்தால்: உடனே நில்லுங்கள், தரையில் விழுந்து உருளுங்கள் (STOP, DROP, ROLL).",
        "வெளியே வந்ததும் உள்ளே செல்ல வேண்டாம். உடனடியாக 112ஐ அழைக்கவும்."
      ],
      after: [
        "தீயணைப்புத் துறையினர் அனுமதிக்கும் வரை வீட்டிற்குள் செல்ல வேண்டாம்.",
        "சிறிய தீக்காயமாக இருந்தாலும் மருத்துவரிடம் காட்டி சிகிச்சை பெறவும்.",
        "தீயில் சிக்கிய உணவுகள், பானங்கள் அல்லது மருந்துகளை அப்புறப்படுத்தவும்.",
        "மின்சார மற்றும் எரிவாயு இணைப்புகளை சரிபார்க்கவும்."
      ]
    },
    earthquake: {
      icon: "🌍",
      name: "நிலநடுக்கம்",
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
        "உடைந்த கண்ணாடிகளிலிருந்து பாதுகாக்க தடிமனான காலணிகள் மற்றும் கையுறைகளை அணியவும்.",
        "அரசு அறிவிப்புகளுக்கு வானொலியைக் கேட்கவும்."
      ]
    },
    lightning: {
      icon: "⚡",
      name: "இடி மின்னல்",
      before: [
        "வானிலை எச்சரிக்கைகளைக் கவனிக்கவும். இடி சத்தம் கேட்டால் பாதுகாப்பான இடத்திற்குச் செல்லவும்.",
        "கணினி, தொலைக்காட்சி மற்றும் ஏசி சாதனங்களை மின் இணைப்பிலிருந்து துண்டிக்கவும்.",
        "செல்லப்பிராணிகளை வீட்டிற்குள் கொண்டு வரவும்."
      ],
      during: [
        "பலமான கட்டிடம் அல்லது காரின் உள்ளே தஞ்சமடையவும்.",
        "தொலைபேசி, தண்ணீர் குழாய்கள், குளியலறைகளைப் பயன்படுத்துவதைத் தவிர்க்கவும் (மின்சாரம் பாயும் ஆபத்து).",
        "வெளியே இருந்தால்: உயரமான மரங்கள், கம்பி வேலிகளைத் தவிர்க்கவும். குனிந்து அமரவும்.",
        "ஜன்னல்கள் மற்றும் சிமெண்ட் தரைகளில் அமர வேண்டாம்."
      ],
      after: [
        "கடைசி இடி சத்தம் கேட்டு 30 நிமிடங்கள் கழிந்த பின்னரே வெளியே செல்லவும்.",
        "மின்னல் தாக்கிய நபரின் உடலில் மின்சாரம் இருக்காது. உடனடியாக CPR செய்யவும்.",
        "மின்னலால் ஏற்பட்ட மின் விபத்துகள் ஏதேனும் உள்ளதா எனப் பார்க்கவும்."
      ]
    }
  }
};

export default function DisasterPrep({ language }) {
  const [selectedDisaster, setSelectedDisaster] = useState("flood");
  const [activeTimeline, setActiveTimeline] = useState("before"); // 'before', 'during', 'after'
  const [checkedList, setCheckedList] = useState({});

  const t = translations[language];
  const bank = disasterBank[language] || disasterBank.en;
  
  const disasterData = bank[selectedDisaster];
  const listItems = disasterData[activeTimeline];

  const handleCheck = (index) => {
    const key = `${selectedDisaster}-${activeTimeline}-${index}`;
    setCheckedList(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
      
      {/* 🌪️ Disaster Filter Tabs */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
          {t.disaster_header}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.5rem'
        }}>
          {Object.keys(bank).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedDisaster(key);
              }}
              style={{
                padding: '12px 10px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: selectedDisaster === key ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: selectedDisaster === key ? 'var(--color-primary)' : 'var(--glass-border)',
                color: selectedDisaster === key ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{bank[key].icon}</span>
              <span>{bank[key].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🗓️ Timeline Selection Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>
              {disasterData.icon} {disasterData.name} {language === 'ta' ? 'விதிமுறைகள்' : 'Protocols'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {t.disaster_desc}
            </p>
          </div>

          {/* Before, During, After Selector */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: '3px',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)'
          }}>
            {[
              { id: 'before', label: t.timeline_before },
              { id: 'during', label: t.timeline_during },
              { id: 'after', label: t.timeline_after }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTimeline(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: activeTimeline === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                  color: activeTimeline === tab.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  transition: 'var(--transition-smooth)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hazard Callout */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(59, 130, 246, 0.05)',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1px solid var(--color-primary-glow)'
        }}>
          <AlertCircle size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {activeTimeline === 'before' && t.disaster_sub_before}
            {activeTimeline === 'during' && t.disaster_sub_during}
            {activeTimeline === 'after' && t.disaster_sub_after}
          </span>
        </div>

        {/* Checklist Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {listItems.map((item, index) => {
            const checkKey = `${selectedDisaster}-${activeTimeline}-${index}`;
            const isChecked = checkedList[checkKey];

            return (
              <div
                key={index}
                onClick={() => handleCheck(index)}
                className="glass-panel"
                style={{
                  padding: '1rem',
                  background: isChecked ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                  borderColor: isChecked ? 'var(--color-safe)' : 'var(--glass-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  border: `2px solid ${isChecked ? 'var(--color-safe)' : 'var(--text-muted)'}`,
                  background: isChecked ? 'var(--color-safe)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'var(--transition-smooth)'
                }}>
                  {isChecked && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>}
                </div>
                <p style={{
                  fontSize: '0.8rem',
                  color: isChecked ? 'var(--text-secondary)' : '#fff',
                  textDecoration: isChecked ? 'line-through' : 'none'
                }}>
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
