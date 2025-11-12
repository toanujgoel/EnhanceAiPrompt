# Supabase Integration Guide for EnhanceAI Prompt

## 📋 Overview
This guide walks you through integrating Supabase as the backend database for user authentication, usage tracking, and subscription management.

## 🎯 What's Been Set Up

### ✅ Completed
1. **Package Installation**: `@supabase/supabase-js` installed
2. **Configuration Files**: 
   - `lib/supabase.ts` - Supabase client configuration
   - `lib/database.types.ts` - TypeScript types for database
   - `.env.example` - Environment variables template
3. **Database Schema**: `supabase/schema.sql` - Complete SQL schema
4. **Service Layer**: `services/supabaseService.ts` - All database operations

### 📝 Database Schema Created
- **users** table: User profiles, plans, usage quotas
- **usage_logs** table: Detailed usage tracking per tool
- **subscriptions** table: Stripe subscription management
- **Indexes**: Optimized for common queries
- **RLS Policies**: Row-level security enabled
- **Triggers**: Auto-update timestamps, daily reset function

## 🚀 Step-by-Step Setup Instructions

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: enhance-ai-prompt
   - **Database Password**: (Generate a strong password - save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier
5. Wait for project to initialize (2-3 minutes)

### Step 2: Get Your Credentials
1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 3: Configure Environment Variables
1. Create `.env` file in project root:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_GEMINI_API_KEY=your_existing_gemini_key
```

2. **IMPORTANT**: Add `.env` to `.gitignore` if not already there

### Step 4: Create Database Tables
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the editor
5. Click "Run" (bottom right)
6. Verify tables created: Go to **Table Editor** and see `users`, `usage_logs`, `subscriptions`

### Step 5: Configure Authentication
1. Go to **Authentication** > **Providers**
2. **Email Authentication**:
   - Already enabled by default
   - Optionally disable "Confirm email" for faster testing
3. **Google OAuth** (Optional but recommended):
   - Click "Google" provider
   - Follow instructions to get Google OAuth credentials:
     - Go to [Google Cloud Console](https://console.cloud.google.com)
     - Create project → Enable Google+ API
     - Create OAuth 2.0 Client ID
     - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Paste Client ID and Secret in Supabase
   - Save

### Step 6: Set Up Row Level Security (RLS)
The schema already includes RLS policies, but verify:
1. Go to **Authentication** > **Policies**
2. Check that policies exist for `users`, `usage_logs`, `subscriptions`
3. If missing, re-run the schema.sql

### Step 7: Configure Daily Reset Cron Job
For automatic daily usage reset:
1. Go to **Database** > **Cron Jobs** (if available on your plan)
2. Create new job:
   - **Name**: reset-daily-usage
   - **Schedule**: `0 0 * * *` (midnight UTC)
   - **Command**: `SELECT reset_daily_usage();`
3. If cron unavailable (Free tier), set up external scheduler:
   - Use GitHub Actions / Vercel Cron / Zapier
   - Call Supabase function daily

### Step 8: Update Your Code

#### Option A: Replace Current useUser Hook
Replace `hooks/useUser.ts` with Supabase version:

```typescript
// See complete implementation in services/supabaseService.ts
// Key changes:
// - Replace localStorage with Supabase auth
// - Replace IP-based rate limiting with user-based
// - Add signup/login/logout methods
```

#### Option B: Gradual Migration (Recommended)
1. Keep existing `useUser.ts` working
2. Create new `useUserSupabase.tsx` hook (copy template from this guide)
3. Update `App.tsx` to import new hook:
```typescript
// Change from:
import { UserProvider } from './hooks/useUser';
// To:
import { UserProvider } from './hooks/useUserSupabase';
```

### Step 9: Update SignupModal Component
Add password field and connect to Supabase:

```typescript
// In components/SignupModal.tsx
const [password, setPassword] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  const { success, error } = await signupUser(email, password);
  
  if (success) {
    setShowSuccess(true);
    setTimeout(() => onClose(), 2000);
  } else {
    alert(error || 'Signup failed');
  }
  
  setIsLoading(false);
};
```

### Step 10: Create Login Modal
Add new LoginModal component for existing users:

```typescript
// components/LoginModal.tsx
// Copy SignupModal structure
// Replace signupUser with loginUser
// Add "Forgot Password" link
// Add "Sign in with Google" button
```

### Step 11: Test the Integration

#### Test Signup Flow:
1. Open app → Click Signup
2. Enter email + password
3. Check Supabase Dashboard → Authentication → Users
4. Verify user appears with correct plan

#### Test Usage Tracking:
1. Use a tool (Prompt Enhancer)
2. Check Supabase Dashboard → Table Editor → usage_logs
3. Verify new row with correct user_id and tool_type

#### Test Daily Reset:
1. Manually update `last_reset_date` to yesterday:
```sql
UPDATE users SET last_reset_date = CURRENT_DATE - 1 WHERE email = 'test@example.com';
```
2. Use a tool
3. Check that `daily_uses` reset to 0 and date updated

### Step 12: Update Rate Limiting
Remove/deprecate PHP rate-limit.php:
- Supabase now handles all usage tracking
- Keep PHP endpoint for backward compatibility during transition
- Add feature flag to switch between systems

## 🔧 Code Changes Summary

### Files to Create/Modify:

**New Files:**
- ✅ `lib/supabase.ts` - Supabase client
- ✅ `lib/database.types.ts` - TypeScript types  
- ✅ `services/supabaseService.ts` - Database operations
- ✅ `supabase/schema.sql` - Database schema
- 🔄 `hooks/useUserSupabase.tsx` - New user hook
- 🔄 `components/LoginModal.tsx` - Login interface

**Files to Modify:**
- 🔄 `App.tsx` - Switch to new UserProvider
- 🔄 `components/SignupModal.tsx` - Add password field, connect to Supabase
- 🔄 `components/Header.tsx` - Add login/logout buttons
- 🔄 `components/UpgradeModal.tsx` - Connect to Stripe via Supabase
- 🔄 `.gitignore` - Add `.env`

## 🎨 UI Changes Needed

### Header Updates:
```typescript
// Add login/logout button
{!isAuthenticated ? (
  <button onClick={() => setShowLoginModal(true)}>
    Log In
  </button>
) : (
  <button onClick={logoutUser}>
    {user.email} • Log Out
  </button>
)}
```

### SignupModal Updates:
- Add password input field
- Add password confirmation
- Add "Already have an account? Log in" link
- Add Google Sign In button

### New LoginModal:
- Email + password fields
- "Forgot password?" link  
- "Sign in with Google" button
- "Don't have an account? Sign up" link

## 🔐 Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use RLS policies** - Already configured in schema
3. **Validate on server** - Supabase handles this
4. **Rate limit API calls** - Supabase has built-in rate limiting
5. **Sanitize user inputs** - Always validate email/password format

## 📊 Monitoring & Analytics

### Supabase Dashboard:
- **Authentication**: View signups, active users
- **Table Editor**: Browse users, usage_logs manually
- **Database**: Run custom queries for analytics
- **Logs**: View API requests, errors

### Custom Analytics Queries:
```sql
-- Daily active users
SELECT COUNT(DISTINCT user_id) 
FROM usage_logs 
WHERE created_at >= CURRENT_DATE;

