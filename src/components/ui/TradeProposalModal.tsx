'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import GlassCard from './GlassCard';

interface TradeProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: '1-to-1' | 'multi-hop';
  yourItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
    category: string;
  };
  theirItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
    category: string;
  };
  chainData?: {
    items: Array<{
      name: string;
      imageUrl: string;
      estimatedValue: number;
      category: string;
    }>;
    chainLength: number;
    chainFairnessScore: number;
  };
  fairnessScore?: number;
  loading?: boolean;
}

export default function TradeProposalModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  yourItem,
  theirItem,
  chainData,
  fairnessScore,
  loading = false,
}: TradeProposalModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    console.log('🤝 Confirming trade proposal...');
    onConfirm();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl"
        >
          <GlassCard className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-6xl mb-4"
              >
                🤝
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Propose Trade?
              </h2>
              <p className="text-gray-600">
                {type === '1-to-1'
                  ? 'Confirm this trade proposal'
                  : `Multi-hop trade involving ${chainData?.chainLength || 2} people`}
              </p>
            </div>

            {/* Trade Preview */}
            {type === '1-to-1' && yourItem && theirItem ? (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Your Item */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-5 border-2 border-blue-300 shadow-lg"
                  >
                    <p className="text-xs font-bold text-blue-600 uppercase mb-3 text-center">
                      You Give
                    </p>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={yourItem.imageUrl}
                        alt={yourItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 text-center">
                      {yourItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-2">{yourItem.category}</p>
                    <p className="text-2xl font-bold text-center gradient-text">
                      ${yourItem.estimatedValue}
                    </p>
                  </motion.div>

                  {/* Their Item */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-5 border-2 border-green-300 shadow-lg"
                  >
                    <p className="text-xs font-bold text-green-600 uppercase mb-3 text-center">
                      You Get
                    </p>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={theirItem.imageUrl}
                        alt={theirItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 text-center">
                      {theirItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 text-center mb-2">{theirItem.category}</p>
                    <p className="text-2xl font-bold text-center gradient-text">
                      ${theirItem.estimatedValue}
                    </p>
                  </motion.div>
                </div>

                {/* Fairness Score */}
                {fairnessScore !== undefined && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-6 bg-gradient-primary text-white rounded-2xl p-4 text-center shadow-xl"
                  >
                    <p className="text-sm font-semibold mb-1">Fairness Score</p>
                    <p className="text-4xl font-bold">{fairnessScore}%</p>
                  </motion.div>
                )}
              </div>
            ) : (
              chainData && (
                <div className="mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {chainData.chainLength} People
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      All users must accept for the trade to complete
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      Chain Fairness: <span className="text-blue-600">{chainData.chainFairnessScore}%</span>
                    </p>
                  </div>
                </div>
              )
            )}

            {/* Info Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
            >
              <p className="text-sm text-green-800 text-center">
                <strong>✓</strong> By proposing, the other user will be notified and can accept or decline this trade.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white bg-gradient-primary shadow-xl glow-primary hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚙️
                    </motion.span>
                    Proposing...
                  </span>
                ) : (
                  <>🤝 Confirm Proposal</>
                )}
              </motion.button>
            </motion.div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  );
}
