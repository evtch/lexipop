'use client';

import { motion } from 'framer-motion';

interface FrameAnswerOptionProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
  showResult: boolean;
  onClick: () => void;
  index: number;
}

export default function FrameAnswerOption({
  letter,
  text,
  isCorrect,
  isSelected,
  showResult,
  onClick,
  index
}: FrameAnswerOptionProps) {
  const getBackgroundColor = () => {
    if (!showResult) {
      return isSelected
        ? 'bg-white/20 border-white/60'
        : 'bg-white/10 border-white/30 hover:border-white/50 hover:bg-white/15';
    }

    if (isSelected && isCorrect) return 'bg-green-500/80 border-green-400';
    if (isSelected && !isCorrect) return 'bg-red-500/80 border-red-400';
    if (!isSelected && isCorrect) return 'bg-green-500/40 border-green-400';
    return 'bg-white/10 border-white/20';
  };

  const getTextColor = () => {
    if (!showResult) return 'text-white';
    if (isSelected || (!isSelected && isCorrect)) return 'text-white';
    return 'text-white/70';
  };

  const getLetterColor = () => {
    if (!showResult) {
      return isSelected ? 'bg-white text-blue-600' : 'bg-white/20 text-white';
    }

    if (isSelected && isCorrect) return 'bg-green-600 text-white';
    if (isSelected && !isCorrect) return 'bg-red-600 text-white';
    if (!isSelected && isCorrect) return 'bg-green-600 text-white';
    return 'bg-white/20 text-white/60';
  };

  return (
    <motion.button
      onClick={!showResult ? onClick : undefined}
      className={`
        w-full p-3 rounded-lg border-2 transition-all duration-200
        flex items-center gap-3 text-left
        answer-option
        ${getBackgroundColor()}
        ${showResult ? 'cursor-default' : 'cursor-pointer'}
      `}
      whileHover={!showResult ? { scale: 1.02 } : {}}
      whileTap={!showResult ? { scale: 0.98 } : {}}
      disabled={showResult}
    >
      {/* Letter badge */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center
        font-bold text-sm transition-all duration-200 flex-shrink-0
        ${getLetterColor()}
      `}>
        {letter}
      </div>

      {/* Answer text */}
      <p className={`flex-1 font-medium text-sm leading-relaxed ${getTextColor()}`}>
        {text}
      </p>

      {/* Result indicator */}
      {showResult && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="text-lg flex-shrink-0"
        >
          {isSelected && isCorrect && '✓'}
          {isSelected && !isCorrect && '✗'}
          {!isSelected && isCorrect && '✓'}
        </motion.div>
      )}
    </motion.button>
  );
}