-- Complete Database Setup for DCode Learning Platform
-- Run this in your Supabase SQL editor to fix all issues

-- ============================================
-- 1. FIX COURSE MATERIALS TABLE
-- ============================================

-- Drop and recreate course_materials table to fix schema cache issues
DROP TABLE IF EXISTS public.course_materials CASCADE;

CREATE TABLE public.course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_extension TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_course_materials_course_id ON public.course_materials(course_id);
CREATE INDEX idx_course_materials_lesson_id ON public.course_materials(lesson_id);
CREATE INDEX idx_course_materials_uploaded_by ON public.course_materials(uploaded_by);
CREATE INDEX idx_course_materials_category ON public.course_materials(category);

-- Enable RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view materials for enrolled courses" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE student_id = auth.uid() 
      AND course_id = course_materials.course_id
    )
  );

CREATE POLICY "Mentors can view materials for their courses" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can insert materials for their courses" ON public.course_materials
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can update materials for their courses" ON public.course_materials
  FOR UPDATE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Mentors can delete materials for their courses" ON public.course_materials
  FOR DELETE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all materials" ON public.course_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create download count function
CREATE OR REPLACE FUNCTION increment_material_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.course_materials 
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_material_download_count(UUID) TO authenticated;

-- ============================================
-- 2. CREATE SAMPLE ENROLLMENTS
-- ============================================

-- Clear existing enrollments
DELETE FROM public.enrollments;

-- Create sample enrollments
INSERT INTO public.enrollments (student_id, course_id, progress)
SELECT 
  s.id as student_id,
  c.id as course_id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY s.id) = 1 THEN 25
    WHEN ROW_NUMBER() OVER (ORDER BY s.id) = 2 THEN 50
    WHEN ROW_NUMBER() OVER (ORDER BY s.id) = 3 THEN 75
    ELSE 10
  END as progress
FROM public.profiles s
CROSS JOIN public.courses c
WHERE s.role = 'student' 
  AND c.id = (SELECT id FROM public.courses LIMIT 1)
LIMIT 3;

-- Enroll students in second course if it exists
INSERT INTO public.enrollments (student_id, course_id, progress)
SELECT 
  s.id as student_id,
  c.id as course_id,
  15 as progress
FROM public.profiles s, public.courses c
WHERE s.role = 'student' 
  AND c.id = (SELECT id FROM public.courses OFFSET 1 LIMIT 1)
LIMIT 2;

-- ============================================
-- 3. CREATE SAMPLE COURSE MATERIALS
-- ============================================

-- Insert sample materials
INSERT INTO public.course_materials (
  course_id, title, description, file_name, file_path, file_size, file_type, file_extension, category, uploaded_by
) VALUES 
  (
    (SELECT id FROM public.courses LIMIT 1),
    'CSS Flexbox Lecture Slides',
    'Complete presentation slides for CSS Flexbox lesson',
    'css-flexbox-slides.pdf',
    'materials/css-flexbox-slides.pdf',
    2516582,
    'application/pdf',
    'pdf',
    'slides',
    (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1)
  ),
  (
    (SELECT id FROM public.courses LIMIT 1),
    'HTML Basics Handout',
    'Reference guide for HTML fundamentals',
    'html-basics-handout.pdf',
    'materials/html-basics-handout.pdf',
    1024000,
    'application/pdf',
    'pdf',
    'handout',
    (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1)
  ),
  (
    (SELECT id FROM public.courses LIMIT 1),
    'JavaScript Exercise Files',
    'Practice exercises for JavaScript fundamentals',
    'js-exercises.zip',
    'materials/js-exercises.zip',
    512000,
    'application/zip',
    'zip',
    'code',
    (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1)
  );

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Show what we created
SELECT '=== SETUP COMPLETE ===' as status;

SELECT 'Courses:' as info;
SELECT id, title, instructor_id FROM public.courses;

SELECT 'Students:' as info;
SELECT id, name, email, role FROM public.profiles WHERE role = 'student';

SELECT 'Enrollments:' as info;
SELECT 
  e.id,
  s.name as student_name,
  c.title as course_title,
  e.progress,
  e.enrolled_at
FROM public.enrollments e
JOIN public.profiles s ON e.student_id = s.id
JOIN public.courses c ON e.course_id = c.id;

SELECT 'Course Materials:' as info;
SELECT 
  cm.id,
  cm.title,
  cm.file_name,
  cm.category,
  c.title as course_title,
  p.name as uploaded_by
FROM public.course_materials cm
JOIN public.courses c ON cm.course_id = c.id
JOIN public.profiles p ON cm.uploaded_by = p.id;

-- Final counts
SELECT 'Final Counts:' as info;
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM public.enrollments
UNION ALL
SELECT 'course_materials', COUNT(*) FROM public.course_materials
UNION ALL
SELECT 'assessments', COUNT(*) FROM public.assessments;
