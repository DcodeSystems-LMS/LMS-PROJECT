# Fix Password Reset URL - Production Domain

## Problem

When sending password reset links from `dcodesys.in`, the email contained `localhost:3000` links instead of `dcodesys.in` links.

## Root Cause

The code was using `window.location.origin` which dynamically uses the current domain. However, in production, we need to explicitly use the production domain (`https://dcodesys.in`) for email links, regardless of where the request originates.

## Solution

Updated `src/lib/supabaseAuth.ts` to use the `VITE_APP_URL` environment variable for production URLs:

### Changes Made:

1. **Password Reset Function** (`resetPassword`):
   ```typescript
   // Before:
   redirectTo: `${window.location.origin}/auth/reset-password`
   
   // After:
   const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
   const redirectUrl = `${baseUrl}/auth/reset-password`;
   ```

2. **Sign Up Function** (`signUp`):
   ```typescript
   // Before:
   emailRedirectTo: `${window.location.origin}/auth/callback`
   
   // After:
   const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
   const redirectUrl = `${baseUrl}/auth/callback`;
   ```

## How It Works

- **Production**: Uses `VITE_APP_URL` from environment (set to `https://dcodesys.in`)
- **Development**: Falls back to `window.location.origin` (e.g., `http://localhost:3000`)

## Environment Configuration

Make sure your production `.env` file has:
```env
VITE_APP_URL=https://dcodesys.in
```

This is already configured in `env.production.template`.

## Testing

1. **In Production**:
   - Send password reset email
   - Check email - link should be: `https://dcodesys.in/auth/reset-password?...`
   - Not: `http://localhost:3000/auth/reset-password?...`

2. **In Development**:
   - Send password reset email
   - Link should be: `http://localhost:3000/auth/reset-password?...`
   - Works as before

## Files Changed

- `src/lib/supabaseAuth.ts` - Updated `resetPassword` and `signUp` functions

## Benefits

✅ **Production emails use correct domain** - Always uses `dcodesys.in` in production
✅ **Development still works** - Falls back to `localhost:3000` in dev
✅ **Environment-based** - Uses environment variables for configuration
✅ **Backward compatible** - Falls back to `window.location.origin` if env var not set

---

**Fix Applied!** ✅ Password reset and email verification links now use the correct production domain.

