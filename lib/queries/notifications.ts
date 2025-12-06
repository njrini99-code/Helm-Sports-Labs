/**
 * ScoutPulse - Notifications Queries
 *
 * Handles fetching, updating, and real-time subscription for in-app notifications.
 */

import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  user_type: 'player' | 'coach';
  type: 'new_message' | 'profile_view' | 'watchlist_add' | 'college_interest' | 'evaluation_received' | 'camp_registration';
  title: string;
  message: string;
  related_id?: string;
  related_type?: 'player' | 'coach' | 'message' | 'conversation' | 'evaluation';
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch recent notifications for the current user
 */
export async function getNotifications(limit: number = 20): Promise<{
  notifications: Notification[];
  error: Error | null;
}> {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { notifications: [], error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return {
      notifications: data || [],
      error: null,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      notifications: [],
      error: error as Error,
    };
  }
}

/**
 * Get count of unread notifications
 */
export async function getUnreadCount(): Promise<{
  count: number;
  error: Error | null;
}> {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { count: 0, error: new Error('Not authenticated') };
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return {
      count: count || 0,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return {
      count: 0,
      error: error as Error,
    };
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Subscribe to real-time notification updates
 * Returns a cleanup function to unsubscribe
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void,
  onUpdate: (notification: Notification) => void
): () => void {
  const supabase = createClient();

  // Subscribe to INSERT events (new notifications)
  const insertChannel: RealtimeChannel = supabase
    .channel(`notifications-insert-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('New notification received:', payload);
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  // Subscribe to UPDATE events (mark as read)
  const updateChannel: RealtimeChannel = supabase
    .channel(`notifications-update-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Notification updated:', payload);
        onUpdate(payload.new as Notification);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(insertChannel);
    supabase.removeChannel(updateChannel);
  };
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'new_message':
      return 'MessageSquare';
    case 'profile_view':
      return 'Eye';
    case 'watchlist_add':
      return 'Star';
    case 'college_interest':
      return 'Heart';
    case 'evaluation_received':
      return 'ClipboardCheck';
    case 'camp_registration':
      return 'Calendar';
    default:
      return 'Bell';
  }
}

/**
 * Format notification time (relative)
 */
export function formatNotificationTime(timestamp: string): string {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return notificationTime.toLocaleDateString();
  }
}
