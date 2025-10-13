'use client';

import { useCallback, useRef } from 'react';

export function useSound() {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundPath: string, volume: number = 0.4) => {
    try {
      // Create or reuse audio element
      if (!audioRefs.current[soundPath]) {
        audioRefs.current[soundPath] = new Audio(soundPath);
        audioRefs.current[soundPath].preload = 'auto';
        // Pre-load the audio immediately to reduce delay
        audioRefs.current[soundPath].load();
      }

      const audio = audioRefs.current[soundPath];
      audio.volume = volume;

      // Reset audio to beginning and play immediately
      audio.currentTime = 0;

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
    playSound('/sounds/correct-answer.mp3', 0.4);
  }, [playSound]);

  const playWrongSound = useCallback(() => {
    playSound('/sounds/wrong-answer.mp3', 0.4);
  }, [playSound]);

  const playRewardGeneratingSound = useCallback(() => {
    playSound('/sounds/reward-generating.mp3', 0.4);
  }, [playSound]);

  const playRewardClaimSound = useCallback(() => {
    playSound('/sounds/reward-claim.mp3', 0.4);
  }, [playSound]);

  return {
    playSound,
    playCorrectSound,
    playWrongSound,
    playRewardGeneratingSound,
    playRewardClaimSound
  };
}