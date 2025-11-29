# 🚨 URGENT: Fix All 401 Errors

## Current Errors:
- ❌ GET /rest/v1/profiles → 401
- ❌ POST /rest/v1/profiles → 401  
- ❌ POST /auth/v1/token → 401

## Root Cause Analysis

The Supabase client is created successfully, but **all API calls return 401**. This means:

1. **Anon key might be invalid** - Most likely
2. **CORS blocking requests** - Possible
3. **RLS policies too restrictive** - Possible
4. **Wrong credentials** - For sign-in only

## 🔧 IMMEDIATE FIXES (Do These First)

### Fix 1: Verify Anon Key (CRITICAL)

1. **Go to Supabase Dashboard:**
   - Visit your Supabase admin panel
   - Navigate to **Settings → API**

2. **Copy the correct anon key:**
   - Look for **"anon" "public"** key
   - Copy the FULL key (it's long, starts with `eyJ...`)

3. **Update `.env.production`:**
   ```env
   VITE_SUPABASE_URL=https://supabase.dcodesys.in
   VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiAiSldUIiwi... (paste FULL key here)
   ```

4. **Rebuild:**
   ```bash
   npm run build:prod
   ```

5. **Upload new build to Hostinger**

### Fix 2: Add CORS Origin

**For Self-Hosted Supabase:**

1. **Find Supabase config file** (usually `config.toml` or Docker environment)
2. **Add CORS origins:**
   ```toml
   [api]
   cors_allowed_origins = [
     "https://app.dcodesys.in",
     "http://app.dcodesys.in",
     "https://dcodesys.in",
     "http://dcodesys.in"
   ]
   ```

3. **Or in Docker environment:**
   ```yaml
   API_CORS_ORIGINS: "https://app.dcodesys.in,http://app.dcodesys.in"
   ```

4. **Restart Supabase:**
   ```bash
   # If using Docker
   docker-compose restart
   ```

### Fix 3: Fix RLS Policies (Run SQL)

Run this SQL in Supabase SQL Editor:

```sql
-- Fix RLS for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

-- Allow authenticated users to read profiles
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can create their own profile
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Fix 4: Check Auth Configuration

1. **Go to Supabase Dashboard → Authentication → Settings**
2. **Verify:**
   - Site URL: `https://app.dcodesys.in`
   - Redirect URLs include: `https://app.dcodesys.in/**`
   - Email verification: Disabled (for testing) or enabled

3. **Check JWT Settings:**
   - JWT Secret should match
   - JWT Expiry should be reasonable (3600 seconds default)

## 🧪 Test Steps

### Step 1: Test Anon Key

Open browser console on your site and run:

```javascript
// Test if anon key works
fetch('https://supabase.dcodesys.in/rest/v1/', {
  headers: {
    'apikey': 'YOUR_ANON_KEY_HERE',
    'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(console.log)
.catch(console.error);
```

**Expected:** Status 200 or 404 (not 401)

### Step 2: Test Sign In Directly

```javascript
// Test sign in
fetch('https://supabase.dcodesys.in/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: {
    'apikey': 'YOUR_ANON_KEY_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => {
  if (r.status === 200) {
    console.log('✅ Sign in successful!', data);
  } else {
    console.error('❌ Sign in failed:', data);
  }
})
.catch(console.error);
```

## 📋 Complete Checklist

- [ ] Verified anon key is correct (from Supabase Dashboard)
- [ ] Updated `.env.production` with correct anon key
- [ ] Rebuilt app: `npm run build:prod`
- [ ] Uploaded new build to Hostinger
- [ ] Added CORS origin `https://app.dcodesys.in` to Supabase
- [ ] Restarted Supabase (if self-hosted)
- [ ] Fixed RLS policies (ran SQL script)
- [ ] Configured Auth settings (Site URL, Redirect URLs)
- [ ] Tested anon key in browser console
- [ ] Verified user exists in Supabase
- [ ] Tested sign in with correct credentials

## 🔍 Debugging

### Check Network Tab:

1. Open DevTools → Network tab
2. Try to sign in
3. Click on the failed request (`token?grant_type=password`)
4. Check:
   - **Request Headers** → Should have `apikey` header
   - **Response** → Check error message
   - **Status** → Should not be 401

### Common Error Messages:

- **401 Unauthorized** → Wrong anon key or CORS issue
- **Invalid authentication credentials** → Wrong email/password OR anon key issue
- **CORS error** → Need to add origin to Supabase

## ⚡ Quick Test

Run this in browser console on your site:

```javascript
// Quick test
const testKey = 'YOUR_ANON_KEY'; // Get from .env.production
const testUrl = 'https://supabase.dcodesys.in';

// Test 1: Check if key works
fetch(`${testUrl}/rest/v1/`, {
  headers: { 'apikey': testKey, 'Authorization': `Bearer ${testKey}` }
})
.then(r => console.log('Test 1 - Status:', r.status))
.catch(e => console.error('Test 1 - Error:', e));

// Test 2: Check CORS
fetch(`${testUrl}/auth/v1/health`, {
  headers: { 'apikey': testKey }
})
.then(r => console.log('Test 2 - CORS Status:', r.status))
.catch(e => console.error('Test 2 - CORS Error:', e));
```

## 🎯 Most Likely Fix

**90% chance it's the anon key:**

1. Get the correct anon key from Supabase Dashboard
2. Update `.env.production`
3. Rebuild and redeploy

**10% chance it's CORS:**

1. Add `https://app.dcodesys.in` to Supabase CORS
2. Restart Supabase

---

**Start with Fix 1 (Anon Key) - that's most likely the issue!**

