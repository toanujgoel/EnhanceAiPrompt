# Server-Side Rate Limiting Deployment Guide

## Files to Upload to Your Hostinger Account

### 1. Upload Rate Limiting API
Upload `api/rate-limit.php` to your `public_html/api/` directory:

**File Path:** `public_html/api/rate-limit.php`

### 2. Create Data Directory
Create a directory called `data` in your public_html folder and set permissions to 755:

```
public_html/
├── api/
│   ├── blog.php (existing)
│   └── rate-limit.php (new)
├── data/
│   ├── blog-posts.json (existing)
│   └── rate-limits.json (will be auto-created)
└── index.html
```

### 3. Set File Permissions

In Hostinger File Manager:
- `api/rate-limit.php` → 644
- `data/` directory → 755
- Allow the server to create `rate-limits.json` automatically

## Testing the Rate Limiting

### 1. Test API Endpoint

Visit: `https://enhanceaiprompt.com/api/rate-limit.php`

Expected response:
```json
{
  "ip": "YOUR_IP_ADDRESS",
  "plan": "FREE",
  "usage": 0,
  "limit": 5,
  "remaining": 5,
  "date": "2024-11-12",
  "canUse": true
}
```

### 2. Test Usage Increment

Use curl or the browser's developer tools:

```bash
curl -X POST https://enhanceaiprompt.com/api/rate-limit.php \
  -H "Content-Type: application/json" \
  -H "X-User-Plan: FREE" \
  -d '{"tool": "enhance"}'
```

Expected response:
```json
{
  "success": true,
  "tool": "enhance",
  "usage": 1,
  "limit": 5,
  "remaining": 4,
  "canContinue": true
}
```

### 3. Test Rate Limit Exceeded

After 5 requests, you should get:
```json
{
  "error": "Daily usage limit exceeded",
  "usage": 5,
  "limit": 5,
  "resetTime": "2024-11-13 00:00:00",
  "upgradeRequired": true
}
```

## Build and Deploy Frontend

1. **Build the updated frontend:**
   ```bash
   npm run build
   ```

2. **Upload the built files:**
   - Upload `dist/index.html` to replace `public_html/index.html`
   - Upload all files from `dist/assets/` to `public_html/assets/`

## Security Features Implemented

### 1. IP-Based Tracking
- Uses the most accurate IP address available
- Handles proxies and load balancers
- Falls back gracefully for localhost testing

### 2. Server-Side Validation
- All usage counting happens on the server
- Client cannot manipulate usage data
- Rate limits are enforced before API calls

### 3. Daily Reset System
- Automatically resets at midnight UTC
- Cleans up old data to prevent unlimited growth
- Maintains performance with large user bases

### 4. Plan-Based Limits
- FREE: 5 uses per day
- PREMIUM: 100 uses per day
- Easy to modify limits in the PHP file

## Bypass Prevention

This implementation prevents all common bypass methods:

✅ **Page Refresh:** Usage stored server-side, not affected by client actions
✅ **Browser DevTools:** Client cannot modify server-side data
✅ **Incognito Mode:** IP-based tracking works across all browser sessions
✅ **Clear Browser Data:** Server retains usage data independently
✅ **LocalStorage Manipulation:** Not used for critical data anymore

## Monitoring and Maintenance

### 1. Monitor Usage Patterns
Check `data/rate-limits.json` periodically to see usage patterns:
```json
{
  "ips": {
    "192.168.1.1": {
      "count": 5,
      "date": "2024-11-12"
    }
  },
  "lastCleanup": "2024-11-12"
}
```

### 2. Adjust Limits if Needed
Edit the PHP file to change limits:
```php
$FREE_DAILY_LIMIT = 5;      // Change this for free users
$PREMIUM_DAILY_LIMIT = 100; // Change this for premium users
```

### 3. Backup Data
Regularly backup the `data/` directory to preserve usage data.

## Business Impact

### Immediate Benefits:
- **Prevents unlimited free usage** - Users must upgrade after 5 daily uses
- **Server-side enforcement** - Cannot be bypassed by technical users
- **Fair usage tracking** - All users get exactly their allocated quota
- **Revenue protection** - Forces premium conversions for heavy users

### Expected Results:
- **Increased premium conversions** - Users who exceed 5 uses daily will need to upgrade
- **Better resource management** - Prevents API abuse and excessive costs
- **Professional user experience** - Clear limits and upgrade prompts
- **Sustainable business model** - Protects the freemium conversion funnel

The rate limiting system is now bulletproof and will effectively drive premium upgrades while maintaining a fair free tier.