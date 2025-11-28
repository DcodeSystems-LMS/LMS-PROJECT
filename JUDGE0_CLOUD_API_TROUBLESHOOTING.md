# Judge0 Cloud API - Troubleshooting

## Error: "Could not allocate metaspace"

If you're seeing this error after switching to cloud API, it means the frontend is still trying to use the old self-hosted server.

## Quick Fix

### Step 1: Restart Frontend Dev Server

The environment variables are only loaded when the dev server starts. You must restart:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Step 3: Verify Configuration

Check that `env.local` exists and has the correct values:

```env
VITE_JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
VITE_JUDGE0_API_KEY=19f8daca8bmsh49e9297b91cd1d9p175e6ejsn7a74554fd6a2
```

### Step 4: Check Browser Console

Open browser console (F12) and look for:
- ✅ "Judge0 languages fetched" - means cloud API is working
- ❌ CORS errors or connection errors - check API key

## Why This Error Shouldn't Happen

With cloud API:
- ✅ No self-hosted server = No JVM memory issues
- ✅ RapidAPI handles all server-side processing
- ✅ No metaspace/thread stack errors
- ✅ Managed infrastructure

## If Error Persists

1. **Check Network Tab**:
   - Open DevTools → Network tab
   - Look for requests to `judge0-ce.p.rapidapi.com`
   - If you see requests to `49.204.168.41:2358`, the old config is still active

2. **Verify Environment Variables**:
   ```bash
   # In browser console, check:
   console.log(import.meta.env.VITE_JUDGE0_BASE_URL)
   # Should show: https://judge0-ce.p.rapidapi.com
   ```

3. **Check for Cached Build**:
   - Delete `dist/` folder if it exists
   - Restart dev server

## Expected Behavior

After switching to cloud API:
- ✅ No JVM errors
- ✅ No metaspace allocation errors
- ✅ No thread creation errors
- ✅ Direct API calls to RapidAPI
- ✅ Fast response times

---

**Note**: The metaspace error only occurs with self-hosted Judge0 servers. Cloud API eliminates this issue completely.

