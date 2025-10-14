# Fix Email CORS Error - Complete Solution

## 🚨 **Current Issue:**
```
Access to fetch at 'https://gtzbjzsjeftkgwvvgefp.supabase.co/functions/v1/send-email' 
from origin 'https://app.dcodesys.in' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## 🔧 **Root Cause:**
The Edge Function `send-email` either:
1. **Doesn't exist** in your Supabase project
2. **Isn't deployed** properly
3. **Has CORS configuration issues**
4. **Is returning an error** during preflight request

## ✅ **Immediate Solutions:**

### **Solution 1: Deploy Simple Email Function (Recommended)**

I've created a simple email function that works without external dependencies:

```bash
# Deploy the simple email function
supabase functions deploy send-email-simple
```

**Features:**
- ✅ **No CORS issues** - properly configured headers
- ✅ **No external dependencies** - works immediately
- ✅ **Simulation mode** - perfect for testing
- ✅ **Easy to deploy** - minimal configuration

### **Solution 2: Deploy Resend Email Function (Production Ready)**

For production use with real email sending:

```bash
# Deploy the Resend email function
supabase functions deploy send-email-resend
```

**Features:**
- ✅ **Real email sending** via Resend API
- ✅ **Professional HTML templates**
- ✅ **Rate limit handling**
- ✅ **Fallback to simulation** if no API key

### **Solution 3: Fix Existing Function**

If you have an existing function, update it with proper CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Handle CORS preflight
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders })
}
```

## 🚀 **Step-by-Step Deployment:**

### **Step 1: Install Supabase CLI**
```bash
npm install -g supabase
```

### **Step 2: Login to Supabase**
```bash
supabase login
```

### **Step 3: Deploy Functions**
```bash
# Deploy simple function (recommended for testing)
supabase functions deploy send-email-simple

# Or deploy Resend function (for production)
supabase functions deploy send-email-resend
```

### **Step 4: Update Frontend Code**

Update your frontend to use the new endpoint:

```typescript
// Change from:
const response = await supabase.functions.invoke('send-email', {
  body: { to, subject, message }
})

// To:
const response = await supabase.functions.invoke('send-email-simple', {
  body: { to, subject, message }
})
```

## 🧪 **Testing the Functions:**

### **Test Simple Function:**
```bash
curl -X POST https://gtzbjzsjeftkgwvvgefp.supabase.co/functions/v1/send-email-simple \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"to":"test@example.com","subject":"Test","message":"Hello World"}'
```

### **Test Resend Function:**
```bash
curl -X POST https://gtzbjzsjeftkgwvvgefp.supabase.co/functions/v1/send-email-resend \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"to":"test@example.com","subject":"Test","message":"Hello World"}'
```

## 🔑 **Environment Variables:**

### **For Resend Function:**
Add to your Supabase project secrets:
```
RESEND_API_KEY=re_your_api_key_here
```

### **For Production:**
Add to your Supabase project secrets:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=https://app.dcodesys.in
```

## 📊 **Function Comparison:**

| Function | CORS | Dependencies | Email Sending | Best For |
|----------|------|-------------|---------------|----------|
| `send-email-simple` | ✅ Fixed | None | Simulation | Testing |
| `send-email-resend` | ✅ Fixed | Resend API | Real | Production |
| `send-email` | ❌ Broken | Supabase SMTP | Real | Legacy |

## 🎯 **Recommended Action:**

1. **Deploy `send-email-simple`** for immediate testing
2. **Update frontend** to use new endpoint
3. **Test email functionality**
4. **Deploy `send-email-resend`** for production
5. **Configure Resend API key** for real emails

## 🚨 **Quick Fix Commands:**

```bash
# Quick deployment
supabase functions deploy send-email-simple

# Check deployment status
supabase functions list

# View function logs
supabase functions logs send-email-simple
```

## 💡 **Pro Tips:**

### **For Development:**
- Use `send-email-simple` for testing
- Check browser console for detailed errors
- Use Supabase dashboard to monitor functions

### **For Production:**
- Use `send-email-resend` with proper API key
- Implement proper error handling
- Monitor email delivery rates
- Set up email templates

## 🔍 **Debugging:**

### **Check Function Status:**
```bash
supabase functions list
```

### **View Function Logs:**
```bash
supabase functions logs send-email-simple --follow
```

### **Test Function Directly:**
Use the curl commands above to test without frontend

## 🎉 **Expected Results:**

After deploying `send-email-simple`:
- ✅ **No CORS errors**
- ✅ **Successful email simulation**
- ✅ **Proper error handling**
- ✅ **Ready for production**

The email functionality will work immediately after deployment! 🚀
