-- Create Admin User via SQL
-- Run this in your Supabase SQL Editor

-- Method 1: Create user directly in auth.users (requires admin privileges)
-- Note: This method might not work in all Supabase setups due to security restrictions

-- Insert user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data,
  is_super_admin,
  last_sign_in_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@dcode.ai',
  crypt('AdminPass123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Admin User", "role": "admin"}',
  '{"provider": "email", "providers": ["email"]}',
  false,
  NOW(),
  '',
  '',
  '',
  ''
);

-- Method 2: Create profile for existing user (if user already exists)
-- First, get the user ID from auth.users
-- Then insert into profiles table

-- Example: If you know the user ID, replace 'USER_ID_HERE' with actual ID
-- INSERT INTO public.profiles (id, email, name, role)
-- VALUES (
--   'USER_ID_HERE',
--   'admin@dcode.ai',
--   'Admin User',
--   'admin'
-- );

-- Method 3: Update existing user to admin role
-- UPDATE public.profiles 
-- SET role = 'admin'
-- WHERE email = 'admin@dcode.ai';

-- Verify the admin user was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@dcode.ai';
