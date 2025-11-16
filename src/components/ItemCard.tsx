'use client';

import { Item, FairTradeScoreBreakdown } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { CheckCircle, TrendingUp } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  score: number;
  breakdown: FairTradeScoreBreakdown;
  sourceItem: Item;
}

export default function ItemCard({
  item,
  score,
  breakdown,
  sourceItem,
}: ItemCardProps) {
  const { user } = useAuth();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [proposed, setProposed] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleProposeTrade = async () => {
    if (!user) return;
    setProposing(true);

    try {
      await addDoc(collection(db, 'trades'), {
        itemsInvolved: [sourceItem.itemId, item.itemId],
        usersInvolved: [sourceItem.userId, item.userId],
        fairnessScore: score,
        tradeType: 'single',
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      setProposed(true);
    } catch (error) {
      console.error('Error proposing trade:', error);
    } finally {
      setProposing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      <div className="relative h-48 bg-gray-200">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
        />
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full bg-white font-bold ${getScoreColor(
            score
          )}`}
        >
          {score}%
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-500">Category</div>
            <div className="font-medium text-sm">{item.category}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Est. Value</div>
            <div className="font-medium text-sm">${item.estimatedValue}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Condition</div>
            <div className="font-medium text-sm">{item.conditionScore}/100</div>
          </div>
        </div>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-sm text-primary hover:underline mb-3 flex items-center space-x-1"
        >
          <TrendingUp className="w-4 h-4" />
          <span>{showBreakdown ? 'Hide' : 'Show'} Fairness Breakdown</span>
        </button>

        {showBreakdown && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Value Similarity:</span>
              <span className="font-medium">{breakdown.valueSimilarity}%</span>
            </div>
            <div className="flex justify-between">
              <span>Condition Match:</span>
              <span className="font-medium">
                {breakdown.conditionCompatibility}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Scarcity Match:</span>
              <span className="font-medium">
                {breakdown.scarcityCompatibility}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Demand Alignment:</span>
              <span className="font-medium">{breakdown.demandAlignment}%</span>
            </div>
          </div>
        )}

        {proposed ? (
          <div className="flex items-center justify-center space-x-2 text-green-600 font-medium py-2">
            <CheckCircle className="w-5 h-5" />
            <span>Trade Proposed!</span>
          </div>
        ) : (
          <button
            onClick={handleProposeTrade}
            disabled={proposing}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
          >
            {proposing ? 'Proposing...' : 'Propose Trade'}
          </button>
        )}
      </div>
    </div>
  );
}

