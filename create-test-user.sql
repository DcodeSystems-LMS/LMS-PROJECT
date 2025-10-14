-- Create Test User for Authentication
-- This script helps create a test user for authentication testing

-- Step 1: Check if test user exists in profiles
SELECT 
    'profiles' as table_name,
    COUNT(*) as user_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'User exists in profiles'
        ELSE 'User not found in profiles'
    END as status
FROM profiles 
WHERE email = 'admin@example.com';

-- Step 2: Check if test user exists in auth.users (if accessible)
-- Note: This might not work depending on permissions
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'User exists in auth.users'
        ELSE 'User not found in auth.users'
    END as status
FROM auth.users 
WHERE email = 'admin@example.com';

-- Step 3: Create test user in profiles if it doesn't exist
INSERT INTO profiles (
    id,
    name,
    email,
    role,
    student_status,
    progress,
    join_date,
    last_active,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'Admin User',
    'admin@example.com',
    'admin',
    'active',
    100,
    NOW(),
    NOW(),
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'admin@example.com'
);

-- Step 4: Verify the user was created
SELECT 
    'Test user creation' as action,
    CASE 
        WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@example.com') 
        THEN 'SUCCESS - Test user created in profiles'
        ELSE 'FAILED - Test user not created'
    END as result;

-- Step 5: Instructions for creating auth user
SELECT 'IMPORTANT: You need to create the user in auth.users table manually' as instruction;
SELECT 'Go to Supabase Dashboard → Authentication → Users → Add User' as next_step;
SELECT 'Email: admin@example.com, Password: admin123' as credentials;
SELECT 'Or use the signup functionality in your app' as alternative;






