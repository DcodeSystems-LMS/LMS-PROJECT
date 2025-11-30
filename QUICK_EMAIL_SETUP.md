# Quick Setup: Email from contact@dcodesys.in

## 🔧 Supabase Dashboard Configuration

### Steps to Configure:

1. **Go to Supabase Dashboard**
   ```
   https://supabase.dcodesys.in → Authentication → Settings
   ```

2. **Enable SMTP**
   - Scroll to "SMTP Settings"
   - Toggle "Enable SMTP" to **ON**

3. **Configure SMTP Settings**
   ```
   SMTP Host: [Your email provider SMTP host]
   SMTP Port: 587
   SMTP User: contact@dcodesys.in (or your email with SMTP access)
   SMTP Pass: [Your email password or App Password]
   SMTP Admin Email: contact@dcodesys.in ⬅️ IMPORTANT!
   SMTP Sender Name: DCODE Learning Platform
   ```

### 📧 Email Provider Options:

#### Gmail/Google Workspace (dcodesys.in):
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: contact@dcodesys.in
SMTP Pass: [Generate App Password from Google Account]
```

**To get App Password:**
- Go to Google Account → Security → 2-Step Verification
- Click "App Passwords"
- Generate password for "Mail"

#### Custom SMTP Server:
```
SMTP Host: mail.dcodesys.in (or your provider's SMTP host)
SMTP Port: 587
SMTP User: contact@dcodesys.in
SMTP Pass: [Email account password]
```

#### SendGrid:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
```
*(Domain verification required)*

### ✅ After Configuration:

1. **Save Settings** in Supabase Dashboard
2. **Test:** Go to Authentication → Users → Send test email
3. **Verify:** Check inbox for email from `contact@dcodesys.in`

### 📝 What Gets Configured Automatically:

- ✅ Forgot Password emails → contact@dcodesys.in
- ✅ Signup Verification emails → contact@dcodesys.in  
- ✅ Resend Verification emails → contact@dcodesys.in

**No code changes needed!** Once SMTP is configured, all emails will come from `contact@dcodesys.in`.

### 🔍 Troubleshooting:

- **Email not received?** Check spam folder
- **Wrong sender?** Verify "SMTP Admin Email" = `contact@dcodesys.in`
- **Auth failed?** Check SMTP credentials, use App Password for Gmail

See `SETUP_CONTACT_EMAIL.md` for detailed guide.

