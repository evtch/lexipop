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
  // Capitalize first letter of each sentence
  const capitalizeText = (str: string) => {
    return str.replace(/(^\w)|(\.\s+\w)/g, (match) => match.toUpperCase());
  };
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
        w-full p-2.5 rounded-lg border-2 transition-all duration-200
        flex items-center gap-2 text-left min-h-[48px]
        answer-option
        ${getBackgroundColor()}
        ${showResult ? 'cursor-default' : 'cursor-pointer'}
      `}
      whileTap={!showResult ? { scale: 0.98 } : {}}
      animate={
        showResult && isCorrect
          ? {
              boxShadow: [
                "0 0 0px rgba(34, 197, 94, 0)",
                "0 0 20px rgba(34, 197, 94, 0.4)",
                "0 0 30px rgba(34, 197, 94, 0.6)",
                "0 0 20px rgba(34, 197, 94, 0.4)",
                "0 0 0px rgba(34, 197, 94, 0)"
              ]
            }
          : {}
      }
      transition={{
        boxShadow: {
          duration: 1.5,
          ease: "easeInOut"
        }
      }}
      disabled={showResult}
    >
      {/* Letter badge */}
      <motion.div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center
          font-bold text-xs transition-all duration-200 flex-shrink-0
          ${getLetterColor()}
        `}
        animate={
          showResult && isCorrect
            ? {
                boxShadow: [
                  "0 0 0px rgba(34, 197, 94, 0)",
                  "0 0 8px rgba(34, 197, 94, 0.6)",
                  "0 0 12px rgba(34, 197, 94, 0.8)",
                  "0 0 8px rgba(34, 197, 94, 0.6)",
                  "0 0 0px rgba(34, 197, 94, 0)"
                ]
              }
            : {}
        }
        transition={{
          boxShadow: {
            duration: 1.5,
            ease: "easeInOut"
          }
        }}
      >
        {letter}
      </motion.div>

      {/* Answer text */}
      <p className={`flex-1 font-medium text-sm leading-snug ${getTextColor()} break-words pr-2 flex items-center`}>
        {capitalizeText(text)}
      </p>

      {/* Result indicator - always reserve space to prevent layout shift */}
      <div className="w-6 flex items-center justify-center flex-shrink-0">
        {showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="text-lg"
          >
            {isSelected && isCorrect && '✓'}
            {isSelected && !isCorrect && '✗'}
            {!isSelected && isCorrect && '✓'}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}