'use client';

import Navbar from '@/components/Navbar';
import { Users, MessageCircle, Award } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Community
        </h1>
        <p className="text-gray-600 mb-8">
          Connect with other students on campus
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Active Traders
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              See who's actively trading on campus
            </p>
            <div className="text-3xl font-bold text-primary">--</div>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chat System
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Message other traders directly
            </p>
            <div className="text-3xl font-bold text-green-500">--</div>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Leaderboard
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Top traders this month
            </p>
            <div className="text-3xl font-bold text-yellow-500">--</div>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <p className="text-gray-500 text-center py-12">
            Activity feed coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}

