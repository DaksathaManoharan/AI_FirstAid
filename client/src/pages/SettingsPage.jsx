import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Trash2, UserX, HelpCircle, Save } from 'lucide-react';
import { api } from '../services/api';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function SettingsPage() {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    user, 
    logoutUser 
  } = useContext(AppContext);

  const navigate = useNavigate();
  const t = translations[language];
  const isTa = language === 'ta';

  const [saving, setSaving] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    if (!user) {
      setSuccessText(isTa ? "விருப்பங்கள் உள்ளூரில் சேமிக்கப்பட்டன." : "Preferences cached on device.");
      return;
    }

    setSaving(true);
    setSuccessText("");
    setErrorText("");

    try {
      await api.updatePreferences({
        language,
        theme,
        voiceEnabled: true
      });
      setSuccessText(isTa ? "விருப்பங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன." : "Preferences updated in profile database.");
    } catch (err) {
      console.error(err);
      setErrorText(isTa ? "சேமிப்பதில் தோல்வி." : "Failed to sync preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearLocalData = () => {
    if (window.confirm(isTa ? "உள்ளூர் ஆஃப்லைன் தரவு அனைத்தையும் அழிக்கவா?" : "Wipe all locally cached offline triage history?")) {
      localStorage.clear();
      logoutUser();
      alert(isTa ? "தரவு அழிக்கப்பட்டது. பக்கம் மீண்டும் ஏற்றப்படும்." : "Cache cleared. Reloading...");
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(isTa ? "எச்சரிக்கை! உங்கள் கணக்கை நிரந்தரமாக நீக்கவா? இதை மாற்ற முடியாது." : "WARNING! Permanently delete your profile and history from PostgreSQL? This action is irreversible.")) {
      try {
        await api.deleteAccount();
        logoutUser();
        alert(isTa ? "உங்கள் கணக்கு நீக்கப்பட்டது." : "Account successfully deleted.");
        navigate('/');
      } catch (err) {
        alert(isTa ? "கணக்கை நீக்க முடியவில்லை." : "Delete action failed.");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Configuration Form */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={22} />
          {isTa ? 'அமைப்புகள் & விருப்பங்கள்' : 'Application Settings'}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {isTa ? 'பயன்பாட்டின் மொழி, தீம் மற்றும் அவசர விருப்பங்களை நிர்வகிக்கவும்.' : 'Configure default languages, visual styles, and safety preferences.'}
        </p>

        {successText && (
          <div style={{ background: 'var(--color-safe-glow)', border: '1px solid var(--color-safe)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '1rem' }}>
            {successText}
          </div>
        )}

        {errorText && (
          <div style={{ background: 'var(--color-critical-glow)', border: '1px solid var(--color-critical)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '1rem' }}>
            {errorText}
          </div>
        )}

        <form onSubmit={handlePreferencesSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Language Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              {isTa ? 'முதன்மை மொழி:' : 'Primary Language:'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: language === 'en' ? 'var(--color-primary)' : 'var(--glass-border)',
                  background: language === 'en' ? 'var(--color-primary-glow)' : 'transparent',
                  color: language === 'en' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                English (en-IN)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: language === 'ta' ? 'var(--color-primary)' : 'var(--glass-border)',
                  background: language === 'ta' ? 'var(--color-primary-glow)' : 'transparent',
                  color: language === 'ta' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                தமிழ் (ta-IN)
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              {isTa ? 'காட்சித் தோற்றம் (Theme):' : 'Interface Theme:'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--glass-border)',
                  background: theme === 'dark' ? 'var(--color-primary-glow)' : 'transparent',
                  color: theme === 'dark' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🌑 Dark Mode
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: theme === 'light' ? 'var(--color-primary)' : 'var(--glass-border)',
                  background: theme === 'light' ? 'var(--color-primary-glow)' : 'transparent',
                  color: theme === 'light' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ☀️ Light Mode
              </button>
            </div>
          </div>

          {/* Profile Bind Notice */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shield size={16} style={{ color: 'var(--color-safe)' }} />
            <span>
              {user 
                ? (isTa ? `கணக்கு: ${user.name} (${user.email}). விருப்பங்கள் ஒத்திசைக்கப்படும்.` : `Logged in profile: ${user.email}. Preferences are synchronized.`)
                : (isTa ? 'விருந்தினர் கணக்கு: விருப்பங்கள் சாதன உலாவியில் தற்காலிகமாக சேமிக்கப்படும்.' : 'Guest Account: Settings are cached in the browser locally.')}
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginTop: '0.5rem'
            }}
          >
            <Save size={16} />
            {saving ? '...' : (isTa ? 'விருப்பங்களைச் சேமி' : 'Save Application Preferences')}
          </button>
        </form>
      </div>

      {/* Critical Actions Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--color-critical)', fontWeight: 800 }}>
          ⚠️ {isTa ? 'ஆபத்தான பகுதி (Dangerous Actions)' : 'Privacy & Diagnostics Area'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Clear local cache */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>
                {isTa ? 'உள்ளூர் தற்காலிகத் தரவை அழி' : 'Clear Offline Local Cache'}
              </strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {isTa ? 'சாதனத்தில் உள்ள அனைத்து தற்காலிக அவசர அமர்வுகளையும் அழிக்கும்.' : 'Erase all locally stored guest triage logs and cached state.'}
              </span>
            </div>
            <button 
              onClick={handleClearLocalData}
              className="btn btn-glass"
              style={{
                borderColor: 'var(--color-critical)',
                color: 'var(--color-critical)',
                padding: '6px 12px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={12} />
              {isTa ? 'தரவு நீக்கு' : 'Clear Cache'}
            </button>
          </div>

          {/* Delete Account */}
          {user && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '0.5rem', 
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '0.75rem'
            }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-critical)', display: 'block' }}>
                  {isTa ? 'கணக்கை நிரந்தரமாக நீக்கு' : 'Delete Account Permanently'}
                </strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {isTa ? 'சுயவிவரம் மற்றும் அனைத்து அவசர வரலாற்றையும் தரவுத்தளத்தில் இருந்து அழிக்கும்.' : 'Remove profile credentials and all saved session histories from PostgreSQL.'}
                </span>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="btn btn-danger"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <UserX size={12} />
                {isTa ? 'கணக்கு நீக்கு' : 'Delete Account'}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
