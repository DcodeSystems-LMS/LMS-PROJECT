# Quick Diagnostic Commands for Email Not Sending

## Run These Commands on Your Supabase Server

### 1. Check .env File Has SMTP Configuration

```bash
cd /path/to/supabase
cat .env | grep SMTP
```

**Expected Output:**
```
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
```

**If empty:** `.env` file lo SMTP settings add cheyali!

### 2. Check if SMTP Variables Are Loaded in Container

```bash
docker-compose exec auth env | grep SMTP
```

**Expected Output:**
```
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
```

**If empty:** Containers restart cheyali or `.env` file not being read!

### 3. Check Auth Container Logs for Errors

```bash
# Recent errors
docker-compose logs auth --tail=100 | grep -i error

# SMTP specific errors
docker-compose logs auth --tail=100 | grep -i "smtp\|email\|mail"

# All recent logs
docker-compose logs auth --tail=50
```

**Look for:**
- "SMTP connection failed"
- "Authentication failed"
- "Error sending email"
- "Connection timeout"

### 4. Check Container Status

```bash
docker-compose ps
```

**Should show:** Auth container running

### 5. Restart Auth Container

```bash
docker-compose restart auth
sleep 5
docker-compose logs auth --tail=20
```

## Most Common Issues

### Issue 1: .env File Not Created/Updated

**Fix:**
```bash
cd /path/to/supabase
nano .env
```

Add:
```env
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true
GOTRUE_MAILER_AUTOCONFIRM=false
```

### Issue 2: Containers Not Restarted

**Fix:**
```bash
docker-compose restart auth
# or
docker-compose down && docker-compose up -d
```

### Issue 3: Docker Compose Not Reading .env

**Fix:**
Check `docker-compose.yml` has:
```yaml
services:
  auth:
    env_file:
      - .env
```

## Quick Test

After fixing, test:

```bash
# 1. Verify config loaded
docker-compose exec auth env | grep SMTP

# 2. Check logs
docker-compose logs -f auth

# 3. Try signup in browser
# Watch logs for any errors
```

---

**Run these commands and share the output!**

