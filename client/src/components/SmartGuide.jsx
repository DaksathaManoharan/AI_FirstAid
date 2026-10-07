import React, { useState, useEffect } from 'react';
import { Volume2, Award, CheckCircle, Heart } from 'lucide-react';
import { speechService } from '../services/speechService';
import { translations } from '../services/translations';

export default function SmartGuide({ activeEmergency, setActiveEmergency, language }) {
  const [selectedModule, setSelectedModule] = useState("cpr");
  const [ageGroup, setAgeGroup] = useState("Adult");
  const [checkedSteps, setCheckedSteps] = useState({});
  const [speakingStepIndex, setSpeakingStepIndex] = useState(null);

  const t = translations[language];

  // Sync with AI Copilot classification
  useEffect(() => {
    if (activeEmergency) {
      if (t.guides[activeEmergency.emergencyType]) {
        setSelectedModule(activeEmergency.emergencyType);
      }
      
      if (activeEmergency.ageGroup) {
        if (["Infant", "Child", "Adult", "Elderly"].includes(activeEmergency.ageGroup)) {
          setAgeGroup(activeEmergency.ageGroup);
        } else if (activeEmergency.ageGroup === 'குழந்தை') {
          setAgeGroup('Infant');
        } else if (activeEmergency.ageGroup === 'சிறுவர்') {
          setAgeGroup('Child');
        } else if (activeEmergency.ageGroup === 'பெரியவர்') {
          setAgeGroup('Adult');
        } else if (activeEmergency.ageGroup === 'முதியவர்') {
          setAgeGroup('Elderly');
        }
      }
      setCheckedSteps({});
    }
  }, [activeEmergency, language]);

  const moduleData = t.guides[selectedModule] || t.guides.cpr;
  const steps = moduleData.steps[ageGroup] || moduleData.steps.Adult;

  const handleStepCheck = (index) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSpeakStep = (index) => {
    const stepItem = steps[index];
    if (!stepItem) return;

    if (speakingStepIndex === index) {
      speechService.stopSpeaking();
      setSpeakingStepIndex(null);
    } else {
      setSpeakingStepIndex(index);
      speechService.speak(stepItem.step, language, () => {
        setSpeakingStepIndex(null);
      });
    }
  };

  const speakAllSteps = () => {
    const prefix = language === 'ta' ? 'படி' : 'Step';
    const text = steps.map((s, i) => `${prefix} ${i + 1}: ${s.step}`).join(". ");
    speechService.speak(text, language);
  };

  const getAgeLabel = (ageKey) => {
    const isTa = language === 'ta';
    switch(ageKey) {
      case 'Infant': return isTa ? '👶 குழந்தை' : '👶 Infant';
      case 'Child': return isTa ? '🧒 சிறுவர்' : '🧒 Child';
      case 'Adult': return isTa ? '🧑 பெரியவர்' : '🧑 Adult';
      default: return isTa ? '👴 முதியவர்' : '👴 Elderly';
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
      
      {/* 🧭 Module Selection Grid */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
          {language === 'ta' ? '🔧 அவசர முதலுதவி வழிகாட்டிகள்' : '🔧 Emergency First-Aid Guides'}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.5rem'
        }}>
          {Object.keys(t.guides).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedModule(key);
                setCheckedSteps({});
                speechService.stopSpeaking();
              }}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: selectedModule === key ? 'var(--color-primary-glow)' : 'transparent',
                borderColor: selectedModule === key ? 'var(--color-primary)' : 'var(--glass-border)',
                color: selectedModule === key ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition-smooth)'
              }}
            >
              {t.guides[key].title.split(" ")[0]} {t.guides[key].title.split(" ").slice(1).join(" ")}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Step-by-Step Interactive Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Module Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800 }}>{moduleData.title}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{moduleData.description}</p>
          </div>
          
          {/* Age Selection Badge Grid */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            padding: '3px',
            borderRadius: '20px',
            border: '1px solid var(--glass-border)'
          }}>
            {["Infant", "Child", "Adult", "Elderly"].map((age) => (
              <button
                key={age}
                onClick={() => {
                  setAgeGroup(age);
                  setCheckedSteps({});
                  speechService.stopSpeaking();
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: ageGroup === age ? 'var(--color-primary)' : 'transparent',
                  color: ageGroup === age ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {getAgeLabel(age)}
              </button>
            ))}
          </div>
        </div>

        {/* Narrator Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {language === 'ta' ? '🎙️ குரல் வழி வழிகாட்டி உதவியாளர்:' : '🎙️ Hands-Free voice instruction assistant:'}
          </span>
          <button 
            onClick={speakAllSteps}
            className="btn btn-glass"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Volume2 size={12} /> {language === 'ta' ? 'வழிமுறைகளைக் கேள்' : 'Play All Instructions'}
          </button>
        </div>

        {/* Step checklist items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {steps.map((stepItem, index) => {
            const isChecked = checkedSteps[index];
            const isSpeaking = speakingStepIndex === index;
            
            return (
              <div 
                key={index} 
                className="glass-panel" 
                style={{
                  padding: '1rem',
                  background: isChecked ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255, 0.01)',
                  borderColor: isChecked ? 'var(--color-safe)' : 'var(--glass-border)',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Step check circles */}
                <button
                  onClick={() => handleStepCheck(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isChecked ? 'var(--color-safe)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                >
                  <CheckCircle size={20} style={{ fill: isChecked ? 'var(--color-safe-glow)' : 'none' }} />
                </button>

                {/* Step Context */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.7rem',
                    color: isChecked ? 'var(--color-safe)' : 'var(--color-primary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.15rem'
                  }}>
                    {language === 'ta' ? `படி ${index + 1}` : `Step ${index + 1}`}
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    fontWeight: stepItem.bold && !isChecked ? 700 : 400
                  }}>
                    {stepItem.step}
                  </p>

                  {/* CPR Pulsing Heart Metronome widget */}
                  {stepItem.anim === 'compress' && !isChecked && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      marginTop: '0.75rem'
                    }}>
                      <div className="animate-cpr-heart" style={{
                        background: 'var(--color-critical-glow)',
                        color: 'var(--color-critical)',
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Heart size={20} style={{ fill: 'var(--color-critical)' }} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block' }}>
                          {language === 'ta' ? 'CPR மார்பு அழுத்தக் கருவி (110 BPM)' : 'CPR Compress Metronome (110 BPM)'}
                        </strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {language === 'ta' 
                            ? 'இந்த துடிப்பிற்கு ஏற்ப மார்பை அழுத்தவும். பலமாகவும் வேகமாகவும் அமுக்கவும்.' 
                            : 'Compress the chest matching this pulse. Push down hard and fast.'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice narrator button */}
                <button
                  onClick={() => handleStepCheck(index)}
                  onDoubleClick={() => handleSpeakStep(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isSpeaking ? 'var(--color-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    marginTop: '2px',
                    padding: '4px'
                  }}
                  title="Double click to read step out loud"
                >
                  <Volume2 size={16} onClick={(e) => {
                    e.stopPropagation();
                    handleSpeakStep(index);
                  }} style={{ color: isSpeaking ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Completion Panel */}
        {Object.keys(checkedSteps).length === steps.length && (
          <div style={{
            background: 'var(--color-safe-glow)',
            border: '1px solid var(--color-safe)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Award size={36} style={{ color: 'var(--color-safe)' }} />
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {language === 'ta' ? 'அவசர நடவடிக்கைகள் அனைத்தும் முடிந்தது' : 'Emergency Actions Completed'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {language === 'ta'
                ? 'சுவாசம் மற்றும் விழிப்புடன் உள்ளாரா என கண்காணிக்கவும். அவசர மருத்துவக் குழு (112/108) வரும் வரை காத்திருக்கவும்.'
                : 'Maintain airway status and monitor responsiveness. Stand by for emergency paramedics (112/108) to arrive.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
