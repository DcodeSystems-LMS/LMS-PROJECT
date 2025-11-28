-- Add missing columns to profiles table for mentor functionality
-- Run this in your Supabase SQL editor

-- Add specialty column for mentors
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS specialty TEXT;

-- Add status column for user status tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'pending', 'suspended')) DEFAULT 'active';

-- Add phone column for contact information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add address column for contact information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add bio column for user descriptions
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add location column for user location
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add skills column as JSON array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]';

-- Add interests column as JSON array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]';

-- Add experience points
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- Add level column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Add badges column as JSON array
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';

-- Add progress column for students
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Add course_id column for students
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id);

-- Add join_date column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add last_active column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add completed_assessments count
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_assessments INTEGER DEFAULT 0;

-- Add average_score column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2) DEFAULT 0;

-- Update existing profiles to have default values
UPDATE public.profiles 
SET 
  status = COALESCE(status, 'active'),
  xp = COALESCE(xp, 0),
  level = COALESCE(level, 1),
  progress = COALESCE(progress, 0),
  completed_assessments = COALESCE(completed_assessments, 0),
  average_score = COALESCE(average_score, 0),
  skills = COALESCE(skills, '[]'::jsonb),
  interests = COALESCE(interests, '[]'::jsonb),
  badges = COALESCE(badges, '[]'::jsonb),
  join_date = COALESCE(join_date, created_at),
  last_active = COALESCE(last_active, updated_at)
WHERE status IS NULL 
   OR xp IS NULL 
   OR level IS NULL 
   OR progress IS NULL 
   OR completed_assessments IS NULL 
   OR average_score IS NULL 
   OR skills IS NULL 
   OR interests IS NULL 
   OR badges IS NULL 
   OR join_date IS NULL 
   OR last_active IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON public.profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_course_id ON public.profiles(course_id);

-- Update RLS policies to include new columns
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate policies with updated column access
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to create profiles for others
CREATE POLICY "Admins can create profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update the trigger function to handle new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, specialty, status, xp, level, progress, skills, interests, badges, join_date, last_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'specialty',
    COALESCE(NEW.raw_user_meta_data->>'status', 'active'),
    COALESCE((NEW.raw_user_meta_data->>'xp')::integer, 0),
    COALESCE((NEW.raw_user_meta_data->>'level')::integer, 1),
    COALESCE((NEW.raw_user_meta_data->>'progress')::integer, 0),
    COALESCE(NEW.raw_user_meta_data->'skills', '[]'::jsonb),
    COALESCE(NEW.raw_user_meta_data->'interests', '[]'::jsonb),
    COALESCE(NEW.raw_user_meta_data->'badges', '[]'::jsonb),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
