# Google OAuth Setup Guide

## ✅ What's Ready

Both LoginModal and SignupModal now have **"Sign in/up with Google"** buttons that will trigger Google OAuth flow through Supabase.

## 🔧 Complete Google OAuth Setup

### Step 1: Get Your Supabase Callback URL

Your Supabase callback URL (already configured):
```
https://jeydyzwyunrornvardxk.supabase.co/auth/v1/callback
```

### Step 2: Create Google OAuth Client

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Select or create a project (e.g., "EnhanceAiPrompt")

2. **Configure OAuth Consent Screen**
   - Go to: **APIs & Services** → **OAuth consent screen**
   - User Type: **External** (for public apps)
   - Click **CREATE**
   
   **App Information:**
   - App name: `EnhanceAiPrompt`
   - User support email: `your-email@domain.com`
   - App logo: (optional)
   
   **App Domain:**
   - Application home page: `https://enhanceaiprompt.com` (or your domain)
   - Privacy policy: `https://enhanceaiprompt.com/privacy`
   - Terms of service: `https://enhanceaiprompt.com/terms`
   
   **Authorized domains:**
   - Add: `supabase.co`
   - Add: `localhost` (for development)
   
   **Scopes:**
   - Click **ADD OR REMOVE SCOPES**
   - Select: `email`, `profile`, `openid` (first 3 checkboxes)
   - Click **UPDATE**
   
   **Test Users (if app not published):**
   - Add your email and any test user emails
   - Click **SAVE AND CONTINUE**
   
   **Summary:**
   - Review and click **BACK TO DASHBOARD**
   - Click **PUBLISH APP** (if ready for production)

3. **Create OAuth Client ID**
   - Go to: **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   
   **Application Type:**
   - Select: **Web application**
   - Name: `EnhanceAiPrompt Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost:5173
   https://enhanceaiprompt.com
   ```
   *(Add all domains where your app will run)*
   
   **Authorized redirect URIs:**
   ```
   https://jeydyzwyunrornvardxk.supabase.co/auth/v1/callback
   ```
   ⚠️ **This MUST match exactly** (no trailing slash, exact subdomain)
   
   - Click **CREATE**
   - **COPY** the Client ID and Client Secret (you'll need these next)

### Step 3: Configure Supabase

1. **Add Google OAuth Credentials**
   - Go to: https://app.supabase.com
   - Select your project: `jeydyzwyunrornvardxk`
   - Navigate to: **Authentication** → **Providers**
   - Find **Google** and click to expand
   
   **Enable and Configure:**
   - Toggle **Enable Sign in with Google** to ON
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - Click **Save**

2. **Configure Redirect URLs (Important!)**
   - Stay in **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:3000` (for dev)
   - **Redirect URLs**: Add these (one per line):
     ```
     http://localhost:3000
     http://localhost:5173
     https://enhanceaiprompt.com
     ```
   - Click **Save**

### Step 4: Test the Flow

1. **Start Dev Server** (if not running)
   ```powershell
   npm run dev
   ```
   Server should be at: http://localhost:3000

2. **Test Google Sign Up**
   - Open http://localhost:3000
   - Click **"Sign Up Free"**
   - Click **"Sign up with Google"**
   - Select your Google account
   - Grant permissions
   - You should be redirected back to the app, logged in!

3. **Verify in Supabase**
   - Go to: **Authentication** → **Users** in Supabase
   - You should see your new user with Google provider

4. **Test Google Login**
   - Log out from the app
   - Click **"Log In"**
   - Click **"Sign in with Google"**
   - Should work instantly (already authorized)

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: The redirect URI doesn't match Google Cloud settings

**Fix**:
1. Check Google Cloud Console → Credentials → OAuth Client
2. Ensure this EXACT URI is listed:
   ```
   https://jeydyzwyunrornvardxk.supabase.co/auth/v1/callback
   ```
3. No extra spaces, no trailing slash, exact match
4. Wait 5 minutes for Google to propagate changes
5. Try in incognito window

### Error: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not properly configured

**Fix**:
1. Complete all required fields in OAuth consent screen
2. Add `supabase.co` to authorized domains
3. Publish the app or add yourself as test user

### Error: "User not found" after redirect
**Cause**: Supabase redirect URL not configured

**Fix**:
1. Go to Supabase → Authentication → URL Configuration
2. Add your app URL to Redirect URLs list
3. Make sure Site URL is set correctly

### Google popup closes immediately
**Cause**: Browser popup blocker

**Fix**:
1. Allow popups for localhost/your domain
2. Or use redirect mode instead of popup

### User created but not getting bonus uses
**Cause**: `createUserRecord` might not be setting bonus correctly

**Fix**: Check database trigger and default values in `users` table

## 🎨 UI Flow

**For Users:**
1. Click "Sign Up Free" or "Log In"
2. See two options:
   - Email + Password (manual)
   - Google button (one-click)
3. If Google → redirects to Google → back to app (instant)
4. User is logged in with email from Google account
5. Gets same benefits: 5 daily + 10 bonus uses

## 🔐 Security Notes

- ✅ Client Secret stored only in Supabase (never exposed to frontend)
- ✅ OAuth flow handled by Supabase (secure)
- ✅ Tokens managed automatically
- ✅ HTTPS enforced on production
- ✅ Row Level Security (RLS) protects user data

## 📱 Production Deployment

When deploying to production:

1. **Update Google Cloud Console**
   - Add production domain to JavaScript origins
   - Keep the same Supabase callback URI

2. **Update Supabase**
   - Change Site URL to production domain
   - Add production URL to Redirect URLs

3. **Environment Variables**
   - No changes needed! OAuth credentials stay in Supabase

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] Authorized redirect URI added: `https://jeydyzwyunrornvardxk.supabase.co/auth/v1/callback`
- [ ] JavaScript origins added for all domains
- [ ] Client ID and Secret added to Supabase
- [ ] Supabase redirect URLs configured
- [ ] Tested Google sign-up
- [ ] Tested Google login
- [ ] Verified user in Supabase dashboard

## 🎉 You're Done!

Users can now sign up/login with:
- ✅ Email + Password
- ✅ Google OAuth (one-click)

Both methods give the same benefits and use the same database!
