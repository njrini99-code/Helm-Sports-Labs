'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Recruiting-pipelineForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/recruiting-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create');

      setFormData({ name: '', description: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to create item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4"
    >
      <div>
        <label className="block text-white mb-2 font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:bg-white/15 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none"
          placeholder="Enter name..."
        />
      </div>
      <div>
        <label className="block text-white mb-2 font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:bg-white/15 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
          placeholder="Enter description..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create'}
      </button>
    </motion.form>
  );
}
