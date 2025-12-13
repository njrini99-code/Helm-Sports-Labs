/**
 * Helper function to create notifications
 * This can be called from server-side code or API routes
 */

import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from './sendPushNotification';
import { sendEmail } from '@/lib/emails/sendEmail';

export interface NotificationData {
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: NotificationData) {
  try {
    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        notification_type: data.notification_type,
        title: data.title,
        body: data.body,
        link: data.link || null,
        read: false,
      })
      .select()
      .single();

    if (error || !notification) {
      console.error('Error creating notification:', error);
      return null;
    }

    // Get user preferences and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, push_notifications_enabled, email_notifications_enabled')
      .eq('id', data.user_id)
      .single();

    // Send push notification if enabled
    if (profile?.push_notifications_enabled) {
      await sendPushNotification({
        userId: data.user_id,
        title: data.title,
        body: data.body,
        url: data.link || undefined,
      });
    }

    // Send email notification if enabled
    if (profile?.email_notifications_enabled && profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: data.title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${data.title}</h2>
            <p>${data.body}</p>
            ${data.link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://scoutpulse.com'}${data.link}" style="color: #10b981; text-decoration: none;">View Details →</a></p>` : ''}
          </div>
        `,
      });
    }

    return notification;
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  notificationData: Omit<NotificationData, 'user_id'>
) {
  try {
    const supabase = await createClient();

    const notifications = userIds.map((user_id) => ({
      user_id,
      ...notificationData,
      read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in createNotificationsForUsers:', error);
    return [];
  }
}

/**
 * Create notification for schedule reminder
 */
export async function createScheduleReminder(
  userId: string,
  eventName: string,
  eventTime: string,
  reminderTime: string
) {
  return createNotification({
    user_id: userId,
    notification_type: 'schedule_reminder',
    title: 'Upcoming Event',
    body: `${eventName} is in ${reminderTime}`,
    link: `/coach/high-school/team?tab=schedule`,
  });
}

/**
 * Create notification for schedule change
 */
export async function createScheduleChangeNotification(
  userId: string,
  eventName: string,
  changeDetails: string
) {
  return createNotification({
    user_id: userId,
    notification_type: 'schedule_change',
    title: 'Schedule Change',
    body: `${eventName}: ${changeDetails}`,
    link: `/coach/high-school/team?tab=schedule`,
  });
}

/**
 * Create notification for new message
 */
export async function createNewMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string
) {
  return createNotification({
    user_id: userId,
    notification_type: 'new_message',
    title: `New message from ${senderName}`,
    body: messagePreview,
    link: `/coach/high-school/messages`,
  });
}

