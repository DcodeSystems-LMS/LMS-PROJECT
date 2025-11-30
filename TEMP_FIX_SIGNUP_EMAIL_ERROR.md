# Temporary Fix: Signup Email Error (500)

## 🔴 Current Problem

Signup ayetappudu error:
```
Error: Error sending confirmation email
500 Internal Server Error
```

**Reason:** Supabase SMTP configuration not working or not loaded.

## ✅ Quick Fix Options

### Option 1: Temporary Auto-Confirm (For Testing)

Self-hosted Supabase lo email verification temporarily disable cheyadaniki:

**Update Supabase .env file:**
```env
# Temporary: Auto-confirm emails (skip verification)
ENABLE_EMAIL_AUTOCONFIRM=true
GOTRUE_MAILER_AUTOCONFIRM=true
```

**Then restart:**
```bash
docker-compose restart auth
```

**Note:** This allows signup without email verification. Production lo disable cheyali!

### Option 2: Fix SMTP Configuration (Proper Solution)

**Update Supabase .env with Hostinger SMTP:**

```env
# Email Authentication
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

# Hostinger SMTP - Try Port 465 first
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true
GOTRUE_MAILER_AUTOCONFIRM=false

# Alternative variable names (if GOTRUE_ prefix doesn't work)
SMTP_ADMIN_EMAIL=contact@dcodesys.in
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@dcodesys.in
SMTP_PASS=Dcode@ports123
SMTP_SENDER_NAME=DCODE Learning Platform
SMTP_SECURE=true
```

**If Port 465 doesn't work, try Port 587:**
```env
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_SECURE=false  # STARTTLS
```

## Step-by-Step Fix

### Step 1: Check Current Configuration

```bash
# Supabase directory lo
cd /path/to/supabase

# Check if SMTP variables are loaded
docker-compose exec auth env | grep -i smtp

# Check auth logs
docker-compose logs auth --tail=50 | grep -i email
```

### Step 2: Update .env File

Supabase server lo `.env` file edit cheyandi:

```bash
nano .env  # or vi/vim
```

Add/update these lines:
```env
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SECURE=true
GOTRUE_MAILER_AUTOCONFIRM=false
```

### Step 3: Restart Auth Container

**CRITICAL:** Restart cheyakapothe new settings apply avvavu!

```bash
# Restart auth service
docker-compose restart auth

# Or full restart
docker-compose down
docker-compose up -d

# Wait for container to start
sleep 5

# Check status
docker-compose ps
```

### Step 4: Verify Configuration Loaded

```bash
# Check environment variables
docker-compose exec auth env | grep SMTP

# Should show:
# GOTRUE_SMTP_HOST=smtp.hostinger.com
# GOTRUE_SMTP_PORT=465
# GOTRUE_SMTP_USER=contact@dcodesys.in
# GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
```

### Step 5: Check Logs for Errors

```bash
# Real-time logs
docker-compose logs -f auth

# Recent errors
docker-compose logs auth --tail=100 | grep -i error

# SMTP specific
docker-compose logs auth --tail=100 | grep -i smtp
```

## Common Issues & Solutions

### Issue 1: Variables Not Loading

**Symptom:** `env | grep SMTP` shows nothing

**Solution:**
1. Check `.env` file location (should be in same directory as docker-compose.yml)
2. Check variable names (use `GOTRUE_` prefix)
3. Restart containers after .env update
4. Check docker-compose.yml has `env_file: .env` or variables in `environment:` section

### Issue 2: Authentication Failed

**Symptom:** Logs show "SMTP authentication failed"

**Solution:**
1. Verify email credentials:
   - Username: Full email `contact@dcodesys.in`
   - Password: `Dcode@ports123`
2. Test login to Hostinger webmail
3. Check if account is active

### Issue 3: Connection Timeout

**Symptom:** Logs show "Connection timeout" or "Connection refused"

**Solution:**
1. Test SMTP connection:
   ```bash
   openssl s_client -connect smtp.hostinger.com:465
   ```
2. Check firewall allows outbound port 465
3. Try port 587 instead:
   ```env
   GOTRUE_SMTP_PORT=587
   GOTRUE_SMTP_SECURE=false
   ```

### Issue 4: Wrong Port/SSL Configuration

**Symptom:** Connection works but authentication fails

**Solution:**
- Port 465 → `SMTP_SECURE=true` (SSL)
- Port 587 → `SMTP_SECURE=false` (STARTTLS)

## Docker Compose Configuration

If using docker-compose.yml, add directly:

```yaml
services:
  auth:
    image: supabase/gotrue:latest
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
      
      # Other required settings
      GOTRUE_SITE_URL: "http://localhost:3000"
      GOTRUE_URI_ALLOW_LIST: "*"
```

## Testing After Fix

### Test 1: Check Configuration

```bash
docker-compose exec auth env | grep SMTP
```

### Test 2: Monitor Logs

```bash
docker-compose logs -f auth
```

### Test 3: Try Signup

1. Browser lo: `http://localhost:3000/auth/signup`
2. New account create cheyandi
3. Watch logs for errors
4. Should work without 500 error

## Temporary Workaround (Development Only)

If SMTP still not working, temporarily auto-confirm:

```env
# In Supabase .env
GOTRUE_MAILER_AUTOCONFIRM=true
ENABLE_EMAIL_AUTOCONFIRM=true
```

**⚠️ WARNING:** This disables email verification. Only for development/testing!

## Verification Checklist

- [ ] `.env` file updated with SMTP settings
- [ ] Containers restarted after .env update
- [ ] SMTP variables visible in `env | grep SMTP`
- [ ] No SMTP errors in logs
- [ ] Signup works without 500 error
- [ ] Email received (if SMTP working) OR auto-confirmed (if temporary fix)

## Next Steps

1. **If temporary fix works:**
   - Users can signup immediately
   - Fix SMTP configuration for production
   - Re-enable email verification later

2. **If SMTP fix works:**
   - Users receive verification emails
   - Email verification required before login
   - Production ready!

---

**Quick Action:** Update `.env` → Restart containers → Test signup!

