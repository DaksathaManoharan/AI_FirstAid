import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Camera, RefreshCw, Send, AlertCircle, ArrowRight, X } from 'lucide-react';
import { api } from '../services/api';
import { speechService } from '../services/speechService';
import { AppContext } from '../context/AppContext';
import { translations } from '../services/translations';

export default function Copilot() {
  const { language, location, setActiveEmergency } = useContext(AppContext);
  const navigate = useNavigate();
  const t = translations[language];
  const isTa = language === 'ta';

  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voiceStep, setVoiceStep] = useState(null); // 'initial', 'conscious_q', 'cough_q'
  
  const [analyzing, setAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [errorText, setErrorText] = useState("");

  // Camera/Image states
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Clean up speech and camera on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
      stopCamera();
    };
  }, []);

  const handleTriageSubmit = async (textToSubmit) => {
    if (!textToSubmit.trim()) return;
    setAnalyzing(true);
    setErrorText("");
    
    try {
      // Call backend triage API
      const result = await api.triage(textToSubmit, language);
      setTriageResult(result);

      // Speak immediate precautions out loud
      if (result.precautions && result.precautions.length > 0) {
        const warningText = isTa 
          ? `${result.severity === 'CRITICAL' ? 'தீவிர அவசரநிலை.' : 'அவசர நிலை.'} ${result.dangerTa || result.danger}. முதல் கட்ட நடவடிக்கை: ${result.precautionsTa ? result.precautionsTa[0] : result.precautions[0]}`
          : `${result.severity === 'CRITICAL' ? 'Critical Emergency.' : 'Urgent Emergency.'} ${result.dangerEn || result.danger}. First step: ${result.precautionsEn ? result.precautionsEn[0] : result.precautions[0]}`;

        speechService.speak(warningText, language);
      }

      // Log emergency session in database (will automatically associate userId if authenticated)
      try {
        await api.createSession({
          emergencyType: result.emergencyType,
          severity: result.severity,
          description: textToSubmit,
          latitude: location?.lat || null,
          longitude: location?.lng || null
        });
      } catch (err) {
        console.warn("Failed to log emergency session history:", err.message);
      }

    } catch (err) {
      console.error("Triage failed:", err);
      setErrorText(isTa ? "முதலுதவி பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." : "Triage analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Conversational Voice State Machine
  const toggleVoiceMode = () => {
    if (voiceModeActive) {
      speechService.stopSpeaking();
      speechService.stopListening();
      setVoiceModeActive(false);
      setIsListening(false);
      setVoiceStep(null);
    } else {
      setVoiceModeActive(true);
      setVoiceStep('initial');
      setInputText("");
      setTriageResult(null);
      
      const promptText = isTa
        ? "அவசர குரல் உதவியாளர் செயலில் உள்ளது. என்ன நடக்கிறது என்று சொல்லுங்கள்."
        : "Emergency Voice Assistant active. Please state what is happening.";
      
      speechService.speak(promptText, language, () => {
        listenForVoiceInput('initial');
      });
    }
  };

  const listenForVoiceInput = (step) => {
    setIsListening(true);
    speechService.startListening(
      language,
      (transcript) => {
        setIsListening(false);
        setInputText(transcript);
        processVoiceState(transcript, step);
      },
      (error) => {
        setIsListening(false);
        console.warn("Speech recognition error:", error);
        
        if (typeof error === 'string' && (error.includes("not supported") || error === "not-allowed" || error === "service-not-allowed" || error === "audio-capture")) {
          const notSupportedMsg = isTa
            ? "உங்கள் உலாவியில் குரல் அறிதல் வசதி கிடைக்கவில்லை அல்லது மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது. தயவுசெய்து Google Chrome அல்லது MS Edge பயன்படுத்தவும்."
            : "Speech Recognition is not supported or microphone permission was denied. Please use Google Chrome or MS Edge.";
          setErrorText(notSupportedMsg);
          setVoiceModeActive(false);
          return;
        }

        const retryPrompt = isTa
          ? "தயவுசெய்து மீண்டும் ஒருமுறை சொல்லுங்கள்."
          : "I couldn't hear you clearly. Please try speaking again.";
        
        speechService.speak(retryPrompt, language);
      },
      () => setIsListening(false)
    );
  };

  const processVoiceState = async (transcript, currentStep) => {
    const text = transcript.toLowerCase();
    
    if (currentStep === 'initial') {
      // Send straight to triage
      handleTriageSubmit(transcript);
      setVoiceModeActive(false);
    } 
  };

  // Camera Handlers
  const startCamera = async () => {
    setCameraActive(true);
    setImagePreview(null);
    setVisionResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraActive(false);
        alert(isTa ? "கேமராவைத் திறக்க முடியவில்லை. படத்தை பதிவேற்றவும்." : "Camera access failed. Please upload an image instead.");
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    setImagePreview(dataUrl);
    stopCamera();
    analyzeImagePayload(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      analyzeImagePayload(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImagePayload = async (dataUrl) => {
    setAnalyzing(true);
    setErrorText("");
    try {
      const result = await api.analyzeImage(dataUrl, language);
      setVisionResult(result);

      if (result.category && result.category !== 'unknown') {
        const updatedText = isTa 
          ? `பகுப்பாய்வு முடிவு: ${result.visualCues}`
          : `Visual triage shows a suspected ${result.category} issue: ${result.visualCues}.`;
        setInputText(updatedText);
        handleTriageSubmit(updatedText);
      } else {
        setInputText(result.visualCues);
      }
    } catch (err) {
      console.error(err);
      setErrorText(isTa ? "பட பகுப்பாய்வு தோல்வியடைந்தது." : "Image analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const navigateToGuide = () => {
    if (!triageResult) return;
    setActiveEmergency(triageResult);
    navigate('/smart-guide');
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return { border: 'var(--color-critical)', bg: 'var(--color-critical-glow)', color: '#fff', prefix: isTa ? '🔴 தீவிர அவசரநிலை' : '🔴 CRITICAL EMERGENCY' };
      case 'URGENT': return { border: 'var(--color-urgent)', bg: 'var(--color-urgent-glow)', color: '#fff', prefix: isTa ? '🟠 அவசரநிலை' : '🟠 URGENT SEVERITY' };
      default: return { border: 'var(--color-moderate)', bg: 'var(--color-moderate-glow)', color: '#fff', prefix: isTa ? '🟡 நடுத்தர அவசரம்' : '🟡 MODERATE SEVERITY' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Input panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          🧠 {isTa ? 'AI முதலுதவி கோபைலட்' : 'AI Emergency Copilot'}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          {isTa 
            ? 'பாதிக்கப்பட்டவரின் வயது, மூச்சு மற்றும் இரத்தப்போக்கு நிலையைத் தெளிவாக விவரிக்கவும். நீங்கள் குரல் மூலமாகவோ அல்லது புகைப்படத்தைப் பதிவேற்றியோ தகவலை வழங்கலாம்.'
            : 'Explain the incident. Include breathing status, consciousness, bleeding, and approximate age. You can speak or upload a photo of the injury.'}
        </p>

        {errorText && (
          <div style={{
            background: 'var(--color-critical-glow)',
            border: '1px solid var(--color-critical)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            marginBottom: '1rem'
          }}>
            {errorText}
          </div>
        )}

        {voiceModeActive ? (
          // Conversational Voice Mode UI
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid var(--glass-border)'
          }}>
            <div className="animate-pulse-critical" style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-critical-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-critical)'
            }}>
              <Mic size={32} />
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {isListening ? (isTa ? 'உங்கள் குரலைக் கேட்கிறது...' : 'Listening to you...') : (isTa ? 'தயாராக உள்ளது...' : 'Awaiting speech...')}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {inputText || (isTa ? 'சூழ்நிலையை விவரிக்கவும்...' : 'Describe what happened...')}
              </p>
            </div>
            <button onClick={toggleVoiceMode} className="btn btn-glass" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              {isTa ? 'குரல் வழியை நிறுத்து' : 'Exit Voice Mode'}
            </button>
          </div>
        ) : (
          // Text and Camera Panel
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isTa ? "விவரிக்கவும்: 'என் தந்தை மயங்கி விழுந்தார், மூச்சு விடவில்லை...'" : "Describe: 'My father collapsed, is unconscious and not breathing...'"}
                style={{
                  width: '100%',
                  height: '110px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <button 
                onClick={toggleVoiceMode}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer'
                }}
                title="Use Voice Assistant"
              >
                <Mic size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={startCamera} 
                className="btn btn-glass"
                style={{ padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Camera size={14} /> {isTa ? 'கேமரா திற' : 'Open Camera'}
              </button>
              
              <label className="btn btn-glass" style={{ padding: '8px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                <span>📤 {isTa ? 'படம் பதிவேற்று' : 'Upload Image'}</span>
              </label>

              <button 
                onClick={() => handleTriageSubmit(inputText)} 
                disabled={analyzing || !inputText.trim()}
                className="btn"
                style={{
                  marginLeft: 'auto',
                  padding: '8px 16px',
                  fontSize: '0.8rem',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {analyzing ? (isTa ? 'பகுப்பாய்வு செய்கிறது...' : 'Analyzing...') : (isTa ? 'வகைப்படுத்துக' : 'Triage Incident')}
                <Send size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📹 Live Camera Stream Frame */}
      {cameraActive && (
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', background: '#000', position: 'relative' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: 'block' }} />
            <button 
              onClick={stopCamera} 
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
          <button onClick={capturePhoto} className="btn btn-danger" style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
            {isTa ? 'படம் பிடி' : 'Capture Photo'}
          </button>
        </div>
      )}

      {/* Image preview frame */}
      {imagePreview && !cameraActive && (
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={imagePreview} alt="Incident Triage Preview" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
          <div>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {analyzing ? (isTa ? 'படம் பகுப்பாய்வு செய்யப்படுகிறது...' : 'Processing image...') : (isTa ? 'படம் வெற்றிகரமாக பகுப்பாய்வு செய்யப்பட்டது' : 'Image processed successfully')}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {visionResult ? `${isTa ? 'பிரிவு:' : 'Suspected Category:'} ${visionResult.category} (${(visionResult.confidence * 100).toFixed(0)}% confidence)` : (isTa ? 'விஷுவல் பகுப்பாய்வுக்காக காத்திருக்கிறது...' : 'Analyzing visual cues...')}
            </p>
          </div>
        </div>
      )}

      {/* 📊 Triage Summary Results Panel */}
      {triageResult && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          border: '1px solid',
          borderColor: getSeverityBadgeColor(triageResult.severity).border,
          background: `linear-gradient(180deg, ${getSeverityBadgeColor(triageResult.severity).bg} 0%, rgba(6,9,19,0.9) 100%)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(0,0,0,0.3)',
              fontSize: '0.75rem',
              fontWeight: 800,
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              {getSeverityBadgeColor(triageResult.severity).prefix}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isTa ? 'AI எஞ்சின் எண்கள்: 112/108' : 'Triage Confidence:'} {(triageResult.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Quick Critical safety warning banner */}
          {triageResult.whenToCallEmergency && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid var(--color-critical)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={20} className="animate-pulse-critical" />
              <span>{isTa ? 'அவசர உதவிக் குழுவை உடனடியாக அழைக்கவும் (112 / 108)' : 'CALL EMERGENCY SERVICES NOW (DIAL 112 / 108)'}</span>
            </div>
          )}

          {/* Grid properties */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isTa ? 'அவசர வகை:' : 'EMERGENCY TYPE:'}</span>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{triageResult.emergencyType.toUpperCase()}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isTa ? 'சுயநினைவு:' : 'CONSCIOUS STATUS:'}</span>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{triageResult.conscious}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isTa ? 'சுவாசம்:' : 'BREATHING:'}</span>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{triageResult.breathing}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isTa ? 'இரத்தப்போக்கு:' : 'BLEEDING SEVERITY:'}</span>
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{triageResult.bleeding}</strong>
            </div>
          </div>

          {/* Danger/Hazard */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-critical)', fontWeight: 700, marginBottom: '0.15rem' }}>
              ⚠️ {isTa ? 'உடலியல் ஆபத்து:' : 'PHYSIOLOGICAL HAZARD:'}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {triageResult.danger}
            </p>
          </div>

          {/* Immediate actions list */}
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-safe)', fontWeight: 700, marginBottom: '0.25rem' }}>
              🔧 {isTa ? 'உடனடி முதலுதவி நடவடிக்கைகள்:' : 'IMMEDIATE ACTIONS:'}
            </h4>
            <ul style={{ paddingLeft: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {triageResult.precautions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Guide launcher */}
          <button 
            onClick={navigateToGuide}
            className="btn" 
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              fontWeight: 700,
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '0.5rem'
            }}
          >
            <span>{isTa ? 'முதலுதவி வழிகாட்டியைத் திறக்கவும்' : 'Open Smart First-Aid Guide'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      
      {/* Canvas for picture frame extraction */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
