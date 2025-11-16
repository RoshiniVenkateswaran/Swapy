'use client';

import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  Upload,
  Search,
  BarChart3,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Upload Item',
      description: 'Add a new item for bartering',
      icon: Upload,
      href: '/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Find Matches',
      description: 'Discover trading opportunities',
      icon: Search,
      href: '/matches',
      color: 'bg-green-500',
    },
    {
      title: 'My Items',
      description: 'Manage your listings',
      icon: Package,
      href: '/my-items',
      color: 'bg-purple-500',
    },
    {
      title: 'My Trades',
      description: 'View trade history and pending',
      icon: TrendingUp,
      href: '/trades',
      color: 'bg-orange-500',
    },
    {
      title: 'Heatmap',
      description: 'View demand & supply analytics',
      icon: BarChart3,
      href: '/heatmap',
      color: 'bg-pink-500',
    },
    {
      title: 'Community',
      description: 'Connect with other traders',
      icon: Users,
      href: '/community',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'Student'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Find the perfect trade with AI-powered matching
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`${item.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-primary transition">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Active Items
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Pending Trades
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Completed Trades
            </div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
        </div>
      </main>
    </div>
  );
}

