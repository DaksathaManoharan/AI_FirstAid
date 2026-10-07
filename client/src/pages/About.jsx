import React, { useContext } from 'react';
import { HeartPulse, ShieldAlert, Award } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function About() {
  const { language } = useContext(AppContext);
  const isTa = language === 'ta';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 🏥 Brand Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(6,9,19,0.8) 0%, rgba(59,130,246,0.05) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          background: 'var(--color-critical-glow)',
          color: 'var(--color-critical)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem'
        }}>
          <HeartPulse size={30} className="animate-cpr-heart" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
          {isTa ? 'AI முதலுதவி அவசர உதவியாளர்' : 'AI First Aid Emergency Assistant'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {isTa 
            ? 'அவசரகால முடிவெடுத்தல் மற்றும் பாதுகாப்பு முதலுதவி வழிகாட்டி தளம்.' 
            : 'A location-aware, bilingual emergency triage and decision support system.'}
        </p>
      </div>

      {/* ⚠️ Critical Medical Disclaimer */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid var(--color-critical)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <ShieldAlert size={28} style={{ color: 'var(--color-critical)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ color: 'var(--color-critical)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {isTa ? 'மருத்துவ மறுப்புரை (Disclaimer)' : 'OFFICIAL MEDICAL DISCLAIMER'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isTa 
              ? 'இந்த பயன்பாடு முற்றிலும் முதலுதவி விழிப்புணர்வு மற்றும் அவசரநிலை முடிவெடுக்கும் ஆதரவிற்காக வடிவமைக்கப்பட்டுள்ளது. இது மருத்துவ நோயறிதலை வழங்காது மற்றும் தொழில்முறை அவசர மருத்துவ பராமரிப்புக்கு மாற்றாக செயல்படாது. அவசர ஆபத்துக்களில் உடனடியாக 112 அல்லது 108 ஐ தொடர்பு கொள்ளவும்.'
              : 'This application provides general first-aid information and emergency decision support. It is NOT a medical diagnosis system. The suggestions provided do not substitute for professional medical assessment, diagnostic advice, or clinical intervention. In life-threatening emergencies, immediately dial 112 or 108 first.'}
          </p>
        </div>
      </div>

      {/* 🛡️ Mission & Purpose */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} style={{ color: 'var(--color-primary)' }} />
          {isTa ? 'செயல்பாட்டு நோக்கம்' : 'Mission & Purpose'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {isTa 
            ? 'இந்த மென்பொருள் அவசர காலங்களில் உடனடி முதலுதவி வழிகாட்டுதல்களை வழங்க வடிவமைக்கப்பட்டுள்ளது. AI வழிகாட்டிகள், ஆஃப்லைன் வரைபடங்கள் மற்றும் குரல் உதவி மூலமாக, அவசர உதவிகள் வருவதற்கு முன்னதாகவே உயிர்களைக் காப்பாற்ற உதவுகிறது.'
            : 'This platform is designed to minimize response times during critical medical emergencies. By combining real-time AI triage with offline safety engines, dynamic maps, and speech modules, it empowers bystanders to perform immediate first aid safely before professional emergency services arrive.'}
        </p>
      </div>
      
    </div>
  );
}
