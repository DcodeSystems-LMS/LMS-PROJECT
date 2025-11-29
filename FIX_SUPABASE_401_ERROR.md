# Fix Supabase 401 Error for app.dcodesys.in

## 🔴 Problem

Getting 401 errors when trying to access Supabase:
- `Failed to load resource: the server responded with a status of 401`
- `Invalid authentication credentials`
- Profile access denied

## 🔍 Root Causes

1. **CORS Configuration** - Supabase needs to allow requests from `app.dcodesys.in`
2. **RLS Policies** - Row Level Security might be blocking access
3. **Anon Key** - Might be incorrect or expired

## ✅ Solutions

### Solution 1: Configure CORS in Supabase (MOST IMPORTANT)

Since you're now using `app.dcodesys.in` instead of `dcodesys.in`, you need to add the new domain to Supabase's allowed origins.

#### Steps:

1. **Go to Supabase Dashboard:**
   - Visit `https://supabase.dcodesys.in` (or your Supabase admin panel)
   - Or if using Supabase Cloud: https://app.supabase.com

2. **Navigate to Settings → API:**
   - Find "CORS" or "Allowed Origins" section
   - Add the following URLs:
     ```
     https://app.dcodesys.in
     http://app.dcodesys.in
     https://dcodesys.in
     http://dcodesys.in
     ```

3. **Save the changes**

#### For Self-Hosted Supabase:

If you're using self-hosted Supabase at `supabase.dcodesys.in`, you need to configure CORS in the Supabase config:

1. **Find Supabase config file** (usually `config.toml` or environment variables)
2. **Add to CORS settings:**
   ```toml
   [api]
   cors_allowed_origins = [
     "https://app.dcodesys.in",
     "http://app.dcodesys.in",
     "https://dcodesys.in",
     "http://dcodesys.in",
     "http://localhost:3000",
     "http://localhost:5173"
   ]
   ```

3. **Restart Supabase** after making changes

### Solution 2: Fix RLS Policies

The 401 error on profiles table suggests RLS policies might be too restrictive.

#### Run this SQL in Supabase SQL Editor:

```sql
-- Fix RLS Policies for Profiles Table
-- Run this in Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create working policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to read profiles (for development)
-- Remove this in production if you want stricter security
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Solution 3: Verify Environment Variables

Make sure your `.env.production` has the correct values:

```env
VITE_SUPABASE_URL=https://supabase.dcodesys.in
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
VITE_APP_URL=https://app.dcodesys.in
```

**Important:** 
- Rebuild after changing environment variables: `npm run build:prod`
- The anon key must match your Supabase project

### Solution 4: Check Supabase Auth Settings

1. **Go to Supabase Dashboard → Authentication → URL Configuration**
2. **Add Site URL:**
   - `https://app.dcodesys.in`
3. **Add Redirect URLs:**
   - `https://app.dcodesys.in/**`
   - `https://app.dcodesys.in/auth/callback`
   - `https://app.dcodesys.in/login`

### Solution 5: Verify Anon Key

1. **Get the correct anon key:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the `anon` `public` key
   - Update in `.env.production`

2. **Rebuild:**
   ```bash
   npm run build:prod
   ```

## 🚀 Quick Fix Steps

1. **Add CORS origin in Supabase:**
   - Settings → API → Add `https://app.dcodesys.in`

2. **Update Site URL in Auth:**
   - Authentication → URL Configuration → Add `https://app.dcodesys.in`

3. **Fix RLS Policies:**
   - Run the SQL script above in Supabase SQL Editor

4. **Verify Environment Variables:**
   - Check `.env.production` has correct values
   - Rebuild: `npm run build:prod`

5. **Test:**
   - Visit `https://app.dcodesys.in`
   - Try to sign in
   - Check browser console for errors

## 🔍 Debugging

### Check Browser Console:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to sign in
4. Look for failed requests to `supabase.dcodesys.in`
5. Check the **Response** tab for error details

### Common Error Messages:

- **401 Unauthorized** → CORS or RLS issue
- **403 Forbidden** → RLS policy blocking
- **CORS error** → Need to add origin to Supabase
- **Invalid credentials** → Wrong email/password or auth URL not configured

## 📝 For Self-Hosted Supabase

If you're using self-hosted Supabase, you might need to:

1. **Update nginx/Caddy config** to allow CORS:
   ```nginx
   add_header 'Access-Control-Allow-Origin' 'https://app.dcodesys.in' always;
   add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
   add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
   ```

2. **Restart Supabase services**

## ✅ Verification

After applying fixes:

1. ✅ No 401 errors in console
2. ✅ Can sign in successfully
3. ✅ Profile loads correctly
4. ✅ No CORS errors in Network tab

---

**Most likely fix:** Add `https://app.dcodesys.in` to Supabase CORS allowed origins!

