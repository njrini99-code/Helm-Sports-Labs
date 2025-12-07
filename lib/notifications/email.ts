// ═══════════════════════════════════════════════════════════════════════════
// Email Notification Service
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationType = 
  | 'new_message' 
  | 'camp_registration' 
  | 'profile_view' 
  | 'watchlist_add' 
  | 'evaluation_added';

export interface NotificationPreferences {
  email_new_messages: boolean;
  email_profile_views: boolean;
  email_watchlist_adds: boolean;
  email_camp_updates: boolean;
  email_evaluations: boolean;
  email_digest_frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export interface NotificationLog {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, unknown>;
  sent_at: string | null;
  error: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Default Preferences
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_new_messages: true,
  email_profile_views: false,
  email_watchlist_adds: true,
  email_camp_updates: true,
  email_evaluations: true,
  email_digest_frequency: 'instant',
};

// ═══════════════════════════════════════════════════════════════════════════
// Notification Preferences Management
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return {
    email_new_messages: data.email_new_messages ?? true,
    email_profile_views: data.email_profile_views ?? false,
    email_watchlist_adds: data.email_watchlist_adds ?? true,
    email_camp_updates: data.email_camp_updates ?? true,
    email_evaluations: data.email_evaluations ?? true,
    email_digest_frequency: data.email_digest_frequency ?? 'instant',
  };
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string, 
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Email Templates
// ═══════════════════════════════════════════════════════════════════════════

export const EMAIL_TEMPLATES = {
  new_message: {
    subject: 'New message from {{senderName}}',
    preview: '{{senderName}} sent you a message on ScoutPulse',
  },
  camp_registration: {
    subject: '{{playerName}} registered interest in {{campName}}',
    preview: 'A new player is interested in your camp',
  },
  profile_view: {
    subject: '{{viewerName}} viewed your profile',
    preview: 'Your profile was viewed on ScoutPulse',
  },
  watchlist_add: {
    subject: '{{coachName}} added you to their watchlist',
    preview: 'Great news! A coach is interested in you',
  },
  evaluation_added: {
    subject: 'New evaluation from {{coachName}}',
    preview: 'You received a new player evaluation',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Notification Queue (Client-side logging)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Queue a notification for sending
 * In production, this would trigger a Supabase Edge Function
 */
export async function queueNotification(
  userId: string,
  type: NotificationType,
  payload: Record<string, unknown>
): Promise<boolean> {
  const supabase = createClient();
  
  // Check user preferences first
  const preferences = await getNotificationPreferences(userId);
  
  // Map notification type to preference
  const preferenceMap: Record<NotificationType, keyof NotificationPreferences> = {
    new_message: 'email_new_messages',
    camp_registration: 'email_camp_updates',
    profile_view: 'email_profile_views',
    watchlist_add: 'email_watchlist_adds',
    evaluation_added: 'email_evaluations',
  };

  const preferenceKey = preferenceMap[type];
  if (!preferences[preferenceKey]) {
    console.log(`User ${userId} has disabled ${type} notifications`);
    return false;
  }

  // Log the notification (would be picked up by Edge Function in production)
  const { error } = await supabase
    .from('notification_queue')
    .insert({
      user_id: userId,
      type,
      payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error queueing notification:', error);
    return false;
  }

  // In development, we'd trigger the edge function manually
  // In production, this would be handled by a database trigger
  console.log(`Notification queued: ${type} for user ${userId}`);
  
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Generate Email HTML
// ═══════════════════════════════════════════════════════════════════════════

export function generateEmailHTML(
  template: keyof typeof EMAIL_TEMPLATES,
  data: Record<string, string>
): string {
  const templateConfig = EMAIL_TEMPLATES[template];
  
  // Simple template interpolation
  let subject = templateConfig.subject;
  let preview = templateConfig.preview;
  
  Object.entries(data).forEach(([key, value]) => {
    subject = subject.replace(`{{${key}}}`, value);
    preview = preview.replace(`{{${key}}}`, value);
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #10b981;
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
    }
    .content {
      padding: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding: 20px 0;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">◈ ScoutPulse</div>
  </div>
  <div class="content">
    <h2>${subject}</h2>
    <p>${preview}</p>
    <p style="margin-top: 24px;">
      <a href="https://scoutpulse.app" class="cta-button">View on ScoutPulse</a>
    </p>
  </div>
  <div class="footer">
    <p>You're receiving this email because you have notifications enabled on ScoutPulse.</p>
    <p><a href="https://scoutpulse.app/settings/notifications">Manage notification preferences</a> | <a href="https://scoutpulse.app/unsubscribe">Unsubscribe</a></p>
    <p>© ${new Date().getFullYear()} ScoutPulse. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send a new message notification
 */
export async function notifyNewMessage(
  recipientUserId: string,
  senderName: string,
  messagePreview: string
): Promise<boolean> {
  return queueNotification(recipientUserId, 'new_message', {
    senderName,
    messagePreview,
    sentAt: new Date().toISOString(),
  });
}

/**
 * Send a camp registration notification to coach
 */
export async function notifyCampRegistration(
  coachUserId: string,
  playerName: string,
  campName: string
): Promise<boolean> {
  return queueNotification(coachUserId, 'camp_registration', {
    playerName,
    campName,
    registeredAt: new Date().toISOString(),
  });
}

/**
 * Send a profile view notification
 */
export async function notifyProfileView(
  profileOwnerUserId: string,
  viewerName: string,
  viewerType: 'coach' | 'player'
): Promise<boolean> {
  return queueNotification(profileOwnerUserId, 'profile_view', {
    viewerName,
    viewerType,
    viewedAt: new Date().toISOString(),
  });
}

/**
 * Send a watchlist add notification
 */
export async function notifyWatchlistAdd(
  playerUserId: string,
  coachName: string,
  programName: string
): Promise<boolean> {
  return queueNotification(playerUserId, 'watchlist_add', {
    coachName,
    programName,
    addedAt: new Date().toISOString(),
  });
}

/**
 * Send an evaluation notification
 */
export async function notifyEvaluationAdded(
  playerUserId: string,
  coachName: string,
  programName: string
): Promise<boolean> {
  return queueNotification(playerUserId, 'evaluation_added', {
    coachName,
    programName,
    evaluatedAt: new Date().toISOString(),
  });
}


