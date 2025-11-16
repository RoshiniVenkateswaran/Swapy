'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Item } from '@/lib/types';
import Image from 'next/image';
import { Loader2, Trash2, Package } from 'lucide-react';

export default function MyItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user) return;

    try {
      const itemsRef = collection(db, 'items');
      const q = query(itemsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);

      const loadedItems: Item[] = [];
      snapshot.forEach((doc) => {
        loadedItems.push({ itemId: doc.id, ...doc.data() } as Item);
      });

      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, { status: 'traded' }); // Soft delete
      setItems(items.filter((item) => item.itemId !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
          <a
            href="/upload"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Upload New Item
          </a>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Items Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start by uploading your first item to trade
            </p>
            <a
              href="/upload"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Upload Item
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.itemId}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Category</div>
                      <div className="font-medium">{item.category}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Value</div>
                      <div className="font-medium">${item.estimatedValue}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Condition</div>
                      <div className="font-medium">{item.conditionScore}/100</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Looking for:</div>
                    <div className="flex flex-wrap gap-1">
                      {item.desiredCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {item.status === 'available' && (
                    <button
                      onClick={() => handleDelete(item.itemId)}
                      className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

