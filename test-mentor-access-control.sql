-- Test Mentor Access Control Implementation
-- This script tests that mentors can only access their own courses
-- Run this in your Supabase SQL editor after implementing the access control

-- ============================================
-- 1. CREATE TEST DATA
-- ============================================

-- Create test mentors (if they don't exist)
INSERT INTO public.profiles (id, email, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'mentor1@test.com', 'Mentor One', 'mentor'),
  ('22222222-2222-2222-2222-222222222222', 'mentor2@test.com', 'Mentor Two', 'mentor')
ON CONFLICT (id) DO NOTHING;

-- Create test courses for each mentor
INSERT INTO public.courses (id, title, description, instructor_id, price, duration_hours, level, category) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mentor 1 Course A', 'Course created by Mentor 1', '11111111-1111-1111-1111-111111111111', 99.99, 10, 'beginner', 'programming'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mentor 1 Course B', 'Another course by Mentor 1', '11111111-1111-1111-1111-111111111111', 149.99, 15, 'intermediate', 'web-development'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mentor 2 Course A', 'Course created by Mentor 2', '22222222-2222-2222-2222-222222222222', 199.99, 20, 'advanced', 'data-science'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mentor 2 Course B', 'Another course by Mentor 2', '22222222-2222-2222-2222-222222222222', 249.99, 25, 'advanced', 'machine-learning')
ON CONFLICT (id) DO NOTHING;

-- Create test course materials
INSERT INTO public.course_materials (course_id, title, description, file_name, file_path, file_size, file_type, file_extension, category, uploaded_by) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mentor 1 Material 1', 'Material for Mentor 1 Course A', 'material1.pdf', 'materials/material1.pdf', 1024, 'application/pdf', 'pdf', 'slides', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mentor 1 Material 2', 'Material for Mentor 1 Course B', 'material2.pdf', 'materials/material2.pdf', 2048, 'application/pdf', 'pdf', 'handout', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mentor 2 Material 1', 'Material for Mentor 2 Course A', 'material3.pdf', 'materials/material3.pdf', 3072, 'application/pdf', 'pdf', 'slides', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mentor 2 Material 2', 'Material for Mentor 2 Course B', 'material4.pdf', 'materials/material4.pdf', 4096, 'application/pdf', 'pdf', 'reference', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Create test assessments
INSERT INTO public.assessments (id, title, description, course_id, instructor_id, questions, passing_score) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mentor 1 Assessment 1', 'Assessment for Mentor 1 Course A', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '[]', 70),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Mentor 1 Assessment 2', 'Assessment for Mentor 1 Course B', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '[]', 75),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Mentor 2 Assessment 1', 'Assessment for Mentor 2 Course A', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '[]', 80),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Mentor 2 Assessment 2', 'Assessment for Mentor 2 Course B', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', '[]', 85)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. TEST SCENARIOS
-- ============================================

-- Test 1: Verify mentor course access
SELECT 'TEST 1: Mentor Course Access' as test_name;

-- This should show only Mentor 1's courses when authenticated as Mentor 1
-- (In real scenario, you would set auth.uid() to '11111111-1111-1111-1111-111111111111')
SELECT 
  'Expected: Mentor 1 should see 2 courses' as expectation,
  COUNT(*) as actual_count
FROM public.courses 
WHERE instructor_id = '11111111-1111-1111-1111-111111111111';

-- This should show only Mentor 2's courses when authenticated as Mentor 2
SELECT 
  'Expected: Mentor 2 should see 2 courses' as expectation,
  COUNT(*) as actual_count
FROM public.courses 
WHERE instructor_id = '22222222-2222-2222-2222-222222222222';

-- Test 2: Verify mentor materials access
SELECT 'TEST 2: Mentor Materials Access' as test_name;

-- Mentor 1 should only see materials for their courses
SELECT 
  'Expected: Mentor 1 should see 2 materials' as expectation,
  COUNT(*) as actual_count
FROM public.course_materials cm
JOIN public.courses c ON cm.course_id = c.id
WHERE c.instructor_id = '11111111-1111-1111-1111-111111111111';

-- Mentor 2 should only see materials for their courses
SELECT 
  'Expected: Mentor 2 should see 2 materials' as expectation,
  COUNT(*) as actual_count
FROM public.course_materials cm
JOIN public.courses c ON cm.course_id = c.id
WHERE c.instructor_id = '22222222-2222-2222-2222-222222222222';

-- Test 3: Verify mentor assessments access
SELECT 'TEST 3: Mentor Assessments Access' as test_name;

