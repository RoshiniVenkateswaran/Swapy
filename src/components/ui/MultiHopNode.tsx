'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface MultiHopNodeProps {
  itemName: string;
  itemImage: string;
  userName: string;
  index: number;
  total: number;
}

export default function MultiHopNode({
  itemName,
  itemImage,
  userName,
  index,
  total,
}: MultiHopNodeProps) {
  const isLast = index === total - 1;

  return (
    <div className="flex items-center">
      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.2 }}
        className="glass rounded-2xl p-4 hover:bg-white/50 transition-all duration-300"
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-2">
          <Image
            src={itemImage}
            alt={itemName}
            fill
            className="object-cover"
          />
        </div>
        <p className="text-xs text-gray-700 font-semibold text-center truncate">
          {userName}
        </p>
        <p className="text-xs text-gray-900 text-center truncate mt-1">
          {itemName}
        </p>
      </motion.div>

      {/* Arrow */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 + 0.1 }}
          className="mx-4 text-3xl text-primary animate-pulse"
        >
          →
        </motion.div>
      )}
    </div>
  );
}

