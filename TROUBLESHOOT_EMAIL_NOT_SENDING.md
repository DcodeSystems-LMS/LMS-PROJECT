# 🔍 Troubleshoot: Email Not Sending from Supabase

## Problem
- Signup ayetappudu 500 error
- Hostinger Sent folder lo emails levu
- Email receive avvatledu
- SMTP configuration not working

## Step-by-Step Diagnosis

### Step 1: Verify SMTP Configuration in Supabase Server

SSH into your Supabase server and check:

```bash
# Supabase directory lo
cd /path/to/supabase

# Check .env file exists
cat .env | grep SMTP

# Check if SMTP variables are set
```

**Expected .env content:**
```env
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SECURE=true
GOTRUE_MAILER_AUTOCONFIRM=false
```

### Step 2: Check if Configuration is Loaded in Container

```bash
# Check environment variables in auth container
docker-compose exec auth env | grep -i smtp

# Should show all SMTP variables
# If nothing shows, configuration not loaded!
```

**If nothing shows:**
- `.env` file not in correct location
- Docker Compose not reading .env file
- Need to restart containers

### Step 3: Check Auth Container Logs

```bash
# Real-time logs monitor
docker-compose logs -f auth

# Check for SMTP errors
docker-compose logs auth | grep -i "smtp\|email\|mail" | tail -50

# Check recent errors
docker-compose logs auth --tail=100 | grep -i error
```

**Look for:**
- "SMTP connection failed"
- "Authentication failed"
- "Error sending email"
- "Connection timeout"

### Step 4: Test SMTP Connection from Server

```bash
# Test SMTP server connectivity
telnet smtp.hostinger.com 465

# Or with SSL
openssl s_client -connect smtp.hostinger.com:465 -quiet

# Test port 587
telnet smtp.hostinger.com 587
```

### Step 5: Verify Email Account Credentials

1. **Login to Hostinger Webmail:**
   - Go to: https://mail.hostinger.com
   - Login with: `contact@dcodesys.in`
   - Password: `Dcode@ports123`
   - Account working undha verify cheyandi

2. **Check Email Account Status:**
   - Account active undha?
   - Suspended or restricted undha?
   - Quota exceeded undha?

### Step 6: Check Docker Compose Configuration

Verify `docker-compose.yml` has email configuration:

```bash
# Check docker-compose.yml
cat docker-compose.yml | grep -A 20 "auth:"

# Look for environment variables or env_file
```

**If using env_file:**
```yaml
services:
  auth:
    env_file:
      - .env
```

**If using environment:**
```yaml
services:
  auth:
    environment:
      GOTRUE_SMTP_HOST: ${GOTRUE_SMTP_HOST}
      GOTRUE_SMTP_PORT: ${GOTRUE_SMTP_PORT}
      # ... etc
```

## Common Issues & Solutions

### Issue 1: .env File Not Being Read

**Symptom:** `env | grep SMTP` shows nothing

**Solution:**
1. Check `.env` file location (should be same directory as docker-compose.yml)
2. Check docker-compose.yml has `env_file: .env` or environment variables
3. Restart containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Issue 2: Wrong Variable Names

**Symptom:** Variables set but not recognized

**Solution:**
Use correct variable names with `GOTRUE_` prefix:
```env
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_SECURE=true
```

### Issue 3: Port/SSL Mismatch

**Symptom:** Connection errors in logs

**Solution:**
- Port 465 → `SMTP_SECURE=true` (SSL required)
- Port 587 → `SMTP_SECURE=false` (STARTTLS)

Try both:

**Option A: Port 465**
```env
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_SECURE=true
```

**Option B: Port 587**
```env
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_SECURE=false
```

### Issue 4: Authentication Failed

**Symptom:** Logs show "SMTP authentication failed"

**Solution:**
1. Verify credentials:
   - Username: Full email `contact@dcodesys.in`
   - Password: `Dcode@ports123`
2. Test login to webmail
3. Check if password has special characters that need escaping

### Issue 5: Connection Timeout

**Symptom:** Logs show "Connection timeout" or "Connection refused"

**Solution:**
1. Check firewall allows outbound port 465/587
2. Test SMTP server reachability:
   ```bash
   ping smtp.hostinger.com
   telnet smtp.hostinger.com 465
   ```
3. Check network connectivity from container

## Complete Fix Checklist

### ✅ Configuration

- [ ] `.env` file created/updated in Supabase server directory
- [ ] All SMTP variables set with `GOTRUE_` prefix
- [ ] Port 465 or 587 configured correctly
- [ ] SSL setting matches port (true for 465, false for 587)
- [ ] Full email address used as username
- [ ] Password correct and properly escaped

### ✅ Docker Setup

- [ ] docker-compose.yml has env_file or environment variables
- [ ] Containers restarted after .env update
- [ ] Auth container running (check with `docker-compose ps`)
- [ ] No errors in container startup logs

### ✅ Verification

- [ ] SMTP variables visible in container (`env | grep SMTP`)
- [ ] No SMTP errors in logs
- [ ] SMTP server reachable (telnet/openssl test)
- [ ] Email account login works (webmail test)

## Quick Diagnostic Commands

Run these commands on Supabase server:

```bash
# 1. Check .env file
cat .env | grep SMTP

# 2. Check container environment
docker-compose exec auth env | grep SMTP

# 3. Check container logs
docker-compose logs auth --tail=50

# 4. Check container status
docker-compose ps

# 5. Test SMTP connection
openssl s_client -connect smtp.hostinger.com:465 -quiet
```

## Manual Test from Container

Test SMTP from inside auth container:

```bash
# Enter auth container
docker-compose exec auth sh

# Test SMTP connection (if tools available)
# Or check environment
env | grep SMTP

# Exit container
exit
```

## Alternative: Test with External Tool

Test Hostinger SMTP with external email client:

1. Use email client (Thunderbird, Outlook)
2. Configure:
   - Server: smtp.hostinger.com
   - Port: 465 (SSL) or 587 (STARTTLS)
   - Username: contact@dcodesys.in
   - Password: Dcode@ports123
3. Try sending test email
4. If works → SMTP credentials correct
5. If fails → Check email account

## Next Steps

1. **Run diagnostic commands** above
2. **Check logs** for specific error messages
3. **Verify configuration** is loaded
4. **Test SMTP connection** from server
5. **Fix specific error** based on logs

## Get Detailed Error

Check logs for specific error:

```bash
# Get last 100 lines of auth logs
docker-compose logs auth --tail=100 > auth_logs.txt

# Search for errors
grep -i "error\|failed\|timeout\|refused" auth_logs.txt

# Search for email/SMTP specific
grep -i "smtp\|email\|mail\|send" auth_logs.txt
```

Share the error messages you see, and we can fix the specific issue!

---

**Action:** Run diagnostic commands and check what error appears in logs!

