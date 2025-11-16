'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import ActionButton from '@/components/ui/ActionButton';
import PageTransition from '@/components/ui/PageTransition';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Item {
  itemId: string;
  userId: string;
  name: string;
  category: string;
  description: string;
  desiredCategories: string[];
  conditionScore: number;
  estimatedValue: number;
  imageUrl: string;
  status: string;
}

interface Match {
  matchId: string;
  item1: Item;
  item2: Item;
  fairTradeScore: number;
  categoryMatch: boolean;
  valueDifference: number;
  conditionDifference: number;
  mutualInterest: boolean;
  reasoning: string;
}

interface TradeChain {
  chainId: string;
  items: Item[];
  userIds: string[];
  chainLength: number;
  chainFairnessScore: number;
  totalValueDifference: number;
  reasoning: string;
}

export default function MatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [multiHopChains, setMultiHopChains] = useState<TradeChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingMultiHop, setLoadingMultiHop] = useState(false);
  const [viewMode, setViewMode] = useState<'1-to-1' | 'multi-hop'>('1-to-1');

  useEffect(() => {
    if (user) {
      loadMyItems();
    }
  }, [user]);

  const loadMyItems = async () => {
    if (!user) return;

    try {
      const itemsQuery = query(
        collection(db, 'items'),
        where('userId', '==', user.uid),
        where('status', '==', 'available')
      );
      const snapshot = await getDocs(itemsQuery);

      const items: Item[] = [];
      snapshot.forEach((doc) => {
        items.push({ itemId: doc.id, ...doc.data() } as Item);
      });

      setMyItems(items);
      
      // Auto-select first item if available
      if (items.length > 0) {
        handleSelectItem(items[0]);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = async (item: Item) => {
    setSelectedItem(item);
    setLoadingMatches(true);
    setMatches([]);
    setMultiHopChains([]); // Clear multi-hop when selecting new item

    try {
      const response = await fetch('/api/match-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.itemId,
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      alert('Failed to load matches. Please try again.');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleFindMultiHop = async () => {
    if (!selectedItem) return;

    setLoadingMultiHop(true);
    setMultiHopChains([]);

    try {
      const response = await fetch('/api/find-multihop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.itemId,
          userId: user?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to find multi-hop chains');
      }

      const data = await response.json();
      setMultiHopChains(data.chains || []);
      setViewMode('multi-hop'); // Auto-switch to multi-hop view
    } catch (error) {
      console.error('Error finding multi-hop:', error);
      alert('Failed to find multi-hop trades. Please try again.');
    } finally {
      setLoadingMultiHop(false);
    }
  };

  const handleProposeTrade = async (match: Match) => {
    if (!user || !selectedItem) return;

    const confirmed = confirm(
      `Propose trade:\nYour "${selectedItem.name}" for their "${match.item2.name}"?\n\nFairness Score: ${match.fairTradeScore}%`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/propose-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: '1-to-1',
          proposerId: user.uid,
          item1Id: selectedItem.itemId,
          item2Id: match.item2.itemId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to propose trade');
      }

      const data = await response.json();
      alert(`✅ ${data.message}`);
      
      // Refresh matches to update status
      handleSelectItem(selectedItem);
    } catch (error) {
      console.error('Error proposing trade:', error);
      alert('❌ Failed to propose trade. Please try again.');
    }
  };

  const handleProposeChain = async (chain: TradeChain) => {
    if (!user) return;

    const confirmed = confirm(
      `Propose ${chain.chainLength}-way trade chain?\n\nFairness Score: ${chain.chainFairnessScore}%\n\nAll ${chain.chainLength} users will be notified.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch('/api/propose-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'multi-hop',
          proposerId: user.uid,
          chainData: chain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to propose chain trade');
      }

      const data = await response.json();
      alert(`✅ ${data.message}`);
      
      // Could refresh or navigate to trades page
      router.push('/trades');
    } catch (error) {
      console.error('Error proposing chain:', error);
      alert('❌ Failed to propose chain trade. Please try again.');
    }
  };

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

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen">
          <Navbar />
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              🔄
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900">Loading your items...</h2>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (myItems.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen pb-20">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
            <GlassCard className="bg-gradient-glow text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl mb-6"
              >
                📭
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                No Items to Match
              </h2>
              <p className="text-gray-700 text-lg mb-8 max-w-md mx-auto">
                Upload an item first to find potential trades!
              </p>
              <ActionButton onClick={() => router.push('/upload')} className="inline-flex items-center space-x-2">
                <span>✨</span>
                <span>Upload Your First Item</span>
              </ActionButton>
            </GlassCard>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-bold mb-2">
              <span className="gradient-text">Find Matches</span>
            </h1>
            <p className="text-gray-700 text-lg">
              Discover perfect trading opportunities powered by AI
            </p>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: My Items */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-3xl mr-2">📦</span>
                Your Items
              </h2>
              
              <div className="space-y-4">
                {myItems.map((item) => (
                  <motion.div
                    key={item.itemId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassCard
                      onClick={() => handleSelectItem(item)}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedItem?.itemId === item.itemId
                          ? 'ring-2 ring-primary glow-primary'
                          : 'hover:shadow-xl'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600">{item.category}</p>
                          <p className="text-sm font-bold gradient-text">
                            ${item.estimatedValue}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Matches */}
            <div className="lg:col-span-2">
              {!selectedItem ? (
                <GlassCard className="text-center py-16">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Select an Item
                  </h3>
                  <p className="text-gray-700">
                    Choose one of your items to find potential matches
                  </p>
                </GlassCard>
              ) : (
                <>
                  {/* Header with View Toggle */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <span className="text-3xl mr-2">🤝</span>
                      Matches for "{selectedItem.name}"
                    </h2>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('1-to-1')}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          viewMode === '1-to-1'
                            ? 'bg-gradient-primary text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🤝 1-to-1
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('multi-hop')}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                          viewMode === 'multi-hop'
                            ? 'bg-gradient-primary text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        🔄 Multi-hop
                      </motion.button>
                    </div>
                  </div>

                  {/* Content based on view mode */}
                  {viewMode === '1-to-1' ? (
                    // 1-to-1 Matches View
                    <>
                      {loadingMatches ? (
                    <GlassCard className="text-center py-16">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="text-6xl mb-4 inline-block"
                      >
                        🔍
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Finding matches...
                      </h3>
                      <p className="text-gray-600">
                        AI is analyzing potential trades
                      </p>
                    </GlassCard>
                  ) : matches.length === 0 ? (
                    <GlassCard className="text-center py-16">
                      <div className="text-6xl mb-4">😔</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        No Matches Found
                      </h3>
                      <p className="text-gray-700 mb-6">
                        Try uploading more items or adjust your desired categories
                      </p>
                    </GlassCard>
                  ) : (
                    <div className="space-y-6">
                      <AnimatePresence>
                        {matches.map((match, index) => (
                          <motion.div
                            key={match.matchId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <GlassCard hover className="group">
                              <div className="flex flex-col md:flex-row gap-6">
                                {/* Match Item Image */}
                                <div className="relative w-full md:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                                  <Image
                                    src={match.item2.imageUrl}
                                    alt={match.item2.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  {/* Fairness Score Badge */}
                                  <div className="absolute top-3 right-3">
                                    <div className={`${getScoreBg(match.fairTradeScore)} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm`}>
                                      {match.fairTradeScore}% Fair
                                    </div>
                                  </div>
                                </div>

                                {/* Match Details */}
                                <div className="flex-1">
                                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">
                                    {match.item2.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {match.item2.description}
                                  </p>

                                  {/* Stats */}
                                  <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Value</div>
                                      <div className="text-lg font-bold gradient-text">
                                        ${match.item2.estimatedValue}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Condition</div>
                                      <div className="text-lg font-bold text-gray-900">
                                        {match.item2.conditionScore}/10
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 mb-1">Category</div>
                                      <div className="text-sm font-medium text-gray-700">
                                        {match.item2.category}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Match Badges */}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {match.mutualInterest && (
                                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        💚 Mutual Interest
                                      </span>
                                    )}
                                    {match.categoryMatch && (
                                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                        🎯 Category Match
                                      </span>
                                    )}
                                    {match.valueDifference <= 5 && (
                                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        💰 Similar Value
                                      </span>
                                    )}
                                  </div>

                                  {/* Reasoning */}
                                  <p className="text-sm text-gray-600 italic mb-4">
                                    "{match.reasoning}"
                                  </p>

                                  {/* Action Buttons */}
                                  <div className="flex gap-3">
                                    <ActionButton 
                                      className="flex-1"
                                      onClick={() => handleProposeTrade(match)}
                                    >
                                      🤝 Propose Trade
                                    </ActionButton>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                      View Details
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            </GlassCard>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                    </>
                  ) : (
                    // Multi-hop View
                    <>
                      {!loadingMultiHop && multiHopChains.length === 0 && (
                        <GlassCard className="text-center py-16">
                          <div className="text-7xl mb-6 animate-float">🔄</div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Find Multi-hop Trade Chains
                          </h3>
                          <p className="text-gray-700 mb-8 max-w-md mx-auto">
                            Discover complex trading opportunities like A→B→C→A where everyone gets what they want!
                          </p>
                          <ActionButton
                            onClick={handleFindMultiHop}
                            loading={loadingMultiHop}
                            className="inline-flex items-center space-x-2"
                          >
                            <span>🔍</span>
                            <span>Find Multi-hop Trades</span>
                          </ActionButton>
                        </GlassCard>
                      )}

                      {loadingMultiHop && (
                        <GlassCard className="text-center py-16">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="text-6xl mb-4 inline-block"
                          >
                            🔄
                          </motion.div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Finding multi-hop chains...
                          </h3>
                          <p className="text-gray-600">
                            AI is analyzing complex trade cycles
                          </p>
                        </GlassCard>
                      )}

                      {!loadingMultiHop && multiHopChains.length > 0 && (
                        <div className="space-y-8">
                          <AnimatePresence>
                            {multiHopChains.map((chain, chainIndex) => (
                              <motion.div
                                key={chain.chainId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: chainIndex * 0.1 }}
                              >
                                <GlassCard hover className="p-8">
                                  {/* Chain Header */}
                                  <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                      {chain.chainLength}-Way Trade Chain
                                    </h3>
                                    <div className={`${getScoreBg(chain.chainFairnessScore)} text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg`}>
                                      {chain.chainFairnessScore}% Fair
                                    </div>
                                  </div>

                                  {/* Visual Chain */}
                                  <div className="flex items-center justify-center gap-4 mb-6 overflow-x-auto py-4">
                                    {chain.items.map((item, itemIndex) => (
                                      <React.Fragment key={item.itemId}>
                                        {/* Item Node */}
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: chainIndex * 0.1 + itemIndex * 0.15 }}
                                          className="flex flex-col items-center"
                                        >
                                          <div className="relative w-24 h-24 rounded-xl overflow-hidden border-4 border-primary shadow-lg">
                                            <Image
                                              src={item.imageUrl}
                                              alt={item.name}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                          <p className="text-sm font-bold text-gray-900 mt-2 text-center max-w-[100px] truncate">
                                            {item.name}
                                          </p>
                                          <p className="text-xs text-gray-600">${item.estimatedValue}</p>
                                        </motion.div>

                                        {/* Arrow */}
                                        {itemIndex < chain.items.length - 1 && (
                                          <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: chainIndex * 0.1 + itemIndex * 0.15 + 0.1 }}
                                            className="text-4xl text-primary"
                                          >
                                            →
                                          </motion.div>
                                        )}

                                        {/* Last arrow back to start */}
                                        {itemIndex === chain.items.length - 1 && (
                                          <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: chainIndex * 0.1 + itemIndex * 0.15 + 0.2 }}
                                            className="text-4xl text-green-600"
                                          >
                                            ↺
                                          </motion.div>
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </div>

                                  {/* Chain Details */}
                                  <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 mb-1">People Involved</div>
                                      <div className="text-2xl font-bold gradient-text">
                                        {chain.chainLength}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 mb-1">Value Spread</div>
                                      <div className="text-2xl font-bold text-gray-900">
                                        ${chain.totalValueDifference}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-gray-500 mb-1">Chain Type</div>
                                      <div className="text-lg font-bold text-gray-900">
                                        {chain.chainLength === 3 ? 'Simple' : 'Complex'}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Reasoning */}
                                  <p className="text-sm text-gray-600 italic mb-6 text-center">
                                    "{chain.reasoning}"
                                  </p>

                                  {/* Action */}
                                  <div className="flex justify-center">
                                    <ActionButton 
                                      className="px-8"
                                      onClick={() => handleProposeChain(chain)}
                                    >
                                      🚀 Propose Chain Trade
                                    </ActionButton>
                                  </div>
                                </GlassCard>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {/* Find More Button */}
                          <div className="text-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleFindMultiHop}
                              disabled={loadingMultiHop}
                              className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              🔄 Find More Chains
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
