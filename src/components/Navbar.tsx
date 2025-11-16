'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <Link href="/dashboard">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg glow-primary">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold gradient-text hidden sm:block">
                Swapy
              </span>
            </motion.div>
          </Link>

          {/* Profile & Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* User Profile with Dropdown */}
                <div className="relative group">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 glass rounded-xl px-4 py-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-gray-900 text-sm font-semibold truncate max-w-[150px]">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-gray-600 text-xs truncate max-w-[150px]">
                        {user.email}
                      </p>
                    </div>
                  </motion.div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/20">
                      <p className="text-gray-900 text-sm font-semibold truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-gray-600 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl glass text-gray-900 hover:bg-white/40 transition-all duration-300 font-medium text-sm"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl bg-gradient-primary text-white shadow-lg glow-primary hover:shadow-xl transition-all duration-300 font-medium text-sm"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
