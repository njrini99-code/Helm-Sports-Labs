/**
 * Email Service Integration
 * Supports Resend, SendGrid, or other email providers
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email using configured email service
 * Checks for RESEND_API_KEY or SENDGRID_API_KEY environment variables
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, html, from } = options;

    // Try Resend first (recommended)
    if (process.env.RESEND_API_KEY) {
      return await sendEmailViaResend({ to, subject, html, from });
    }

    // Fallback to SendGrid
    if (process.env.SENDGRID_API_KEY) {
      return await sendEmailViaSendGrid({ to, subject, html, from });
    }

    // Development mode: log email
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] Development mode - email not sent:');
      console.log('  To:', to);
      console.log('  Subject:', subject);
      console.log('  HTML length:', html.length);
      return true;
    }

    console.warn('[Email] No email service configured. Set RESEND_API_KEY or SENDGRID_API_KEY');
    return false;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Send email via Resend
 */
async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@scoutpulse.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email] Resend error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] Resend request error:', error);
    return false;
  }
}

/**
 * Send email via SendGrid
 */
async function sendEmailViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }],
        }],
        from: {
          email: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@scoutpulse.com',
        },
        subject: options.subject,
        content: [{
          type: 'text/html',
          value: options.html,
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] SendGrid error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] SendGrid request error:', error);
    return false;
  }
}
