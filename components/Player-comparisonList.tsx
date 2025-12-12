'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function Player-comparisonList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const response = await fetch('/api/player-comparison');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-gray-500 mb-4">No items yet</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Create First Item
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:-translate-y-1 transition-all duration-200"
        >
          <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
          {item.description && (
            <p className="text-white/70">{item.description}</p>
)}
          <div className="mt-4 flex gap-2">
            <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30">
              Edit
            </button>
            <button className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30">
              Delete
            </button>
          </div>
        </motion.div>
)}
    </div>
  );
}
