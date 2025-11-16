'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = false, glow = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      onClick={onClick}
      className={`
        glass rounded-3xl p-6 
        transition-all duration-300
        ${hover ? 'cursor-pointer hover:shadow-2xl hover:bg-white/50' : ''}
        ${glow ? 'glow-primary' : 'shadow-lg'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

