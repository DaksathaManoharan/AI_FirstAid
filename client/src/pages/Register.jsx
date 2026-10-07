import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Key, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function Register() {
  const { language, loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  const t = translations[language];
  const isTa = language === 'ta';

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorText(isTa ? "கடவுச்சொற்கள் பொருந்தவில்லை." : "Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorText("");

    try {
      const registerRes = await api.register(name.trim(), email.trim(), password, language);
      loginUser(registerRes.token, registerRes.user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorText(isTa 
        ? "பதிவு செய்வதில் தோல்வி. மின்னஞ்சல் ஏற்கனவே பயன்பாட்டில் இருக்கலாம்." 
        : "Registration failed. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <UserPlus size={24} style={{ color: 'var(--color-primary)' }} />
            {isTa ? 'கணக்கு உருவாக்கவும்' : 'Register Profile'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isTa ? 'அவசர தகவல்கள் மற்றும் சரிபார்ப்பு பட்டியல்களை ஒத்திசைக்க கணக்கு தொடங்கவும்.' : 'Create an account to synchronize checklists and log sessions.'}
          </p>
        </div>

        {errorText && (
          <div style={{
            background: 'var(--color-critical-glow)',
            border: '1px solid var(--color-critical)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} />
            <span>{errorText}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {isTa ? 'முழு பெயர்:' : 'Full Name:'}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="e.g., Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {isTa ? 'மின்னஞ்சல் முகவரி:' : 'Email Address:'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="e.g., jane@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {isTa ? 'கடவுச்சொல்:' : 'Password:'}
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Create password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {isTa ? 'கடவுச்சொல்லை உறுதிப்படுத்துக:' : 'Confirm Password:'}
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="Confirm password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn"
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '0.5rem'
            }}
          >
            {loading ? '...' : (isTa ? 'பதிவு செய்' : 'Register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isTa ? 'ஏற்கனவே கணக்கு உள்ளதா? ' : 'Already have an account? '}
          </span>
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
            {isTa ? 'உள்நுழையவும்' : 'Login Here'}
          </Link>
        </div>
      </div>
    </div>
  );
}
