'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingButtonProps {
  children: ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export default function FloatingButton({ 
  children, 
  onClick,
  position = 'bottom-right' 
}: FloatingButtonProps) {
  const positions = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
  };

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        fixed ${positions[position]} z-50
        w-16 h-16 rounded-full
        bg-gradient-primary text-gray-900
        flex items-center justify-center
        shadow-2xl glow-primary
        hover:shadow-3xl
        transition-all duration-300
      `}
    >
      {children}
    </motion.button>
  );
}

