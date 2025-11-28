# Supabase SMTP Email Configuration Guide

## Overview
This guide explains how to configure Supabase to send emails using your SMTP server instead of EmailJS.

## Prerequisites
- Supabase project with admin access
- SMTP server credentials (Gmail, SendGrid, Mailgun, etc.)

## Configuration Steps

### 1. Configure SMTP in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: `https://supabase.com/dashboard/project/[your-project-id]`

2. **Access Authentication Settings**
   - Go to `Authentication` → `Settings`
   - Scroll down to `SMTP Settings`

3. **Enable SMTP**
   - Toggle `Enable SMTP` to ON
   - Fill in your SMTP configuration:

### 2. SMTP Configuration Examples

#### Gmail SMTP Configuration:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password (not regular password)
SMTP Admin Email: your-email@gmail.com
SMTP Sender Name: Your App Name
```

#### SendGrid SMTP Configuration:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
SMTP Admin Email: your-verified-sender@yourdomain.com
SMTP Sender Name: Your App Name
```

#### Mailgun SMTP Configuration:
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-smtp-username
SMTP Pass: your-mailgun-smtp-password
SMTP Admin Email: your-verified-sender@yourdomain.com
SMTP Sender Name: Your App Name
```

### 3. Test Configuration

After configuring SMTP, test it by:

1. **Go to Authentication → Users**
2. **Try to send a password reset email**
3. **Check if the email is received**

### 4. Code Implementation

The email functionality is now implemented using:

```typescript
// Send email using Supabase's built-in email service
const { data, error } = await window.supabase.auth.admin.sendEmail({
  to: selectedMentor.email,
  subject: subject,
  html: message.replace(/\n/g, '<br>'),
  text: message
});
```

### 5. Required Permissions

Make sure your Supabase project has:
- **Service Role Key** configured
- **Admin API** enabled
- **SMTP** properly configured

### 6. Troubleshooting

#### Common Issues:

1. **"Email sending failed"**
   - Check SMTP credentials
   - Verify SMTP server allows connections
   - Check firewall settings

2. **"Authentication failed"**
   - Verify SMTP username/password
   - For Gmail, use App Password, not regular password
   - Check if 2FA is enabled (requires App Password)

3. **"Connection timeout"**
   - Check SMTP host and port
   - Verify network connectivity
   - Check if SMTP server is accessible

#### Debug Steps:

1. **Check Supabase Logs**
   - Go to `Logs` → `Auth`
   - Look for email-related errors

2. **Test SMTP Configuration**
   - Use a tool like `telnet` to test SMTP connection
   - Example: `telnet smtp.gmail.com 587`

3. **Verify Email Templates**
   - Check if email templates are properly configured
   - Ensure HTML/text content is valid

### 7. Security Considerations

- **Never expose SMTP credentials** in client-side code
- **Use environment variables** for sensitive data
- **Enable rate limiting** to prevent abuse
- **Monitor email usage** for unusual activity

### 8. Alternative: Edge Functions

If direct SMTP doesn't work, you can use Supabase Edge Functions:

1. **Create Edge Function** (already provided in `supabase/functions/send-email/index.ts`)
2. **Deploy the function**
3. **Update the code** to use Edge Functions instead

## Testing

After configuration, test the email functionality:

1. **Open mentor management page**
2. **Click email icon** for any mentor
3. **Compose and send email**
4. **Check console logs** for success/error messages
5. **Verify email is received**

## Support

If you encounter issues:
1. Check Supabase documentation
2. Review SMTP provider documentation
3. Check Supabase community forums
4. Contact Supabase support if needed






