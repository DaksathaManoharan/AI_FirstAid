import React, { useState } from 'react';
import { Settings, HeartPulse, Sun, Moon } from 'lucide-react';
import { translations } from '../services/translations';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  geminiApiKey, 
  setGeminiApiKey, 
  language,
  setLanguage,
  theme,
  setTheme
}) {
  const [showSettings, setShowSettings] = useState(false);
  const t = translations[language];

  return (
    <header className="glass-panel" style={{
      margin: '1rem',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      zIndex: 100
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--color-critical-glow)',
            color: 'var(--color-critical)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <HeartPulse className="animate-cpr-heart" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {t.title} 
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--color-safe)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>{t.erss_ready}</span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.subtitle}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* Language Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setLanguage('en')}
              style={{
                background: language === 'en' ? 'var(--color-primary)' : 'transparent',
                color: language === 'en' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('ta')}
              style={{
                background: language === 'ta' ? 'var(--color-primary)' : 'transparent',
                color: language === 'ta' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              தமிழ்
            </button>
          </div>

          {/* Theme Switcher Button */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-glass" 
            style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px' }}
            title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {theme === 'dark' ? (
              <Sun size={18} style={{ color: 'var(--color-moderate)' }} />
            ) : (
              <Moon size={18} style={{ color: 'var(--color-primary)' }} />
            )}
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-glass" 
            style={{ padding: '8px', borderRadius: '50%', width: '38px', height: '38px' }}
            title="Configure Gemini API Settings"
          >
            <Settings size={18} style={{ color: showSettings ? 'var(--color-primary)' : 'var(--text-primary)' }} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        gap: '0.5rem',
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '0.75rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'copilot', label: t.copilot_tab },
          { id: 'guide', label: t.guide_tab },
          { id: 'map', label: t.map_tab },
          { id: 'disaster', label: t.disaster_tab }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Gemini Settings Expandable Panel */}
      {showSettings && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--glass-border)',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '0.5rem'
        }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{t.settings_title}</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {t.settings_desc}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="password"
              placeholder="Enter Gemini API Key..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
            {geminiApiKey && (
              <button 
                onClick={() => setGeminiApiKey('')}
                className="btn btn-glass"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {t.clear_btn}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: geminiApiKey ? 'var(--color-primary)' : 'var(--color-safe)',
              boxShadow: geminiApiKey ? '0 0 8px var(--color-primary)' : '0 0 8px var(--color-safe)'
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {t.active_engine}: {geminiApiKey ? t.gemini_live : t.local_rules}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
