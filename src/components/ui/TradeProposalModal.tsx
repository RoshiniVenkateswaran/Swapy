'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import GlassCard from './GlassCard';
import ActionButton from './ActionButton';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                    {type === '1-to-1' ? '🤝' : '🔄'}
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {type === '1-to-1' ? 'Propose Trade' : 'Propose Multi-hop Trade'}
                  </h2>
                  <p className="text-gray-600">
                    {type === '1-to-1'
                      ? 'Review the trade details below'
                      : `This will involve ${chainData?.chainLength} people`}
                  </p>
                </div>

                {/* Content */}
                {type === '1-to-1' && yourItem && theirItem ? (
                  <div className="space-y-6">
                    {/* Items Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Your Item */}
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="text-center mb-2">
                          <span className="text-sm font-semibold text-gray-500 uppercase">
                            You Give
                          </span>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-blue-200">
                          <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                            <Image
                              src={yourItem.imageUrl}
                              alt={yourItem.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {yourItem.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{yourItem.category}</p>
                          <p className="text-2xl font-bold gradient-text">
                            ${yourItem.estimatedValue}
                          </p>
                        </div>
                      </motion.div>

                      {/* Arrow */}
                      <div className="hidden md:flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4, type: 'spring' }}
                          className="text-5xl text-primary"
                        >
                          ↔️
                        </motion.div>
                      </div>

                      {/* Mobile Arrow */}
                      <div className="md:hidden flex justify-center -my-2">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.4, type: 'spring' }}
                          className="text-5xl text-primary rotate-90"
                        >
                          ↔️
                        </motion.div>
                      </div>

                      {/* Their Item */}
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="text-center mb-2">
                          <span className="text-sm font-semibold text-gray-500 uppercase">
                            You Get
                          </span>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-green-200">
                          <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                            <Image
                              src={theirItem.imageUrl}
                              alt={theirItem.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {theirItem.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{theirItem.category}</p>
                          <p className="text-2xl font-bold gradient-text">
                            ${theirItem.estimatedValue}
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Fairness Score */}
                    {fairnessScore !== undefined && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="flex items-center justify-center gap-4 py-4"
                      >
                        <span className="text-gray-700 font-medium">Fairness Score:</span>
                        <div
                          className={`${getScoreBg(
                            fairnessScore
                          )} text-white px-6 py-3 rounded-full text-2xl font-bold shadow-lg`}
                        >
                          {fairnessScore}%
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : type === 'multi-hop' && chainData ? (
                  <div className="space-y-6">
                    {/* Chain Visual */}
                    <div className="flex items-center justify-center gap-3 overflow-x-auto py-4">
                      {chainData.items.map((item, index) => (
                        <React.Fragment key={index}>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex flex-col items-center"
                          >
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary shadow-lg">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="text-xs font-bold text-gray-900 mt-2 max-w-[80px] truncate text-center">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-600">${item.estimatedValue}</p>
                          </motion.div>
                          {index < chainData.items.length - 1 ? (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="text-2xl text-primary"
                            >
                              →
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="text-2xl text-green-600"
                            >
                              ↺
                            </motion.div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Chain Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-blue-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">People Involved</div>
                        <div className="text-3xl font-bold gradient-text">
                          {chainData.chainLength}
                        </div>
                      </div>
                      <div className="text-center bg-green-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 mb-1">Fairness Score</div>
                        <div
                          className={`text-3xl font-bold ${getScoreColor(
                            chainData.chainFairnessScore
                          )}`}
                        >
                          {chainData.chainFairnessScore}%
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-sm text-gray-700">
                        ℹ️ All {chainData.chainLength} users will be notified and must accept for
                        the trade to complete.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4 mt-8"
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
                    className="flex-1 text-lg"
                  >
                    {type === '1-to-1' ? '🤝 Propose Trade' : '🚀 Propose Chain'}
                  </ActionButton>
                </motion.div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

