# Fix: "Error sending confirmation email" (500 Error)

## 🔴 Problem

Signup ayetappudu error:
```
Error: Error sending confirmation email
POST https://supabase.dcodesys.in/auth/v1/signup 500 (Internal Server Error)
```

## ✅ Solution: Update Supabase .env with Hostinger SMTP Settings

### Step 1: Update Supabase .env File

Your self-hosted Supabase server lo `.env` file lo Hostinger SMTP settings add cheyali:

```env
# Email Authentication
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

# Hostinger SMTP Configuration (Port 465 with SSL)
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true

# Alternative (try if GOTRUE_ prefix doesn't work)
SMTP_ADMIN_EMAIL=contact@dcodesys.in
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@dcodesys.in
SMTP_PASS=Dcode@ports123
SMTP_SENDER_NAME=DCODE Learning Platform
SMTP_SECURE=true
```

### Step 2: Restart Supabase Containers

**CRITICAL:** Containers restart cheyakapothe new configuration apply avvadu!

```bash
# Supabase directory lo navigate cheyandi
cd /path/to/supabase

# Auth container restart cheyandi
docker-compose restart auth

# Or full restart (better)
docker-compose down
docker-compose up -d

# Status verify cheyandi
docker-compose ps
```

### Step 3: Verify Configuration Loaded

```bash
# Environment variables check cheyandi
docker-compose exec auth env | grep SMTP

# Expected output:
# GOTRUE_SMTP_HOST=smtp.hostinger.com
# GOTRUE_SMTP_PORT=465
# GOTRUE_SMTP_USER=contact@dcodesys.in
# GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
```

### Step 4: Check Logs for Errors

```bash
# Real-time logs monitor cheyandi
docker-compose logs -f auth

# Recent errors check
docker-compose logs auth --tail=100 | grep -i error

# SMTP specific errors
docker-compose logs auth --tail=100 | grep -i smtp
```

## Alternative: Try Port 587

If port 465 doesn't work, port 587 try cheyandi:

```env
# Option 2: Port 587 with STARTTLS
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SECURE=false  # STARTTLS handles encryption
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
```

## Important Notes for Hostinger SMTP

### ✅ Correct Settings:
- **SMTP Host:** `smtp.hostinger.com`
- **Port:** `465` (SSL) or `587` (STARTTLS)
- **Username:** Full email `contact@dcodesys.in`
- **Password:** `Dcode@ports123`
- **SSL/TLS:** Required (true for 465, false for 587)

### ❌ Common Mistakes:
- Port 587 ki SSL true pettaru (wrong!)
- Port 465 ki SSL false pettaru (wrong!)
- Username lo domain lekunda email pettaru (wrong!)
- Containers restart cheyakunda update chesaru (won't work!)

## Test SMTP Connection

### Test 1: Check if SMTP Server is Reachable

```bash
# Test connection (port 465)
openssl s_client -connect smtp.hostinger.com:465

# Or port 587
telnet smtp.hostinger.com 587
```

### Test 2: Verify Email Credentials

1. Hostinger webmail login cheyandi: https://hpanel.hostinger.com
2. `contact@dcodesys.in` login cheyandi
3. Password `Dcode@ports123` correct undha verify cheyandi

## Docker Compose Configuration

If you have `docker-compose.yml`, directly lo add cheyandi:

```yaml
services:
  auth:
    environment:
      # Hostinger SMTP
      GOTRUE_SMTP_ADMIN_EMAIL: "contact@dcodesys.in"
      GOTRUE_SMTP_HOST: "smtp.hostinger.com"
      GOTRUE_SMTP_PORT: "465"
      GOTRUE_SMTP_USER: "contact@dcodesys.in"
      GOTRUE_SMTP_PASS: "Dcode@ports123"
      GOTRUE_SMTP_SENDER_NAME: "DCODE Learning Platform"
      GOTRUE_SMTP_SECURE: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "false"
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

## Troubleshooting Steps

### 1. Check if Variables are Loaded

```bash
docker-compose exec auth env | grep -i smtp
```

If no SMTP variables show, `.env` file load avvaledhu. Check:
- `.env` file location correct undha?
- Docker Compose `.env` file read chesthundha?
- Variable names correct undha?

### 2. Check Auth Logs

```bash
docker-compose logs auth | tail -50
```

Look for:
- "SMTP error"
- "Authentication failed"
- "Connection timeout"
- "Failed to send email"

### 3. Verify Email Account

- Email account exists undha?
- Password correct undha?
- Account active/suspended undha?
- Email quota exceeded undha?

### 4. Test Port Configuration

**Port 465 (SSL):**
```env
SMTP_PORT=465
SMTP_SECURE=true
```

**Port 587 (STARTTLS):**
```env
SMTP_PORT=587
SMTP_SECURE=false
```

Try both and see which works.

## Quick Fix Checklist

- [ ] Updated `.env` file with Hostinger SMTP settings
- [ ] Port 465 or 587 configured correctly
- [ ] SSL/TLS setting matches port (true for 465, false for 587)
- [ ] Full email address used as username
- [ ] Containers restarted after .env update
- [ ] SMTP variables loaded in container (check with `env | grep SMTP`)
- [ ] No errors in auth container logs
- [ ] Test signup again

## Expected Behavior After Fix

1. **Signup:**
   - User fills signup form
   - Clicks "Sign Up"
   - **NO ERROR** - Success message shows
   - Message: "Check your email to verify"

2. **Email:**
   - Email arrives from `contact@dcodesys.in`
   - Subject: "Confirm your email"
   - Contains verification link

3. **Verification:**
   - User clicks link
   - Email verified
   - Can login

## Still Not Working?

1. **Check Supabase logs:**
   ```bash
   docker-compose logs auth --tail=200
   ```

2. **Check email account:**
   - Login to Hostinger email
   - Verify credentials
   - Check account status

3. **Try different port:**
   - If 465 doesn't work, try 587
   - Or vice versa

4. **Verify network:**
   - SMTP server reachable undha?
   - Firewall block cheyadha?

---

**Main Action:** Update `.env` with Hostinger settings and **RESTART containers**!

