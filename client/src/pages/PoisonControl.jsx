import React, { useState, useContext, useRef } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  Search, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Sparkles, 
  X, 
  FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function PoisonControl() {
  const { language } = useContext(AppContext);
  const t = translations[language];
  const isTa = language === 'ta';

  // Primary Inputs
  const [substance, setSubstance] = useState("");
  const [brandName, setBrandName] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [strength, setStrength] = useState("");
  const [amount, setAmount] = useState("");
  const [timeSince, setTimeSince] = useState("");
  const [ageGroup, setAgeGroup] = useState("Adult");
  const [weight, setWeight] = useState("");
  const [exposureRoute, setExposureRoute] = useState("swallowed");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // Label Scanner State
  const [labelImage, setLabelImage] = useState(null);
  const [scanningLabel, setScanningLabel] = useState(false);
  const [labelScanNote, setLabelScanNote] = useState("");
  const fileInputRef = useRef(null);

  // Results & Playback
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const commonSymptomOptions = [
    { id: 'nausea', en: 'Nausea / Vomiting', ta: 'குமட்டல் / வாந்தி' },
    { id: 'burning', en: 'Burning Mouth / Throat', ta: 'வாய் / தொண்டை எரிச்சல்' },
    { id: 'drowsy', en: 'Drowsiness / Confusion', ta: 'மயக்கம் / குழப்பம்' },
    { id: 'breathing', en: 'Difficulty Breathing', ta: 'மூச்சுத்திணறல்' },
    { id: 'seizures', en: 'Seizures / Convulsions', ta: 'வலிப்பு' },
    { id: 'drooling', en: 'Excessive Drooling / Foaming', ta: 'அதிக உமிழ்நீர் / நுரை' },
    { id: 'pain', en: 'Severe Abdominal Pain', ta: 'கடுமையான வயிற்று வலி' }
  ];

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handlePoisonSearch = async (e) => {
    if (e) e.preventDefault();
    if (!substance.trim() && !brandName.trim() && !activeIngredient.trim()) return;

    setLoading(true);
    setErrorText("");
    setResult(null);
    speechService.stopSpeaking();
    setIsPlayingAudio(false);

    try {
      const payload = {
        substance: substance.trim(),
        brandName: brandName.trim(),
        activeIngredient: activeIngredient.trim(),
        strength: strength.trim(),
        amount: amount.trim(),
        timeSince: timeSince.trim(),
        ageGroup,
        weight: weight.trim(),
        exposureRoute,
        symptoms: selectedSymptoms.map(id => {
          const matched = commonSymptomOptions.find(o => o.id === id);
          return matched ? matched.en : id;
        })
      };

      const data = await api.searchPoison(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorText(isTa 
        ? "விஷப் பொருள் பகுப்பாய்வில் பிழை ஏற்பட்டது. அவசர உதவிக்கு 112 அல்லது 108 ஐ அழைக்கவும்." 
        : "Failed to analyze substance. Please verify input or call emergency services.");
    } finally {
      setLoading(false);
    }
  };

  // Image Upload / Scan Product Label
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setLabelImage(base64Data);
      setScanningLabel(true);
      setLabelScanNote(isTa ? "லேபிள் பகுப்பாய்வு செய்யப்படுகிறது..." : "Scanning product label via Vision AI...");

      try {
        const response = await api.analyzeProductLabel(base64Data);
        const { extracted, pipelineMatch } = response;

        if (extracted) {
          if (extracted.productName) setSubstance(extracted.productName);
          if (extracted.brandName) setBrandName(extracted.brandName);
          if (extracted.activeIngredients && extracted.activeIngredients.length > 0) {
            setActiveIngredient(extracted.activeIngredients.join(', '));
          }
          if (extracted.concentration) setStrength(extracted.concentration);
          
          setLabelScanNote(isTa 
            ? `லேபிள் கண்டறியப்பட்டது: ${extracted.productName || extracted.brandName || 'விபரங்கள் நிரப்பப்பட்டன'}` 
            : `Label scanned: ${extracted.productName || extracted.brandName || 'Details extracted'}`);
        }

        // If pipeline match arrived directly, display analysis immediately
        if (pipelineMatch && pipelineMatch.identified) {
          handlePoisonSearch();
        }
      } catch (err) {
        console.warn("Label scanning failed:", err);
        setLabelScanNote(isTa ? "படத்திலிருந்து விபரம் பெற முடியவில்லை. கைமுறையாக உள்ளிடவும்." : "Could not extract text from label. Please enter manually.");
      } finally {
        setScanningLabel(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Voice Readout of First-Aid Instructions
  const handleSpeakFirstAid = () => {
    if (!result) return;

    if (isPlayingAudio || loadingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
      setLoadingAudio(false);
      return;
    }

    const textToSpeak = isTa 
      ? `முதலுதவி வழிகாட்டுதல்: ${result.immediateFirstAid.ta}. எச்சரிக்கை அறிகுறிகள்: ${result.warningSigns.join(', ')}`
      : `Immediate First Aid: ${result.immediateFirstAid.en}. Warning Signs: ${result.warningSigns.join(', ')}`;

    setIsPlayingAudio(true);
    setLoadingAudio(true);

    speechService.speak(
      textToSpeak,
      language,
      () => {
        setIsPlayingAudio(false);
        setLoadingAudio(false);
      },
      (err) => {
        setIsPlayingAudio(false);
        setLoadingAudio(false);
        if (err) alert(isTa ? "குரல் சேவை கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்." : err);
      },
      () => {
        setLoadingAudio(false);
      }
    );
  };

  const handleReset = () => {
    setSubstance("");
    setBrandName("");
    setActiveIngredient("");
    setStrength("");
    setAmount("");
    setTimeSince("");
    setWeight("");
    setSelectedSymptoms([]);
    setLabelImage(null);
    setLabelScanNote("");
    setResult(null);
    setErrorText("");
    speechService.stopSpeaking();
    setIsPlayingAudio(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ⚠️ Critical Life Safety Caution Banner */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid var(--color-critical)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <ShieldAlert size={26} style={{ color: 'var(--color-critical)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', color: 'var(--color-critical)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
            ⚠️ {isTa ? 'மிக முக்கிய பாதுகாப்பு எச்சரிக்கை!' : 'CRITICAL LIFE SAFETY CAUTION!'}
          </strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {isTa 
              ? 'விஷம், இரசாயனங்கள் அல்லது மருந்துகளை உட்கொண்டால் மருத்துவரின் அறிவுறுத்தலின்றி ஒருபோதும் வாந்தி எடுக்க வைக்க முயற்சிக்க வேண்டாம். அமிலங்கள், காரப்பொருட்கள் அல்லது மண்ணெண்ணெய் உட்கொண்டால் வாந்தி எடுப்பது உணவுக்குழாய் மற்றும் நுரையீரலில் மீளமுடியாத கடுமையான காயங்களை உண்டாக்கும்.'
              : 'Do NOT induce vomiting under any circumstances unless explicitly instructed by medical personnel. Vomiting corrosive acids, alkalis, or petroleum distillates (like kerosene/thinners) can cause fatal chemical pneumonia or esophageal perforation.'}
          </span>
        </div>
      </div>

      {/* 🧪 Main Input & Pipeline Form */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              🧪 {isTa ? 'AI பொருள் & விஷ பகுப்பாய்வு' : 'AI Substance & Poison Analysis'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa 
                ? 'மருந்துகள், இரசாயனங்கள் மற்றும் நச்சுப் பொருட்களை அடையாளம் கண்டு நம்பகமான முதலுதவி வழிகாட்டுதலைப் பெறுக.' 
                : 'Identify medications, chemicals, household products, or toxins and get reliable first-aid steps.'}
            </p>
          </div>

          {/* Scan Label Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-glass"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.8rem',
              padding: '8px 14px',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)'
            }}
          >
            <Camera size={16} />
            {isTa ? '📷 லேபிளை ஸ்கேன் செய்' : '📷 Scan Product Label'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Label scan status feedback */}
        {scanningLabel && (
          <div style={{ 
            background: 'var(--color-primary-glow)', 
            border: '1px solid var(--color-primary)', 
            padding: '8px 12px', 
            borderRadius: '8px', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '1rem'
          }}>
            <Loader2 size={16} className="spin" />
            <span>{labelScanNote}</span>
          </div>
        )}

        {labelScanNote && !scanningLabel && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid var(--color-safe)', 
            padding: '8px 12px', 
            borderRadius: '8px', 
            fontSize: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'var(--color-safe)', fontWeight: 600 }}>✓ {labelScanNote}</span>
            <button 
              onClick={() => { setLabelImage(null); setLabelScanNote(""); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handlePoisonSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Substance Name (Primary Input) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              {isTa ? 'பொருள் அல்லது தயாரிப்பு பெயர் *:' : 'Substance or Product Name *:'}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder={isTa ? "எ.கா. பாராசிட்டமால், ஹார்பிக், ப்ளீச், மண்ணெண்ணெய், எலி விஷம்..." : "e.g., paracetamol, bleach, kerosene, Harpic, rat poison..."}
                value={substance}
                onChange={(e) => setSubstance(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
                required
              />
              <button 
                type="submit" 
                disabled={loading || (!substance.trim() && !brandName.trim())}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
                {isTa ? 'பகுப்பாய்வு' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Optional Details Row (Brand, Active Ingredient, Strength) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'பிராண்ட் பெயர் (விருப்பத்திற்குரியது):' : 'Brand Name (Optional):'}
              </label>
              <input 
                type="text" 
                placeholder="e.g., Dolo 650, Dettol, Clorox"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'மூலப்பொருள் (இருப்பின்):' : 'Active Ingredient (If known):'}
              </label>
              <input 
                type="text" 
                placeholder="e.g., Sodium Hypochlorite, Acetaminophen"
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'வீரியம் / செறிவு:' : 'Strength / Concentration:'}
              </label>
              <input 
                type="text" 
                placeholder="e.g., 650mg, 5%, 10%"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Exposure Parameters Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'விஷம்பட்ட விதம்:' : 'Exposure Route:'}
              </label>
              <select 
                value={exposureRoute} 
                onChange={(e) => setExposureRoute(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value="swallowed">{isTa ? 'விழுங்குதல் (Swallowed)' : 'Swallowed / Ingestion'}</option>
                <option value="inhaled">{isTa ? 'சுவாசித்தல் (Inhaled)' : 'Inhalation (Vapors/Dust)'}</option>
                <option value="skin">{isTa ? 'தோல் தொடர்பு (Skin)' : 'Skin Contact'}</option>
                <option value="eye">{isTa ? 'கண் தொடர்பு (Eye)' : 'Eye Contact / Splash'}</option>
                <option value="injected">{isTa ? 'ஊசி / தொடர்பு (Injected)' : 'Injected'}</option>
                <option value="bite">{isTa ? 'கடி / கொட்டுதல் (Bite/Sting)' : 'Bite or Sting'}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'தோராயமான அளவு:' : 'Approx Amount:'}
              </label>
              <input 
                type="text" 
                placeholder="e.g., 2 tablets, 1 sip, a splash"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'விஷமடைந்த நேரம்:' : 'Time Since Exposure:'}
              </label>
              <input 
                type="text" 
                placeholder="e.g., 10 mins ago, 2 hours"
                value={timeSince}
                onChange={(e) => setTimeSince(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {isTa ? 'வயது பிரிவு:' : 'Patient Age:'}
              </label>
              <select 
                value={ageGroup} 
                onChange={(e) => setAgeGroup(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value="Adult">{isTa ? 'பெரியவர் (Adult)' : 'Adult'}</option>
                <option value="Child">{isTa ? 'சிறுவர் (Child)' : 'Child'}</option>
                <option value="Infant">{isTa ? 'குழந்தை (Infant)' : 'Infant'}</option>
                <option value="Elderly">{isTa ? 'முதியவர் (Elderly)' : 'Elderly'}</option>
              </select>
            </div>
          </div>

          {/* Symptoms Checklist */}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              {isTa ? 'தென்படும் அறிகுறிகள் (பொருந்துவதை தேர்வு செய்யவும்):' : 'Observed Symptoms (Select any that apply):'}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {commonSymptomOptions.map(s => {
                const isSelected = selectedSymptoms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSymptom(s.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--glass-border)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    {isTa ? s.ta : s.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset button */}
          {(substance || brandName || result) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-glass"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} style={{ marginRight: '4px' }} />
                {isTa ? 'அழித்து புதிதாகத் தேடு' : 'Reset Form'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Error Message */}
      {errorText && (
        <div style={{
          background: 'var(--color-critical-glow)',
          border: '1px solid var(--color-critical)',
          color: '#fff',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          {errorText}
        </div>
      )}

      {/* 📊 Structured Analysis Results */}
      {result && (
        <div className="glass-panel" style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          borderLeft: '5px solid',
          borderLeftColor: result.dangerLevel === 'CRITICAL' ? 'var(--color-critical)' : 'var(--color-urgent)'
        }}>

          {/* Top Header & Confidence Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {result.substanceName.toUpperCase()}
                </h3>

                {/* Dynamic Confidence Badge */}
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: result.confidence.level === 'HIGH' 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : result.confidence.level === 'MEDIUM'
                    ? 'rgba(249, 115, 22, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                  color: result.confidence.level === 'HIGH' 
                    ? 'var(--color-safe)' 
                    : result.confidence.level === 'MEDIUM'
                    ? 'var(--color-urgent)'
                    : 'var(--color-critical)',
                  border: '1px solid'
                }}>
                  {result.confidence.level === 'HIGH' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  {result.confidence.badgeText} ({Math.round(result.confidence.score * 100)}%)
                </span>
              </div>

              {result.genericName && result.genericName !== result.substanceName && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  {isTa ? 'பொதுவான பெயர் / மூலப்பொருள்:' : 'Generic Name:'} {result.genericName}
                </span>
              )}
            </div>

            {/* Danger Hazard Tag */}
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              padding: '4px 10px',
              borderRadius: '6px',
              color: result.dangerLevel === 'CRITICAL' ? 'var(--color-critical)' : 'var(--color-urgent)',
              background: result.dangerLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)',
              border: '1px solid'
            }}>
              {result.dangerLevel} HAZARD
            </span>
          </div>

          {/* Confidence Note Banner if Medium or Low */}
          {result.confidence.level !== 'HIGH' && (
            <div style={{
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '0.75rem',
              color: 'var(--color-urgent)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{isTa ? result.confidence.noteTa : result.confidence.noteEn}</span>
            </div>
          )}

          {/* Red Flag Critical Emergency Alert */}
          {result.isEmergencyAlert && (
            <div style={{
              background: 'var(--color-critical)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldAlert size={28} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>
                  🚨 {isTa ? 'உடனடி அவசர உதவி தேவை!' : 'URGENT: CALL 112 / 108 IMMEDIATELY!'}
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.95 }}>
                  {isTa
                    ? 'தீவிர எச்சரிக்கை அறிகுறிகள் தென்படுகின்றன. வீட்டில் தாமதிக்காமல் ஆம்புலன்ஸை (108) அழைக்கவும்.'
                    : 'Severe exposure warning signs detected. Do NOT delay hospital transport.'}
                </span>
              </div>
            </div>
          )}

          {/* SECTION 1: IDENTIFIED SUBSTANCE */}
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
              📌 {isTa ? 'பொருள் வகைப்பாடு:' : 'Substance Classification:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Category: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{result.category}</strong>
              </div>
              {result.activeIngredients && result.activeIngredients.length > 0 && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Active Ingredients: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{result.activeIngredients.join(', ')}</strong>
                </div>
              )}
            </div>
            {result.description && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
                {result.description}
              </p>
            )}
          </div>

          {/* SECTION 2: EXPOSURE SUMMARY */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            background: 'rgba(255,255,255,0.01)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            fontSize: '0.75rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Route:</span>
              <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{result.exposure.route}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Quantity:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{result.exposure.amount}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Elapsed:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{result.exposure.timeSince}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Patient:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{result.exposure.ageGroup}</strong>
            </div>
          </div>

          {/* SECTION 3: IMMEDIATE FIRST AID (WITH VOICE READOUT) */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-safe)', fontWeight: 800, textTransform: 'uppercase' }}>
                🧰 {isTa ? 'உடனடி முதலுதவி நடவடிக்கைகள்:' : 'IMMEDIATE FIRST-AID PROTOCOL:'}
              </h4>

              {/* Voice Readout Button */}
              <button
                onClick={handleSpeakFirstAid}
                className="btn btn-glass"
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  background: isPlayingAudio ? 'var(--color-critical-glow)' : undefined,
                  borderColor: isPlayingAudio ? 'var(--color-critical)' : undefined,
                  color: isPlayingAudio ? 'var(--color-critical)' : 'var(--text-primary)'
                }}
                disabled={loadingAudio}
              >
                {loadingAudio ? (
                  <>
                    <Loader2 size={12} className="spin" />
                    {isTa ? 'தயாராகிறது...' : 'Preparing...'}
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <VolumeX size={12} />
                    {isTa ? 'நிறுத்து' : 'Stop'}
                  </>
                ) : (
                  <>
                    <Volume2 size={12} />
                    {isTa ? 'குரல் வழி கேள்' : 'Listen'}
                  </>
                )}
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
              {isTa ? result.immediateFirstAid.ta : result.immediateFirstAid.en}
            </p>

            {result.contraindications && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-critical)', fontWeight: 700 }}>
                ⛔ {result.contraindications}
              </div>
            )}
          </div>

          {/* SECTION 4: WARNING SIGNS */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase' }}>
              ⚠️ {isTa ? 'கவனிக்க வேண்டிய எச்சரிக்கை அறிகுறிகள்:' : 'WARNING SIGNS (SEEK IMMEDIATE EMERGENCY CARE):'}
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {result.warningSigns.map((w, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>{w}</li>
              ))}
            </ul>
          </div>

          {/* SECTION 5: NEXT STEPS & HOTLINES */}
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            fontSize: '0.78rem'
          }}>
            <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>
              📞 {isTa ? 'அடுத்த கட்ட நடவடிக்கை மற்றும் நச்சு உதவி எண்கள்:' : 'Next Steps & Poison Information Hotline:'}
            </strong>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
              {isTa ? result.nextSteps.ta : result.nextSteps.en}
            </p>
            <div style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              {result.helpline}
            </div>
          </div>

          {/* Quick Helpline Dial Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
            <a 
              href="tel:112" 
              className="btn btn-danger" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}
            >
              <Phone size={16} /> DIAL 112 (EMERGENCY)
            </a>
            <a 
              href="tel:108" 
              className="btn" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', fontSize: '0.9rem', fontWeight: 800, background: 'var(--color-urgent)', color: '#fff' }}
            >
              <Phone size={16} /> DIAL 108 (AMBULANCE)
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
