'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import ActionButton from '@/components/ui/ActionButton';
import PageTransition from '@/components/ui/PageTransition';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered',
      description: 'Smart item analysis and matching',
    },
    {
      icon: '⚖️',
      title: 'Fair Trade Score',
      description: 'Transparent value assessment',
    },
    {
      icon: '🔄',
      title: 'Multi-Hop Trading',
      description: 'Find complex trade cycles',
    },
    {
      icon: '🗺️',
      title: 'Campus Heatmap',
      description: 'Real-time demand analytics',
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Background Animated Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl glow-primary"
            >
              S
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6"
            >
              <span className="gradient-text">Swapy</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl text-gray-700 mb-4"
            >
              Smart Campus Trading Platform
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto mb-12"
            >
              Trade items with fellow students using AI-powered matching.
              Find fair trades, discover multi-hop opportunities, and build your campus community.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/signup">
                <ActionButton variant="primary" size="lg" className="min-w-[200px]">
                  🚀 Get Started
                </ActionButton>
              </Link>
              <Link href="/login">
                <ActionButton variant="ghost" size="lg" className="min-w-[200px]">
                  🔑 Login
                </ActionButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <GlassCard hover className="text-center h-full">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                      className="text-5xl mb-4"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16"
          >
            <GlassCard className="bg-gradient-glow">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold gradient-text mb-2">100%</div>
                  <p className="text-gray-700">Campus Exclusive</p>
                </div>
                <div>
                  <div className="text-5xl font-bold gradient-text mb-2">AI</div>
                  <p className="text-gray-700">Powered Matching</p>
                </div>
                <div>
                  <div className="text-5xl font-bold gradient-text mb-2">0₹</div>
                  <p className="text-gray-700">Completely Free</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