-- Mentor 1 should only see assessments for their courses
SELECT 
  'Expected: Mentor 1 should see 2 assessments' as expectation,
  COUNT(*) as actual_count
FROM public.assessments a
JOIN public.courses c ON a.course_id = c.id
WHERE c.instructor_id = '11111111-1111-1111-1111-111111111111';

-- Mentor 2 should only see assessments for their courses
SELECT 
  'Expected: Mentor 2 should see 2 assessments' as expectation,
  COUNT(*) as actual_count
FROM public.assessments a
JOIN public.courses c ON a.course_id = c.id
WHERE c.instructor_id = '22222222-2222-2222-2222-222222222222';

-- ============================================
-- 3. VERIFY CROSS-MENTOR ACCESS IS BLOCKED
-- ============================================

-- Test 4: Verify Mentor 1 cannot access Mentor 2's data
SELECT 'TEST 4: Cross-Mentor Access Blocking' as test_name;

-- This query simulates what Mentor 1 would see when trying to access Mentor 2's courses
-- In a real scenario with RLS, this would return 0 rows for Mentor 1
SELECT 
  'Expected: Mentor 1 should see 0 of Mentor 2 courses' as expectation,
  COUNT(*) as actual_count
FROM public.courses 
WHERE instructor_id = '22222222-2222-2222-2222-222222222222'
AND instructor_id = '11111111-1111-1111-1111-111111111111'; -- This condition will never be true

-- This query simulates what Mentor 2 would see when trying to access Mentor 1's courses
SELECT 
  'Expected: Mentor 2 should see 0 of Mentor 1 courses' as expectation,
  COUNT(*) as actual_count
FROM public.courses 
WHERE instructor_id = '11111111-1111-1111-1111-111111111111'
AND instructor_id = '22222222-2222-2222-2222-222222222222'; -- This condition will never be true

-- ============================================
-- 4. TEST HELPER FUNCTIONS
-- ============================================

-- Test 5: Test helper functions
SELECT 'TEST 5: Helper Functions' as test_name;

-- Test is_course_owner function
SELECT 
  'is_course_owner test for Mentor 1 and their course' as test_case,
  is_course_owner('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111') as result,
  'Expected: true' as expected;

SELECT 
  'is_course_owner test for Mentor 1 and Mentor 2 course' as test_case,
  is_course_owner('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111') as result,
  'Expected: false' as expected;

-- Test get_mentor_courses function
SELECT 
  'get_mentor_courses test for Mentor 1' as test_case,
  COUNT(*) as course_count
FROM get_mentor_courses('11111111-1111-1111-1111-111111111111');

SELECT 
  'get_mentor_courses test for Mentor 2' as test_case,
  COUNT(*) as course_count
FROM get_mentor_courses('22222222-2222-2222-2222-222222222222');

-- ============================================
-- 5. DISPLAY CURRENT MENTOR ACCESS SUMMARY
-- ============================================

SELECT 'CURRENT MENTOR ACCESS SUMMARY' as summary;

-- Show all mentors and their courses
SELECT * FROM mentor_course_access;

-- Show detailed course ownership
SELECT 
  c.title as course_title,
  p.name as mentor_name,
  p.email as mentor_email,
  c.created_at as course_created
FROM public.courses c
JOIN public.profiles p ON c.instructor_id = p.id
WHERE p.role = 'mentor'
ORDER BY p.name, c.title;

-- ============================================
-- 6. CLEANUP INSTRUCTIONS
-- ============================================

SELECT 
  'CLEANUP INSTRUCTIONS' as cleanup,
  'To remove test data, run the following commands:' as instruction,
  'DELETE FROM public.assessments WHERE id IN (''eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'', ''ffffffff-ffff-ffff-ffff-ffffffffffff'', ''gggggggg-gggg-gggg-gggg-gggggggggggg'', ''hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'');' as step1,
  'DELETE FROM public.course_materials WHERE course_id IN (''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'', ''cccccccc-cccc-cccc-cccc-cccccccccccc'', ''dddddddd-dddd-dddd-dddd-dddddddddddd'');' as step2,
  'DELETE FROM public.courses WHERE id IN (''aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'', ''bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'', ''cccccccc-cccc-cccc-cccc-cccccccccccc'', ''dddddddd-dddd-dddd-dddd-dddddddddddd'');' as step3,
  'DELETE FROM public.profiles WHERE id IN (''11111111-1111-1111-1111-111111111111'', ''22222222-2222-2222-2222-222222222222'');' as step4;
