# Judge0 Cloud API Migration Guide

## Overview

Successfully migrated from self-hosted Judge0 instance to Judge0 Cloud API (RapidAPI).

## Changes Made

### 1. Frontend Client (`src/lib/judge0Client.ts`)
- ✅ Changed from direct API calls to backend proxy
- ✅ Updated default URL from `http://49.204.168.41:2358` to `/api/judge0`
- ✅ All requests now go through backend to avoid CORS and handle API keys securely

### 2. Backend Proxy (`backend/server.js`)
- ✅ Updated to use Judge0 Cloud API: `https://judge0-ce.p.rapidapi.com`
- ✅ Added API key support via `JUDGE0_API_KEY` environment variable
- ✅ Automatically adds RapidAPI headers when API key is provided
- ✅ Changed submissions endpoint to use `wait=true` for immediate results

### 3. Environment Configuration

#### Backend (`.env`)
```env
# Judge0 Cloud API Configuration
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key-here
JUDGE0_TIMEOUT=20000
```

#### Frontend (`env.local`)
```env
# Uses backend proxy - no direct API calls
# VITE_JUDGE0_BASE_URL=/api/judge0 (default)
```

## Setup Instructions

### Step 1: Get RapidAPI Key

1. Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up or log in to RapidAPI
3. Subscribe to the Judge0 CE API (free tier available)
4. Copy your API key from the dashboard

### Step 2: Configure Backend

1. Copy `backend/env.template` to `backend/.env`
2. Add your RapidAPI key:
   ```env
   JUDGE0_API_KEY=your-actual-rapidapi-key-here
   ```

### Step 3: Restart Backend

```bash
cd backend
npm start
```

## Benefits of Cloud API

✅ **No server maintenance** - No need to manage self-hosted instance  
✅ **No JVM memory issues** - Cloud handles all resource management  
✅ **Better reliability** - Managed infrastructure  
✅ **Automatic updates** - Always on latest version  
✅ **Scalability** - Handles traffic spikes automatically  

## API Key Security

- ✅ API key is stored in backend `.env` file (never committed to git)
- ✅ Frontend never sees the API key (all requests go through backend)
- ✅ Backend adds API key to headers server-side

## Testing

After configuration, test the connection:

1. Start backend server
2. Open browser console
3. Check for "Judge0 languages fetched" message
4. Try running code in the playground

## Troubleshooting

### Error: "Failed to fetch languages"
- Check if backend is running
- Verify API key is set in backend `.env`
- Check RapidAPI subscription status

### Error: "401 Unauthorized"
- API key is missing or invalid
- Check `JUDGE0_API_KEY` in backend `.env`
- Verify RapidAPI subscription is active

### Error: "Service unavailable"
- Check RapidAPI service status
- Verify network connectivity
- Check backend logs for detailed error messages

## Migration Checklist

- [x] Update frontend client to use backend proxy
- [x] Update backend to use cloud API URL
- [x] Add API key support in backend
- [x] Update environment variable templates
- [x] Remove self-hosted server references
- [x] Update documentation

## Rollback (If Needed)

If you need to rollback to self-hosted:

1. Update `backend/.env`:
   ```env
   JUDGE0_BASE_URL=http://your-server-ip:2358
   # Remove or comment out JUDGE0_API_KEY
   ```

2. Restart backend server

---

**Migration Date**: $(date)  
**Status**: ✅ Complete

