-- Test Assessment Creation and Database Fields
-- This script helps verify if assessment fields are being saved correctly

-- First, let's check what columns exist in the assessments table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;

-- Check if we have any existing assessments
SELECT COUNT(*) as total_assessments FROM assessments;

-- Let's see the structure of existing assessments
SELECT 
    id,
    title,
    description,
    course_id,
    instructor_id,
    mentor_id,
    type,
    status,
    time_limit,
    max_attempts,
    passing_score,
    created_at
FROM assessments 
LIMIT 5;

-- Test creating a new assessment to see what fields are available
-- (This is just a test - we'll rollback)
BEGIN;

-- Insert a test assessment
INSERT INTO assessments (
    title,
    description,
    course_id,
    instructor_id,
    mentor_id,
    type,
    status,
    time_limit,
    max_attempts,
    passing_score
) VALUES (
    'Test Assessment - Field Check',
    'This is a test to check if all fields are being saved',
    (SELECT id FROM courses LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'quiz',
    'draft',
    30,
    3,
    70
);

-- Check what was actually saved
SELECT 
    id,
    title,
    description,
    course_id,
    instructor_id,
    mentor_id,
    type,
    status,
    time_limit,
    max_attempts,
    passing_score,
    created_at,
    updated_at
FROM assessments 
WHERE title = 'Test Assessment - Field Check';

-- Rollback the test
ROLLBACK;

-- Check if questions table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questions' 
ORDER BY ordinal_position;

-- Check if assessment_attempts table exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessment_attempts' 
ORDER BY ordinal_position;

-- Check if question_responses table exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'question_responses' 
ORDER BY ordinal_position;