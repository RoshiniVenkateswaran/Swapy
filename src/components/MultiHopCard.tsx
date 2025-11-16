'use client';

import { Item } from '@/lib/types';
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';

interface MultiHopCardProps {
  cycle: Item[];
  chainFairnessScore: number;
}

export default function MultiHopCard({
  cycle,
  chainFairnessScore,
}: MultiHopCardProps) {
  const { user } = useAuth();
  const [proposing, setProposing] = useState(false);
  const [proposed, setProposed] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const handleProposeMultiHop = async () => {
    if (!user) return;
    setProposing(true);

    try {
      const itemIds = cycle.map((item) => item.itemId);
      const userIds = Array.from(new Set(cycle.map((item) => item.userId)));

      await addDoc(collection(db, 'trades'), {
        itemsInvolved: itemIds,
        usersInvolved: userIds,
        fairnessScore: chainFairnessScore,
        tradeType: 'multi',
        status: 'pending',
        cycleOrder: itemIds,
        createdAt: Timestamp.now(),
      });

      setProposed(true);
    } catch (error) {
      console.error('Error proposing multi-hop trade:', error);
    } finally {
      setProposing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {cycle.length}-Way Trade Chain
        </h3>
        <div
          className={`px-4 py-1 rounded-full font-bold ${getScoreColor(
            chainFairnessScore
          )}`}
        >
          Chain Score: {chainFairnessScore}%
        </div>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-4">
        {cycle.map((item, index) => (
          <div key={item.itemId} className="flex items-center space-x-4">
            <div className="flex-shrink-0 text-center">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 mb-2">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-sm font-medium text-gray-900 truncate w-24">
                {item.name}
              </div>
              <div className="text-xs text-gray-500">${item.estimatedValue}</div>
            </div>
            {index < cycle.length - 1 && (
              <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
            )}
          </div>
        ))}
        <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="flex-shrink-0 text-center">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-200 mb-2">
            <Image
              src={cycle[0].imageUrl}
              alt={cycle[0].name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-sm font-medium text-gray-900 truncate w-24">
            {cycle[0].name}
          </div>
          <div className="text-xs text-gray-500 font-semibold">Cycle Complete</div>
        </div>
      </div>

      <div className="mt-4">
        {proposed ? (
          <div className="flex items-center justify-center space-x-2 text-green-600 font-medium py-2">
            <CheckCircle className="w-5 h-5" />
            <span>Multi-Hop Trade Proposed!</span>
          </div>
        ) : (
          <button
            onClick={handleProposeMultiHop}
            disabled={proposing}
            className="w-full bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
          >
            {proposing ? 'Proposing...' : 'Propose Multi-Hop Trade'}
          </button>
        )}
      </div>
    </div>
  );
}

