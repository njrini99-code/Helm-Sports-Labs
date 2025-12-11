# Deployment Checklist

## Pre-Deployment

### 1. Environment Variables
Ensure all required environment variables are set in your deployment platform:

#### Required Variables:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Email Service (choose one)
RESEND_API_KEY=your_resend_key
# OR
SENDGRID_API_KEY=your_sendgrid_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
# OR
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Push Notifications (optional)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:support@yourdomain.com

# Error Tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
# OR
NEXT_PUBLIC_LOGROCKET_APP_ID=your_logrocket_id
```

### 2. Database Migrations
Run all database migrations to ensure tables exist:
- `recruit_watchlist`
- `team_media`
- `team_schedule`
- `player_tags`
- `player_stats`
- `game_stats`
- `evaluations`
- `staff_members`
- `email_sequence`
- `push_subscriptions`

### 3. Build Test
```bash
npm run build
```
Ensure the build completes without errors.

### 4. Type Check
```bash
npm run typecheck
```
Fix any TypeScript errors.

## Deployment Platforms

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 or similar for process management

## Post-Deployment

### 1. Verify Environment
- Check that all API routes work
- Verify database connections
- Test email sending
- Test push notifications (if configured)

### 2. Monitor
- Set up error tracking (Sentry/LogRocket)
- Monitor application logs
- Check database performance

### 3. Security
- Ensure HTTPS is enabled
- Verify CORS settings
- Check API rate limiting
- Review RLS policies in Supabase

## Rollback Plan
Keep previous deployment version ready for quick rollback if issues occur.
