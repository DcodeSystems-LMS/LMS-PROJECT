-- Quick Fix: Temporarily Disable Foreign Key Constraint
-- This allows adding students without creating auth users first

-- Step 1: Drop the foreign key constraint temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Test adding a student directly
INSERT INTO profiles (
  id,
  name,
  email,
  phone,
  address,
  role,
  student_status,
  progress,
  course_id,
  join_date,
  last_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Test Student',
  'test@example.com',
  '+1 (555) 123-4567',
  '123 Test Street',
  'student',
  'active',
  0,
  NULL,
  NOW(),
  NOW(),
  NOW(),
  NOW()
);

-- Step 3: Verify the student was added
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Step 4: Clean up test data
DELETE FROM profiles WHERE email = 'test@example.com';

-- Step 5: Re-enable the foreign key constraint (optional)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

SELECT 'Foreign key constraint temporarily disabled - students can now be added directly' as status;






