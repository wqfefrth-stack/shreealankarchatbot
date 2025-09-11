import { useState, useEffect, useRef, useCallback } from 'react';

type SoundType = 'send' | 'receive' | 'click';

interface UseSound {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (sound: SoundType) => void;
}

export const useSound = (): UseSound => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sounds-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    send: null,
    receive: null,
    click: null,
  });

  const hasUserInteracted = useRef(false);

  // Track user interaction for autoplay policy compliance
  useEffect(() => {
    const handleUserInteraction = () => {
      hasUserInteracted.current = true;
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Initialize audio elements
  useEffect(() => {
    const loadAudio = (type: SoundType, src: string) => {
      try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0.4; // Keep sounds subtle
        audioRefs.current[type] = audio;
      } catch (error) {
        console.warn(`Failed to load ${type} sound:`, error);
      }
    };

    loadAudio('send', '/sounds/send.mp3');
    loadAudio('receive', '/sounds/receive.mp3');
    loadAudio('click', '/sounds/click.mp3');

    return () => {
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.src = '';
          audio.load();
        }
      });
    };
  }, []);

  // Persist enabled state
  useEffect(() => {
    localStorage.setItem('sounds-enabled', JSON.stringify(enabled));
  }, [enabled]);

  const play = useCallback((sound: SoundType) => {
    if (!enabled || !hasUserInteracted.current) return;

    const audio = audioRefs.current[sound];
    if (audio) {
      try {
        audio.currentTime = 0; // Reset to start
        audio.play().catch(error => {
          console.warn(`Failed to play ${sound} sound:`, error);
        });
      } catch (error) {
        console.warn(`Error playing ${sound} sound:`, error);
      }
    }
  }, [enabled]);

  return {
    enabled,
    setEnabled,
    play,
  };
};