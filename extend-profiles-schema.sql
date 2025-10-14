-- Extend Profiles Table with Additional Student Fields
-- This script adds all the fields needed for comprehensive student management

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS student_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id),
ADD COLUMN IF NOT EXISTS join_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS badges TEXT[],
ADD COLUMN IF NOT EXISTS completed_assessments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) DEFAULT 0.00;

-- Update existing profiles with default values
UPDATE profiles 
SET 
  phone = '+1 (555) 000-0000',
  address = 'Address not provided',
  student_status = 'inactive',
  progress = 0,
  join_date = created_at,
  last_active = updated_at
WHERE phone IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_student_status ON profiles(student_status);
CREATE INDEX IF NOT EXISTS idx_profiles_progress ON profiles(progress);
CREATE INDEX IF NOT EXISTS idx_profiles_course_id ON profiles(course_id);

-- Update RLS policies to allow updates to new fields
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Grant permissions for new columns
GRANT ALL ON public.profiles TO anon, authenticated;

-- Test the schema
SELECT 
  id, 
  name, 
  email, 
  phone, 
  address, 
  student_status, 
  progress, 
  course_id,
  join_date,
  last_active
FROM profiles 
LIMIT 1;

SELECT 'Profiles table extended successfully with all student fields' as status;
