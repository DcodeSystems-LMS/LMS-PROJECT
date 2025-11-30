# Hostinger SMTP Configuration for Self-Hosted Supabase

## ✅ Correct Hostinger SMTP Settings

Based on your Hostinger email configuration, here are the correct SMTP settings:

### SMTP Configuration for contact@dcodesys.in

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@dcodesys.in
SMTP_PASS=Dcode@ports123
SMTP_SECURE=true  # SSL/TLS required for port 465
SMTP_ADMIN_EMAIL=contact@dcodesys.in
SMTP_SENDER_NAME=DCODE Learning Platform
```

**Important Notes:**
- Port: **465** (NOT 587) - Hostinger uses SSL on port 465
- SSL/TLS: **Required** (must be enabled)
- SMTP User: Full email address `contact@dcodesys.in`
- SMTP Pass: Your email password `Dcode@ports123`

## Self-Hosted Supabase .env Configuration

Update your Supabase `.env` file with these settings:

```env
# Email Authentication
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false

# Hostinger SMTP Configuration
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_PASS=Dcode@ports123
GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
GOTRUE_SMTP_SECURE=true

# Alternative variable names (try these if above don't work)
SMTP_ADMIN_EMAIL=contact@dcodesys.in
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@dcodesys.in
SMTP_PASS=Dcode@ports123
SMTP_SENDER_NAME=DCODE Learning Platform
SMTP_SECURE=true
```

## Docker Compose Configuration

If using Docker Compose, update your `docker-compose.yml`:

```yaml
services:
  auth:
    image: supabase/gotrue:latest
    environment:
      # Email Configuration
      GOTRUE_MAILER_AUTOCONFIRM: "false"
      GOTRUE_SMTP_ADMIN_EMAIL: "contact@dcodesys.in"
      GOTRUE_SMTP_HOST: "smtp.hostinger.com"
      GOTRUE_SMTP_PORT: "465"
      GOTRUE_SMTP_USER: "contact@dcodesys.in"
      GOTRUE_SMTP_PASS: "Dcode@ports123"
      GOTRUE_SMTP_SENDER_NAME: "DCODE Learning Platform"
      GOTRUE_SMTP_SECURE: "true"
```

## Port 465 vs 587

**Hostinger uses:**
- Port **465** with SSL/TLS (secure)
- Port **587** with STARTTLS (may also work)

**Try both:**

### Option 1: Port 465 (SSL)
```env
SMTP_PORT=465
SMTP_SECURE=true
```

### Option 2: Port 587 (STARTTLS)
```env
SMTP_PORT=587
SMTP_SECURE=false  # STARTTLS handles encryption
```

## Troubleshooting "Error sending confirmation email"

### Step 1: Verify SMTP Configuration

Check if SMTP settings are loaded:

```bash
docker-compose exec auth env | grep SMTP
```

Should show:
```
GOTRUE_SMTP_HOST=smtp.hostinger.com
GOTRUE_SMTP_PORT=465
GOTRUE_SMTP_USER=contact@dcodesys.in
GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
```

### Step 2: Check Auth Container Logs

```bash
# Check for SMTP errors
docker-compose logs auth | grep -i smtp

# Check for email errors
docker-compose logs auth | grep -i email

# Check recent errors
docker-compose logs auth --tail=100 | grep -i error
```

### Step 3: Test SMTP Connection

Test if SMTP server is reachable:

```bash
# Test connection to Hostinger SMTP
telnet smtp.hostinger.com 465

# Or use openssl for SSL connection
openssl s_client -connect smtp.hostinger.com:465
```

### Step 4: Verify Email Account

1. **Check if email account exists:**
   - Login to Hostinger email at: https://hpanel.hostinger.com
   - Verify `contact@dcodesys.in` email account exists

2. **Check email password:**
   - Verify password `Dcode@ports123` is correct
   - Try logging into webmail to confirm

3. **Check email account status:**
   - Make sure email account is active
   - Check if account is suspended or restricted

### Step 5: Common Issues & Solutions

#### Issue: Connection Timeout
**Solution:**
- Check firewall allows outbound port 465
- Verify SMTP server hostname is correct
- Test network connectivity

#### Issue: Authentication Failed
**Solution:**
- Double-check username: `contact@dcodesys.in` (full email)
- Verify password: `Dcode@ports123`
- Try logging into webmail to confirm credentials

#### Issue: SSL/TLS Error
**Solution:**
- Ensure `SMTP_SECURE=true` for port 465
- Or try port 587 with STARTTLS

#### Issue: Port 465 Not Working
**Solution:**
- Try port 587 instead:
  ```env
  SMTP_PORT=587
  SMTP_SECURE=false
  ```

## Quick Fix Steps

1. **Update .env file with Hostinger settings:**
   ```env
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=contact@dcodesys.in
   SMTP_PASS=Dcode@ports123
   SMTP_SECURE=true
   ```

2. **Restart auth container:**
   ```bash
   docker-compose restart auth
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f auth
   ```

4. **Test signup again:**
   - Try creating a new account
   - Check logs for any errors

## Alternative: Try Port 587

If port 465 doesn't work, try port 587:

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@dcodesys.in
SMTP_PASS=Dcode@ports123
SMTP_SECURE=false  # STARTTLS instead of SSL
```

## Verification Checklist

- [ ] SMTP_HOST = smtp.hostinger.com
- [ ] SMTP_PORT = 465 (or 587)
- [ ] SMTP_USER = contact@dcodesys.in (full email)
- [ ] SMTP_PASS = Dcode@ports123
- [ ] SMTP_SECURE = true (for 465) or false (for 587)
- [ ] SMTP_ADMIN_EMAIL = contact@dcodesys.in
- [ ] Container restarted after .env update
- [ ] No errors in auth container logs
- [ ] SMTP connection test successful

## Testing

After updating configuration:

1. **Restart containers:**
   ```bash
   docker-compose restart auth
   ```

2. **Monitor logs:**
   ```bash
   docker-compose logs -f auth
   ```

3. **Test signup:**
   - Go to signup page
   - Create new account
   - Watch logs for SMTP errors

4. **Check email:**
   - Verification email should arrive
   - From: contact@dcodesys.in

---

**Main Issue:** Make sure you're using port **465** with SSL, or port **587** with STARTTLS for Hostinger SMTP!

