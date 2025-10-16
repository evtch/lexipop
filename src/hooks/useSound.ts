'use client';

import { useCallback, useRef, useEffect } from 'react';

export function useSound() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio session for iOS mixing
  useEffect(() => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const initializeAudioSession = async () => {
        try {
          // Create a global AudioContext for the session
          if ('webkitAudioContext' in window && !audioContextRef.current) {
            audioContextRef.current = new (window as any).webkitAudioContext();

            // Resume context if suspended
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
            }

            console.log('iOS AudioContext initialized for mixing');
          }
        } catch (error) {
          console.log('Failed to initialize iOS audio session:', error);
        }
      };

      // Initialize on first user interaction
      const handleFirstInteraction = () => {
        initializeAudioSession();
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };

      document.addEventListener('touchstart', handleFirstInteraction);
      document.addEventListener('click', handleFirstInteraction);

      return () => {
        document.removeEventListener('touchstart', handleFirstInteraction);
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, []);

  const playSound = useCallback((soundPath: string, volume: number = 0.4) => {
    try {
      // Create or reuse audio element
      if (!audioRefs.current[soundPath]) {
        const audio = new Audio(soundPath);
        audio.preload = 'auto';

        // Configure for background mixing - doesn't interrupt other audio
        audio.volume = 0.3; // Lower default volume
        audio.muted = false;

        // iOS Safari: Set to allow mixing with other audio
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
          // iOS-specific: Request permission and set mixing mode
          if ('webkitAudioContext' in window) {
            try {
              // Create an AudioContext to set the proper category
              const audioContext = new (window as any).webkitAudioContext();

              // Configure for ambient category (allows mixing)
              if (audioContext.onstatechange !== undefined) {
                audioContext.onstatechange = () => {
                  if (audioContext.state === 'suspended') {
                    audioContext.resume();
                  }
                };
              }

              // Use shared context if available
              if (audioContextRef.current) {
                (audio as any)._audioContext = audioContextRef.current;
              } else {
                (audio as any)._audioContext = audioContext;
              }
            } catch (e) {
              console.log('AudioContext setup for mixing failed:', e);
            }
          }

          // iOS: Set additional properties for background audio
          (audio as any).webkitPlaysinline = true;
          (audio as any).playsinline = true;
        }

        // Set audio to be less intrusive and mix with other audio
        if ('mozAudioChannelType' in audio) {
          (audio as any).mozAudioChannelType = 'content';
        }

        // Modern browsers: configure for mixing with other audio
        if ('setSinkId' in audio && typeof audio.setSinkId === 'function') {
          // Allow audio to be mixed rather than take exclusive control
          Object.defineProperty(audio, 'mixWithOthers', {
            value: true,
            writable: false
          });
        }

        audioRefs.current[soundPath] = audio;
        // Pre-load the audio immediately to reduce delay
        audio.load();
      }

      const audio = audioRefs.current[soundPath];
      audio.volume = volume;

      // Reset audio to beginning and play immediately
      audio.currentTime = 0;

      // iOS: Ensure AudioContext is resumed before playing
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(error => {
            console.log('Failed to resume AudioContext:', error);
          });
        }
      }

      // Ensure audio doesn't interrupt other audio sources
      if ('webkitAudioContext' in window || 'AudioContext' in window) {
        // For browsers that support it, try to set as background audio
        if ((audio as any).mozPreservesPitch !== undefined) {
          (audio as any).mozPreservesPitch = true;
        }
      }

      // Use immediate play without waiting for promise
      audio.play().catch(error => {
        // Auto-play was prevented, which is expected on first load
        console.log('Audio play prevented (expected on first load):', error.name);
      });
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, []);

  const playCorrectSound = useCallback(() => {
    playSound('/sounds/correct-answer.mp3', 0.25);
  }, [playSound]);

  const playWrongSound = useCallback(() => {
    playSound('/sounds/wrong-answer.mp3', 0.25);
  }, [playSound]);

  const playRewardGeneratingSound = useCallback(() => {
    playSound('/sounds/reward-generating.mp3', 0.3);
  }, [playSound]);

  const playRewardClaimSound = useCallback(() => {
    playSound('/sounds/reward-claim.mp3', 0.3);
  }, [playSound]);

  return {
    playSound,
    playCorrectSound,
    playWrongSound,
    playRewardGeneratingSound,
    playRewardClaimSound
  };
}