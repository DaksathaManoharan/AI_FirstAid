import React, { useState, useEffect, useContext } from 'react';
import { ShieldCheck, Volume2, VolumeX, Loader2, Info, AlertTriangle, CheckSquare } from 'lucide-react';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function DisasterPrepPage() {
  const { language, user } = useContext(AppContext);
  const t = translations[language];
  const isTa = language === 'ta';

  const [disastersList, setDisastersList] = useState([]);
  const [selectedType, setSelectedType] = useState("flood");
  const [timelineData, setTimelineData] = useState(null);
  const [activeStage, setActiveStage] = useState("before"); // before, during, after
  const [checklistState, setChecklistState] = useState({});
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
    };
  }, []);

  // 1. Fetch disasters directory on load
  useEffect(() => {
    const loadDisasters = async () => {
      try {
        const list = await api.getDisasters();
        setDisastersList(list);
      } catch (err) {
        console.warn("Failed to load disasters directory from server:", err.message);
      }
    };
    loadDisasters();
  }, []);

  // 2. Fetch specific disaster details when selectedType changes
  useEffect(() => {
    const loadTimeline = async () => {
      setLoading(true);
      try {
        const data = await api.getDisasterByType(selectedType);
        setTimelineData(data);
        
        // Setup initial checklist status
        if (user) {
          // Logged-in user: query DB checklist
          try {
            const dbChecklist = await api.getChecklist();
            const matched = dbChecklist.filter(c => c.disasterType === selectedType);
            const state = {};
            matched.forEach(c => {
              state[c.item] = c.completed;
            });
            setChecklistState(state);
          } catch (err) {
            console.warn("Failed to retrieve DB checklist:", err.message);
          }
        } else {
          // Guest user: query LocalStorage
          const saved = localStorage.getItem(`guest_checklist_${selectedType}`);
          setChecklistState(saved ? JSON.parse(saved) : {});
        }
      } catch (err) {
        console.error("Failed to load disaster details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTimeline();
  }, [selectedType, user]);

  const handleChecklistToggle = async (itemText) => {
    const newCompleted = !checklistState[itemText];
    const newState = { ...checklistState, [itemText]: newCompleted };
    setChecklistState(newState);

    if (user) {
      // Logged in: Sync with DB
      try {
        await api.updateChecklist(selectedType, itemText, newCompleted);
      } catch (err) {
        console.warn("Failed to sync checklist update to database:", err.message);
      }
    } else {
      // Guest: Sync with LocalStorage
      localStorage.setItem(`guest_checklist_${selectedType}`, JSON.stringify(newState));
    }
  };

  const speakStageGuidelines = () => {
    if (!timelineData) return;

    if (isPlayingAudio || loadingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
      setLoadingAudio(false);
      return;
    }

    const stages = isTa ? timelineData.timelineTa : timelineData.timelineEn;
    const items = stages[activeStage] || [];
    
    const stageName = activeStage === 'before' 
      ? (isTa ? 'முன்னதாக செய்ய வேண்டியவை' : 'Before timeline preparation')
      : activeStage === 'during'
      ? (isTa ? 'போது செய்ய வேண்டியவை' : 'During timeline actions')
      : (isTa ? 'பின்னர் செய்ய வேண்டியவை' : 'After timeline actions');

    const speakText = `${stageName}. ${items.join(". ")}`;
    
    setIsPlayingAudio(true);
    setLoadingAudio(true);

    speechService.speak(
      speakText,
      language,
      () => {
        setIsPlayingAudio(false);
        setLoadingAudio(false);
      },
      (errMsg) => {
        setIsPlayingAudio(false);
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

  if (!timelineData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        {isTa ? 'பதிவிறக்கம் செய்யப்படுகிறது...' : 'Loading preparedness guidelines...'}
      </div>
    );
  }

  const stagesData = isTa ? timelineData.timelineTa : timelineData.timelineEn;
  const guidelines = stagesData[activeStage] || [];
  const checklistItems = timelineData.checklist || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
      
      {/* 🌪️ Disaster type navigation */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🚨 {isTa ? 'பேரிடர் மேலாண்மை மையம்' : 'Disaster Preparedness Modules'}
        </h3>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {disastersList.map(dis => (
            <button
              key={dis.type}
              onClick={() => {
                setSelectedType(dis.type);
                speechService.stopSpeaking();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                background: selectedType === dis.type ? 'var(--color-primary-glow)' : 'rgba(255,255,255,0.02)',
                borderColor: selectedType === dis.type ? 'var(--color-primary)' : 'var(--glass-border)',
                color: selectedType === dis.type ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <span>{dis.icon}</span>
              <span>{isTa ? dis.nameTa : dis.nameEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 📅 Before/During/After Timeline Navigation */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isTa ? timelineData.nameTa : timelineData.nameEn} {timelineData.icon}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa ? 'பேரிடர் காலங்களில் ஆபத்துகளைக் குறைக்க இந்த பாதுகாப்பு வழிகளைப் பின்பற்றவும்.' : 'Timeline-based survival guidelines and checklists.'}
            </p>
          </div>
          
          <button 
            onClick={speakStageGuidelines}
            className="btn btn-glass"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.75rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: isPlayingAudio ? 'var(--color-critical-glow)' : undefined,
              borderColor: isPlayingAudio ? 'var(--color-critical)' : undefined,
              color: isPlayingAudio ? 'var(--color-critical)' : undefined
            }}
            disabled={loadingAudio}
          >
            {loadingAudio ? (
              <>
                <Loader2 size={14} className="spin" />
                {isTa ? 'ஆடியோ தயாராகிறது...' : 'Preparing audio...'}
              </>
            ) : isPlayingAudio ? (
              <>
                <VolumeX size={14} />
                {isTa ? 'நிறுத்து' : 'Stop Audio'}
              </>
            ) : (
              <>
                <Volume2 size={14} />
                {isTa ? 'வழிகாட்டிகளைக் கேள்' : 'Read Timeline Out Loud'}
              </>
            )}
          </button>
        </div>

        {/* Stage selection badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'var(--bg-secondary)',
          padding: '3px',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)'
        }}>
          {[
            { id: 'before', label: isTa ? '🟢 முன்னதாக' : '🟢 BEFORE', desc: isTa ? 'தயாரிப்பு' : 'Prep' },
            { id: 'during', label: isTa ? '🟠 போது' : '🟠 DURING', desc: isTa ? 'பாதுகாப்பு' : 'Survive' },
            { id: 'after', label: isTa ? '🔵 பின்னர்' : '🔵 AFTER', desc: isTa ? 'மீட்பு' : 'Recover' }
          ].map(stage => (
            <button
              key={stage.id}
              onClick={() => {
                setActiveStage(stage.id);
                speechService.stopSpeaking();
              }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: activeStage === stage.id ? 'var(--color-primary)' : 'transparent',
                color: activeStage === stage.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <strong style={{ fontSize: '0.8rem' }}>{stage.label}</strong>
              <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>{stage.desc}</span>
            </button>
          ))}
        </div>

        {/* Guidelines Text List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {guidelines.map((text, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px'
              }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: activeStage === 'before' ? 'var(--color-safe-glow)' : activeStage === 'during' ? 'var(--color-urgent-glow)' : 'var(--color-primary-glow)',
                color: activeStage === 'before' ? 'var(--color-safe)' : activeStage === 'during' ? 'var(--color-urgent)' : 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {idx + 1}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 📋 Disaster Preparedness Checklist */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          📋 {isTa ? 'பாதுகாப்பு சரிபார்ப்புப் பட்டியல் (Checklist)' : `${selectedType.toUpperCase()} Preparedness Checklist`}
        </h3>
        
        {user ? (
          <p style={{ fontSize: '0.7rem', color: 'var(--color-safe)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} />
            {isTa ? 'இருப்புப் பட்டியல் உங்களது கணக்குடன் ஒத்திசைக்கப்பட்டுள்ளது.' : 'Checklist status is synchronized with your profile.'}
          </p>
        ) : (
          <p style={{ fontSize: '0.7rem', color: 'var(--color-moderate)' }}>
            ⚠️ {isTa ? 'விருந்தினர் பயன்முறை: சாதனத்தில் மட்டுமே சேமிக்கப்படும்.' : 'Guest Mode: Checklist progress saved locally on device.'}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {checklistItems.map((item, idx) => {
            const isCompleted = !!checklistState[item];
            return (
              <label 
                key={idx} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: isCompleted ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.01)',
                  border: '1px solid',
                  borderColor: isCompleted ? 'var(--color-safe)' : 'var(--glass-border)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isCompleted}
                  onChange={() => handleChecklistToggle(item)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--color-safe)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{
                  color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)',
                  textDecoration: isCompleted ? 'line-through' : 'none'
                }}>
                  {item}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
