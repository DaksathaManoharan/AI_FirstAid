import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, ShieldAlert, Brain, MapPin, ShieldAlert as ShieldIcon, HelpCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function Home() {
  const { language, theme, setActiveEmergency } = useContext(AppContext);
  const navigate = useNavigate();
  const t = translations[language];
  const isTa = language === 'ta';

  const quickCards = [
    { type: 'cpr', icon: '🫀', title: isTa ? 'சி.பி.ஆர் (CPR)' : 'CPR' },
    { type: 'choking', icon: '😮💨', title: isTa ? 'தொண்டை அடைப்பு' : 'Choking' },
    { type: 'bleeding', icon: '🩸', title: isTa ? 'இரத்தப்போக்கு' : 'Bleeding' },
    { type: 'burn', icon: '🔥', title: isTa ? 'தீக்காயம்' : 'Burns' },
    { type: 'shock', icon: '⚡', title: isTa ? 'மின் அதிர்ச்சி' : 'Electric Shock' },
    { type: 'fracture', icon: '🦴', title: isTa ? 'எலும்பு முறிவு' : 'Fracture' },
    { type: 'bite', icon: '🐍', title: isTa ? 'பாம்பு கடி' : 'Snake Bite' },
    { type: 'poison', icon: '☠️', title: isTa ? 'விஷம் குடித்தல்' : 'Poisoning' },
    { type: 'fainting', icon: '😵', title: isTa ? 'மயக்கம்' : 'Fainting' },
    { type: 'accident', icon: '🚗', title: isTa ? 'விபத்து' : 'Accident' }
  ];

  const handleCardClick = (type) => {
    // Set selected type in global state and route to smart-guide page
    setActiveEmergency({ emergencyType: type, ageGroup: 'Adult' });
    navigate('/smart-guide');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 🚀 Hero Branding Section */}
      <div className="glass-panel" style={{
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, rgba(8, 12, 20, 0.95) 0%, rgba(59, 130, 246, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(59, 130, 246, 0.06) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--color-primary)'
        }} />
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {isTa ? 'AI முதலுதவி உதவியாளர்' : 'AI First Aid'}
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxW: '600px', margin: '0 auto 1.5rem' }}>
          {isTa ? 'ஒவ்வொரு நொடியும் முக்கியமாக இருக்கும்போது உடனடி வழிகாட்டுதல்.' : 'Immediate guidance when every second matters.'}
        </p>
        
        {/* Dynamic Warning Alert */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          maxWidth: '650px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <ShieldAlert size={28} style={{ color: 'var(--color-critical)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>{isTa ? 'மருத்துவ மறுப்புரை:' : 'Disclaimer:'}</strong>{' '}
            {isTa 
              ? 'இந்த பயன்பாடு பொதுவான முதலுதவித் தகவலை மட்டுமே வழங்குகிறது. இது தொழில்முறை மருத்துவ சிகிச்சைக்கு மாற்றாக இருக்காது.' 
              : 'This application provides general first-aid information and emergency decision support. It does not replace professional medical care.'}
          </span>
        </div>
      </div>

      {/* 📞 India Helpline Quick Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <a href="tel:112" className="btn btn-danger" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: 700,
          padding: '12px'
        }}>
          <Phone size={18} /> DIAL 112
        </a>
        <a href="tel:108" className="btn" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: 700,
          padding: '12px',
          background: 'var(--color-urgent)',
          color: '#fff'
        }}>
          <Phone size={18} /> DIAL 108
        </a>
      </div>

      {/* 🏁 Primary Modules Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>

        {/* AI Copilot Card */}
        <div onClick={() => navigate('/copilot')} className="glass-panel" style={{
          padding: '1.25rem',
          cursor: 'pointer',
          borderLeft: '4px solid var(--color-primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px'
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '0.25rem' }}>
              🧠 {isTa ? 'AI அவசர கோபைலட்' : 'AI Assessment Copilot'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa ? 'குரல், உரை அல்லது புகைப்படம் மூலம் வகைப்படுத்துக.' : 'Triage emergency via voice, text, or camera.'}
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
            {isTa ? 'கோபைலட் திற →' : 'Launch Triage →'}
          </span>
        </div>

        {/* Nearby Resources Map */}
        <div onClick={() => navigate('/emergency-map')} className="glass-panel" style={{
          padding: '1.25rem',
          cursor: 'pointer',
          borderLeft: '4px solid var(--color-safe)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px'
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-safe)', fontWeight: 800, marginBottom: '0.25rem' }}>
              📍 {isTa ? 'அவசர வரைபடம்' : 'Find Nearby Help'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa ? 'அருகிலுள்ள மருத்துவமனைகள் மற்றும் ஏ.இ.டி (AED) வரைபடம்.' : 'Map of nearby clinics, pharmacies, and AEDs.'}
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-safe)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
            {isTa ? 'வரைபடம் காண் →' : 'Open Map →'}
          </span>
        </div>

        {/* Disaster prep */}
        <div onClick={() => navigate('/disaster-prep')} className="glass-panel" style={{
          padding: '1.25rem',
          cursor: 'pointer',
          borderLeft: '4px solid var(--color-moderate)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px'
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', color: 'var(--color-moderate)', fontWeight: 800, marginBottom: '0.25rem' }}>
              🌪️ {isTa ? 'பேரிடர் தயாரிப்பு' : 'Disaster Preparation'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa ? 'வெள்ளம் மற்றும் புயல் கால பாதுகாப்பு சரிபார்ப்பு.' : 'Safety guidelines and preparedness checklists.'}
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-moderate)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
            {isTa ? 'வழிகாட்டிகள் →' : 'Read timeline →'}
          </span>
        </div>

        {/* AI Substance & Poison Analysis Card */}
        <div onClick={() => navigate('/poison-control')} className="glass-panel" style={{
          padding: '1.25rem',
          cursor: 'pointer',
          borderLeft: '4px solid #a855f7',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px'
        }}>
          <div>
            <h2 style={{ fontSize: '1rem', color: '#a855f7', fontWeight: 800, marginBottom: '0.25rem' }}>
              🧪 {isTa ? 'AI பொருள் & விஷ பகுப்பாய்வு' : 'AI Substance & Poison Analysis'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa ? 'இரசாயனங்கள், மருந்துகள் மற்றும் நச்சுப் பொருட்களை அடையாளம் கண்டு முதலுதவி பெறுக.' : 'Identify chemicals, medications, or toxins and get reliable first-aid steps.'}
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
            {isTa ? 'பகுப்பாய்வு செய்க →' : 'Analyze Substance →'}
          </span>
        </div>

      </div>

      {/* 🧰 Quick First Aid Cards Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🚑 {isTa ? 'விரைவு முதலுதவி அட்டைகள்' : 'Quick First-Aid Action Cards'}
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.75rem'
        }}>
          {quickCards.map((card) => (
            <button
              key={card.type}
              onClick={() => handleCardClick(card.type)}
              className="glass-panel"
              style={{
                padding: '1.25rem 0.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{ fontSize: '2rem' }}>{card.icon}</span>
              <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{card.title}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
