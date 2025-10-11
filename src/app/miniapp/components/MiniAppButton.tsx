'use client';

/**
 * 🎮 MINIAPP BUTTON COMPONENT
 *
 * Standardized full-width button for miniapp navigation
 * Follows miniapp design principles for ease of use
 */

import React from 'react';
import { motion } from 'framer-motion';

interface MiniAppButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  className?: string;
}

export default function MiniAppButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled = false,
  className = ''
}: MiniAppButtonProps) {
  const baseClasses = 'w-full font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-md hover:shadow-lg',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    sm: 'py-3 px-4 text-sm',
    md: 'py-4 px-6 text-base',
    lg: 'py-5 px-8 text-lg'
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'active:scale-95 hover:scale-[1.02]';

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  const content = (
    <>
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={buttonClasses}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
    >
      {content}
    </motion.button>
  );
}

/**
 * 🎯 MINIAPP BUTTON FEATURES:
 *
 * - Full Width: Always spans the full width of the container
 * - Touch Optimized: Large touch targets for mobile use
 * - Visual Feedback: Hover and tap animations
 * - Consistent Styling: Standardized variants and sizes
 * - Accessibility: Proper disabled states and semantics
 * - Icons: Optional icon support for better UX
 */