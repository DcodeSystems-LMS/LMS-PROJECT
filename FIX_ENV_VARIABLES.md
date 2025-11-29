# ⚠️ IMPORTANT: Fix Environment Variables

## 🔴 Problem Found!

You're using `REACT_APP_` prefix, but this is a **Vite project**, not Create React App!

**Vite uses `VITE_` prefix, NOT `REACT_APP_`**

## ✅ Correct Format

### ❌ Wrong (Create React App):
```env
REACT_APP_SUPABASE_URL=https://supabase.dcodesys.in
REACT_APP_SUPABASE_ANON_KEY=eyJhbGci...
```

### ✅ Correct (Vite):
```env
VITE_SUPABASE_URL=https://supabase.dcodesys.in
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 🔧 Fix Steps

### Step 1: Update `.env.production`

Make sure your `.env.production` file has:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://supabase.dcodesys.in
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYwODk4NjAwLCJleHAiOjE5MTg2NjUwMDB9.tO91YG4EHFALK1-cDpvtL6Br62SqbJnCaCzzDRMsWE4

# Production Settings
VITE_APP_ENV=production
VITE_APP_URL=https://app.dcodesys.in
```

**Important:** Use `VITE_` prefix, not `REACT_APP_`!

### Step 2: Rebuild

After updating `.env.production`:

```bash
npm run build:prod
```

### Step 3: Upload New Build

Upload the new `dist/` folder to Hostinger.

## 🧪 Verify

After rebuilding, check browser console. You should see:

```
🔧 Supabase Configuration:
URL: https://supabase.dcodesys.in
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: production
✅ Supabase client created successfully
```

If you still see the old key or "Not found", the environment variables aren't being read correctly.

## 📝 All Vite Environment Variables

Remember: **ALL** environment variables in Vite must start with `VITE_`:

- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_APP_URL`
- ✅ `VITE_JUDGE0_BASE_URL`
- ✅ `VITE_JUDGE0_API_KEY`
- ❌ `REACT_APP_*` (won't work!)

## 🔍 Check Your Files

1. **`.env.production`** - Should have `VITE_` prefix
2. **`.env.local`** - Should have `VITE_` prefix
3. **`env.production.template`** - Already updated ✅

---

**This is likely why you're getting 401 errors - the anon key isn't being read because of wrong prefix!**

