# Supabase Integration Setup Guide

This guide will help you integrate Supabase with your DCode Learning Platform.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `dcode-learning-platform` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` file
3. Paste it into the SQL editor
4. Click "Run" to execute the schema

This will create:
- User profiles table
- Courses table
- Enrollments table
- Assessments table
- Assessment results table
- Discussions table
- Sessions table (for mentoring)
- Notifications table
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/**`
   - **Email Templates**: Customize if needed

## Step 6: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/auth/signup`
3. Try creating a new account
4. Check your Supabase dashboard → **Authentication** → **Users** to see the new user

## Step 7: Create Sample Data (Optional)

You can create sample courses, assessments, etc. by running additional SQL queries in the Supabase SQL editor.

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Check that your `.env.local` file has the correct values
   - Ensure the file is in the project root
   - Restart your development server after adding environment variables

2. **"User not found" error**:
   - Check that the database schema was created successfully
   - Verify that the `handle_new_user` trigger is working

3. **RLS policy errors**:
   - Check that Row Level Security policies are correctly set up
   - Verify user roles in the profiles table

### Getting Help:

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)

## Next Steps

After successful integration, you can:
1. Customize the database schema for your specific needs
2. Add more authentication providers (Google, GitHub, etc.)
3. Implement real-time features using Supabase subscriptions
4. Add file storage for course materials and user avatars
5. Set up email templates for notifications

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive data
- Regularly review and update your RLS policies
- Keep your Supabase project credentials secure
