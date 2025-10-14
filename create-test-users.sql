-- Create test users in Supabase
-- Run this in your Supabase SQL Editor after setting up the schema

-- First, let's create the test users in auth.users table
-- Note: You'll need to create these users through the Supabase Auth UI or API
-- This is just a reference for the profiles that will be created

-- Insert test profiles (these will be created automatically when users sign up)
-- But first, you need to create the actual auth users

-- Method 1: Create users through Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Create these users:
-- 1. Email: admin@dcode.ai, Password: AdminPass123, Role: admin
-- 2. Email: mentor@dcode.ai, Password: MentorPass123, Role: mentor  
-- 3. Email: student@dcode.ai, Password: StudentPass123, Role: student

-- Method 2: Use the signup form in your app
-- Go to http://localhost:3000/auth/signup
-- Create accounts with the test credentials

-- Method 3: Create users via SQL (if you have admin access)
-- This is more complex and requires special permissions

-- After creating users, you can verify they exist by running:
SELECT * FROM auth.users;
SELECT * FROM public.profiles;

-- If you want to manually insert profiles (not recommended, use signup instead):
-- INSERT INTO public.profiles (id, email, name, role) VALUES
--   ('user-uuid-here', 'admin@dcode.ai', 'Admin User', 'admin'),
--   ('user-uuid-here', 'mentor@dcode.ai', 'Mentor User', 'mentor'),
--   ('user-uuid-here', 'student@dcode.ai', 'Student User', 'student')
-- ON CONFLICT (id) DO NOTHING;
