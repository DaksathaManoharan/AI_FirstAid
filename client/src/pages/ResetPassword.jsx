import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { AppContext } from '../context/AppContext';

export default function ResetPassword() {
  const { language } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTa = language === 'ta';

  const [email, setEmail] = useState('');
  const [tokenOrOtp, setTokenOrOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Read URL query params if user clicked direct reset link in email
  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const urlToken = searchParams.get('token');
    if (urlEmail) setEmail(urlEmail);
    if (urlToken) setTokenOrOtp(urlToken);
  }, [searchParams]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!email.trim()) {
      setStatusMessage({
        type: 'error',
        text: isTa ? 'மின்னஞ்சல் முகவரியை உள்ளிடவும்.' : 'Please enter your email address.'
      });
      return;
    }

    if (!tokenOrOtp.trim()) {
      setStatusMessage({
        type: 'error',
        text: isTa ? 'சரிபார்ப்புக் குறியீடு அல்லது டோக்கனை உள்ளிடவும்.' : 'Please enter the 6-digit verification code or token.'
      });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({
        type: 'error',
        text: isTa ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்.' : 'Password must be at least 6 characters long.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: isTa ? 'கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும்.' : 'Passwords do not match. Please verify.'
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.resetPassword(email.trim(), tokenOrOtp.trim(), newPassword);
      setStatusMessage({
        type: 'success',
        text: isTa 
          ? 'உங்கள் கடவுச்சொல் வெற்றிகரமாக மீட்டமைக்கப்பட்டது! உள்நுழையவும்.' 
          : res.message || 'Password reset successfully! Redirecting to login...'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || (isTa ? 'கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை. குறியீட்டைச் சரிபார்க்கவும்.' : 'Failed to reset password. Please check your verification code.')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            color: 'var(--color-primary)',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem'
          }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isTa ? 'புதிய கடவுச்சொல்லை அமைக்கவும்' : 'Set New Password'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isTa 
              ? 'உங்கள் மின்னஞ்சலில் பெறப்பட்ட 6 இலக்கக் குறியீட்டைப் பயன்படுத்தி புதிய கடவுச்சொல்லை அமைக்கவும்.' 
              : 'Enter the 6-digit code sent to your email to choose your new password.'}
          </p>
        </div>

        {statusMessage.text && (
          <div style={{
            background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-critical-glow)',
            border: `1px solid ${statusMessage.type === 'success' ? 'var(--color-safe)' : 'var(--color-critical)'}`,
            color: statusMessage.type === 'success' ? 'var(--color-safe)' : '#fff',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {isTa ? 'மின்னஞ்சல் முகவரி:' : 'Email Address:'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="yourname@gmail.com"
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
              {isTa ? '6 இலக்கக் குறியீடு / மீட்டமைப்பு டோக்கன்:' : '6-Digit Code / Reset Token:'}
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. 849201"
                value={tokenOrOtp}
                onChange={(e) => setTokenOrOtp(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  outline: 'none',
                  fontWeight: 600
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {isTa ? 'புதிய கடவுச்சொல் (குறைந்தது 6 எழுத்துகள்):' : 'New Password (min 6 characters):'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              {isTa ? 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்:' : 'Confirm New Password:'}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Confirm new password..."
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
            {loading ? (isTa ? 'புதுப்பிக்கப்படுகிறது...' : 'Updating...') : (isTa ? 'கடவுச்சொல்லை மாற்றவும்' : 'Update Password')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/login" style={{
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ArrowLeft size={14} />
            {isTa ? 'உள்நுழைவுப் பக்கத்திற்குச் செல்' : 'Back to Login'}
          </Link>
        </div>

      </div>
    </div>
  );
}