-- Most popular tool
SELECT tool_type, COUNT(*) as usage_count
FROM usage_logs
GROUP BY tool_type
ORDER BY usage_count DESC;

-- Conversion rate (Free → Premium)
SELECT 
  COUNT(CASE WHEN plan = 'PREMIUM' THEN 1 END) * 100.0 / COUNT(*) as premium_rate
FROM users;
```

## 🚨 Troubleshooting

### "Cannot find Supabase credentials"
- Check `.env` file exists
- Verify VITE_ prefix on variables
- Restart dev server after adding .env

### "RLS policy violation"
- Check user is authenticated
- Verify policies in Supabase dashboard
- Test with service_role key (temporarily, for debugging)

### "Daily usage not resetting"
- Check `last_reset_date` in users table
- Verify `reset_daily_usage()` function exists
- Set up cron job or call manually

### "Google OAuth not working"
- Verify redirect URI matches exactly
- Check Google Cloud Console credentials
- Enable Google+ API

## 📈 Next Steps After Integration

1. **Stripe Integration**: Connect subscriptions table to Stripe webhooks
2. **Email Notifications**: Set up Supabase email templates
3. **Analytics Dashboard**: Build admin panel for usage stats
4. **Export Feature**: Let users export their usage history
5. **API Keys**: Generate per-user API keys for programmatic access

## 🆘 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: Report bugs in this repo

## ✅ Migration Checklist

- [ ] Create Supabase project
- [ ] Add environment variables
- [ ] Run schema.sql
- [ ] Enable authentication providers
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test usage tracking
- [ ] Test daily reset
- [ ] Update all components
- [ ] Remove old PHP rate limiting
- [ ] Test on production
- [ ] Monitor for errors
- [ ] Celebrate! 🎉
