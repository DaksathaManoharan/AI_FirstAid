import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Key, Mail, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { api } from '../services/api';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function Login() {
  const { language, loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  const t = translations[language];
  const isTa = language === 'ta';

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Forgot password states
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter code & new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [resetMode, setResetMode] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorText("");

    try {
      const response = await api.login(email.trim(), password);
      loginUser(response.token, response.user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorText(err.message || (isTa 
        ? "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது." 
        : "Invalid email or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError(isTa ? "மின்னஞ்சல் முகவரியை உள்ளிடவும்." : "Please enter your email address.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    setDevCode("");

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotSuccess(res.message || (isTa 
        ? "மீட்டமைப்புக் குறியீடு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது." 
        : "Password reset instructions sent to your email."));
      if (res.devOtp) {
        setDevCode(res.devOtp);
        setVerificationCode(res.devOtp);
      }
      setResetMode(res.mode || "");
      setForgotStep(2);
    } catch (err) {
      console.error(err);
      setForgotError(err.message || (isTa ? "குறியீட்டை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Failed to send reset code. Please try again."));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setForgotError(isTa ? "சரிபார்ப்புக் குறியீட்டை உள்ளிடவும்." : "Please enter the verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError(isTa ? "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்." : "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError(isTa ? "கடவுச்சொற்கள் பொருந்தவில்லை." : "Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const res = await api.resetPassword(forgotEmail.trim(), verificationCode.trim(), newPassword);
      setForgotSuccess(res.message || (isTa ? "கடவுச்சொல் புதுப்பிக்கப்பட்டது! உள்நுழையவும்." : "Password reset successfully! You can now log in."));
      
      // Auto prefill login email and switch to login
      setEmail(forgotEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setForgotMode(false);
        setForgotStep(1);
      }, 2000);
    } catch (err) {
      console.error(err);
      setForgotError(err.message || (isTa ? "கடவுச்சொல்லை மாற்ற முடியவில்லை. குறியீட்டைச் சரிபார்க்கவும்." : "Failed to reset password. Please check your verification code."));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Normal Login View */}
        {!forgotMode ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <LogIn size={24} style={{ color: 'var(--color-primary)' }} />
                {isTa ? 'உள்நுழையவும்' : 'User Login'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {isTa ? 'உங்கள் கணக்கில் உள்நுழைந்து அவசர வரலாற்றைச் சேமிக்கவும்.' : 'Sign in to sync your emergency logs and checklists.'}
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

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  {isTa ? 'மின்னஞ்சல் முகவரி:' : 'Email Address:'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    placeholder="e.g., yourname@domain.com"
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
                    placeholder="Enter password..."
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

              {/* 🔑 Forgot Password Trigger */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.25rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setForgotEmail(email);
                    setForgotStep(1);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 0',
                    textDecoration: 'underline'
                  }}
                >
                  {isTa ? 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' : 'Forgot Password?'}
                </button>
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
                  marginTop: '0.25rem'
                }}
              >
                {loading ? '...' : (isTa ? 'உள்நுழை' : 'Login')}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isTa ? 'புதிய கணக்கா? ' : "Don't have an account? "}
              </span>
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
                {isTa ? 'பதிவு செய்யவும்' : 'Register Here'}
              </Link>
            </div>
          </>
        ) : (
          /* Forgot Password View */
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--color-primary)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem'
              }}>
                <KeyRound size={24} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isTa ? 'கடவுச்சொல் மீட்பு' : 'Reset Password'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {forgotStep === 1
                  ? (isTa ? 'மீட்டமைப்பு இணைப்பைப் பெற உங்கள் மின்னஞ்சலை உள்ளிடவும்.' : 'Enter your email to receive a password reset link and code.')
                  : (isTa ? 'உங்கள் மின்னஞ்சலில் பெறப்பட்ட 6 இலக்கக் குறியீட்டை உள்ளிடவும்.' : 'Enter the 6-digit code sent to your email to set a new password.')}
              </p>
            </div>

            {forgotError && (
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
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--color-safe)',
                color: 'var(--color-safe)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={14} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Send reset email */}
            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {isTa ? 'மின்னஞ்சல் முகவரி:' : 'Email Address:'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      placeholder="yourname@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
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
                  disabled={forgotLoading}
                  className="btn"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {forgotLoading ? (isTa ? 'அனுப்பப்படுகிறது...' : 'Sending...') : (isTa ? 'மீட்டமைப்பு இணைப்பை அனுப்பு' : 'Send Reset Link to Email')}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setErrorText(""); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <ArrowLeft size={14} />
                    {isTa ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(2)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    {isTa ? 'ஏற்கனவே குறியீடு உள்ளதா?' : 'Already have code?'}
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Enter code & new password */
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {devCode && (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px dashed var(--color-primary)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {resetMode === 'dev_mock'
                        ? (isTa ? '💡 டெவலப்மென்ட் குறியீடு (தானாக நிரப்பப்பட்டது):' : '💡 Verification Code (Auto-filled):')
                        : (isTa ? 'சரிபார்ப்புக் குறியீடு:' : 'Verification Code:')}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '4px', color: '#60a5fa', margin: '4px 0' }}>
                      {devCode}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {isTa 
                        ? 'உங்கள் ஜிமெயில் இன்பாக்ஸிற்கு நேரடி மின்னஞ்சல் பெற .env-ல் SMTP அமைப்புகளை உள்ளிடவும்.'
                        : 'To receive emails in your real Gmail inbox, configure SMTP_USER & SMTP_PASS in server/.env'}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {isTa ? '6 இலக்கக் குறியீடு:' : '6-Digit Verification Code:'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="e.g. 849201"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        outline: 'none'
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {isTa ? 'புதிய கடவுச்சொல்:' : 'New Password:'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      placeholder="Min 6 characters..."
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
                    {isTa ? 'கடவுச்சொல்லை உறுதிப்படுத்தவும்:' : 'Confirm Password:'}
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
                  disabled={forgotLoading}
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
                    marginTop: '0.25rem'
                  }}
                >
                  {forgotLoading ? (isTa ? 'புதுப்பிக்கப்படுகிறது...' : 'Updating...') : (isTa ? 'கடவுச்சொல்லை மாற்றி உள்நுழையவும்' : 'Reset Password & Log In')}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setErrorText(""); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <ArrowLeft size={14} />
                    {isTa ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    {isTa ? 'குறியீட்டை மீண்டும் அனுப்பு' : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
