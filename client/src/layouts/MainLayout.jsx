import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Sun, Moon, LogIn, LogOut, User, Info, Settings } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function MainLayout({ children }) {
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

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <div className={`app-container ${theme}-theme`}>
      
      {/*  Header component */}
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
          {/* Logo / Title */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
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
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--color-safe)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>{t.erss_ready || 'ERSS 2.0'}</span>
              </h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {isTa ? 'அவசர முதலுதவி முடிவெடுக்கும் தளம்' : 'Emergency Triage & Decision Support'}
              </span>
            </div>
          </Link>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
            {/* Language dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'var(--bg-secondary)', padding: '2px 4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <button 
                onClick={() => setLanguage('en')}
                style={{
                  background: language === 'en' ? 'var(--color-primary)' : 'transparent',
                  color: language === 'en' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
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
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                தமிழ்
              </button>
            </div>

            {/* Dark/Light mode button */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn btn-glass" 
              style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? (
                <Sun size={16} style={{ color: 'var(--color-moderate)' }} />
              ) : (
                <Moon size={16} style={{ color: 'var(--color-primary)' }} />
              )}
            </button>

            {/* Auth status link */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'none', md: 'inline' }}>
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-glass"
                  style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Logout Profile"
                >
                  <LogOut size={16} style={{ color: 'var(--color-critical)' }} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="btn btn-glass"
                style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Login"
              >
                <LogIn size={16} style={{ color: 'var(--color-safe)' }} />
              </Link>
            )}

          </div>
        </div>

        {/* Navigation links */}
        <nav style={{
          display: 'flex',
          gap: '0.5rem',
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '0.75rem',
          overflowX: 'auto',
          scrollbarWidth: 'none' // Firefox
        }}>
          {[
            { path: '/', label: isTa ? '🏠 முகப்பு' : '🏠 Home' },
            { path: '/copilot', label: isTa ? '🧠 AI கோபைலட்' : '🧠 AI Copilot' },
            { path: '/smart-guide', label: isTa ? '🧰 முதலுதவி' : '🧰 First-Aid' },
            { path: '/emergency-map', label: isTa ? '📍 வரைபடம்' : '📍 Resources' },
            { path: '/disaster-prep', label: isTa ? '🌪️ பேரிடர்' : '🌪️ Disaster' },
            { path: '/poison-control', label: isTa ? '🧪 பொருள் & விஷம்' : '🧪 Substances' },
            { path: '/settings', label: isTa ? '⚙️ அமைப்புகள்' : '⚙️ Settings' },
            { path: '/about', label: isTa ? 'ℹ️ பற்றி' : 'ℹ️ About' }
          ].map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={({ isActive }) => ({
                padding: '6px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-smooth)'
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Main content grid */}
      <main className="main-content full-layout" style={{ padding: '0 1rem', flex: 1 }}>
        {children}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--glass-border)',
        marginTop: '2rem'
      }}>
        © 2026 {isTa ? 'AI முதலுதவி அவசர உதவியாளர். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'AI First Aid Emergency Assistant. All rights reserved.'}
      </footer>
    </div>
  );
}
