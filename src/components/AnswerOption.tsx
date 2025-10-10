'use client';

import { motion } from 'framer-motion';

interface AnswerOptionProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
  showResult: boolean;
  onClick: () => void;
  index: number;
}

export default function AnswerOption({
  letter,
  text,
  isCorrect,
  isSelected,
  showResult,
  onClick,
  index
}: AnswerOptionProps) {
  const getBackgroundColor = () => {
    if (!showResult) {
      return isSelected
        ? 'bg-blue-100 border-blue-500'
        : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50';
    }

    if (isSelected && isCorrect) return 'bg-green-500 border-green-600';
    if (isSelected && !isCorrect) return 'bg-red-500 border-red-600';
    if (!isSelected && isCorrect) return 'bg-green-100 border-green-500';
    return 'bg-gray-100 border-gray-300';
  };

  const getTextColor = () => {
    if (!showResult) return 'text-gray-800';
    if (isSelected && (isCorrect || !isCorrect)) return 'text-white';
    if (!isSelected && isCorrect) return 'text-green-800';
    return 'text-gray-600';
  };

  const getLetterColor = () => {
    if (!showResult) {
      return isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700';
    }

    if (isSelected && isCorrect) return 'bg-green-600 text-white';
    if (isSelected && !isCorrect) return 'bg-red-600 text-white';
    if (!isSelected && isCorrect) return 'bg-green-600 text-white';
    return 'bg-gray-400 text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="w-full"
    >
      <motion.button
        onClick={!showResult ? onClick : undefined}
        className={`
          w-full p-4 rounded-xl border-2 transition-all duration-200
          flex items-center gap-4 text-left
          ${getBackgroundColor()}
          ${showResult ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}
        `}
        whileHover={!showResult ? { scale: 1.02 } : {}}
        whileTap={!showResult ? { scale: 0.98 } : {}}
        disabled={showResult}
      >
        {/* Letter badge */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          font-bold text-lg transition-all duration-200
          ${getLetterColor()}
        `}>
          {letter}
        </div>

        {/* Answer text */}
        <p className={`flex-1 font-medium leading-relaxed ${getTextColor()}`}>
          {text}
        </p>

        {/* Checkmark or X for results */}
        {showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="text-2xl"
          >
            {isSelected && isCorrect && '✓'}
            {isSelected && !isCorrect && '✗'}
            {!isSelected && isCorrect && '✓'}
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  );
}