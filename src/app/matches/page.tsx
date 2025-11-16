'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/lib/types';
import ItemCard from '@/components/ItemCard';
import MultiHopCard from '@/components/MultiHopCard';
import { Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (myItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Items to Match
          </h2>
          <p className="text-gray-600 mb-6">
            Upload an item first to see potential matches
          </p>
          <a
            href="/upload"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Upload Item
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Find Matches
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - My Items */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sticky top-20">
              <h2 className="font-semibold text-lg mb-4">Your Items</h2>
              <div className="space-y-2">
                {myItems.map((item) => (
                  <button
                    key={item.itemId}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedItem?.itemId === item.itemId
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">
                      {item.name}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      ${item.estimatedValue}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {loadingMatches ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Single-Hop Matches */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Direct Matches (1-to-1)
                  </h2>
                  {singleHopMatches.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                      No matches found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {singleHopMatches.map((match) => (
                        <ItemCard
                          key={match.item.itemId}
                          item={match.item}
                          score={match.score}
                          breakdown={match.breakdown}
                          sourceItem={selectedItem!}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Multi-Hop Matches */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Multi-Hop Chains
                  </h2>
                  {multiHopCycles.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                      No multi-hop chains found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {multiHopCycles.map((cycleData, index) => (
                        <MultiHopCard
                          key={index}
                          cycle={cycleData.cycle}
                          chainFairnessScore={cycleData.chainFairnessScore}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

