import { useState, useEffect, useRef, useCallback } from 'react';

interface TextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeech {
  speak: (text: string, options?: TextToSpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentMessageId: number | null;
}

export const useTextToSpeech = (): UseTextToSpeech => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = 'speechSynthesis' in window;

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Find best voice for language
  const findBestVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    const isMarathi = lang.startsWith('mr');
    
    // Try to find Marathi voice first
    if (isMarathi) {
      const marathiVoice = voices.find(v => v.lang.startsWith('mr'));
      if (marathiVoice) return marathiVoice;
      
      // Fallback to Hindi if Marathi not available
      const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
      if (hindiVoice) return hindiVoice;
    }
    
    // For English or fallback, find female voice
    const femaleVoiceNames = [
      'microsoft zira', 'google us english female', 'female', 'woman',
      'alice', 'samantha', 'victoria', 'karen', 'moira', 'fiona',
      'google हिन्दी', 'google मराठी'
    ];
    
    for (const name of femaleVoiceNames) {
      const voice = voices.find(v => v.name.toLowerCase().includes(name));
      if (voice) return voice;
    }
    
    // Return first available voice as last resort
    return voices[0] || null;
  }, [voices]);

  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();

    // Clean text (remove URLs and special characters for better pronunciation)
    const cleanText = text
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
      .replace(/[*_~`]/g, '') // Remove markdown formatting
      .replace(/\\n/g, ' ') // Replace newlines with spaces
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Set options with defaults
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 0.9;

    // Find and set the best voice
    const voice = findBestVoice(utterance.lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Event listeners
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentMessageId(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentMessageId(null);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, findBestVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentMessageId(null);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    currentMessageId
  };
};
