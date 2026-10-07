import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, RefreshCw, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { classifyEmergencyLocal, classifyEmergencyAI, analyzeIncidentImage } from '../services/emergencyAI';
import { speechService } from '../services/speechService';
import { translations } from '../services/translations';

export default function AICopilot({ geminiApiKey, onNavigateToGuide, location, language }) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voiceStep, setVoiceStep] = useState(null); // 'initial', 'conscious_q', 'cough_q'
  
  const [analyzing, setAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  
  // Camera/Image states
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const t = translations[language];

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
      stopCamera();
    };
  }, []);

  const handleTextSubmit = async (textToSubmit) => {
    if (!textToSubmit.trim()) return;
    setAnalyzing(true);
    
    let result;
    if (geminiApiKey) {
      result = await classifyEmergencyAI(textToSubmit, geminiApiKey, language);
    } else {
      result = classifyEmergencyLocal(textToSubmit, language);
    }
    
    setTriageResult(result);
    setAnalyzing(false);

    // Speak immediate precautions out loud (Pass localized warning)
    if (result.precautions && result.precautions.length > 0) {
      const isTa = language === 'ta';
      const warningText = isTa 
        ? `${result.severity === 'CRITICAL' ? 'தீவிர அவசரநிலை.' : 'அவசர நிலை.'} ${result.dangerTa || result.danger}. முதல் கட்ட நடவடிக்கை: ${result.precautionsTa ? result.precautionsTa[0] : result.precautions[0]}`
        : `${result.severity === 'CRITICAL' ? 'Critical Emergency.' : 'Urgent Emergency.'} ${result.dangerEn || result.danger}. First step: ${result.precautionsEn ? result.precautionsEn[0] : result.precautions[0]}`;

      speechService.speak(warningText, language);
    }
  };

  // 🎙️ Conversational Voice State Machine (Bilingual Enabled)
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
      
      const promptText = language === 'ta'
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
        console.warn("Speech API Error: ", error);
        
        const retryPrompt = language === 'ta'
          ? "தயவுசெய்து மீண்டும் ஒருமுறை சொல்லுங்கள்."
          : "I couldn't hear you clearly. Please try speaking again.";
        
        speechService.speak(retryPrompt, language);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const processVoiceState = (transcript, currentStep) => {
    const text = transcript.toLowerCase();
    const isTa = language === 'ta';
    
    if (currentStep === 'initial') {
      const localAnalysis = classifyEmergencyLocal(text, language);
      
      if (localAnalysis.emergencyType === 'choking') {
        setVoiceStep('conscious_q');
        
        const qPrompt = isTa
          ? "தொண்டை அடைப்பு கண்டறியப்பட்டுள்ளது. நோயாளிக்கு சுயநினைவு உள்ளதா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்."
          : "Choking suspected. Is the person conscious? Please say yes or no.";
        
        speechService.speak(qPrompt, language, () => {
          listenForVoiceInput('conscious_q');
        });
      } else if (localAnalysis.emergencyType === 'cpr' || text.includes('breathing') || text.includes('conscious') || text.includes('சுவாசம்') || text.includes('மயக்கம்')) {
        setTriageResult(localAnalysis);
        
        const cprPrompt = isTa
          ? "சிபிஆர் எச்சரிக்கை. உடனடியாக மார்பு அழுத்தங்கள் கொடுக்கவும். 112ஐ அழைக்கவும்."
          : "Unconscious CPR alert. Directing you to chest compression guidelines. Call emergency services immediately.";
        
        speechService.speak(cprPrompt, language);
        setTimeout(() => {
          onNavigateToGuide(localAnalysis);
          toggleVoiceMode();
        }, 3000);
      } else {
        handleTextSubmit(transcript);
        setVoiceModeActive(false);
      }
    } 
    
    else if (currentStep === 'conscious_q') {
      const saysNo = text.includes('no') || text.includes('இல்லை') || text.includes('சுயநினைவு இல்லை') || text.includes('மயக்கம்');
      
      if (saysNo) {
        // Go straight to CPR
        const result = {
          emergencyType: 'cpr',
          severity: 'CRITICAL',
          conscious: isTa ? 'இல்லை' : 'No',
          breathing: isTa ? 'இல்லை' : 'None',
          bleeding: isTa ? 'இல்லை' : 'None',
          ageGroup: isTa ? 'பெரியவர்' : 'Adult',
          danger: isTa ? 'சுவாசப்பாதை முழுமையாக அடைக்கப்பட்டு நோயாளி நினைவிழந்த நிலையில் உள்ளார்.' : 'Airway fully obstructed and patient unresponsive.',
          dangerEn: 'Airway fully obstructed and patient unresponsive.',
          dangerTa: 'சுவாசப்பாதை முழுமையாக அடைக்கப்பட்டு நோயாளி நினைவிழந்த நிலையில் உள்ளார்.',
          precautions: isTa ? [
            'நபரை மல்லாக்க படுக்கவைக்கவும்.',
            'சுவாசப்பாதையை திறந்து வாயில் ஏதேனும் அடைப்பு உள்ளதா எனப் பார்க்கவும்.',
            'உடனடியாக மார்பு அழுத்தங்களை (CPR) தொடங்கவும்.'
          ] : [
            'Position on back.',
            'Open airway and check mouth.',
            'Begin chest compressions immediately.'
          ],
          precautionsEn: [
            'Position on back.',
            'Open airway and check mouth.',
            'Begin chest compressions immediately.'
          ],
          precautionsTa: [
            'நபரை மல்லாக்க படுக்கவைக்கவும்.',
            'சுவாசப்பாதையை திறந்து வாயில் ஏதேனும் அடைப்பு உள்ளதா எனப் பார்க்கவும்.',
            'உடனடியாக மார்பு அழுத்தங்களை (CPR) தொடங்கவும்.'
          ]
        };
        setTriageResult(result);
        
        const directPrompt = isTa
          ? "நோயாளி சுயநினைவின்றி உள்ளார். மார்பு அழுத்தங்கள் செய்ய வழிகாட்டியைத் திறக்கிறேன்."
          : "The person is unconscious. Directing to CPR instructions immediately.";
        
        speechService.speak(directPrompt, language, () => {
          onNavigateToGuide(result);
          toggleVoiceMode();
        });
      } else {
        // Patient is conscious
        setVoiceStep('cough_q');
        
        const coughPrompt = isTa
          ? "புரிந்தது. அவர்களால் இரும அல்லது பேச முடிகிறதா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்."
          : "Understood. Can they cough or speak? Please say yes or no.";
        
        speechService.speak(coughPrompt, language, () => {
          listenForVoiceInput('cough_q');
        });
      }
    } 
    
    else if (currentStep === 'cough_q') {
      const saysNo = text.includes('no') || text.includes("can't") || text.includes('cannot') || text.includes('இல்லை') || text.includes('முடியாது');
      
      if (saysNo) {
        // Complete block
        const result = {
          emergencyType: 'choking',
          severity: 'CRITICAL',
          conscious: isTa ? 'உள்ளது' : 'Yes',
          breathing: isTa ? 'இல்லை' : 'None',
          bleeding: isTa ? 'இல்லை' : 'None',
          ageGroup: isTa ? 'பெரியவர்' : 'Adult',
          danger: isTa ? 'சுவாசப்பாதை கடுமையாக அடைபட்டுள்ளது. மூச்சு திணறல் ஆபத்து.' : 'Severe airway blockage. Suffocation hazard.',
          dangerEn: 'Severe airway blockage. Suffocation hazard.',
          dangerTa: 'சுவாசப்பாதை கடுமையாக அடைபட்டுள்ளது. மூச்சு திணறல் ஆபத்து.',
          precautions: isTa ? [
            'தோள்களுக்கு இடையே 5 முறை பலமாக தட்டவும்.',
            'உள்நோக்கியும் மேல்நோக்கியும் 5 வயிற்று அழுத்தங்கள் (ஹெய்ம்லிச்) கொடுக்கவும்.',
            'பொருள் வெளியேறும் வரை அல்லது மயக்கம் வரும் வரை மீண்டும் செய்யவும்.'
          ] : [
            'Perform 5 back blows between the shoulder blades.',
            'Perform 5 abdominal thrusts (Heimlich).',
            'Repeat until object is expelled or they lose consciousness.'
          ],
          precautionsEn: [
            'Perform 5 back blows between the shoulder blades.',
            'Perform 5 abdominal thrusts (Heimlich).',
            'Repeat until object is expelled or they lose consciousness.'
          ],
          precautionsTa: [
            'தோள்களுக்கு இடையே 5 முறை பலமாக தட்டவும்.',
            'உள்நோக்கியும் மேல்நோக்கியும் 5 வயிற்று அழுத்தங்கள் (ஹெய்ம்லிச்) கொடுக்கவும்.',
            'பொருள் வெளியேறும் வரை அல்லது மயக்கம் வரும் வரை மீண்டும் செய்யவும்.'
          ]
        };
        setTriageResult(result);
        
        const actionPrompt = isTa
          ? "முதுகு தட்டல்கள் கொடுக்க தயாராகுங்கள். அவசர வழிகாட்டியைத் திறக்கிறேன்."
          : "Airway fully blocked. Preparing emergency choking instructions.";
        
        speechService.speak(actionPrompt, language, () => {
          onNavigateToGuide(result);
          toggleVoiceMode();
        });
      } else {
        // Mild choke
        const result = {
          emergencyType: 'choking',
          severity: 'URGENT',
          conscious: isTa ? 'உள்ளது' : 'Yes',
          breathing: isTa ? 'சீரற்றது' : 'Abnormal',
          bleeding: isTa ? 'இல்லை' : 'None',
          ageGroup: isTa ? 'பெரியவர்' : 'Adult',
          danger: isTa ? 'பகுதி அளவிலான சுவாசப்பாதை அடைப்பு.' : 'Partial airway restriction.',
          dangerEn: 'Partial airway restriction.',
          dangerTa: 'பகுதி அளவிலான சுவாசப்பாதை அடைப்பு.',
          precautions: isTa ? [
            'அவர்களை பலமாக இரும ஊக்குவிக்கவும்.',
            'அவர்களின் இருமத் திறனைத் தடுக்க வேண்டாம்.',
            'மூச்சுவிடுவதை கூர்ந்து கவனிக்கவும்.'
          ] : [
            'Encourage them to cough forcefully.',
            'Do not interfere with their attempts to cough.',
            'Monitor for signs of deterioration.'
          ],
          precautionsEn: [
            'Encourage them to cough forcefully.',
            'Do not interfere with their attempts to cough.',
            'Monitor for signs of deterioration.'
          ],
          precautionsTa: [
            'அவர்களை பலமாக இரும ஊக்குவிக்கவும்.',
            'அவர்களின் இருமத் திறனைத் தடுக்க வேண்டாம்.',
            'மூச்சுவிடுவதை கூர்ந்து கவனிக்கவும்.'
          ]
        };
        setTriageResult(result);
        
        const coughPrompt = isTa
          ? "லேசான அடைப்பு. தொடர்ந்து இருமச் சொல்லுங்கள். வழிகாட்டியைத் திறக்கிறேன்."
          : "Partial blockage. Encourage them to keep coughing. Loading guidelines.";
        
        speechService.speak(coughPrompt, language);
        onNavigateToGuide(result);
        toggleVoiceMode();
      }
    }
  };

  // 📸 Camera & Vision Handler
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
      console.warn("Could not access environment camera:", e);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        mediaStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraActive(false);
        alert(language === 'ta' ? "கேமராவைத் திறக்க முடியவில்லை. படத்தை பதிவேற்றவும்." : "Camera could not be accessed. Please upload an image file instead.");
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
    analyzeImage(dataUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (dataUrl) => {
    setAnalyzing(true);
    const result = await analyzeIncidentImage(dataUrl, geminiApiKey, language);
    setVisionResult(result);
    setAnalyzing(false);

    if (result.category !== 'unknown') {
      const isTa = language === 'ta';
      const updatedText = isTa 
        ? `பகுப்பாய்வு முடிவு: ${result.visualCues}`
        : `Visual triage shows a suspected ${result.category} issue: ${result.visualCues}.`;
      setInputText(updatedText);
      handleTextSubmit(updatedText);
    }
  };

  const getSeverityBadgeColor = (severity) => {
    const isTa = language === 'ta';
    switch (severity) {
      case 'CRITICAL': return { border: 'var(--color-critical)', bg: 'var(--color-critical-glow)', color: '#fff', prefix: isTa ? '🔴 தீவிர அவசரநிலை' : '🔴 CRITICAL EMERGENCY' };
      case 'URGENT': return { border: 'var(--color-urgent)', bg: 'var(--color-urgent-glow)', color: '#fff', prefix: isTa ? '🟠 அவசரநிலை' : '🟠 URGENT SEVERITY' };
      default: return { border: 'var(--color-moderate)', bg: 'var(--color-moderate-glow)', color: '#fff', prefix: isTa ? '🟡 நடுத்தர அவசரம்' : '🟡 MODERATE SEVERITY' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 🧠 Input Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <span>🚑</span> {t.copilot_title}
        </h2>
        
        {voiceModeActive ? (
          // Conversational Voice Mode Screen
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid var(--color-primary-glow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              {voiceStep === 'initial' && t.voice_prompt_initial}
              {voiceStep === 'conscious_q' && t.voice_prompt_conscious}
              {voiceStep === 'cough_q' && t.voice_prompt_cough}
            </div>
            
            {/* Pulsing Dictation Meter */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '40px', gap: '4px', margin: '0.5rem 0' }}>
              <div className="equalizer-bar" style={{ height: isListening ? '24px' : '4px' }}></div>
              <div className="equalizer-bar" style={{ height: isListening ? '40px' : '4px' }}></div>
              <div className="equalizer-bar" style={{ height: isListening ? '32px' : '4px' }}></div>
              <div className="equalizer-bar" style={{ height: isListening ? '44px' : '4px' }}></div>
              <div className="equalizer-bar" style={{ height: isListening ? '18px' : '4px' }}></div>
            </div>

            <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
              {inputText ? `"${inputText}"` : 'Listening... speak now'}
            </div>

            <button 
              onClick={toggleVoiceMode}
              className="btn btn-danger"
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              <MicOff size={14} /> {t.exit_voice}
            </button>
          </div>
        ) : (
          // Text Dictation Area
          <>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {t.copilot_desc}
            </p>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.textarea_placeholder}
                style={{
                  width: '100%',
                  height: '95px',
                  padding: '12px 45px 12px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  transition: 'var(--transition-smooth)'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSubmit(inputText);
                  }
                }}
              />
              <button
                onClick={toggleVoiceMode}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '12px',
                  border: 'none',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--color-primary)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Emergency Voice Mode"
              >
                <Mic size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleTextSubmit(inputText)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                disabled={analyzing || !inputText.trim()}
              >
                {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} {t.triage_btn}
              </button>
              
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className="btn btn-glass"
                style={{ padding: '10px 14px', fontSize: '0.85rem' }}
              >
                <Camera size={16} /> {t.image_btn}
              </button>
            </div>
          </>
        )}

        {/* Camera Sandbox Section */}
        {cameraActive && (
          <div style={{
            marginTop: '1rem',
            background: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', alignSelf: 'flex-start' }}>📸 {t.live_camera}</h4>
            <div style={{
              width: '100%',
              maxHeight: '240px',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative',
              background: '#000'
            }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: '100%', display: 'block', maxHeight: '240px', objectFit: 'cover' }} 
              />
              <div className="animate-scan-line"></div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <button 
                onClick={capturePhoto} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
              >
                {t.capture_btn}
              </button>
              <button 
                onClick={stopCamera} 
                className="btn btn-glass" 
                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
              >
                {t.close_btn}
              </button>
            </div>
          </div>
        )}

        {/* File upload hidden triggers */}
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!cameraActive && (
            <label className="btn btn-glass" style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', textAlign: 'center' }}>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              📁 {t.upload_photo}
            </label>
          )}
        </div>

        {/* Image Assessment Preview & Vision Summary */}
        {imagePreview && (
          <div style={{
            marginTop: '1rem',
            background: 'var(--bg-secondary)',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <img 
              src={imagePreview} 
              alt="Assessment Frame" 
              style={{ width: '70px', height: '70px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--glass-border)' }} 
            />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>{t.image_feedback}</strong>
              {analyzing ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.processing_img}</span>
              ) : visionResult ? (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{visionResult.visualCues}</span>
                  {visionResult.category !== 'unknown' && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                      {t.suspected_category} {visionResult.category.toUpperCase()} ({t.confidence}: {(visionResult.confidence * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 🔴 Triage Severity Dashboard */}
      {triageResult && (
        <div className="glass-panel" style={{
          padding: '1.5rem',
          border: `1px solid ${getSeverityBadgeColor(triageResult.severity).border}`,
          boxShadow: `0 8px 32px 0 ${getSeverityBadgeColor(triageResult.severity).bg}`
        }}>
          {/* Header Severity Banner */}
          <div style={{
            background: getSeverityBadgeColor(triageResult.severity).bg,
            border: `1px solid ${getSeverityBadgeColor(triageResult.severity).border}`,
            color: getSeverityBadgeColor(triageResult.severity).color,
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            {getSeverityBadgeColor(triageResult.severity).prefix}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{t.emergency_type}</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{triageResult.emergencyType}</strong>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{t.conscious_status}</span>
              <strong style={{ fontSize: '0.85rem', color: (triageResult.conscious === 'No' || triageResult.conscious === 'இல்லை') ? 'var(--color-critical)' : 'var(--text-primary)' }}>{triageResult.conscious}</strong>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{t.breathing_status}</span>
              <strong style={{ fontSize: '0.85rem', color: (triageResult.breathing === 'None' || triageResult.breathing === 'இல்லை') ? 'var(--color-critical)' : 'var(--text-primary)' }}>{triageResult.breathing}</strong>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{t.bleeding_severity}</span>
              <strong style={{ fontSize: '0.85rem', color: (triageResult.bleeding === 'Severe' || triageResult.bleeding === 'கடுமையானது') ? 'var(--color-critical)' : 'var(--text-primary)' }}>{triageResult.bleeding}</strong>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px', gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>{t.demographic}</span>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{triageResult.ageGroup}</strong>
            </div>
          </div>

          {/* Danger Warning Box */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.06)',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            marginBottom: '1rem',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={16} style={{ color: 'var(--color-critical)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', display: 'block' }}>{t.physiological_hazard}</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{triageResult.danger}</p>
            </div>
          </div>

          {/* Immediate Action Checklist */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{t.immediate_actions}</h4>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {triageResult.precautions.map((prec, index) => (
                <li key={index} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {prec}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onNavigateToGuide(triageResult)}
            className="btn btn-primary"
            style={{ width: '100%', background: 'var(--color-critical)', border: 'none', padding: '10px' }}
          >
            {t.open_guide_btn} <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
