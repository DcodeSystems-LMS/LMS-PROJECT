# Fix "Page Not Found" Error for Email Verification Links

## Problem

Clicking email verification link shows "page not found":
```
https://dcodesys.in/auth/v1/verify?token=...&redirect_to=http://localhost:3000/auth/reset-password
```

## Root Causes

1. **Wrong Domain**: Link points to `dcodesys.in/auth/v1/verify` but Supabase endpoint is on `supabase.dcodesys.in`
2. **Wrong Redirect**: Still using `localhost:3000` instead of `dcodesys.in`

## Solution

### Option 1: Fix Supabase Server Configuration (Recommended)

The email link should point to `supabase.dcodesys.in`, not `dcodesys.in`.

**Update Supabase Server `.env` file:**

```bash
# SSH into Supabase server
ssh user@your-server
cd /path/to/supabase
nano .env
```

**Update these settings:**

```env
# Site URL - Where users are redirected AFTER verification
GOTRUE_SITE_URL=https://dcodesys.in

# External URL - Public URL of Supabase (for email links)
GOTRUE_EXTERNAL_URL=https://supabase.dcodesys.in

# API URL - Internal API endpoint
GOTRUE_API_URL=https://supabase.dcodesys.in

# Allow redirects to both production and development
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**
```

**Restart Supabase Auth:**

```bash
docker-compose restart auth
```

**After this fix, email links will be:**
```
https://supabase.dcodesys.in/auth/v1/verify?token=...&redirect_to=https://dcodesys.in/auth/reset-password
```

### Option 2: Configure Reverse Proxy (If you want dcodesys.in/auth/*)

If you want email links to use `dcodesys.in/auth/v1/verify`, configure a reverse proxy:

**Nginx Configuration:**

```nginx
# Route /auth/* to Supabase
location /auth/ {
    proxy_pass https://supabase.dcodesys.in/auth/;
    proxy_set_header Host supabase.dcodesys.in;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_verify off;
}
```

**Then update Supabase `.env`:**

```env
GOTRUE_EXTERNAL_URL=https://dcodesys.in
GOTRUE_SITE_URL=https://dcodesys.in
```

## Expected Behavior

### Before Fix:
```
❌ https://dcodesys.in/auth/v1/verify → 404 Page Not Found
❌ redirect_to=http://localhost:3000/auth/reset-password
```

### After Fix:
```
✅ https://supabase.dcodesys.in/auth/v1/verify → Works!
✅ redirect_to=https://dcodesys.in/auth/reset-password
```

## Verification Steps

1. **Update Supabase server `.env`** with correct URLs
2. **Restart auth service**: `docker-compose restart auth`
3. **Send new password reset email**
4. **Check email link** - should be:
   - `https://supabase.dcodesys.in/auth/v1/verify?...`
   - `redirect_to=https://dcodesys.in/auth/reset-password`
5. **Click link** - should work and redirect correctly

## Important Notes

- **Old emails won't work** - Only NEW emails will have correct links
- **Restart required** - Changes only take effect after restart
- **Use HTTPS** - Always use `https://` in production
- **Test with new email** - Send fresh password reset to verify

## Quick Reference

**Supabase Server `.env` should have:**
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

**Fix the Supabase server configuration to point email links to the correct domain!** 🔧

