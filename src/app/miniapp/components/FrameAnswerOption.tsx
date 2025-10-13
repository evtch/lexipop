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
        ? 'bg-blue-600 border-blue-700'
        : 'bg-blue-500 border-blue-600 hover:border-blue-700 hover:bg-blue-600';
    }

    if (isSelected && isCorrect) return 'bg-green-500 border-green-600';
    if (isSelected && !isCorrect) return 'bg-red-500 border-red-600';
    if (!isSelected && isCorrect) return 'bg-green-100 border-green-500';
    return 'bg-blue-400 border-blue-500';
  };

  const getTextColor = () => {
    if (!showResult) return 'text-white';
    if (isSelected && (isCorrect || !isCorrect)) return 'text-white';
    if (!isSelected && isCorrect) return 'text-green-800';
    return 'text-white';
  };

  const getLetterColor = () => {
    if (!showResult) {
      return isSelected ? 'bg-white text-blue-600' : 'bg-white/20 text-white';
    }

    if (isSelected && isCorrect) return 'bg-green-600 text-white';
    if (isSelected && !isCorrect) return 'bg-red-600 text-white';
    if (!isSelected && isCorrect) return 'bg-green-600 text-white';
    return 'bg-white/20 text-white';
  };

  return (
    <motion.button
      onClick={!showResult ? onClick : undefined}
      className={`
        w-full p-3 rounded-lg border-2 transition-all duration-200
        flex items-start gap-3 text-left min-h-[60px]
        answer-option
        ${getBackgroundColor()}
        ${showResult ? 'cursor-default' : 'cursor-pointer'}
      `}
      whileTap={!showResult ? { scale: 0.98 } : {}}
      disabled={showResult}
    >
      {/* Letter badge */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center
        font-bold text-sm transition-all duration-200 flex-shrink-0 mt-1
        ${getLetterColor()}
      `}>
        {letter}
      </div>

      {/* Answer text */}
      <p className={`flex-1 font-medium text-xs leading-relaxed ${getTextColor()} break-words pr-2`}>
        {text}
      </p>

      {/* Result indicator */}
      {showResult && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="text-lg flex-shrink-0 mt-1"
        >
          {isSelected && isCorrect && '✓'}
          {isSelected && !isCorrect && '✗'}
          {!isSelected && isCorrect && '✓'}
        </motion.div>
      )}
    </motion.button>
  );
}