# Email Verification Setup for Signup

## ✅ Configuration Complete!

Email verification has been enabled for user signup. When users sign up, they will receive a verification email from `contact@dcodesys.in`.

## Configuration Details

### 1. Supabase .env Configuration

Your self-hosted Supabase `.env` file should have:

```env
# Email Authentication
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false  # Email verification required

# SMTP Configuration
SMTP_ADMIN_EMAIL=contact@dcodesys.in
SMTP_HOST=smtp.gmail.com  # or your SMTP server
SMTP_PORT=587
SMTP_USER=contact@dcodesys.in
SMTP_PASS=Dcode@ports123
SMTP_SENDER_NAME=DCODE Learning Platform

# Security
ENABLE_ANONYMOUS_USERS=false
```

**Important:** 
- `ENABLE_EMAIL_AUTOCONFIRM=false` ensures email verification is required
- `SMTP_ADMIN_EMAIL=contact@dcodesys.in` sets the sender email

### 2. Code Changes Made

#### Updated `src/lib/supabaseAuth.ts`:

1. **Removed development bypass** - Email verification is now enforced
2. **Added redirect URL** - Verification emails redirect to `/auth/callback`
3. **Proper verification handling** - Returns `needsVerification: true` when email not confirmed

#### Signup Flow:

```typescript
// When user signs up:
1. User submits signup form
2. Supabase creates account (unverified)
3. Verification email sent from contact@dcodesys.in
4. User sees message: "Check your email to verify"
5. User clicks link in email
6. User redirected to /auth/callback
7. Email verified, user can login
```

### 3. Email Verification Process

#### Step-by-Step:

1. **User Signs Up:**
   - User enters email, password, name
   - Clicks "Sign Up"
   - Account created but email not verified

2. **Verification Email Sent:**
   - Email sent from: `contact@dcodesys.in`
   - Subject: "Confirm your email"
   - Contains verification link

3. **User Clicks Link:**
   - Redirected to: `https://your-domain.com/auth/callback?token=...`
   - Email automatically verified
   - User can now login

4. **User Logs In:**
   - After verification, user can sign in normally

### 4. Email Template

Supabase automatically sends verification emails with:
- **From:** `DCODE Learning Platform <contact@dcodesys.in>`
- **Subject:** "Confirm your email"
- **Content:** Verification link and instructions

### 5. Resend Verification Email

Users can resend verification email if needed:
- Signup page shows "Resend verification email" button
- Uses `resendVerificationEmail()` function
- Email sent from `contact@dcodesys.in`

## Testing Email Verification

### Test Signup Flow:

1. **Go to Signup Page:**
   ```
   http://localhost:3000/auth/signup
   ```

2. **Fill Signup Form:**
   - Email: your-test-email@example.com
   - Password: (at least 8 characters)
   - Name: Test User

3. **Submit Form:**
   - Should see: "Account created successfully! Please check your email..."
   - Should NOT redirect to dashboard
   - Should show resend button

4. **Check Email:**
   - Open inbox for the email you used
   - Check spam folder too
   - Email should be from: `contact@dcodesys.in`

5. **Click Verification Link:**
   - Click the link in email
   - Should redirect and verify email
   - Can now login

### Test Resend:

1. On signup page, click "Resend verification email"
2. New email should be sent from `contact@dcodesys.in`

## Supabase Dashboard Configuration

### Verify Settings:

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.dcodesys.in → Authentication → Settings
   ```

2. **Check Email Settings:**
   - ✅ Email signup: Enabled
   - ✅ Auto-confirm: Disabled (verification required)
   - ✅ SMTP: Enabled and configured

3. **Check Email Templates:**
   - Go to: Authentication → Email Templates
   - Verify "Confirm signup" template
   - Check sender is `contact@dcodesys.in`

## Troubleshooting

### Issue: Verification Email Not Sent

**Check:**
1. SMTP configuration in `.env` file
2. Containers restarted after `.env` update?
3. Check logs: `docker-compose logs auth | grep -i smtp`
4. Test SMTP connection: `telnet smtp.gmail.com 587`

**Fix:**
```bash
# Restart auth container
docker-compose restart auth

# Check logs
docker-compose logs -f auth
```

### Issue: Email Goes to Spam

**Solution:**
1. Configure SPF/DKIM records for dcodesys.in domain
2. Use production email service (SendGrid, Mailgun)
3. Verify domain in email provider

### Issue: Verification Link Not Working

**Check:**
1. Site URL configured in Supabase Dashboard
2. Redirect URLs allowed: `https://your-domain.com/auth/callback`
3. Link expiration (default 24 hours)

**Fix in Dashboard:**
- Authentication → Settings → Site URL
- Add redirect URL: `https://your-domain.com/auth/callback`

### Issue: User Auto-Logged In (Not Verified)

**Check:**
- `ENABLE_EMAIL_AUTOCONFIRM=false` in `.env`
- Restart containers if changed

## Email Redirect URL

Verification emails redirect to:
```
https://your-domain.com/auth/callback
```

Make sure this route exists in your application. If using Supabase default, it should work automatically.

## Code Reference

### Signup Function:

```typescript
// src/lib/supabaseAuth.ts
async signUp(email: string, password: string, name: string, role: 'student' | 'mentor' | 'admin' = 'student') {
  // Creates user account
  // Sends verification email from contact@dcodesys.in
  // Returns { user: null, needsVerification: true }
}
```

### Signup Page:

```typescript
// src/pages/auth/signup/page.tsx
// Shows verification message
// Displays resend button
// Waits for email verification
```

## Summary

✅ **Email verification enabled**
✅ **Emails sent from:** `contact@dcodesys.in`
✅ **Verification required before login**
✅ **Resend verification available**
✅ **Redirect URL configured**

## Next Steps

1. **Restart Supabase containers** (if not done already)
2. **Test signup** with a real email
3. **Check email inbox** for verification email
4. **Click verification link** to confirm it works
5. **Test login** after verification

---

**All set!** Users will now receive verification emails from `contact@dcodesys.in` when they sign up.

