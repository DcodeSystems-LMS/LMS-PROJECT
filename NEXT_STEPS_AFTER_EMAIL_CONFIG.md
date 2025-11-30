# Next Steps After Email Configuration

## ✅ Email Configuration Complete!

You've updated the `.env` file with email settings. Now follow these steps to activate and test the configuration.

## Step 1: Restart Supabase Containers

Configuration apply avvadaniki containers restart cheyali:

```bash
# Supabase directory lo navigate cheyandi
cd /path/to/supabase  # or wherever your docker-compose.yml is

# Containers stop cheyandi
docker-compose down

# Containers start cheyandi (new configuration tho)
docker-compose up -d

# Status check cheyandi
docker-compose ps
```

**Alternative (if using supabase CLI):**
```bash
supabase stop
supabase start
```

## Step 2: Verify Email Configuration

### Check Environment Variables Loaded:

```bash
# Auth container lo environment variables check cheyandi
docker-compose exec auth env | grep SMTP

# Expected output:
# GOTRUE_SMTP_ADMIN_EMAIL=contact@dcodesys.in
# GOTRUE_SMTP_HOST=smtp.gmail.com
# GOTRUE_SMTP_PORT=587
# GOTRUE_SMTP_USER=contact@dcodesys.in
# GOTRUE_SMTP_SENDER_NAME=DCODE Learning Platform
```

### Check Container Logs:

```bash
# Auth service logs check cheyandi
docker-compose logs auth | grep -i smtp

# Errors unte kanipisthayi
docker-compose logs auth | grep -i error
```

## Step 3: Test Email Configuration

### Option A: Supabase Dashboard lo Test

1. **Supabase Dashboard open cheyandi:**
   ```
   https://supabase.dcodesys.in → Authentication → Users
   ```

2. **Test Email Send cheyandi:**
   - Any existing user select cheyandi
   - "Send password reset email" button click cheyandi
   - Email `contact@dcodesys.in` nunchi vastundha check cheyandi

### Option B: Application lo Test

1. **Forgot Password Test:**
   - Browser lo open cheyandi: `http://localhost:3000/auth/signin`
   - "Forgot password?" click cheyandi
   - Email address enter cheyandi
   - "Send Reset Link" click cheyandi
   - Email inbox check cheyandi (spam folder kuda)

2. **Signup Test:**
   - Browser lo open cheyandi: `http://localhost:3000/auth/signup`
   - New user signup cheyandi
   - Verification email `contact@dcodesys.in` nunchi vastundha check cheyandi

### Option C: Direct API Test

Browser console lo run cheyandi:

```javascript
// Test password reset email
const testEmail = async () => {
  const { data, error } = await supabase.auth.resetPasswordForEmail('your-test-email@example.com', {
    redirectTo: window.location.origin + '/auth/reset-password'
  });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Password reset email sent!');
    console.log('📧 Check inbox for email from contact@dcodesys.in');
  }
};

testEmail();
```

## Step 4: Verify Email Delivery

### Check Email Inbox:

1. **Primary Inbox** check cheyandi
2. **Spam/Junk Folder** check cheyandi
3. **Email Details verify cheyandi:**
   - From: `contact@dcodesys.in` or `DCODE Learning Platform <contact@dcodesys.in>`
   - Subject: Password reset or Email verification
   - Link click chesi verify cheyandi

### Common Email Providers:

- **Gmail:** Inbox or Spam folder, sometimes "Promotions" tab
- **Outlook:** Inbox or Junk folder
- **Yahoo:** Inbox or Spam folder

## Step 5: Monitor Logs

### Real-time Log Monitoring:

```bash
# Auth service logs follow cheyandi
docker-compose logs -f auth

# Email sending attempts kanipisthayi
# Success: "Email sent successfully"
# Error: "SMTP error" or "Authentication failed"
```

### Check for Errors:

```bash
# Recent errors check cheyandi
docker-compose logs auth --tail=100 | grep -i error

# SMTP specific errors
docker-compose logs auth --tail=100 | grep -i smtp
```

## Step 6: Troubleshooting (If Needed)

### Issue: Email Not Received

1. **Check SMTP Credentials:**
   ```bash
   docker-compose exec auth env | grep SMTP
   ```
   - Verify all SMTP variables are set correctly
   - Check password (Gmail ki App Password use cheyali)

2. **Test SMTP Connection:**
   ```bash
   # Server lo telnet install cheyandi
   telnet smtp.gmail.com 587
   
   # Connection successful aithe SMTP server reachable
   ```

3. **Check Firewall:**
   - Port 587 (or 465) open undha verify cheyandi
   - Outbound connections allow cheyandi

4. **Verify Email Account:**
   - `contact@dcodesys.in` account active undha check cheyandi
   - Gmail use chesthunna, App Password correct undha verify cheyandi

### Issue: Authentication Failed

**Gmail Use Chesthunna:**
1. Google Account → Security → 2-Step Verification enable cheyandi
2. App Passwords generate cheyandi
3. Generated App Password use cheyandi (regular password avvadu)

**Custom SMTP:**
1. Username/password correct undha verify cheyandi
2. SMTP server settings verify cheyandi

### Issue: Wrong Sender Email

1. **Check SMTP_ADMIN_EMAIL:**
   ```bash
   docker-compose exec auth env | grep SMTP_ADMIN_EMAIL
   ```
   - Should be: `contact@dcodesys.in`

2. **Restart Containers:**
   ```bash
   docker-compose restart auth
   ```

## Step 7: Production Checklist

Before going to production:

- [ ] Email configuration tested successfully
- [ ] Password reset emails working
- [ ] Signup verification emails working
- [ ] Emails coming from `contact@dcodesys.in`
- [ ] Email delivery rate good (not going to spam)
- [ ] SMTP credentials secure (not exposed)
- [ ] Logs monitored for errors
- [ ] Backup SMTP configuration ready (if needed)

## Step 8: Application Integration

Your application code already configured:

✅ **Forgot Password:** `src/lib/supabaseAuth.ts` - `resetPassword()`
✅ **Signup:** `src/lib/supabaseAuth.ts` - `signUp()`
✅ **Resend Verification:** `src/lib/supabaseAuth.ts` - `resendVerificationEmail()`

**No code changes needed!** Once Supabase SMTP configured, all emails automatically `contact@dcodesys.in` nunchi vastayi.

## Quick Test Commands

```bash
# 1. Restart containers
docker-compose restart auth

# 2. Check configuration
docker-compose exec auth env | grep SMTP

# 3. Check logs
docker-compose logs auth --tail=50

# 4. Test email (browser console)
# Use the test script above
```

## Success Indicators

✅ **Configuration Successful if:**
- Containers restart ayyayi without errors
- SMTP environment variables loaded correctly
- No SMTP errors in logs
- Test emails received from `contact@dcodesys.in`
- Password reset links working
- Signup verification emails working

## Support

If issues persist:
1. Check Supabase documentation
2. Review SMTP provider documentation
3. Check container logs for detailed errors
4. Verify network connectivity to SMTP server

---

**Next:** Test forgot password and signup functionality in your application!

