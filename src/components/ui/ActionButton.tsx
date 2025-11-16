'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
}: ActionButtonProps) {
  const variants = {
    primary: 'bg-gradient-primary text-gray-900 hover:shadow-xl hover:shadow-primary/50',
    accent: 'bg-gradient-to-r from-accent to-purple-600 text-gray-900 hover:shadow-xl hover:shadow-accent/50',
    success: 'bg-success text-gray-900 hover:shadow-xl hover:shadow-success/50',
    ghost: 'glass text-gray-900 hover:bg-white/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-xl font-semibold
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}

