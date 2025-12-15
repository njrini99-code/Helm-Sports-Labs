/**
 * Push Notification Service
 * Handles sending push notifications to users
 */

import { createClient } from '@/lib/supabase/server';

interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(
  options: PushNotificationOptions
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get user's push subscription
    const { data: subscription, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', options.userId)
      .eq('enabled', true)
      .single();

    if (subError || !subscription) {
      // User not subscribed or subscription not found - not an error
      return false;
    }

    // Check if web-push is available
    let webpush: any;
    try {
      webpush = require('web-push');
    } catch (error) {
      // web-push not installed - log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Push] web-push not installed. Install with: npm install web-push');
      }
      return false;
    }

    // Set VAPID keys if configured
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:support@helm-sports-labs.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }

    const pushData = {
      title: options.title,
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'helm-sports-labs-notification',
      data: {
        url: options.url || '/',
      },
    };

    try {
      await webpush.sendNotification(
        subscription.subscription,
        JSON.stringify(pushData)
      );
      return true;
    } catch (error: any) {
      // If subscription is invalid, remove it
      if (error.statusCode === 410 || error.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', options.userId);
      }
      console.error('[Push] Error sending notification:', error);
      return false;
    }
  } catch (error) {
    console.error('[Push] Error in sendPushNotification:', error);
    return false;
  }
}
