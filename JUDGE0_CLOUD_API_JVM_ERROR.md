# Judge0 Cloud API JVM Error - Solution

## Problem

Even though we're using the Judge0 Cloud API (RapidAPI), we're still getting JVM metaspace errors:

```
Error occurred during initialization of VM
Could not allocate metaspace: 1073741824 bytes
```

This means **RapidAPI's Judge0 server also has JVM memory issues**.

## Root Cause

The RapidAPI Judge0 service (`judge0-ce.p.rapidapi.com`) appears to be a self-hosted instance that also has JVM configuration problems.

## Solutions

### Option 1: Use Official Judge0.com API (Recommended)

Judge0 has an official cloud API at `https://api.judge0.com` that should be properly configured:

1. **Update `env.local`**:
   ```env
   VITE_JUDGE0_BASE_URL=https://api.judge0.com
   VITE_JUDGE0_API_KEY=your-judge0-api-key
   ```

2. **Get API Key**:
   - Go to https://judge0.com
   - Sign up for an account
   - Get your API key from the dashboard

3. **Update headers** in `judge0Client.ts`:
   - Official API uses `Authorization: Bearer <token>` instead of RapidAPI headers

### Option 2: Try Different RapidAPI Endpoint

Some RapidAPI endpoints might have different server configurations. Check if there are alternative endpoints available.

### Option 3: Use Alternative Code Execution Service

Consider using:
- **Piston API** - Another code execution service
- **CodeX API** - Alternative service
- **Replit API** - If available

### Option 4: Wait for RapidAPI to Fix

Contact RapidAPI support or wait for them to fix their server configuration.

## Quick Fix: Switch to Official Judge0 API

The official Judge0.com API should have proper JVM configuration. Let's update the code to use it.

---

**Status**: RapidAPI Judge0 service has JVM issues  
**Recommendation**: Switch to official Judge0.com API

