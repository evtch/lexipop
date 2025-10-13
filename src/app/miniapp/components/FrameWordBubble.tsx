'use client';

import { motion } from 'framer-motion';

interface FrameWordBubbleProps {
  word: string;
  isVisible: boolean;
  isCorrect?: boolean | null;
  showResult?: boolean;
}

export default function FrameWordBubble({ word, isVisible, isCorrect, showResult }: FrameWordBubbleProps) {
  const floatingAnimation = {
    y: [0, -8, 0],
    x: [0, 3, -3, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1] as [number, number, number, number]
    }
  };

  const getBubbleColor = () => {
    if (!showResult) return 'bg-blue-500';
    if (isCorrect) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      className="flex justify-center items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`
          relative w-48 h-48 rounded-full
          ${getBubbleColor()}
          shadow-xl border-2 border-white/30
          flex items-center justify-center
          overflow-hidden
        `}
        animate={{
          ...floatingAnimation,
          ...(showResult && isCorrect
            ? {
                boxShadow: [
                  "0 0 0px rgba(34, 197, 94, 0)",
                  "0 0 20px rgba(34, 197, 94, 0.4)",
                  "0 0 40px rgba(34, 197, 94, 0.7)",
                  "0 0 60px rgba(34, 197, 94, 0.9)",
                  "0 0 40px rgba(34, 197, 94, 0.7)",
                  "0 0 20px rgba(34, 197, 94, 0.4)",
                  "0 0 50px rgba(34, 197, 94, 0.8)",
                  "0 0 30px rgba(34, 197, 94, 0.5)",
                  "0 0 0px rgba(34, 197, 94, 0)"
                ]
              }
            : {})
        }}
        transition={{
          ...floatingAnimation.transition,
          boxShadow: {
            duration: 0.3,
            ease: "easeInOut",
            repeat: 2,
            repeatType: "loop"
          }
        }}
      >
        {/* Word text */}
        <h2 className="vocabulary-word text-white font-bold text-2xl text-center px-4 drop-shadow-lg">
          {word}
        </h2>
      </motion.div>
    </motion.div>
  );
}