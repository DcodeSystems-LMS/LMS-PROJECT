# Email Service Integration Guide

## Current Issue
The `window.supabase.auth.admin.sendEmail` function is not available on the client side. This is a server-side only function that requires the service role key.

## Solutions

### Option 1: Deploy Supabase Edge Function (Recommended)

1. **Deploy the Edge Function:**
   ```bash
   # In your project root
   supabase functions deploy send-email
   ```

2. **Configure SMTP in Supabase Dashboard:**
   - Go to Authentication → Settings
   - Enable SMTP and configure your credentials

3. **Update the Edge Function** to use Supabase's email service:
   ```typescript
   // In supabase/functions/send-email/index.ts
   const { data, error } = await supabaseClient.auth.admin.sendEmail({
     to: to,
     subject: subject,
     html: html,
     text: text
   });
   ```

### Option 2: Use External Email Service

#### A. SendGrid Integration
```typescript
// In Edge Function
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY'));

const msg = {
  to: to,
  from: 'admin@yourdomain.com',
  subject: subject,
  html: html,
  text: text
};

await sgMail.send(msg);
```

#### B. Mailgun Integration
```typescript
// In Edge Function
const formData = new FormData();
formData.append('from', 'admin@yourdomain.com');
formData.append('to', to);
formData.append('subject', subject);
formData.append('html', html);

const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
  },
  body: formData
});
```

#### C. Gmail SMTP Integration
```typescript
// In Edge Function
import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

await transporter.sendMail({
  from: 'your-email@gmail.com',
  to: to,
  subject: subject,
  html: html,
  text: text
});
```

### Option 3: Simple Webhook Approach

Create a simple webhook endpoint that handles email sending:

```typescript
// In Edge Function
const webhookUrl = Deno.env.get('EMAIL_WEBHOOK_URL');
const webhookKey = Deno.env.get('EMAIL_WEBHOOK_KEY');

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${webhookKey}`
  },
  body: JSON.stringify({
    to: to,
    subject: subject,
    html: html,
    text: text
  })
});
```

## Quick Fix for Testing

For immediate testing, the current implementation includes a fallback simulation:

1. **Try Edge Function** - If deployed and configured
2. **Fallback to simulation** - Shows success message and logs email details
3. **User feedback** - Confirms "email sent" for testing purposes

## Production Implementation

For production, choose one of the following:

1. **Deploy Edge Function with SMTP** (easiest)
2. **Integrate external email service** (most reliable)
3. **Use webhook approach** (most flexible)

## Testing

The current implementation will:
- ✅ Try Edge Function if available
- ✅ Fallback to simulation if Edge Function fails
- ✅ Show success message to user
- ✅ Log email details to console
- ✅ Work immediately without additional setup

This allows you to test the UI functionality while setting up the actual email service.






