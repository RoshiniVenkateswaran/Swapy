'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import GradientBadge from '@/components/ui/GradientBadge';
import ActionButton from '@/components/ui/ActionButton';
import PageTransition from '@/components/ui/PageTransition';
import TradeActionModal from '@/components/ui/TradeActionModal';
import TradeResultModal from '@/components/ui/TradeResultModal';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, or, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

interface Item {
  itemId: string;
  name: string;
  imageUrl: string;
  estimatedValue: number;
  category: string;
  userId: string;
}

interface UserContact {
  displayName: string;
  email: string;
  phone: string;
  address: string;
}

interface Trade {
  tradeId: string;
  item1Id?: string;
  item2Id?: string;
  item1?: Item;
  item2?: Item;
  status: string;
  createdAt: any;
  usersInvolved: string[];
  proposerId?: string;
  user1Contact?: UserContact;
  user2Contact?: UserContact;
}

export default function TradesPage() {
  const { user } = useAuth();
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [processingTradeId, setProcessingTradeId] = useState<string | null>(null);
  
  // Modal states
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'decline'>('accept');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;
    setLoading(true);

    try {
      console.log('🔍 Loading trades for user:', user.uid);
      
      const tradesRef = collection(db, 'trades');
      const q = query(
        tradesRef,
        or(
          where('usersInvolved', 'array-contains', user.uid)
        )
      );
      const snapshot = await getDocs(q);

      console.log('📊 Found trades:', snapshot.size);

      const pending: Trade[] = [];
      const completed: Trade[] = [];

      // Fetch each trade and its item details
      for (const tradeDoc of snapshot.docs) {
        const tradeData = { tradeId: tradeDoc.id, ...tradeDoc.data() } as Trade;
        
        console.log('📦 Processing trade:', tradeData.tradeId, tradeData);

        // Fetch item details if we have item IDs
        if (tradeData.item1Id) {
          try {
            const item1Doc = await getDoc(doc(db, 'items', tradeData.item1Id));
            if (item1Doc.exists()) {
              tradeData.item1 = { itemId: item1Doc.id, ...item1Doc.data() } as Item;
              console.log('✅ Item 1 loaded:', tradeData.item1.name);
            } else {
              console.warn('⚠️ Item 1 not found:', tradeData.item1Id);
            }
          } catch (error) {
            console.error('❌ Error loading item 1:', error);
          }
        }

        if (tradeData.item2Id) {
          try {
            const item2Doc = await getDoc(doc(db, 'items', tradeData.item2Id));
            if (item2Doc.exists()) {
              tradeData.item2 = { itemId: item2Doc.id, ...item2Doc.data() } as Item;
              console.log('✅ Item 2 loaded:', tradeData.item2.name);
            } else {
              console.warn('⚠️ Item 2 not found:', tradeData.item2Id);
            }
          } catch (error) {
            console.error('❌ Error loading item 2:', error);
          }
        }

        // Fetch user contact details for completed trades
        if (tradeData.status === 'completed' && tradeData.usersInvolved.length === 2) {
          try {
            const [userId1, userId2] = tradeData.usersInvolved;
            
            const user1Doc = await getDoc(doc(db, 'users', userId1));
            if (user1Doc.exists()) {
              const user1Data = user1Doc.data();
              tradeData.user1Contact = {
                displayName: user1Data.displayName || 'Unknown',
                email: user1Data.email || '',
                phone: user1Data.phone || 'Not provided',
                address: user1Data.address || 'Not provided',
              };
            }

            const user2Doc = await getDoc(doc(db, 'users', userId2));
            if (user2Doc.exists()) {
              const user2Data = user2Doc.data();
              tradeData.user2Contact = {
                displayName: user2Data.displayName || 'Unknown',
                email: user2Data.email || '',
                phone: user2Data.phone || 'Not provided',
                address: user2Data.address || 'Not provided',
              };
            }

            console.log('✅ Contact details loaded for completed trade');
          } catch (error) {
            console.error('❌ Error loading contact details:', error);
          }
        }

        // Categorize by status
        if (tradeData.status === 'pending') {
          pending.push(tradeData);
        } else if (tradeData.status === 'completed') {
          completed.push(tradeData);
        }
      }

      console.log('✅ Pending trades:', pending.length);
      console.log('✅ Completed trades:', completed.length);

      setPendingTrades(pending);
      setCompletedTrades(completed);
    } catch (error) {
      console.error('❌ Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setActionType('accept');
    setShowActionModal(true);
  };

  const handleDeclineTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setActionType('decline');
    setShowActionModal(true);
  };

  const confirmTradeAction = async () => {
    if (!user || !selectedTrade) return;

    setProcessingTradeId(selectedTrade.tradeId);

    try {
      const endpoint = actionType === 'accept' ? '/api/accept-trade' : '/api/decline-trade';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId: selectedTrade.tradeId,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${actionType} trade`);
      }

      const data = await response.json();
      
      // Close action modal
      setShowActionModal(false);
      
      // Show success result
      setResultSuccess(true);
      setResultMessage(data.message);
      setShowResultModal(true);

      // Reload trades after a short delay
      setTimeout(async () => {
        await loadTrades();
      }, 500);

    } catch (error: any) {
      console.error(`Error ${actionType}ing trade:`, error);
      
      // Close action modal
      setShowActionModal(false);
      
      // Show error result
      setResultSuccess(false);
      setResultMessage(error.message || `Failed to ${actionType} trade. Please try again.`);
      setShowResultModal(true);
    } finally {
      setProcessingTradeId(null);
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
      case 'declined':
        return { icon: '❌', label: 'Declined', variant: 'danger' as const };
      case 'rejected':
        return { icon: '❌', label: 'Rejected', variant: 'danger' as const };
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
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-200">
                {trade.item1?.imageUrl ? (
                  <Image
                    src={trade.item1.imageUrl}
                    alt={trade.item1?.name || 'Item'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    📦
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {trade.item1?.name || 'Unknown Item'}
              </p>
              <p className="text-xs text-gray-700">
                ${trade.item1?.estimatedValue || 0}
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
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-200">
                {trade.item2?.imageUrl ? (
                  <Image
                    src={trade.item2.imageUrl}
                    alt={trade.item2?.name || 'Item'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    📦
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {trade.item2?.name || 'Unknown Item'}
              </p>
              <p className="text-xs text-gray-700">
                ${trade.item2?.estimatedValue || 0}
              </p>
            </div>
          </div>

          {/* Actions */}
          {trade.status === 'pending' && (
            <div className="flex gap-3">
              <ActionButton
                onClick={() => handleAcceptTrade(trade)}
                loading={processingTradeId === trade.tradeId}
                disabled={processingTradeId !== null}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                ✅ Accept
              </ActionButton>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeclineTrade(trade)}
                disabled={processingTradeId !== null}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Decline
              </motion.button>
            </div>
          )}
          
          {trade.status === 'declined' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-center text-sm">
              ❌ Trade was declined
            </div>
          )}

          {trade.status === 'completed' && (
            <>
              <div className="bg-success/20 border border-success/50 text-success px-4 py-2 rounded-xl text-center text-sm mb-4">
                🎉 Trade completed successfully!
              </div>

              {/* Contact Information */}
              {trade.user1Contact && trade.user2Contact && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    📞 Contact Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* User 1 Contact */}
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-semibold text-gray-900 mb-2">
                        {trade.user1Contact.displayName}
                      </p>
                      <div className="space-y-1 text-xs text-gray-700">
                        <p className="flex items-start gap-2">
                          <span className="text-blue-600">📧</span>
                          <span className="break-all">{trade.user1Contact.email}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600">📱</span>
                          <span>{trade.user1Contact.phone}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-purple-600">🏠</span>
                          <span>{trade.user1Contact.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* User 2 Contact */}
                    <div className="bg-white rounded-lg p-3">
                      <p className="font-semibold text-gray-900 mb-2">
                        {trade.user2Contact.displayName}
                      </p>
                      <div className="space-y-1 text-xs text-gray-700">
                        <p className="flex items-start gap-2">
                          <span className="text-blue-600">📧</span>
                          <span className="break-all">{trade.user2Contact.email}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-600">📱</span>
                          <span>{trade.user2Contact.phone}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-purple-600">🏠</span>
                          <span>{trade.user2Contact.address}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 text-center mt-2">
                    💡 Contact each other to arrange the item exchange
                  </p>
                </div>
              )}
            </>
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

        {/* Trade Action Modal (Accept/Decline Confirmation) */}
        <TradeActionModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          onConfirm={confirmTradeAction}
          action={actionType}
          item1={
            selectedTrade?.item1
              ? {
                  name: selectedTrade.item1.name,
                  imageUrl: selectedTrade.item1.imageUrl,
                  estimatedValue: selectedTrade.item1.estimatedValue,
                  category: selectedTrade.item1.category,
                }
              : undefined
          }
          item2={
            selectedTrade?.item2
              ? {
                  name: selectedTrade.item2.name,
                  imageUrl: selectedTrade.item2.imageUrl,
                  estimatedValue: selectedTrade.item2.estimatedValue,
                  category: selectedTrade.item2.category,
                }
              : undefined
          }
          loading={processingTradeId === selectedTrade?.tradeId}
          isMultiHop={!selectedTrade?.item1Id || !selectedTrade?.item2Id}
          chainLength={selectedTrade?.usersInvolved?.length || 2}
        />

        {/* Trade Result Modal (Success/Error) */}
        <TradeResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          success={resultSuccess}
          message={resultMessage}
        />
      </div>
    </PageTransition>
  );
}
