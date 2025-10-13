'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Random X position (%)
        y: -10, // Start above screen
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.5, // Random delay for staggered effect
      }));

      setParticles(newParticles);

      // Clear particles after animation
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{
            y: -50,
            opacity: 1,
            scale: 0,
            rotate: 0
          }}
          animate={{
            y: window.innerHeight + 100,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: 360 * 3,
            x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100], // Drift sideways
          }}
          transition={{
            duration: 2.5,
            delay: particle.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}