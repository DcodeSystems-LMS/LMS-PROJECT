# Fix Supabase Site URL for Email Links

## Problem

Email verification and password reset links are using `localhost:3000` instead of `dcodesys.in`, even after client-side fixes.

## Root Cause

Supabase server uses `GOTRUE_SITE_URL` environment variable to generate email links. This server-side setting overrides the client-side `redirectTo` parameter.

## Solution

Update the Supabase server's `.env` file to set `GOTRUE_SITE_URL` to `https://dcodesys.in`.

## Steps to Fix

### 1. Access Your Supabase Server

SSH into your server where Supabase is hosted:
```bash
ssh user@your-server
cd /path/to/supabase
```

### 2. Update Supabase .env File

Edit the `.env` file in your Supabase directory:

```bash
nano .env
# or
vim .env
```

### 3. Add/Update GOTRUE_SITE_URL

Add or update this line in the `.env` file:

```env
GOTRUE_SITE_URL=https://dcodesys.in
```

**Important:** Make sure it's `https://dcodesys.in` (not `http://localhost:3000`)

### 4. Also Update These Related Settings

```env
# Site URL for email links
GOTRUE_SITE_URL=https://dcodesys.in

# Allowed redirect URLs (add both for flexibility)
GOTRUE_EXTERNAL_URL=https://dcodesys.in
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**
```

### 5. Restart Supabase Auth Service

After updating the `.env` file, restart the auth container:

```bash
# If using Docker Compose
docker-compose restart auth

# Or if using Docker directly
docker restart supabase_auth_<container_id>

# Or restart all Supabase services
docker-compose restart
```

### 6. Verify Configuration

Check if the environment variable is set correctly:

```bash
docker-compose exec auth env | grep GOTRUE_SITE_URL
```

Should show:
```
GOTRUE_SITE_URL=https://dcodesys.in
```

### 7. Check Auth Logs

Verify the configuration is loaded:

```bash
docker-compose logs auth --tail=50 | grep -i "site_url\|SITE_URL"
```

## Alternative: Update via Supabase Dashboard (if available)

If you have access to Supabase Dashboard:

1. Go to **Authentication** → **Settings**
2. Find **Site URL** field
3. Set it to: `https://dcodesys.in`
4. Save changes

## Complete .env Configuration Example

Here's a complete example of what your Supabase `.env` should have:

```env
# Site URL Configuration
GOTRUE_SITE_URL=https://dcodesys.in
GOTRUE_EXTERNAL_URL=https://dcodesys.in
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**

# SMTP Configuration (Hostinger)
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true
```

## Testing

After updating and restarting:

1. **Send a password reset email** from `dcodesys.in`
2. **Check the email** - the link should be:
   ```
   https://supabase.dcodesys.in/auth/v1/verify?token=...&redirect_to=https://dcodesys.in/auth/reset-password
   ```
   NOT:
   ```
   https://supabase.dcodesys.in/auth/v1/verify?token=...&redirect_to=http://localhost:3000/auth/reset-password
   ```

3. **Send a signup email** - verification link should also use `https://dcodesys.in`

## Why This Happens

- **Client-side code** (`redirectTo` parameter) is used as a suggestion
- **Server-side** (`GOTRUE_SITE_URL`) is the authoritative source
- Supabase server validates and may override client `redirectTo` with `GOTRUE_SITE_URL`

## Important Notes

1. **Always use HTTPS** in production: `https://dcodesys.in`
2. **Restart required** - Changes only take effect after restarting the auth service
3. **Both URLs can work** - You can allow both `dcodesys.in` and `localhost:3000` in `GOTRUE_URI_ALLOW_LIST` for development flexibility

## Troubleshooting

### Still seeing localhost:3000?

1. **Check if .env was saved correctly:**
   ```bash
   cat .env | grep GOTRUE_SITE_URL
   ```

2. **Verify container has the variable:**
   ```bash
   docker-compose exec auth env | grep SITE_URL
   ```

3. **Check if auth service restarted:**
   ```bash
   docker-compose ps auth
   ```

4. **Clear browser cache** - Old emails might have cached links

5. **Send a new email** - Old emails will still have old links

### Links not working?

Make sure `GOTRUE_URI_ALLOW_LIST` includes your domain:
```env
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**
```

---

**After this fix, all new emails will use `https://dcodesys.in` links!** ✅

