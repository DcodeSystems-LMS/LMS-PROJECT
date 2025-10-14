-- Fix Auto-Creation Issue
-- This script helps identify and fix the auto-creation problem

-- 1. Check if there are any auto-created assessments
SELECT 
    id,
    title,
    description,
    instructor_id,
    created_at,
    CASE 
        WHEN title LIKE '%Auto Created%' THEN 'AUTO_CREATED'
        ELSE 'MANUAL'
    END as creation_type
FROM public.assessments 
WHERE title LIKE '%Auto Created%' OR title LIKE '%Test Assessment%'
ORDER BY created_at DESC;

-- 2. Delete all auto-created assessments
DELETE FROM public.assessments 
WHERE title LIKE '%Auto Created%' OR title LIKE '%Test Assessment%';

-- 3. Check for any remaining auto-created assessments
SELECT COUNT(*) as remaining_auto_assessments
FROM public.assessments 
WHERE title LIKE '%Auto Created%' OR title LIKE '%Test Assessment%';

-- 4. Show current assessments
SELECT 
    id,
    title,
    instructor_id,
    created_at
FROM public.assessments 
ORDER BY created_at DESC;
