'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  CARD_GLASS,
  LOADING_CONTAINER,
  LOADING_SPINNER,
  EMPTY_STATE_CONTAINER,
  EMPTY_STATE_ICON,
  EMPTY_STATE_TEXT,
  BUTTON_STANDARD,
  BUTTON_DANGER_GLASS,
} from '@/lib/constants/styles';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  [key: string]: any; // Additional fields
}

export interface GenericListProps {
  /** API endpoint to fetch from (e.g., '/api/bulk-actions') */
  endpoint: string;

  /** Title for the list */
  title?: string;

  /** Empty state message */
  emptyMessage?: string;

  /** Empty state emoji/icon */
  emptyIcon?: string;

  /** Show create button */
  showCreate?: boolean;

  /** Create button text */
  createText?: string;

  /** Callback when create button is clicked */
  onCreate?: () => void;

  /** Callback when edit button is clicked */
  onEdit?: (item: ListItem) => void;

  /** Callback when delete button is clicked */
  onDelete?: (item: ListItem) => void;

  /** Custom render function for list items */
  renderItem?: (item: ListItem, index: number) => React.ReactNode;

  /** Additional className for container */
  className?: string;

  /** Use glass styling (default: true) */
  glassStyle?: boolean;

  /** Enable animations (default: true) */
  animated?: boolean;

  /** Refresh trigger - increment to refetch data */
  refreshTrigger?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function GenericList({
  endpoint,
  title,
  emptyMessage = 'No items yet',
  emptyIcon = '📭',
  showCreate = true,
  createText = 'Create First Item',
  onCreate,
  onEdit,
  onDelete,
  renderItem,
  className = '',
  glassStyle = true,
  animated = true,
  refreshTrigger = 0,
}: GenericListProps) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════════════
  // Load Data
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    loadItems();
  }, [endpoint, refreshTrigger]);

  async function loadItems() {
    try {
      setLoading(true);
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`Failed to fetch items (${response.status})`);
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load items:', error);
      toast.error('Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Delete Handler
  // ═══════════════════════════════════════════════════════════════════════

  async function handleDelete(item: ListItem) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    setDeleting(item.id);

    try {
      const response = await fetch(`${endpoint}/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete (${response.status})`);
      }

      toast.success('Item deleted successfully');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      onDelete?.(item);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleting(null);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render Loading State
  // ═══════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className={LOADING_CONTAINER}>
        <div className={LOADING_SPINNER}></div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render Empty State
  // ═══════════════════════════════════════════════════════════════════════

  if (items.length === 0) {
    return (
      <div className={EMPTY_STATE_CONTAINER}>
        <div className={EMPTY_STATE_ICON}>{emptyIcon}</div>
        <p className={EMPTY_STATE_TEXT}>{emptyMessage}</p>
        {showCreate && onCreate && (
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            {createText}
          </button>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render Default Item
  // ═══════════════════════════════════════════════════════════════════════

  function renderDefaultItem(item: ListItem, index: number) {
    const isDeleting = deleting === item.id;

    return (
      <motion.div
        key={item.id}
        initial={animated ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animated ? index * 0.1 : 0 }}
        className={CARD_GLASS}
      >
        <h3 className={glassStyle ? 'text-xl font-bold text-white mb-2' : 'text-xl font-bold text-gray-900 mb-2'}>
          {item.name}
        </h3>

        {item.description && (
          <p className={glassStyle ? 'text-white/70 mb-4' : 'text-gray-600 mb-4'}>
            {item.description}
          </p>
        )}

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className={BUTTON_STANDARD}
              disabled={isDeleting}
            >
              <Edit className="w-4 h-4 inline mr-1" />
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => handleDelete(item)}
              className={BUTTON_DANGER_GLASS}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 inline mr-1" />
              )}
              Delete
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Render List
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className={className}>
      {title && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className={glassStyle ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
            {title}
          </h2>
          {showCreate && onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {items.map((item, index) =>
          renderItem ? renderItem(item, index) : renderDefaultItem(item, index)
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience Hook for List Management
// ═══════════════════════════════════════════════════════════════════════════

export function useListRefresh() {
  const [trigger, setTrigger] = useState(0);

  const refresh = () => setTrigger((prev) => prev + 1);

  return { refreshTrigger: trigger, refresh };
}
