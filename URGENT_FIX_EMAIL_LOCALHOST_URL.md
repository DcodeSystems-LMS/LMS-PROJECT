# 🔴 URGENT: Fix Email Links Using localhost:3000

## Problem

Email verification and password reset links are showing `localhost:3000` instead of `dcodesys.in`:
```
https://supabase.dcodesys.in/auth/v1/verify?token=...&redirect_to=http://localhost:3000/auth/reset-password
```

## Root Cause

Supabase server uses `GOTRUE_SITE_URL` environment variable to generate email links. This **server-side setting** overrides client-side `redirectTo` parameter.

## ✅ IMMEDIATE FIX - Update Supabase Server

### Step 1: Access Supabase Server

SSH into your server:
```bash
ssh user@your-server
cd /path/to/supabase
```

### Step 2: Edit .env File

```bash
nano .env
# or
vim .env
```

### Step 3: Update GOTRUE_SITE_URL

Find this line:
```env
GOTRUE_SITE_URL=http://localhost:3000
```

Change it to:
```env
GOTRUE_SITE_URL=https://dcodesys.in
```

### Step 4: Also Add/Update These

```env
# Site URL for all email links
GOTRUE_SITE_URL=https://dcodesys.in

# External URL
GOTRUE_EXTERNAL_URL=https://dcodesys.in

# Allow both production and development URLs
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**
```

### Step 5: Restart Auth Service

```bash
# Restart auth container
docker-compose restart auth

# Or restart all services
docker-compose restart
```

### Step 6: Verify

```bash
# Check if variable is set
docker-compose exec auth env | grep GOTRUE_SITE_URL

# Should show:
# GOTRUE_SITE_URL=https://dcodesys.in
```

## 🧪 Test After Fix

1. **Send new password reset email** from `dcodesys.in`
2. **Check email** - link should now be:
   ```
   https://supabase.dcodesys.in/auth/v1/verify?token=...&redirect_to=https://dcodesys.in/auth/reset-password
   ```

## 📝 Complete .env Example

```env
# Site URL - MUST be https://dcodesys.in for production
GOTRUE_SITE_URL=https://dcodesys.in
GOTRUE_EXTERNAL_URL=https://dcodesys.in
GOTRUE_URI_ALLOW_LIST=https://dcodesys.in/**,http://localhost:3000/**

# SMTP Configuration
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true
```

## ⚠️ Important Notes

1. **Old emails won't change** - Only NEW emails will use the correct URL
2. **Restart required** - Changes only work after restarting auth service
3. **Use HTTPS** - Always use `https://dcodesys.in` (not `http://`)
4. **Test with new email** - Send a fresh password reset to verify

## 🔍 Why Client-Side Fix Isn't Enough

- Client code passes `redirectTo` parameter ✅
- But Supabase server validates it against `GOTRUE_SITE_URL` ❌
- If they don't match, server uses `GOTRUE_SITE_URL` instead

**Solution:** Update server-side `GOTRUE_SITE_URL` to match production domain.

---

**This is a SERVER-SIDE configuration issue. Update the Supabase server `.env` file!** 🔧

