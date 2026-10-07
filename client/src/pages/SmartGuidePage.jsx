import React, { useState, useEffect, useContext } from 'react';
import { Volume2, VolumeX, Loader2, Award, CheckCircle, Heart, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function SmartGuidePage() {
  const { language, activeEmergency, setActiveEmergency } = useContext(AppContext);
  const t = translations[language];
  const isTa = language === 'ta';

  const [dbGuides, setDbGuides] = useState([]);
  const [selectedModule, setSelectedModule] = useState("cpr");
  const [ageGroup, setAgeGroup] = useState("Adult");
  const [checkedSteps, setCheckedSteps] = useState({});
  const [speakingStepIndex, setSpeakingStepIndex] = useState(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  // 1. Fetch Guides from backend database
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const data = await api.getGuides();
        setDbGuides(data);
      } catch (err) {
        console.warn("Could not load guides from database, using translations bundle fallback:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  // 2. Sync selected module from AI triage context
  useEffect(() => {
    if (activeEmergency) {
      const type = activeEmergency.emergencyType;
      // Normalise case and sync
      setSelectedModule(type.toLowerCase());
      
      if (activeEmergency.ageGroup) {
        const age = activeEmergency.ageGroup;
        if (["Infant", "Child", "Adult", "Elderly"].includes(age)) {
          setAgeGroup(age);
        } else if (age === 'குழந்தை') {
          setAgeGroup('Infant');
        } else if (age === 'சிறுவர்') {
          setAgeGroup('Child');
        } else if (age === 'பெரியவர்') {
          setAgeGroup('Adult');
        } else if (age === 'முதியவர்') {
          setAgeGroup('Elderly');
        }
      }
      setCheckedSteps({});
    }
  }, [activeEmergency]);

  // Determine active guide data
  let activeGuide = null;

  if (dbGuides.length > 0) {
    const matched = dbGuides.find(g => g.type === selectedModule);
    if (matched) {
      const content = isTa ? matched.contentTa : matched.contentEn;
      activeGuide = {
        title: isTa ? matched.titleTa : matched.titleEn,
        description: content.description,
        steps: content.steps
      };
    }
  }

  // Fallback to translations bundle if DB guides are loading or failed
  if (!activeGuide) {
    const fallbackData = t.guides[selectedModule] || t.guides.cpr;
    activeGuide = {
      title: fallbackData.title,
      description: fallbackData.description,
      steps: fallbackData.steps
    };
  }

  // Retrieve steps for age group, falling back to Adult if not defined for age group
  const steps = activeGuide.steps[ageGroup] || activeGuide.steps.Adult || [];

  const handleStepCheck = (index) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSpeakStep = (index) => {
    const stepItem = steps[index];
    if (!stepItem) return;

    if (speakingStepIndex === index || loadingStepIndex === index) {
      speechService.stopSpeaking();
      setSpeakingStepIndex(null);
      setLoadingStepIndex(null);
      return;
    }

    // Cancel any "Play All" or other step in progress
    speechService.stopSpeaking();
    setIsPlayingAll(false);
    setLoadingAudio(false);

    setSpeakingStepIndex(index);
    setLoadingStepIndex(index);

    speechService.speak(
      stepItem.step,
      language,
      () => {
        setSpeakingStepIndex(null);
        setLoadingStepIndex(null);
      },
      (errMsg) => {
        setSpeakingStepIndex(null);
        setLoadingStepIndex(null);
        if (errMsg) {
          alert(isTa ? "தமிழ் குரல் சேவை தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." : errMsg);
        }
      },
      () => {
        setLoadingStepIndex(null);
      }
    );
  };

  const speakAllSteps = () => {
    if (isPlayingAll || loadingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAll(false);
      setLoadingAudio(false);
      setSpeakingStepIndex(null);
      setLoadingStepIndex(null);
      return;
    }

    // Cancel any single step currently playing
    speechService.stopSpeaking();
    setSpeakingStepIndex(null);
    setLoadingStepIndex(null);

    setIsPlayingAll(true);
    setLoadingAudio(true);

    const prefix = isTa ? 'படி' : 'Step';
    const text = steps.map((s, i) => `${prefix} ${i + 1}: ${s.step}`).join(". ");

    speechService.speak(
      text,
      language,
      () => {
        setIsPlayingAll(false);
        setLoadingAudio(false);
      },
      (errMsg) => {
        setIsPlayingAll(false);
        setLoadingAudio(false);
        if (errMsg) {
          alert(isTa ? "தமிழ் குரல் சேவை தற்போது கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." : errMsg);
        }
      },
      () => {
        setLoadingAudio(false);
      }
    );
  };

  const getAgeLabel = (ageKey) => {
    switch(ageKey) {
      case 'Infant': return isTa ? '👶 குழந்தை' : '👶 Infant';
      case 'Child': return isTa ? '🧒 சிறுவர்' : '🧒 Child';
      case 'Adult': return isTa ? '🧑 பெரியவர்' : '🧑 Adult';
      default: return isTa ? '👴 முதியவர்' : '👴 Elderly';
    }
  };

  // Compile full module listing (merge dynamic keys and offline keys)
  const modulesList = dbGuides.length > 0 
    ? dbGuides.map(g => ({ type: g.type, title: isTa ? g.titleTa : g.titleEn }))
    : Object.keys(t.guides).map(key => ({ type: key, title: t.guides[key].title }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
      
      {/* 🧭 Guides module menu grid */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🔧 {isTa ? 'முதலுதவி வழிகாட்டிகள்' : 'Emergency Guides'}
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.5rem'
        }}>
          {modulesList.map((m) => (
            <button
              key={m.type}
              onClick={() => {
                setSelectedModule(m.type);
                setCheckedSteps({});
                speechService.stopSpeaking();
                // Clear active context so it doesn't fight manually loaded modules
                setActiveEmergency(null);
              }}
              style={{
                padding: '10px 8px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: selectedModule === m.type ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.01)',
                borderColor: selectedModule === m.type ? 'var(--color-primary)' : 'var(--glass-border)',
                color: selectedModule === m.type ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                textAlign: 'center',
                transition: 'var(--transition-smooth)'
              }}
            >
              {m.title}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Step-by-Step Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Guide Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800 }}>{activeGuide.title}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{activeGuide.description}</p>
          </div>
          
          {/* Age Demographics Badge Row */}
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
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              >
                {getAgeLabel(age)}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Playback helper bar */}
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
            🎙️ {isTa ? 'குரல் வழி முதலுதவி உதவியாளர்:' : 'Hands-Free voice instruction assistant:'}
          </span>
          <button 
            onClick={speakAllSteps}
            className="btn btn-glass"
            style={{ 
              padding: '4px 10px', 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: isPlayingAll ? 'var(--color-critical-glow)' : undefined,
              borderColor: isPlayingAll ? 'var(--color-critical)' : undefined,
              color: isPlayingAll ? 'var(--color-critical)' : undefined
            }}
            disabled={loadingAudio}
          >
            {loadingAudio ? (
              <>
                <Loader2 size={12} className="spin" /> {isTa ? 'ஆடியோ தயாராகிறது...' : 'Preparing audio...'}
              </>
            ) : isPlayingAll ? (
              <>
                <VolumeX size={12} /> {isTa ? 'நிறுத்து' : 'Stop Audio'}
              </>
            ) : (
              <>
                <Volume2 size={12} /> {isTa ? 'வழிமுறைகளைக் கேள்' : 'Play All Instructions'}
              </>
            )}
          </button>
        </div>

        {/* Steps checklists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {steps.length > 0 ? (
            steps.map((stepItem, index) => {
              const isChecked = checkedSteps[index];
              const isSpeaking = speakingStepIndex === index;
              
              return (
                <div 
                  key={index} 
                  className="glass-panel" 
                  style={{
                    padding: '1rem',
                    background: isChecked ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255,255,255, 0.01)',
                    borderColor: isChecked ? 'var(--color-safe)' : 'var(--glass-border)',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {/* Check circle button */}
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

                  {/* Context */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.7rem',
                      color: isChecked ? 'var(--color-safe)' : 'var(--color-primary)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.15rem'
                    }}>
                      {isTa ? `படி ${index + 1}` : `Step ${index + 1}`}
                    </div>
                    <p style={{
                      fontSize: '0.85rem',
                      color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      fontWeight: stepItem.bold && !isChecked ? 700 : 400
                    }}>
                      {stepItem.step}
                    </p>

                    {/* Metronome for CPR Compressions */}
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
                        {/* Pulser heart */}
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
                            {isTa ? 'CPR மார்பு அழுத்தக் கருவி (110 BPM)' : 'CPR Compress Metronome (110 BPM)'}
                          </strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {isTa 
                              ? 'இந்த துடிப்பிற்கு ஏற்ப மார்பை அழுத்தவும். வேகமாக அமுக்கவும்.' 
                              : 'Compress the chest matching this pulse. Push down hard and fast.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Read step out loud */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakStep(index);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isSpeaking ? 'var(--color-critical)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isSpeaking ? (isTa ? 'நிறுத்து' : 'Stop') : (isTa ? 'கேள்' : 'Read aloud')}
                  >
                    {loadingStepIndex === index ? (
                      <Loader2 size={16} className="spin" style={{ color: 'var(--color-primary)' }} />
                    ) : isSpeaking ? (
                      <VolumeX size={16} style={{ color: 'var(--color-critical)' }} />
                    ) : (
                      <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {isTa ? 'வழிகாட்டிகள் கிடைக்கவில்லை.' : 'No steps defined for this emergency profile.'}
            </div>
          )}
        </div>

        {/* Completion Panel */}
        {steps.length > 0 && Object.keys(checkedSteps).length === steps.length && (
          <div style={{
            background: 'var(--color-safe-glow)',
            border: '1px solid var(--color-safe)',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem'
          }}>
            <Award size={36} style={{ color: 'var(--color-safe)' }} />
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
              {isTa ? 'அவசர நடவடிக்கைகள் அனைத்தும் முடிந்தது' : 'Emergency Actions Completed'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa
                ? 'சுவாசம் மற்றும் விழிப்புடன் உள்ளாரா என கண்காணிக்கவும். அவசர மருத்துவக் குழு (112/108) வரும் வரை காத்திருக்கவும்.'
                : 'Maintain airway status and monitor responsiveness. Stand by for emergency paramedics (112/108) to arrive.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
