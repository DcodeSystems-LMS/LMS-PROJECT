-- Fix existing assessments with invalid status values
-- Run this in Supabase SQL Editor

-- 1. First, let's see what status values we have
SELECT DISTINCT status, COUNT(*) as count
FROM assessments 
GROUP BY status;

-- 2. Update any 'active' status to 'published'
UPDATE assessments 
SET status = 'published' 
WHERE status = 'active';

-- 3. Update any 'inactive' status to 'draft'  
UPDATE assessments 
SET status = 'draft' 
WHERE status = 'inactive';

-- 4. Check the results
SELECT DISTINCT status, COUNT(*) as count
FROM assessments 
GROUP BY status;

-- 5. Show updated assessments
SELECT id, title, status, created_at
FROM assessments 
ORDER BY created_at DESC 
LIMIT 5;





