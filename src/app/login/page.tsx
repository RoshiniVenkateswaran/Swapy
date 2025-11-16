'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ALLOWED_DOMAINS } from '@/lib/constants';
import { validateEduEmail } from '@/lib/auth-utils';
import { handleAuthError, getErrorIcon } from '@/lib/auth-errors';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCategory, setErrorCategory] = useState<'email' | 'password' | 'network' | 'account' | 'rate-limit' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email domain
    const emailValidation = validateEduEmail(email, ALLOWED_DOMAINS);
    if (!emailValidation.isValid) {
      setError(emailValidation.error);
      return;
    }

    // Validate password not empty
    if (!password || password.trim() === '') {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const authError = handleAuthError(err);
      setError(authError.userFriendly);
      setErrorCategory(authError.category);
      
      console.error('Login error:', {
        code: authError.code,
        category: authError.category,
        message: authError.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl glow-primary"
          >
            S
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Welcome to Swapy</span>
          </h1>
          <p className="text-gray-700">
            Sign in to start trading on campus
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email (.edu required)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 ${
                  error && error.toLowerCase().includes('email')
                    ? 'ring-2 ring-red-500'
                    : ''
                }`}
                placeholder="student@university.edu"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl glass focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-300 text-gray-900 placeholder-gray-500 ${
                  error && error.toLowerCase().includes('password')
                    ? 'ring-2 ring-red-500'
                    : ''
                }`}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2"
              >
                <span className="text-lg">{getErrorIcon(errorCategory)}</span>
                <span className="flex-1">{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-primary text-white font-semibold py-3 px-6 rounded-xl shadow-lg glow-primary hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Signing in...' : '🚀 Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-accent font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
