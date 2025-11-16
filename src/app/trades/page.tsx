'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import GradientBadge from '@/components/ui/GradientBadge';
import ActionButton from '@/components/ui/ActionButton';
import PageTransition from '@/components/ui/PageTransition';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

interface Trade {
  tradeId: string;
  item1: any;
  item2: any;
  status: string;
  createdAt: any;
  usersInvolved: string[];
}

export default function TradesPage() {
  const { user } = useAuth();
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const tradesRef = collection(db, 'trades');
      const q = query(
        tradesRef,
        or(
          where('usersInvolved', 'array-contains', user.uid)
        )
      );
      const snapshot = await getDocs(q);

      const pending: Trade[] = [];
      const completed: Trade[] = [];

      snapshot.forEach((doc) => {
        const trade = { tradeId: doc.id, ...doc.data() } as Trade;
        if (trade.status === 'pending') {
          pending.push(trade);
        } else if (trade.status === 'completed') {
          completed.push(trade);
        }
      });

      setPendingTrades(pending);
      setCompletedTrades(completed);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: '⏳', label: 'Pending', variant: 'warning' as const };
      case 'accepted':
        return { icon: '✅', label: 'Accepted', variant: 'success' as const };
      case 'completed':
        return { icon: '🎉', label: 'Completed', variant: 'success' as const };
      case 'rejected':
        return { icon: '❌', label: 'Rejected', variant: 'primary' as const };
      default:
        return { icon: '➖', label: 'Unknown', variant: 'primary' as const };
    }
  };

  const TradeCard = ({ trade, index }: { trade: Trade; index: number }) => {
    const badge = getStatusBadge(trade.status);
    const isUserItem1 = trade.item1?.userId === user?.uid;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <GlassCard hover className="group">
          {/* Status Badge */}
          <div className="flex justify-between items-center mb-4">
            <GradientBadge variant={badge.variant}>
              {badge.icon} {badge.label}
            </GradientBadge>
            <span className="text-sm text-gray-600">
              {trade.createdAt?.toDate().toLocaleDateString()}
            </span>
          </div>

          {/* Trade Items */}
          <div className="space-y-4 mb-4">
            {/* Your Item */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold">
                {isUserItem1 ? '🫵 Your Item' : '👤 Their Item'}
              </p>
              <div className="relative w-full h-32 rounded-xl overflow-hidden">
                <Image
                  src={trade.item1?.imageUrl || '/placeholder.png'}
                  alt={trade.item1?.name || 'Item'}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {trade.item1?.name}
              </p>
              <p className="text-xs text-gray-700">
                ${trade.item1?.estimatedValue}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl text-primary"
              >
                ⇅
              </motion.div>
            </div>

            {/* Their Item */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-semibold">
                {!isUserItem1 ? '🫵 Your Item' : '👤 Their Item'}
              </p>
              <div className="relative w-full h-32 rounded-xl overflow-hidden">
                <Image
                  src={trade.item2?.imageUrl || '/placeholder.png'}
                  alt={trade.item2?.name || 'Item'}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {trade.item2?.name}
              </p>
              <p className="text-xs text-gray-700">
                ${trade.item2?.estimatedValue}
              </p>
            </div>
          </div>

          {/* Actions */}
          {trade.status === 'pending' && (
            <div className="flex gap-3">
              <ActionButton
                variant="success"
                size="sm"
                className="flex-1"
                onClick={() => console.log('Accept trade')}
              >
                ✅ Accept
              </ActionButton>
              <ActionButton
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => console.log('Reject trade')}
              >
                ❌ Reject
              </ActionButton>
            </div>
          )}

          {trade.status === 'completed' && (
            <div className="bg-success/20 border border-success/50 text-success px-4 py-2 rounded-xl text-center text-sm">
              🎉 Trade completed successfully!
            </div>
          )}
        </GlassCard>
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="gradient-text">My Trades</span>
            </h1>
            <p className="text-xl text-gray-700">
              Track your pending and completed trades
            </p>
          </motion.div>

          {/* Tab Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <GlassCard>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('pending')}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                    ${
                      activeTab === 'pending'
                        ? 'bg-gradient-primary text-gray-900 shadow-lg glow-primary'
                        : 'text-gray-700 hover:bg-white/10'
                    }
                  `}
                >
                  ⏳ Pending ({pendingTrades.length})
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('completed')}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                    ${
                      activeTab === 'completed'
                        ? 'bg-gradient-primary text-gray-900 shadow-lg glow-primary'
                        : 'text-gray-700 hover:bg-white/10'
                    }
                  `}
                >
                  ✅ Completed ({completedTrades.length})
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mb-4"
              >
                🔄
              </motion.div>
              <p className="text-gray-700">Loading trades...</p>
            </div>
          )}

          {/* Pending Trades */}
          {!loading && activeTab === 'pending' && (
            <div>
              {pendingTrades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingTrades.map((trade, index) => (
                    <TradeCard key={trade.tradeId} trade={trade} index={index} />
                  ))}
                </div>
              ) : (
                <GlassCard className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No pending trades
                  </h3>
                  <p className="text-gray-700 mb-6">
                    Start finding matches to begin trading!
                  </p>
                  <ActionButton
                    variant="primary"
                    onClick={() => (window.location.href = '/matches')}
                  >
                    🤝 Find Matches
                  </ActionButton>
                </GlassCard>
              )}
            </div>
          )}

          {/* Completed Trades */}
          {!loading && activeTab === 'completed' && (
            <div>
              {completedTrades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedTrades.map((trade, index) => (
                    <TradeCard key={trade.tradeId} trade={trade} index={index} />
                  ))}
                </div>
              ) : (
                <GlassCard className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No completed trades yet
                  </h3>
                  <p className="text-gray-700 mb-6">
                    Complete your first trade to see it here!
                  </p>
                  <ActionButton
                    variant="primary"
                    onClick={() => (window.location.href = '/matches')}
                  >
                    🤝 Find Matches
                  </ActionButton>
                </GlassCard>
              )}
            </div>
          )}

          {/* Stats Summary */}
          {!loading && (pendingTrades.length > 0 || completedTrades.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <GlassCard className="bg-gradient-glow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold gradient-text mb-2">
                      {pendingTrades.length + completedTrades.length}
                    </div>
                    <p className="text-gray-700 text-sm">Total Trades</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-warning mb-2">
                      {pendingTrades.length}
                    </div>
                    <p className="text-gray-700 text-sm">Pending</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-success mb-2">
                      {completedTrades.length}
                    </div>
                    <p className="text-gray-700 text-sm">Completed</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
