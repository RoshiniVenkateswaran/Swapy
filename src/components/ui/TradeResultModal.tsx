'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface TradeResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function TradeResultModal({
  isOpen,
  onClose,
  success,
  message,
  autoClose = true,
  autoCloseDelay = 3000,
}: TradeResultModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 text-center">
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 10,
              }}
              className="text-8xl mb-4"
            >
              {success ? '🎉' : '❌'}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-2xl font-bold mb-3 ${
                success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {success ? 'Success!' : 'Error'}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-700 mb-6"
            >
              {message}
            </motion.p>

            {/* Progress bar for auto-close */}
            {autoClose && (
              <motion.div
                className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className={`h-full ${success ? 'bg-green-500' : 'bg-red-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
                />
              </motion.div>
            )}

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-colors ${
                success
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {autoClose ? 'Close' : 'Got it!'}
            </motion.button>
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  );
}
