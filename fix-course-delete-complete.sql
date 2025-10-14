-- Complete Fix for Course Delete Issues
-- This script addresses all potential issues preventing course deletion
-- Run this in your Supabase SQL editor

-- ============================================
-- 1. ADD MISSING DELETE POLICY FOR COURSES
-- ============================================

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Course instructors can delete their own courses" ON public.courses;

-- Create comprehensive delete policy for courses
CREATE POLICY "Course instructors can delete their own courses" ON public.courses
  FOR DELETE USING (
    instructor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. VERIFY CASCADE CONSTRAINTS
-- ============================================

-- Check that all related tables have proper CASCADE constraints
-- This query will show all foreign key constraints referencing courses
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'courses'
  AND tc.table_schema = 'public';

-- ============================================
-- 3. VERIFY RLS POLICIES
-- ============================================

-- Check all RLS policies on courses table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'courses' 
AND schemaname = 'public'
ORDER BY cmd, policyname;

-- ============================================
-- 4. TEST COURSE DELETION (OPTIONAL)
-- ============================================

-- Uncomment the following lines to test deletion of a specific course
-- Replace 'COURSE_ID_HERE' with an actual course ID for testing
-- 
-- DELETE FROM public.courses WHERE id = 'COURSE_ID_HERE';
-- 
-- If this works, the issue was the missing RLS policy.
-- If this fails, there might be other constraints preventing deletion.

-- ============================================
-- 5. CHECK FOR ORPHANED DATA
-- ============================================

-- Check for any data that might prevent deletion
-- (This is just for debugging - don't run in production)

-- Check if there are any courses with enrollments
SELECT 
  c.id as course_id,
  c.title,
  COUNT(e.id) as enrollment_count
FROM public.courses c
LEFT JOIN public.enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title
HAVING COUNT(e.id) > 0;

-- Check if there are any courses with assessments
SELECT 
  c.id as course_id,
  c.title,
  COUNT(a.id) as assessment_count
FROM public.courses c
LEFT JOIN public.assessments a ON c.id = a.course_id
GROUP BY c.id, c.title
HAVING COUNT(a.id) > 0;

-- Check if there are any courses with discussions
SELECT 
  c.id as course_id,
  c.title,
  COUNT(d.id) as discussion_count
FROM public.courses c
LEFT JOIN public.discussions d ON c.id = d.course_id
GROUP BY c.id, c.title
HAVING COUNT(d.id) > 0;

-- Check if there are any courses with materials
SELECT 
  c.id as course_id,
  c.title,
  COUNT(cm.id) as material_count
FROM public.courses c
LEFT JOIN public.course_materials cm ON c.id = cm.course_id
GROUP BY c.id, c.title
HAVING COUNT(cm.id) > 0;
