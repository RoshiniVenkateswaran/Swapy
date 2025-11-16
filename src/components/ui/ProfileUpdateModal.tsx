'use client';

import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  success: boolean;
  message: string;
}

export default function ProfileUpdateModal({
  isOpen,
  onClose,
  success,
  message,
}: ProfileUpdateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="text-7xl mb-4"
          >
            {success ? '✅' : '❌'}
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-bold mb-3 ${
              success ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {success ? 'Profile Updated!' : 'Update Failed'}
          </motion.h3>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-700 mb-6"
          >
            {message}
          </motion.p>

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
              success
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            }`}
          >
            {success ? 'Great! 🎉' : 'Try Again'}
          </motion.button>
        </GlassCard>
      </motion.div>
    </div>
  );
}

