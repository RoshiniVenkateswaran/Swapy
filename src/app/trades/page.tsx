'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade, Item } from '@/lib/types';
import Image from 'next/image';
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

export default function TradesPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;

    try {
      const tradesRef = collection(db, 'trades');
      const q = query(tradesRef, where('usersInvolved', 'array-contains', user.uid));
      const snapshot = await getDocs(q);

      const loadedTrades: any[] = [];

      for (const tradeDoc of snapshot.docs) {
        const tradeData = tradeDoc.data() as Trade;
        
        // Load items
        const items: Item[] = [];
        for (const itemId of tradeData.itemsInvolved) {
          const itemDoc = await getDoc(doc(db, 'items', itemId));
          if (itemDoc.exists()) {
            items.push({ itemId: itemDoc.id, ...itemDoc.data() } as Item);
          }
        }

        loadedTrades.push({
          tradeId: tradeDoc.id,
          ...tradeData,
          items,
        });
      }

      // Sort by creation date
      loadedTrades.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setTrades(loadedTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTrade = async (tradeId: string, trade: any) => {
    try {
      const tradeRef = doc(db, 'trades', tradeId);
      await updateDoc(tradeRef, { status: 'completed' });

      // Update item statuses
      for (const itemId of trade.itemsInvolved) {
        const itemRef = doc(db, 'items', itemId);
        await updateDoc(itemRef, { status: 'traded' });
      }

      // Reload trades
      loadTrades();
    } catch (error) {
      console.error('Error accepting trade:', error);
    }
  };

  const handleDeclineTrade = async (tradeId: string) => {
    try {
      const tradeRef = doc(db, 'trades', tradeId);
      await updateDoc(tradeRef, { status: 'cancelled' });

      // Reload trades
      loadTrades();
    } catch (error) {
      console.error('Error declining trade:', error);
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

  const pendingTrades = trades.filter((t) => t.status === 'pending');
  const completedTrades = trades.filter((t) => t.status === 'completed');
  const cancelledTrades = trades.filter((t) => t.status === 'cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Trades</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pendingTrades.length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {completedTrades.length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {cancelledTrades.length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Trades */}
        {pendingTrades.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Pending Trades
            </h2>
            <div className="space-y-4">
              {pendingTrades.map((trade) => (
                <div
                  key={trade.tradeId}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          trade.tradeType === 'single'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {trade.tradeType === 'single' ? '1-to-1' : 'Multi-Hop'}
                      </span>
                      <span className="text-sm text-gray-600">
                        Fairness Score:{' '}
                        <span className="font-bold text-green-600">
                          {trade.fairnessScore}%
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                    {trade.items.map((item: Item, index: number) => (
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
                          <div className="text-xs text-gray-500">
                            ${item.estimatedValue}
                          </div>
                        </div>
                        {index < trade.items.length - 1 && (
                          <ArrowRight className="w-6 h-6 text-primary flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => handleAcceptTrade(trade.tradeId, trade)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      Accept Trade
                    </button>
                    <button
                      onClick={() => handleDeclineTrade(trade.tradeId)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed Trades */}
        {completedTrades.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Completed Trades
            </h2>
            <div className="space-y-4">
              {completedTrades.map((trade) => (
                <div
                  key={trade.tradeId}
                  className="bg-white rounded-xl shadow-md p-6 opacity-75"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-semibold">Completed</span>
                    <span className="text-sm text-gray-500">
                      Score: {trade.fairnessScore}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {trade.items.map((item: Item) => (
                      <div key={item.itemId} className="flex-shrink-0 text-center">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 mb-1">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-xs font-medium text-gray-700 truncate w-20">
                          {item.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {trades.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Trades Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start by finding matches for your items
            </p>
            <a
              href="/matches"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Find Matches
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

