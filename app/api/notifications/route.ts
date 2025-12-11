import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPushNotification } from '@/lib/notifications/sendPushNotification';
import { sendEmail } from '@/lib/emails/sendEmail';
import { z } from 'zod';

/**
 * Get user notifications
 * GET /api/notifications
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error: notificationsError } = await query;

    if (notificationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create notification (internal use)
 * POST /api/notifications
 */

const notificationInputSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  notification_type: z.string().min(1, 'Notification type is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(1000, 'Body too long'),
  link: z.string().url('Invalid link URL').optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validate input
    const validationResult = notificationInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { user_id, notification_type, title, body: notificationBody, link } = validationResult.data;

    if (!user_id || !notification_type || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        notification_type,
        title,
        body: notificationBody,
        link,
        read: false,
      })
      .select()
      .single();

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // Get user preferences and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, push_notifications_enabled, email_notifications_enabled')
      .eq('id', user_id)
      .single();

    // Send push notification if enabled
    if (profile?.push_notifications_enabled) {
      await sendPushNotification({
        userId: user_id,
        title,
        body: notificationBody,
        url: link || undefined,
      });
    }

    // Send email notification if enabled
    if (profile?.email_notifications_enabled && profile?.email) {
      await sendEmail({
        to: profile.email,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${title}</h2>
            <p>${notificationBody}</p>
            ${link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://scoutpulse.com'}${link}" style="color: #10b981; text-decoration: none;">View Details →</a></p>` : ''}
          </div>
        `,
      });
    }

    return NextResponse.json({ notification, success: true });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

