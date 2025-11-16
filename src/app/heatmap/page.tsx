'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CategoryStats } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

export default function HeatmapPage() {
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsCollection = collection(db, 'stats');
      const snapshot = await getDocs(statsCollection);

      const loadedStats: CategoryStats[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedStats.push({
          category: data.category,
          demandCount: data.demandCount || 0,
          supplyCount: data.supplyCount || 0,
        });
      });

      // Sort by total activity
      loadedStats.sort(
        (a, b) =>
          b.demandCount + b.supplyCount - (a.demandCount + a.supplyCount)
      );

      setStats(loadedStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingCategories = () => {
    return stats
      .filter((s) => s.demandCount > s.supplyCount)
      .slice(0, 5);
  };

  const getRareCategories = () => {
    return stats
      .filter((s) => s.supplyCount > 0 && s.demandCount > s.supplyCount * 2)
      .slice(0, 5);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Market Analytics
        </h1>
        <p className="text-gray-600 mb-8">
          Demand vs Supply heatmap across categories
        </p>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Demand vs Supply by Category
          </h2>
          {stats.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="demandCount" fill="#3B82F6" name="Demand" />
                <Bar dataKey="supplyCount" fill="#10B981" name="Supply" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trending Categories */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">
                High Demand Categories
              </h2>
            </div>
            {getTrendingCategories().length === 0 ? (
              <p className="text-gray-500">No trending categories yet</p>
            ) : (
              <div className="space-y-3">
                {getTrendingCategories().map((stat) => (
                  <div
                    key={stat.category}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">
                      {stat.category}
                    </span>
                    <div className="text-sm text-gray-600">
                      <span className="text-green-600 font-semibold">
                        {stat.demandCount}
                      </span>{' '}
                      demand /{' '}
                      <span className="text-gray-500">{stat.supplyCount}</span>{' '}
                      supply
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rare/Oversupplied Categories */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingDown className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Rare in Demand
              </h2>
            </div>
            {getRareCategories().length === 0 ? (
              <p className="text-gray-500">No rare categories yet</p>
            ) : (
              <div className="space-y-3">
                {getRareCategories().map((stat) => (
                  <div
                    key={stat.category}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">
                      {stat.category}
                    </span>
                    <div className="text-sm text-gray-600">
                      <span className="text-orange-600 font-semibold">
                        {stat.demandCount}
                      </span>{' '}
                      demand /{' '}
                      <span className="text-gray-500">{stat.supplyCount}</span>{' '}
                      supply
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Categories Table */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Categories
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Demand
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Supply
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Ratio
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.category} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{stat.category}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-semibold">
                      {stat.demandCount}
                    </td>
                    <td className="py-3 px-4 text-center text-green-600 font-semibold">
                      {stat.supplyCount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {stat.supplyCount > 0
                        ? (stat.demandCount / stat.supplyCount).toFixed(2)
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

