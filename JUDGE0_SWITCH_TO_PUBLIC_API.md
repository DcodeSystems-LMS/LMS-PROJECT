# Switch to Public Judge0 API (No JVM Issues)

## Problem

RapidAPI's Judge0 service has JVM metaspace errors. We need to switch to a different endpoint.

## Solution: Use Public Judge0 CE Endpoint

Judge0 has a public Community Edition endpoint that doesn't require authentication and should have proper JVM configuration.

## Steps to Switch

### 1. Update `env.local`

The file is already updated to use:
```env
VITE_JUDGE0_BASE_URL=https://ce.judge0.com
VITE_JUDGE0_API_KEY=
VITE_JUDGE0_USE_RAPIDAPI=false
```

### 2. Restart Dev Server

**IMPORTANT**: Environment variables only load when the dev server starts!

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Clear Browser Cache

- Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or: DevTools → Right-click refresh → "Empty Cache and Hard Reload"

### 4. Test

Try running your Java code again. It should now use `https://ce.judge0.com` instead of RapidAPI.

## Verify It's Working

Check browser console (F12):
- Look for requests to `ce.judge0.com` (not `rapidapi.com`)
- Should see "Judge0 languages fetched" message
- No more JVM metaspace errors

## Alternative Endpoints

If `ce.judge0.com` doesn't work, try:
- `https://api.judge0.com` (official API, may require key)
- `https://judge0-ce.p.rapidapi.com` (RapidAPI - has JVM issues)

## Troubleshooting

### Still Using RapidAPI?

1. **Check env.local** - Make sure it has the correct values
2. **Restart dev server** - This is critical!
3. **Check Network tab** - Verify requests go to `ce.judge0.com`

### Getting CORS Errors?

The public endpoint should handle CORS, but if you see errors:
- Check if the endpoint is accessible
- Try a different endpoint
- Consider using backend proxy as fallback

---

**Status**: Ready to switch - just restart dev server!

