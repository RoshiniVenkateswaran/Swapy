'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import GlassCard from './GlassCard';
import ActionButton from './ActionButton';

interface Item {
  name: string;
  imageUrl: string;
  estimatedValue: number;
  category: string;
}

interface TradeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'accept' | 'decline';
  item1?: Item;
  item2?: Item;
  loading?: boolean;
  isMultiHop?: boolean;
  chainLength?: number;
}

export default function TradeActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  item1,
  item2,
  loading = false,
  isMultiHop = false,
  chainLength = 2,
}: TradeActionModalProps) {
  const isAccept = action === 'accept';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg"
        >
          <GlassCard className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-7xl mb-4"
              >
                {isAccept ? '✅' : '❌'}
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isAccept ? 'Accept Trade?' : 'Decline Trade?'}
              </h2>
              <p className="text-gray-600">
                {isAccept
                  ? isMultiHop
                    ? `You're accepting a ${chainLength}-way trade chain`
                    : 'You will trade your item for theirs'
                  : 'This action cannot be undone'}
              </p>
            </div>

            {/* Items Preview (for non-multi-hop) */}
            {!isMultiHop && item1 && item2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Item 1 */}
                  <div className="space-y-2">
                    <div className="relative w-full h-24 rounded-xl overflow-hidden">
                      <Image
                        src={item1.imageUrl}
                        alt={item1.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item1.name}
                    </p>
                    <p className="text-xs text-gray-600">${item1.estimatedValue}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-3xl text-primary"
                    >
                      ⇄
                    </motion.div>
                  </div>

                  {/* Item 2 */}
                  <div className="space-y-2">
                    <div className="relative w-full h-24 rounded-xl overflow-hidden">
                      <Image
                        src={item2.imageUrl}
                        alt={item2.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item2.name}
                    </p>
                    <p className="text-xs text-gray-600">${item2.estimatedValue}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Multi-hop Info */}
            {isMultiHop && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
              >
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {chainLength} People
                  </p>
                  <p className="text-sm text-gray-700">
                    {isAccept
                      ? 'All users must accept for the trade to complete'
                      : 'Declining will cancel the entire chain'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Warning/Info Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`${
                isAccept ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              } border rounded-xl p-4 mb-6`}
            >
              <p
                className={`text-sm ${
                  isAccept ? 'text-green-700' : 'text-red-700'
                } text-center`}
              >
                {isAccept ? (
                  <>
                    <strong>✓</strong> By accepting, you agree to complete this trade
                  </>
                ) : (
                  <>
                    <strong>!</strong> Items will be available for other trades
                  </>
                )}
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <ActionButton
                onClick={onConfirm}
                loading={loading}
                className={`flex-1 text-lg ${
                  isAccept
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isAccept ? '✅ Accept Trade' : '❌ Decline Trade'}
              </ActionButton>
            </motion.div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  );
}
