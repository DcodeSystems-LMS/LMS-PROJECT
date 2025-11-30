# Fix "Page Not Found" for Email Verification Links

## Problem

Email verification link shows "page not found":
```
https://dcodesys.in/auth/v1/verify?token=...&redirect_to=http://localhost:3000/auth/reset-password
```

## Root Cause

The email link is pointing to `dcodesys.in/auth/v1/verify`, but this Supabase auth endpoint should be on `supabase.dcodesys.in/auth/v1/verify`.

## Issues Identified

1. **Wrong Domain**: Link uses `dcodesys.in` instead of `supabase.dcodesys.in`
2. **Wrong Redirect**: Still using `localhost:3000` instead of `dcodesys.in`

## Solution

### Step 1: Update Supabase Server Configuration

The Supabase server needs to be configured correctly. Update the Supabase server `.env` file:

```bash
# SSH into your Supabase server
ssh user@your-server
cd /path/to/supabase
nano .env
```

### Step 2: Update These Settings

```env
# Site URL - This is where users will be redirected AFTER verification
GOTRUE_SITE_URL=https://dcodesys.in

# External URL - This is the public URL of your Supabase instance
GOTRUE_EXTERNAL_URL=https://supabase.dcodesys.in

# API URL - Internal API URL
GOTRUE_API_URL=https://supabase.dcodesys.in

# Allow both production and development redirects
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**
```

### Step 3: Check Reverse Proxy Configuration

If you have a reverse proxy (nginx/apache) that routes `dcodesys.in/auth/*` to Supabase, make sure it's configured correctly:

**Nginx Example:**
```nginx
# Route Supabase auth endpoints
location /auth/ {
    proxy_pass https://supabase.dcodesys.in/auth/;
    proxy_set_header Host supabase.dcodesys.in;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Step 4: Restart Supabase Services

```bash
docker-compose restart auth
# Or restart all
docker-compose restart
```

### Step 5: Verify Configuration

```bash
# Check environment variables
docker-compose exec auth env | grep GOTRUE

# Check logs
docker-compose logs auth --tail=50
```

## Expected Email Link Format

After fix, email links should be:
```
https://supabase.dcodesys.in/auth/v1/verify?token=...&type=recovery&redirect_to=https://dcodesys.in/auth/reset-password
```

NOT:
```
https://dcodesys.in/auth/v1/verify?token=...&redirect_to=http://localhost:3000/auth/reset-password
```

## Alternative: If Using Reverse Proxy

If you want email links to use `dcodesys.in/auth/v1/verify` (via reverse proxy), you need to:

1. **Configure reverse proxy** to route `/auth/*` to `supabase.dcodesys.in/auth/*`
2. **Update GOTRUE_EXTERNAL_URL** to match:
   ```env
   GOTRUE_EXTERNAL_URL=https://dcodesys.in
   ```

## Testing

1. **Send new password reset email**
2. **Check email link** - should be:
   - `https://supabase.dcodesys.in/auth/v1/verify?...` (if no proxy)
   - OR `https://dcodesys.in/auth/v1/verify?...` (if proxy configured)
3. **Click link** - should redirect to `https://dcodesys.in/auth/reset-password`

## Quick Fix Summary

**On Supabase Server:**
```env
GOTRUE_SITE_URL=https://dcodesys.in
GOTRUE_EXTERNAL_URL=https://supabase.dcodesys.in
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**
```

**Then restart:**
```bash
docker-compose restart auth
```

---

**The email link must point to the correct Supabase auth endpoint!** 🔧

