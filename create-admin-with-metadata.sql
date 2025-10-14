-- Create Admin User with Metadata via SQL
-- Run this in Supabase SQL Editor

-- First, let's create the user in auth.users
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
  last_sign_in_at
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
  NOW()
);

-- Then create the profile (this should be done automatically by the trigger)
-- But if the trigger doesn't work, you can manually insert:
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'role'
FROM auth.users u
WHERE u.email = 'admin@dcode.ai'
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created correctly
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
