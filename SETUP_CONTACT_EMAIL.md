# Setup Email from contact@dcodesys.in

## Overview
This guide explains how to configure Supabase to send all authentication emails (forgot password, signup verification) from `contact@dcodesys.in`.

## Step-by-Step Configuration

### 1. Configure SMTP in Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to: `https://supabase.dcodesys.in` (or your Supabase project URL)
   - Login with admin credentials

2. **Navigate to Authentication Settings**
   - Go to **Authentication** → **Settings**
   - Scroll down to **SMTP Settings** section

3. **Enable and Configure SMTP**

   **Enable SMTP:**
   - Toggle **"Enable SMTP"** to **ON**

   **SMTP Configuration for contact@dcodesys.in:**
   
   You need to know your email provider SMTP settings. Here are common configurations:

   #### Option A: If using Gmail/Google Workspace for dcodesys.in domain
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: contact@dcodesys.in
   SMTP Pass: [App Password - see below]
   SMTP Admin Email: contact@dcodesys.in
   SMTP Sender Name: DCODE Learning Platform
   ```

   **For Gmail/Google Workspace:**
   - You need to enable 2-Factor Authentication
   - Generate an App Password (not regular password)
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate new app password and use it in "SMTP Pass" field

   #### Option B: If using custom SMTP server for dcodesys.in
   ```
   SMTP Host: [Your SMTP server for dcodesys.in, e.g., mail.dcodesys.in or smtp.dcodesys.in]
   SMTP Port: 587 (or 465 for SSL)
   SMTP User: contact@dcodesys.in
   SMTP Pass: [Email password for contact@dcodesys.in]
   SMTP Admin Email: contact@dcodesys.in
   SMTP Sender Name: DCODE Learning Platform
   ```

   #### Option C: Using SendGrid with dcodesys.in domain
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Pass: [Your SendGrid API Key]
   SMTP Admin Email: contact@dcodesys.in
   SMTP Sender Name: DCODE Learning Platform
   ```
   
   **Note:** For SendGrid, you need to:
   - Verify `dcodesys.in` domain in SendGrid
   - Set up sender authentication
   - Create API key in SendGrid dashboard

   #### Option D: Using Mailgun with dcodesys.in domain
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   SMTP User: [Mailgun SMTP username]
   SMTP Pass: [Mailgun SMTP password]
   SMTP Admin Email: contact@dcodesys.in
   SMTP Sender Name: DCODE Learning Platform
   ```

### 2. Configure Email Templates (Optional but Recommended)

In Supabase Dashboard:
1. Go to **Authentication** → **Email Templates**
2. Configure templates for:
   - **Confirm signup** - Sent when user signs up
   - **Reset password** - Sent when user requests password reset
   - **Magic Link** - If using magic link authentication
   - **Change email address** - If allowing email changes

3. **Update Email Templates to include contact@dcodesys.in**

   You can customize the email templates. Make sure the "From" address shows:
   - **From Name:** DCODE Learning Platform
   - **From Email:** contact@dcodesys.in

   Example template customization:
   ```html
   <h2>Welcome to DCODE Learning Platform</h2>
   <p>Hello {{ .Name }},</p>
   <p>Thank you for signing up!</p>
   <p>Click the link below to verify your email:</p>
   <a href="{{ .ConfirmationURL }}">Verify Email</a>
   <p>Best regards,<br>DCODE Team</p>
   ```

### 3. Verify Configuration

1. **Save SMTP Settings** in Supabase Dashboard
2. **Test Email Sending:**
   - Go to **Authentication** → **Users**
   - Click on any user
   - Click "Send password reset email" button
   - Check if email is received from `contact@dcodesys.in`

### 4. Code Changes (Already Implemented)

The following functions already use Supabase's email system and will automatically use the configured SMTP:

#### Forgot Password:
```typescript
// src/lib/supabaseAuth.ts - resetPassword()
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`,
})
```

#### Signup Verification:
```typescript
// src/lib/supabaseAuth.ts - signUp()
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, role }
  }
})
```

#### Resend Verification:
```typescript
// src/lib/supabaseAuth.ts - resendVerificationEmail()
await supabase.auth.resend({
  type: 'signup',
  email: email,
})
```

All these will automatically use the SMTP configuration from Supabase Dashboard.

### 5. Test Email Functionality

After configuration, test both features:

#### Test Forgot Password:
1. Go to `/auth/signin`
2. Click "Forgot password?"
3. Enter an email address
4. Click "Send Reset Link"
5. Check inbox for email from `contact@dcodesys.in`
6. Verify the reset link works

#### Test Signup:
1. Go to `/auth/signup`
2. Fill in signup form
3. Submit
4. Check inbox for verification email from `contact@dcodesys.in`
5. Click verification link

### 6. Troubleshooting

#### Email Not Received:
1. **Check Spam Folder** - Emails might go to spam
2. **Check Supabase Logs** - Go to Logs → Auth in Dashboard
3. **Verify SMTP Credentials** - Double-check username/password
4. **Test SMTP Connection** - Use `telnet smtp.server.com 587` to test connection
5. **Check Rate Limits** - Supabase has rate limits on email sending

#### Email Coming from Wrong Address:
1. **Verify SMTP Admin Email** - Should be `contact@dcodesys.in`
2. **Check Email Templates** - Verify sender address in templates
3. **Domain Verification** - Ensure dcodesys.in domain is verified with email provider

#### Authentication Failed:
1. **Gmail App Password** - Make sure you're using App Password, not regular password
2. **2FA Enabled** - Gmail requires 2FA for App Passwords
3. **Correct Credentials** - Verify SMTP username and password

### 7. Production Recommendations

For production environment:

1. **Use Dedicated Email Service:**
   - SendGrid, Mailgun, or AWS SES recommended
   - Better deliverability than Gmail
   - Higher sending limits

2. **Domain Verification:**
   - Verify `dcodesys.in` domain with email provider
   - Set up SPF, DKIM, and DMARC records
   - Improves email deliverability

3. **Monitor Email Delivery:**
   - Set up email delivery monitoring
   - Track bounce rates
   - Monitor spam complaints

4. **Rate Limiting:**
   - Configure appropriate rate limits
   - Prevent abuse
   - Stay within provider limits

### 8. Quick Checklist

- [ ] SMTP enabled in Supabase Dashboard
- [ ] SMTP Host configured correctly
- [ ] SMTP User set to `contact@dcodesys.in` (or email with access)
- [ ] SMTP Admin Email set to `contact@dcodesys.in`
- [ ] SMTP Sender Name set to "DCODE Learning Platform"
- [ ] Email templates updated (optional)
- [ ] Test email sent successfully
- [ ] Forgot password email received from `contact@dcodesys.in`
- [ ] Signup verification email received from `contact@dcodesys.in`

## Important Notes

1. **Email Provider Requirements:**
   - The email `contact@dcodesys.in` must exist and be accessible
   - You need SMTP credentials for this email account
   - For Gmail/Google Workspace, you need App Password

2. **Supabase Configuration:**
   - All email sending is controlled by Supabase SMTP settings
   - No code changes needed once SMTP is configured
   - Emails will automatically use the configured sender address

3. **Security:**
   - Never commit SMTP credentials to git
   - Use environment variables if possible
   - Regularly rotate passwords/API keys

## Support

If you need help:
1. Check Supabase Dashboard → Logs → Auth for errors
2. Verify email provider documentation
3. Test SMTP connection independently
4. Contact email provider support if needed

