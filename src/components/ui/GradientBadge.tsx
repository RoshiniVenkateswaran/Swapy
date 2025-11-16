'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning';
  className?: string;
  glow?: boolean;
}

export default function GradientBadge({ 
  children, 
  variant = 'primary', 
  className = '',
  glow = false
}: GradientBadgeProps) {
  const variants = {
    primary: 'bg-gradient-primary',
    accent: 'bg-gradient-to-r from-accent to-purple-600',
    success: 'bg-success',
    warning: 'bg-warning',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        ${variants[variant]}
        px-3 py-1 rounded-full text-xs font-bold text-gray-900
        inline-flex items-center justify-center
        ${glow ? 'glow-primary' : 'shadow-md'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

