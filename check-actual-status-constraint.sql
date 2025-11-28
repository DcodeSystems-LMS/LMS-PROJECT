-- Check what status values are actually allowed in the assessments table
-- Run this in Supabase SQL Editor

-- 1. Check the exact constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%status%' 
AND conrelid = 'assessments'::regclass;

-- 2. Check what status values currently exist
SELECT DISTINCT status, COUNT(*) as count
FROM assessments 
GROUP BY status
ORDER BY status;

-- 3. Check if there are any assessments with valid status
SELECT id, title, status, created_at
FROM assessments 
WHERE status IS NOT NULL
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Try to see what the constraint actually allows
-- Common valid values might be: 'draft', 'active', 'inactive', 'published', 'archived'
-- Let's test with some common values

-- 5. Check if we can insert with different status values
-- (This will help us understand what's allowed)
SELECT 'Testing status values...' as test;





