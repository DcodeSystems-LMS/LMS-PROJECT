-- Remove Orphaned Materials (Quick Fix)
-- Run this in your Supabase SQL editor to remove materials that don't have files in storage

-- WARNING: This will delete the database records for materials
-- Only run this if you're sure the files don't exist in storage

-- Option 1: Remove all materials for the HTML course
DELETE FROM public.course_materials 
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b';

-- Option 2: Remove specific materials by ID (safer approach)
-- Uncomment the lines below and replace with actual material IDs if you want to be more selective

-- DELETE FROM public.course_materials 
-- WHERE id IN (
--     '586b2379-20a2-4ba7-a568-e533c422a165',  -- HTML Basics Handout
--     'b46d1b3f-45e9-4c07-a797-6adeded19e86',  -- CSS Flexbox Guide
--     'ca09f5d1-66c1-4fb1-a90a-0c91c73c831b'   -- JavaScript Fundamentals
-- );

-- Check if materials were removed
SELECT COUNT(*) as remaining_materials 
FROM public.course_materials 
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b';
