# Database Setup Instructions

## Issues Fixed

The following issues have been resolved in the codebase:

1. **406 Errors**: Fixed profile fetching queries to handle missing profiles table gracefully
2. **400 Errors**: Fixed session queries that were using placeholder user IDs instead of actual authenticated user IDs
3. **Multiple GoTrueClient Instances**: Implemented singleton pattern to prevent duplicate Supabase client instances
4. **Auth Check Failures**: Enhanced error handling to work with or without database tables

## Database Schema Setup

To set up the database properly, run the following SQL commands in your Supabase SQL editor:

```sql
-- Run the contents of supabase-schema-final.sql
-- This will create all necessary tables and policies
```

## Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing the Fixes

1. **Authentication**: The app now works with or without the profiles table
2. **Session Management**: Session queries now use actual user IDs from authentication
3. **Error Handling**: All database operations now handle missing tables gracefully
4. **Client Instances**: Only one Supabase client instance is created

## What Changed

### Authentication Service (`src/lib/supabaseAuth.ts`)
- Added try-catch blocks around profile queries
- Fallback to session data when profiles table is missing
- Enhanced error handling for database operations

### Data Service (`src/services/dataService.ts`)
- Added error handling for all database operations
- Return empty arrays instead of throwing errors when tables don't exist

### Supabase Client (`src/lib/supabase.ts`)
- Implemented singleton pattern to prevent multiple client instances
- Added proper auth configuration

### Dashboard Pages
- Fixed hardcoded user IDs to use actual authenticated user IDs
- Added proper error handling for missing user data

The application should now work without the database errors you were experiencing.
