'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/ui/GlassCard';
import MatchCard from '@/components/ui/MatchCard';
import MultiHopNode from '@/components/ui/MultiHopNode';
import GradientBadge from '@/components/ui/GradientBadge';
import ActionButton from '@/components/ui/ActionButton';
import PageTransition from '@/components/ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/lib/types';

export default function MatchesPage() {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [singleHopMatches, setSingleHopMatches] = useState<any[]>([]);
  const [multiHopCycles, setMultiHopCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyItems();
    }
  }, [user]);

  const loadMyItems = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const itemsRef = collection(db, 'items');
      const q = query(
        itemsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'available')
      );
      const snapshot = await getDocs(q);

      const items: Item[] = [];
      snapshot.forEach((doc) => {
        items.push({ itemId: doc.id, ...doc.data() } as Item);
      });

      setMyItems(items);

      // Auto-select first item
      if (items.length > 0 && !selectedItem) {
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

    try {
      // Get single-hop matches
      const matchesResponse = await fetch('/api/get-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.itemId }),
      });
      const matchesData = await matchesResponse.json();
      setSingleHopMatches(matchesData.matches || []);

      // Get multi-hop cycles
      const multiHopResponse = await fetch('/api/find-multihop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.itemId }),
      });
      const multiHopData = await multiHopResponse.json();
      setMultiHopCycles(multiHopData.multiHopCycles || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoadingMatches(false);
    }
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
              <span className="gradient-text">Find Your Match</span>
            </h1>
            <p className="text-xl text-gray-700">
              AI-powered trading suggestions tailored for you
            </p>
          </motion.div>

          {/* My Items Selector */}
          {myItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <GlassCard>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">📦</span>
                  Select Your Item
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {myItems.map((item) => (
                    <motion.button
                      key={item.itemId}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSelectItem(item)}
                      className={`
                        flex-shrink-0 p-4 rounded-2xl transition-all duration-300
                        ${
                          selectedItem?.itemId === item.itemId
                            ? 'bg-gradient-primary shadow-xl glow-primary'
                            : 'glass hover:bg-white/50'
                        }
                      `}
                    >
                      <p className="text-gray-900 font-semibold text-sm truncate max-w-[150px]">
                        {item.name}
                      </p>
                      <p className="text-gray-700 text-xs">
                        ${item.estimatedValue}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

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
              <p className="text-gray-700">Loading your items...</p>
            </div>
          )}

          {/* No Items */}
          {!loading && myItems.length === 0 && (
            <GlassCard className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No items yet
              </h3>
              <p className="text-gray-700 mb-6">
                Upload your first item to start finding matches!
              </p>
              <ActionButton
                variant="primary"
                onClick={() => (window.location.href = '/upload')}
              >
                📤 Upload Item
              </ActionButton>
            </GlassCard>
          )}

          {/* Matches Content */}
          {selectedItem && (
            <div className="space-y-12">
              {/* Single-Hop Matches */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">🎯</span>
                    Direct Matches
                  </h2>
                  <GradientBadge variant="primary">
                    {singleHopMatches.length} Found
                  </GradientBadge>
                </div>

                {loadingMatches ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-6xl mb-4"
                    >
                      🔍
                    </motion.div>
                    <p className="text-gray-700">Finding matches...</p>
                  </div>
                ) : singleHopMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {singleHopMatches.map((match, index) => (
                      <motion.div
                        key={match.matchedItem.itemId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <MatchCard
                          itemName={match.matchedItem.name}
                          itemImage={match.matchedItem.imageUrl}
                          fairTradeScore={match.fairTradeScore}
                          condition={match.matchedItem.conditionScore}
                          estimatedValue={match.matchedItem.estimatedValue}
                          yourItemValue={selectedItem.estimatedValue}
                          onAccept={() => console.log('Accept trade')}
                          onViewDetails={() => console.log('View details')}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="text-center py-12">
                    <div className="text-5xl mb-4">🔎</div>
                    <p className="text-gray-700">
                      No direct matches found. Try multi-hop trades below!
                    </p>
                  </GlassCard>
                )}
              </motion.section>

              {/* Multi-Hop Trades */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <span className="text-4xl mr-3">🔄</span>
                    Multi-Hop Trades
                  </h2>
                  <GradientBadge variant="accent">
                    {multiHopCycles.length} Cycles
                  </GradientBadge>
                </div>

                {loadingMatches ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="text-6xl mb-4"
                    >
                      🔄
                    </motion.div>
                    <p className="text-gray-700">Finding trade cycles...</p>
                  </div>
                ) : multiHopCycles.length > 0 ? (
                  <div className="space-y-6">
                    {multiHopCycles.map((cycle, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <GlassCard hover className="overflow-x-auto">
                          {/* Cycle Score */}
                          <div className="flex justify-between items-center mb-6">
                            <GradientBadge variant="success" glow>
                              ⭐ {cycle.chainFairnessScore}% Fair
                            </GradientBadge>
                            <span className="text-sm text-gray-700">
                              {cycle.chain.length}-way trade
                            </span>
                          </div>

                          {/* Chain Visualization */}
                          <div className="flex items-center overflow-x-auto pb-4">
                            {cycle.chain.map((item: any, nodeIndex: number) => (
                              <MultiHopNode
                                key={nodeIndex}
                                itemName={item.name}
                                itemImage={item.imageUrl}
                                userName={item.userName || 'User'}
                                index={nodeIndex}
                                total={cycle.chain.length}
                              />
                            ))}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 mt-6">
                            <ActionButton
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              onClick={() => console.log('View cycle details')}
                            >
                              👁️ View Details
                            </ActionButton>
                            <ActionButton
                              variant="success"
                              size="sm"
                              className="flex-1"
                              onClick={() => console.log('Initiate trade')}
                            >
                              ✅ Initiate Trade
                            </ActionButton>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="text-center py-12">
                    <div className="text-5xl mb-4">🌐</div>
                    <p className="text-gray-700">
                      No multi-hop trade cycles found at the moment.
                    </p>
                  </GlassCard>
                )}
              </motion.section>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
