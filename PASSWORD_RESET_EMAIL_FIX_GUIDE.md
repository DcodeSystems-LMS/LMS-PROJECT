# Password Reset Email Fix Guide

## 🚨 Issue Description
When clicking "Forgot Password", the system shows "Password reset link sent" but no email is received.

## 🔍 Root Cause Analysis
The issue is likely one of the following:
1. **SMTP Configuration Missing**: Supabase is not configured to send emails
2. **Email Service Not Set Up**: No email provider configured in Supabase
3. **Environment Configuration**: Missing or incorrect environment variables
4. **Rate Limiting**: Email service rate limits preventing email sending

## 🛠️ Step-by-Step Fix

### Step 1: Check Current Configuration
Run the debug script in your browser console:
```javascript
// Copy and paste the contents of debug-password-reset-email.js
```

### Step 2: Configure SMTP in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: `https://supabase.dcodesys.in` (or your Supabase URL)
   - Go to `Authentication` → `Settings`

2. **Enable SMTP**
   - Scroll down to `SMTP Settings`
   - Toggle `Enable SMTP` to ON

3. **Configure Email Provider**

#### Option A: Gmail SMTP (Recommended for testing)
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password (not regular password)
SMTP Admin Email: your-email@gmail.com
SMTP Sender Name: DCODE Learning Platform
```

**Important**: For Gmail, you need to:
- Enable 2-Factor Authentication
- Generate an App Password (not your regular password)
- Use the App Password in SMTP Pass field

#### Option B: SendGrid SMTP
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
SMTP Admin Email: your-verified-sender@yourdomain.com
SMTP Sender Name: DCODE Learning Platform
```

#### Option C: Mailgun SMTP
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-smtp-username
SMTP Pass: your-mailgun-smtp-password
SMTP Admin Email: your-verified-sender@yourdomain.com
SMTP Sender Name: DCODE Learning Platform
```

### Step 3: Test Email Configuration

1. **Save SMTP Settings** in Supabase Dashboard
2. **Go to Authentication → Users**
3. **Find a test user** or create one
4. **Click "Send password reset email"** for that user
5. **Check if email is received**

### Step 4: Verify Environment Variables

Make sure your `.env.local` file contains:
```env
VITE_SUPABASE_URL=https://supabase.dcodesys.in
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Test Password Reset in Application

1. **Start your development server**: `npm run dev`
2. **Go to sign-in page**
3. **Click "Forgot password?"**
4. **Enter a valid email address**
5. **Check console for errors**
6. **Check email inbox and spam folder**

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "Rate limit exceeded" Error
**Solution**: Wait 10 minutes and try again, or use Supabase Dashboard to send emails

#### 2. "User not found" Error
**Solution**: 
- Check if the email exists in your database
- User might need to sign up first
- Check Supabase Dashboard → Authentication → Users

#### 3. "Email sending failed" Error
**Solution**:
- Check SMTP credentials
- Verify email provider settings
- Check firewall/network settings

#### 4. "Authentication failed" Error
**Solution**:
- For Gmail: Use App Password, not regular password
- Check if 2FA is enabled
- Verify SMTP username/password

### Debug Commands

Run these in your browser console to debug:

```javascript
// Check Supabase connection
console.log('Supabase URL:', window.supabase.supabaseUrl);

// Test password reset
const { data, error } = await window.supabase.auth.resetPasswordForEmail('test@example.com', {
  redirectTo: window.location.origin + '/auth/reset-password'
});
console.log('Result:', { data, error });
```

## 📧 Email Provider Setup Guides

### Gmail Setup (Recommended)
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use App Password in Supabase SMTP settings

### SendGrid Setup
1. Create SendGrid account
2. Verify sender identity
3. Generate API key
4. Use API key in Supabase SMTP settings

### Mailgun Setup
1. Create Mailgun account
2. Verify domain
3. Get SMTP credentials
4. Use credentials in Supabase SMTP settings

## ✅ Verification Steps

After configuration, verify:

1. **SMTP Settings Saved**: Check Supabase Dashboard
2. **Test Email Sent**: Use Supabase Dashboard to send test email
3. **Application Working**: Test forgot password in your app
4. **Email Received**: Check inbox and spam folder
5. **Reset Link Works**: Click the reset link and verify it works

## 🚀 Production Considerations

For production deployment:

1. **Use Production Email Service**: SendGrid, Mailgun, or AWS SES
2. **Configure Domain**: Set up proper domain for email sending
3. **Monitor Email Delivery**: Set up email delivery monitoring
4. **Rate Limiting**: Configure appropriate rate limits
5. **Security**: Use secure SMTP credentials

## 📞 Support

If you still have issues:

1. **Check Supabase Logs**: Go to Logs → Auth in Supabase Dashboard
2. **Test SMTP Connection**: Use tools like `telnet` to test SMTP
3. **Contact Email Provider**: Check with your email service provider
4. **Supabase Community**: Check Supabase community forums

## 🎯 Quick Fix Summary

1. **Configure SMTP** in Supabase Dashboard
2. **Use Gmail with App Password** for testing
3. **Test email sending** from Supabase Dashboard
4. **Verify application** password reset works
5. **Check email delivery** in inbox/spam folder

The most common issue is missing SMTP configuration. Once you set up SMTP with a proper email provider, password reset emails should work correctly.
