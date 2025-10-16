'use client';

import { useCallback, useRef } from 'react';

export function useSound() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundPath: string, volume: number = 0.4) => {
    try {
      // Create or reuse audio element
      if (!audioRefs.current[soundPath]) {
        const audio = new Audio(soundPath);
        audio.preload = 'auto';

        // Configure for background mixing - doesn't interrupt other audio
        audio.volume = 0.3; // Lower default volume
        audio.muted = false;

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