-- Simple fix for assessments table
-- Run this in Supabase SQL Editor

-- 1. Check if assessments table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;

-- 2. If table doesn't exist, create it
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

-- 3. Create a simple test assessment (without is_active column)
INSERT INTO assessments (
    title,
    description,
    type,
    course_id,
    instructor_id,
    mentor_id,
    time_limit,
    max_attempts,
    passing_score,
    status
) 
SELECT 
    'Test Assessment - Real Data',
    'This is a real assessment created in the database',
    'Quiz',
    (SELECT id FROM courses LIMIT 1),
    'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9',
    'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9',
    30,
    1,
    60,
    'draft'
WHERE NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9'
);

-- 4. Verify the test assessment was created
SELECT 
    id, title, mentor_id, instructor_id, created_at, status
FROM assessments 
WHERE mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9';

-- 5. Enable RLS and create policies
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own assessments" ON assessments
    FOR SELECT USING (mentor_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Users can insert their own assessments" ON assessments
    FOR INSERT WITH CHECK (mentor_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Users can update their own assessments" ON assessments
    FOR UPDATE USING (mentor_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Users can delete their own assessments" ON assessments
    FOR DELETE USING (mentor_id = auth.uid() OR instructor_id = auth.uid());

