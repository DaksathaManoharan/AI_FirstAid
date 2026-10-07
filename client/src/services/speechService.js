import { api } from './api.js';

/**
 * Browser Speech Recognition & Hybrid AI/Cloud Text-to-Speech Service
 * 
 * - Tamil ('ta'): Synthesized via backend AI/cloud TTS endpoint (POST /api/tts/tamil)
 *   and played via Browser Audio API, with genuine-Tamil browser voice fallback.
 *   NEVER uses an English voice to read Tamil text.
 * - English ('en'): Kept completely unchanged using the browser's native SpeechSynthesis.
 * - Voice Input: Kept using Web Speech API with ta-IN and en-IN locales.
 */
class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.currentAudio = null;
    this.currentAudioUrl = null;
    this.isListeningState = false;
    this.isGeneratingAudio = false;
    this.isActiveTamilRequest = false;

    // Initialize Web Speech API Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Stop after user finishes speaking
        this.recognition.interimResults = false;
      }

      // Proactively query and warm up voice cache in browser
      if (this.synthesis) {
        this.synthesis.getVoices();
        if (this.synthesis.addEventListener) {
          this.synthesis.addEventListener('voiceschanged', () => {
            this.synthesis.getVoices();
          });
        } else {
          this.synthesis.onvoiceschanged = () => {
            this.synthesis.getVoices();
          };
        }
      }
    }
  }

  /**
   * Speaks the provided text out loud in the specified language ('en' or 'ta').
   * Always cancels any currently active speech before starting.
   * 
   * @param {string} text - First aid instruction or statement to speak
   * @param {string} lang - 'en' or 'ta'
   * @param {Function} [onEnd] - Callback when speech/audio finishes
   * @param {Function} [onError] - Callback when speech fails
   * @param {Function} [onStart] - Callback when audio generation / speech starts
   */
  async speak(text, lang = 'en', onEnd = null, onError = null, onStart = null) {
    // 1. Cancel and cleanup any currently active speech/audio
    this.stopSpeaking();

    // 2. Clean up markdown markers and icons from text to ensure clear speech
    const cleanedText = (text || '')
      .replace(/[*#`_~•🔴🟠🟡🟢🚑🏥⚡❤️🦴🔥☠️😵🚗😮💨👶🧒🧑👴🎙️📍🔧]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) {
      if (onEnd) onEnd();
      return;
    }

    // ==========================================
    // TAMIL VOICE: AI/Cloud Backend TTS Route
    // ==========================================
    if (lang === 'ta') {
      this.isGeneratingAudio = true;
      this.isActiveTamilRequest = true;
      if (onStart) onStart();

      try {
        const audioBlob = await api.synthesizeTamilSpeech(cleanedText);

        // If stopSpeaking() was called while download was in flight, abort
        if (!this.isActiveTamilRequest) {
          return;
        }

        this.isGeneratingAudio = false;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        this.currentAudioUrl = audioUrl;

        audio.onended = () => {
          this.cleanupAudio();
          if (onEnd) onEnd();
        };

        audio.onerror = (e) => {
          console.warn("Tamil audio playback error, checking genuine browser voice fallback:", e);
          this.cleanupAudio();
          this.fallbackTamilSpeech(cleanedText, onEnd, onError);
        };

        await audio.play();
      } catch (err) {
        console.warn("Backend Tamil TTS request failed, checking genuine browser voice fallback:", err.message);
        this.cleanupAudio();
        this.fallbackTamilSpeech(cleanedText, onEnd, onError);
      }
      return;
    }

    // ==========================================
    // ENGLISH VOICE: Native SpeechSynthesis (Unchanged)
    // ==========================================
    if (!this.synthesis) {
      console.warn("Speech Synthesis is not supported in this browser.");
      if (onError) onError("Speech Synthesis is not supported in this browser.");
      if (onEnd) onEnd();
      return;
    }

    const voices = this.synthesis.getVoices() || [];
    const selectedVoice = 
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0];

    this.currentUtterance = new SpeechSynthesisUtterance(cleanedText);

    if (selectedVoice) {
      this.currentUtterance.voice = selectedVoice;
      this.currentUtterance.lang = selectedVoice.lang;
    } else {
      this.currentUtterance.lang = 'en-IN';
    }

    this.currentUtterance.rate = 0.95;
    this.currentUtterance.pitch = 1.0;

    if (onStart) {
      this.currentUtterance.onstart = () => onStart();
    }

    if (onEnd || onError) {
      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      this.currentUtterance.onerror = (e) => {
        console.error("Speech utterance error:", e);
        this.currentUtterance = null;
        if (onError) onError(e.error || "Speech failed");
        if (onEnd) onEnd();
      };
    }

    this.synthesis.speak(this.currentUtterance);
  }

  /**
   * Fallback for Tamil text when cloud service is unreachable.
   * IMPORTANT SAFETY RULE:
   * Only uses browser TTS if a genuine Tamil voice (ta-IN / ta) exists.
   * NEVER uses an English voice to read Tamil text.
   */
  fallbackTamilSpeech(text, onEnd, onError) {
    if (!this.synthesis) {
      const msg = "Tamil voice is currently unavailable. Please try again.";
      if (onError) onError(msg);
      if (onEnd) onEnd();
      return;
    }

    const voices = this.synthesis.getVoices() || [];
    const genuineTamilVoice = voices.find(v => 
      v.lang === 'ta-IN' || 
      v.lang === 'ta_IN' || 
      v.lang.toLowerCase() === 'ta' || 
      v.lang.toLowerCase().startsWith('ta-')
    );

    if (genuineTamilVoice) {
      console.log("Using verified browser Tamil voice fallback:", genuineTamilVoice.name);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = genuineTamilVoice;
      utterance.lang = genuineTamilVoice.lang;
      utterance.rate = 0.85;

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        console.error("Browser Tamil speech error:", e);
        this.currentUtterance = null;
        if (onError) onError("Tamil voice is currently unavailable. Please try again.");
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    } else {
      // Do NOT pronounce Tamil using English voice
      console.warn("No genuine Tamil voice installed on this system.");
      const msg = "Tamil voice is currently unavailable. Please try again.";
      if (onError) onError(msg);
      if (onEnd) onEnd();
    }
  }

  /**
   * Cleans up any playing or buffered audio and object URLs.
   */
  cleanupAudio() {
    this.isGeneratingAudio = false;
    this.isActiveTamilRequest = false;

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch (e) {}
      this.currentAudioUrl = null;
    }
  }

  /**
   * Stop any current speech playback (both browser SpeechSynthesis and Audio element).
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
    this.cleanupAudio();
  }

  /**
   * Start recording voice input with localized recognition (ta-IN or en-IN).
   */
  startListening(lang = 'en', onResult, onError = null, onEnd = null) {
    if (!this.recognition) {
      const msg = lang === 'ta'
        ? "உங்கள் உலாவியில் குரல் அறிதல் வசதி கிடைக்கவில்லை. தயவுசெய்து Google Chrome அல்லது MS Edge பயன்படுத்தவும்."
        : "Speech Recognition is not supported in this browser. Please use Google Chrome or MS Edge.";
      if (onError) onError(msg);
      return;
    }

    if (this.isListeningState) {
      this.recognition.stop();
    }

    this.isListeningState = true;
    this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

    this.recognition.onstart = () => {
      console.log(`Voice capturing active in lang: ${this.recognition.lang}...`);
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      this.isListeningState = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition start failed: ", e);
      this.isListeningState = false;
    }
  }

  /**
   * Stops voice recording.
   */
  stopListening() {
    if (this.recognition && this.isListeningState) {
      this.recognition.stop();
      this.isListeningState = false;
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
