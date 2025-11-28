-- Debug script to check assessments table and data
-- Run this in Supabase SQL Editor

-- 1. Check if assessments table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;

-- 2. Check if there are any assessments in the database
SELECT COUNT(*) as total_assessments FROM assessments;

-- 3. Check if there are any assessments for the specific user
SELECT COUNT(*) as user_assessments 
FROM assessments 
WHERE mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9';

-- 4. Check RLS policies on assessments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'assessments';

-- 5. Check if user has access to assessments table
SELECT has_table_privilege('ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9', 'assessments', 'SELECT');

-- 6. Create a test assessment to verify functionality
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
    is_active,
    status
) VALUES (
    'Test Assessment - Debug',
    'This is a test assessment to verify database functionality',
    'Quiz',
    (SELECT id FROM courses LIMIT 1),
    'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9',
    'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9',
    30,
    1,
    60,
    true,
    'draft'
) RETURNING *;

-- 7. Check if the test assessment was created
SELECT * FROM assessments WHERE title = 'Test Assessment - Debug';

