# Database Setup Instructions

## ✅ What's Been Completed

1. **Hybrid System Implementation**
   - ✅ Anonymous users: IP-based tracking (5 uses/day) via Supabase
   - ✅ Authenticated users: Account-based tracking (5 daily + 10 bonus) via Supabase
   - ✅ Prevents abuse: Can't bypass limits by clearing browser or incognito mode

2. **Code Updates**
   - ✅ hooks/useUser.tsx: Hybrid authentication hook
   - ✅ components/SignupModal.tsx: Password field added
   - ✅ components/LoginModal.tsx: New login component with Google OAuth
   - ✅ components/Header.tsx: Auth UI (login/logout/user menu)
   - ✅ services/supabaseService.ts: Complete database operations
   - ✅ supabase/schema.sql: Updated with anonymous_usage table

## 🚀 Next Step: Run Database Schema

### 1. Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: **jeydyzwyunrornvardxk**
3. Click **SQL Editor** in the left sidebar

### 2. Run the Schema

1. Click **New Query**
2. Open the file: `supabase/schema.sql`
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click **RUN** (or press Ctrl+Enter)

### 3. Verify Tables Were Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ usage_logs
   - ✅ anonymous_usage
   - ✅ subscriptions

### 4. Test the Application

```powershell
# Start the dev server (if not already running)
npm run dev
```

**Test Flow:**
1. Visit http://localhost:5173
2. **Anonymous Test:**
   - Try using a tool (should work, 5 times max)
   - Check browser console for IP tracking
3. **Signup Test:**
   - Click "Sign Up Free"
   - Enter email + password (min 6 chars)
   - Check email for verification link
   - Click verification link
4. **Login Test:**
   - Click "Log In"
   - Enter credentials
   - Should see user email in header
5. **Usage Test:**
   - Use tools as authenticated user
   - Should have 5 daily + 10 bonus = 15 total
6. **Logout Test:**
   - Click user menu → Sign Out
   - Should return to anonymous state (5 uses)

## 🔧 Optional: Enable Google OAuth

To enable "Sign in with Google" button:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google** provider
3. Add these URLs to Google Cloud Console:
   - Authorized redirect URIs: `https://jeydyzwyunrornvardxk.supabase.co/auth/v1/callback`
   - Authorized JavaScript origins: `http://localhost:5173`

## 📊 Monitor Usage

### Check Anonymous Usage
```sql
SELECT * FROM anonymous_usage 
WHERE usage_date = CURRENT_DATE 
ORDER BY usage_count DESC;
```

### Check Authenticated Usage
```sql
SELECT u.email, u.daily_uses, u.bonus_uses, u.plan
FROM users u
ORDER BY u.created_at DESC;
```

### Check All Usage Logs
```sql
SELECT 
  ul.tool_type,
  u.email,
  ul.created_at
FROM usage_logs ul
JOIN users u ON u.id = ul.user_id
ORDER BY ul.created_at DESC
LIMIT 20;
```

## 🔄 Daily Reset

The database includes a function `reset_daily_usage()` that:
- Resets all users' daily_uses to 0
- Deletes old anonymous_usage records

**To schedule automatic daily reset:**
1. Go to **Database** → **Cron Jobs** in Supabase (if available)
2. Or use an external scheduler (e.g., GitHub Actions, n8n) to call the function

## 🎉 You're All Set!

The hybrid system is now ready:
- Anonymous users get 5 uses/day (IP tracked)
- Signed up users get 5 daily + 10 bonus uses
- No more abuse via browser clearing/incognito
- All data securely stored in Supabase PostgreSQL
