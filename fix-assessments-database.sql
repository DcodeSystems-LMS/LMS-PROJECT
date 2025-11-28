-- Fix assessments database issue
-- Run this in Supabase SQL Editor

-- 1. Check if assessments table exists and has data
SELECT 
    'assessments' as table_name,
    COUNT(*) as row_count
FROM assessments;

-- 2. Check if there are any assessments for the specific user
SELECT 
    id, title, mentor_id, instructor_id, created_at
FROM assessments 
WHERE mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9'
   OR instructor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9';

-- 3. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;

-- 4. Create a test assessment if none exists
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
    status,
    created_at,
    updated_at
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
    true,
    'draft',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9'
);

-- 5. Verify the test assessment was created
SELECT 
    id, title, mentor_id, instructor_id, created_at
FROM assessments 
WHERE mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9';

-- 6. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'assessments';

-- 7. If RLS is blocking, temporarily disable it for testing
-- ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;

-- 8. Create RLS policy if missing
CREATE POLICY "Users can view their own assessments" ON assessments
    FOR SELECT USING (mentor_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Users can insert their own assessments" ON assessments
    FOR INSERT WITH CHECK (mentor_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Users can update their own assessments" ON assessments
    FOR UPDATE USING (mentor_id = auth.uid() OR instructor_id = auth.uid());

CREATE POLICY "Users can delete their own assessments" ON assessments
    FOR DELETE USING (mentor_id = auth.uid() OR instructor_id = auth.uid());

