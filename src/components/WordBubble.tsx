'use client';

import { motion } from 'framer-motion';

interface WordBubbleProps {
  word: string;
  isVisible: boolean;
  isCorrect?: boolean | null;
  showResult?: boolean;
}

export default function WordBubble({ word, isVisible, isCorrect, showResult }: WordBubbleProps) {
  const floatingAnimation = {
    y: [0, -15, 0],
    x: [0, 5, -5, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };


  const getBubbleColors = () => {
    if (!showResult) {
      return 'bg-blue-500';
    }

    if (isCorrect) {
      return 'bg-green-500';
    } else {
      return 'bg-red-500';
    }
  };

  const colors = getBubbleColors();

  return (
    <motion.div
      className="flex justify-center items-center mb-12"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`
          relative w-80 h-80 rounded-full
          ${colors}
          shadow-2xl border-4 border-white
          flex items-center justify-center
          overflow-hidden
        `}
        animate={floatingAnimation}
      >

        {/* Word text */}
        <h2 className="text-white font-bold text-4xl text-center px-8 drop-shadow-lg">
          {word}
        </h2>
      </motion.div>
    </motion.div>
  );
}