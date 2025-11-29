# Debug Supabase Authentication 401 Error

## 🔴 Error
```
POST https://supabase.dcodesys.in/auth/v1/token?grant_type=password 401 (Unauthorized)
Error: Invalid authentication credentials
```

## 🔍 Possible Causes

### 1. Wrong Email/Password
- User doesn't exist in Supabase
- Password is incorrect
- Email is not verified (if email verification is required)

### 2. CORS Issue
- Supabase not allowing requests from `app.dcodesys.in`
- Preflight OPTIONS request failing

### 3. Supabase Configuration Issue
- Auth not properly configured
- JWT secret mismatch
- Auth URL not set correctly

### 4. Environment Variables
- Wrong Supabase URL
- Wrong anon key
- Not using production build

## ✅ Step-by-Step Debugging

### Step 1: Check CORS (Most Common Issue)

1. **Open Browser DevTools (F12)**
2. **Go to Network tab**
3. **Try to sign in**
4. **Look for the failed request:**
   - Click on `token?grant_type=password`
   - Check **Headers** tab
   - Look for CORS errors

5. **Check Response:**
   - If you see CORS error → Need to add origin to Supabase
   - If you see 401 with error message → Credentials issue

### Step 2: Verify Supabase URL and Key

Check browser console for:
```
🔧 Supabase Configuration:
URL: https://supabase.dcodesys.in
Key: eyJ0eXAiOiAiSldUIiwi...
Environment: production
```

**Verify:**
- URL matches your Supabase instance
- Key is correct (not default placeholder)

### Step 3: Test Direct API Call

Open browser console and run:

```javascript
// Test Supabase connection
fetch('https://supabase.dcodesys.in/rest/v1/', {
  method: 'GET',
  headers: {
    'apikey': 'YOUR_ANON_KEY_HERE',
    'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If this fails → CORS or Supabase not accessible

### Step 4: Check User Exists in Supabase

1. **Go to Supabase Dashboard**
2. **Navigate to Authentication → Users**
3. **Check if your user exists**
4. **Verify email is confirmed**

### Step 5: Test with Supabase Dashboard

1. **Try signing in via Supabase Dashboard**
2. **If it works there → Issue is with frontend/CORS**
3. **If it doesn't work → Issue is with user/credentials**

## 🔧 Fixes

### Fix 1: Add CORS Origin

**For Self-Hosted Supabase:**

1. **Find Supabase config** (usually in Docker or config file)
2. **Add to CORS settings:**
   ```yaml
   # In docker-compose.yml or config.toml
   API_CORS_ORIGINS: https://app.dcodesys.in,http://app.dcodesys.in
   ```

3. **Or in config.toml:**
   ```toml
   [api]
   cors_allowed_origins = [
     "https://app.dcodesys.in",
     "http://app.dcodesys.in"
   ]
   ```

4. **Restart Supabase**

### Fix 2: Verify Credentials

1. **Reset password in Supabase Dashboard:**
   - Go to Authentication → Users
   - Find your user
   - Click "Reset Password"
   - Use the new password

2. **Or create a new test user:**
   - Create via Supabase Dashboard
   - Try signing in with that user

### Fix 3: Check Auth Settings

1. **Go to Supabase Dashboard → Authentication → Settings**
2. **Check:**
   - Site URL: `https://app.dcodesys.in`
   - Redirect URLs: Include `https://app.dcodesys.in/**`
   - Email verification: Disable for testing (if needed)

### Fix 4: Verify Environment Variables

Check your `.env.production`:

```env
VITE_SUPABASE_URL=https://supabase.dcodesys.in
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiAiSldUIiwi... (your actual key)
```

**Important:**
- Get the key from Supabase Dashboard → Settings → API
- Rebuild after changing: `npm run build:prod`

### Fix 5: Check Network Tab Details

In browser DevTools → Network tab:

1. **Click on the failed request**
2. **Check Request Headers:**
   - Should have `apikey` header
   - Should have `Content-Type: application/json`

3. **Check Response:**
   - Look for error message
   - Check if it's CORS or auth error

## 🧪 Quick Test Script

Add this to browser console to test:

```javascript
// Test Supabase Auth
async function testSupabaseAuth() {
  const supabaseUrl = 'https://supabase.dcodesys.in';
  const anonKey = 'YOUR_ANON_KEY_HERE'; // Get from .env.production
  
  console.log('Testing Supabase connection...');
  
  // Test 1: Check if Supabase is accessible
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    console.log('✅ Supabase accessible:', response.status);
  } catch (error) {
    console.error('❌ Supabase not accessible:', error);
    return;
  }
  
  // Test 2: Try to sign in
  try {
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com', // Use your test email
        password: 'testpassword'    // Use your test password
      })
    });
    
    const data = await authResponse.json();
    console.log('Auth response:', authResponse.status, data);
    
    if (authResponse.ok) {
      console.log('✅ Sign in successful!');
    } else {
      console.error('❌ Sign in failed:', data);
    }
  } catch (error) {
    console.error('❌ Sign in error:', error);
  }
}

// Run the test
testSupabaseAuth();
```

## 📋 Checklist

- [ ] CORS origin added to Supabase (`https://app.dcodesys.in`)
- [ ] Site URL set in Supabase Auth settings
- [ ] Redirect URLs configured
- [ ] User exists in Supabase
- [ ] Email is confirmed (or email verification disabled)
- [ ] Correct anon key in `.env.production`
- [ ] Rebuilt app after changing env vars
- [ ] Checked Network tab for detailed error
- [ ] Tested with Supabase Dashboard

## 🚨 Most Likely Issues

1. **CORS not configured** → Add `https://app.dcodesys.in` to Supabase CORS
2. **Wrong credentials** → Reset password or create new user
3. **Email not verified** → Disable email verification or verify email
4. **Wrong anon key** → Get correct key from Supabase Dashboard

## 💡 Quick Fix

1. **Add CORS:**
   - Supabase Dashboard → Settings → API → Add `https://app.dcodesys.in`

2. **Reset password:**
   - Supabase Dashboard → Authentication → Users → Reset password

3. **Test again**

---

**If still not working, check the Network tab response for the exact error message!**

