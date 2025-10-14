-- Check actual structure of assessments table
-- Run this in Supabase SQL Editor

-- 1. Check what columns exist in assessments table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;

-- 2. Check if table exists at all
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'assessments'
);

-- 3. If table doesn't exist, create it with basic structure
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    course_id UUID REFERENCES courses(id),
    instructor_id UUID REFERENCES auth.users(id),
    mentor_id UUID REFERENCES auth.users(id),
    time_limit INTEGER DEFAULT 30,
    max_attempts INTEGER DEFAULT 1,
    passing_score INTEGER DEFAULT 60,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'is_active') THEN
        ALTER TABLE assessments ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 5. Check final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;

