# Environment Configuration Check

## Required Environment Variables

Make sure you have the following environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Setup

1. Run the SQL schema from `supabase-schema-final.sql` in your Supabase SQL editor
2. Make sure Row Level Security (RLS) policies are enabled
3. Verify that the `profiles` and `sessions` tables exist

## Troubleshooting

If you're seeing "No mentors found" or connection errors:

1. Check browser console for error messages
2. Verify Supabase URL and API key are correct
3. Ensure database tables exist and have proper permissions
4. Check if RLS policies allow reading from the tables

## Sample Data

The application will automatically create sample mentor and session data if none exists when you first load the mentor management page.

