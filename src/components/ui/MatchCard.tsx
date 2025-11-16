'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import GradientBadge from './GradientBadge';
import ActionButton from './ActionButton';

interface MatchCardProps {
  itemName: string;
  itemImage: string;
  fairTradeScore: number;
  condition: number;
  estimatedValue: number;
  yourItemValue: number;
  onAccept?: () => void;
  onViewDetails?: () => void;
}

export default function MatchCard({
  itemName,
  itemImage,
  fairTradeScore,
  condition,
  estimatedValue,
  yourItemValue,
  onAccept,
  onViewDetails,
}: MatchCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="glass rounded-3xl p-6 hover:bg-white/50 transition-all duration-300 cursor-pointer"
    >
      {/* Fair Trade Score Badge */}
      <div className="flex justify-between items-start mb-4">
        <GradientBadge variant={getScoreColor(fairTradeScore)} glow>
          ⭐ {fairTradeScore}% Fair
        </GradientBadge>
        <div className="text-sm text-gray-700">
          Condition: {condition}/10
        </div>
      </div>

      {/* Item Image */}
      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
        <Image
          src={itemImage}
          alt={itemName}
          fill
          className="object-cover"
        />
      </div>

      {/* Item Name */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{itemName}</h3>

      {/* Value Comparison */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Your Item:</span>
          <span className="text-gray-900 font-semibold">${yourItemValue}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Their Item:</span>
          <span className="text-gray-900 font-semibold">${estimatedValue}</span>
        </div>
        
        {/* Value Bar */}
        <div className="w-full bg-dark/50 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fairTradeScore}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full bg-gradient-primary`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <ActionButton 
          variant="primary" 
          size="sm" 
          onClick={onAccept}
          className="flex-1"
        >
          ✅ Accept Trade
        </ActionButton>
        <ActionButton 
          variant="ghost" 
          size="sm" 
          onClick={onViewDetails}
          className="flex-1"
        >
          👁️ Details
        </ActionButton>
      </div>
    </motion.div>
  );
}

