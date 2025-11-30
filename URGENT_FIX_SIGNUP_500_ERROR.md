# 🔴 URGENT: Fix Signup 500 Error - "Error sending confirmation email"

## Problem
```
POST https://supabase.dcodesys.in/auth/v1/signup 500 (Internal Server Error)
Error: Error sending confirmation email
```

**Root Cause:** Supabase server lo SMTP configuration missing or incorrect.

## ✅ IMMEDIATE FIX

### Step 1: Check Supabase Server Logs

SSH into your Supabase server and check logs:

```bash
# Supabase directory lo
cd /path/to/supabase

# Auth container logs check cheyandi
docker-compose logs auth --tail=100

# SMTP errors specific ga check
docker-compose logs auth | grep -i "smtp\|email\|mail"
```

### Step 2: Verify SMTP Configuration is Loaded

```bash
# Environment variables check
docker-compose exec auth env | grep -i smtp

# If nothing shows, SMTP not configured!
```

### Step 3: Update Supabase .env File

Supabase server lo `.env` file lo add/update cheyandi:

```env
# Hostinger SMTP Configuration
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true
GOTRUE_MAILER_AUTOCONFIRM=false
```

**OR try Port 587 if 465 doesn't work:**

```env
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_SECURE=false
```

### Step 4: Restart Auth Container

**CRITICAL:** Restart cheyakapothe new settings apply avvavu!

```bash
# Restart auth service
docker-compose restart auth

# Wait 10 seconds
sleep 10

# Check if running
docker-compose ps auth
```

### Step 5: Verify Configuration Loaded

```bash
# Check SMTP variables loaded
docker-compose exec auth env | grep SMTP

# Should show:
# GOTRUE_SMTP_HOST=smtp.hostinger.com
# GOTRUE_SMTP_PORT=465
# GOTRUE_SMTP_USER=contact@dcodesys.in
# GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
```

### Step 6: Test Signup Again

1. Browser lo: `http://localhost:3000/auth/signup`
2. New account create cheyandi
3. Watch logs: `docker-compose logs -f auth`
4. Should work without 500 error

## 🔧 Alternative: Temporary Auto-Confirm (For Testing)

If SMTP still not working, temporarily disable email verification:

**Update .env:**
```env
GOTRUE_MAILER_AUTOCONFIRM=true
ENABLE_EMAIL_AUTOCONFIRM=true
```

**Restart:**
```bash
docker-compose restart auth
```

**⚠️ WARNING:** This allows signup without email. Only for testing!

## 📋 Complete .env Configuration

Full `.env` file example:

```env
# Database
POSTGRES_PASSWORD=your-db-password

# Auth Configuration
GOTRUE_SITE_URL=http://localhost:3000
GOTRUE_URI_ALLOW_LIST=*

# Email Authentication
GOTRUE_MAILER_AUTOCONFIRM=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

# Hostinger SMTP
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true
```

## 🐛 Troubleshooting

### Issue: Variables Not Showing

**Check:**
1. `.env` file location correct undha?
2. Docker Compose `.env` file read chesthundha?
3. Variable names correct undha? (`GOTRUE_` prefix important!)

**Fix:**
```bash
# Check docker-compose.yml has env_file
cat docker-compose.yml | grep env_file

# Or check environment section
cat docker-compose.yml | grep -A 10 "environment:"
```

### Issue: Still Getting 500 Error

**Check logs:**
```bash
docker-compose logs auth --tail=50
```

**Common errors:**
- "SMTP connection failed" → Check SMTP host/port
- "Authentication failed" → Check username/password
- "Connection timeout" → Check firewall/network

### Issue: Port 465 Not Working

**Try Port 587:**
```env
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_SECURE=false
```

**Restart:**
```bash
docker-compose restart auth
```

## ✅ Success Indicators

After fix, you should see:

1. **No 500 error** when signing up
2. **Success message** shows
3. **Logs show:** "Email sent" or "User created"
4. **Email received** (if SMTP working) OR **Auto-login** (if auto-confirm enabled)

## 🚀 Quick Command Summary

```bash
# 1. Check logs
docker-compose logs auth --tail=100

# 2. Check SMTP config
docker-compose exec auth env | grep SMTP

# 3. Restart auth
docker-compose restart auth

# 4. Monitor logs
docker-compose logs -f auth

# 5. Test signup in browser
```

---

**Main Action:** Update `.env` with SMTP settings → Restart auth container → Test signup!

