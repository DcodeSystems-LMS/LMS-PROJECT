-- Fix RLS Policies for Learning Paths - Simple Version
-- This matches the pattern used for courses table
-- Run this in your Supabase SQL Editor

-- ============================================
-- Drop existing policies
-- ============================================
DROP POLICY IF EXISTS "Mentors can view their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Mentors can insert their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Mentors can update their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Mentors can delete their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Students can view all learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Anyone can view learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Admins can manage all learning paths" ON public.learning_paths;

-- ============================================
-- Create simple, working RLS policies for learning_paths
-- ============================================

-- Anyone can view learning paths (for browsing)
CREATE POLICY "Anyone can view learning paths"
  ON public.learning_paths FOR SELECT
  USING (true);

-- Mentors can create learning paths (same pattern as courses)
CREATE POLICY "Mentors can create learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
    AND mentor_id = auth.uid()
  );

-- Mentors can update their own learning paths
CREATE POLICY "Mentors can update their own learning paths"
  ON public.learning_paths FOR UPDATE
  USING (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
  );

-- Mentors can delete their own learning paths
CREATE POLICY "Mentors can delete their own learning paths"
  ON public.learning_paths FOR DELETE
  USING (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
  );

-- Admins can manage all learning paths
CREATE POLICY "Admins can manage all learning paths"
  ON public.learning_paths FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- Fix policies for related tables (simplified)
-- ============================================

-- Drop existing policies for units
DROP POLICY IF EXISTS "Users can view units of accessible learning paths" ON public.learning_path_units;
DROP POLICY IF EXISTS "Mentors can manage units of their learning paths" ON public.learning_path_units;

-- Anyone can view units
CREATE POLICY "Anyone can view units"
  ON public.learning_path_units FOR SELECT
  USING (true);

-- Mentors can manage units (simplified)
CREATE POLICY "Mentors can manage units"
  ON public.learning_path_units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_units.learning_path_id
      AND learning_paths.mentor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('mentor', 'admin')
      )
    )
  );

-- Drop existing policies for modules
DROP POLICY IF EXISTS "Users can view modules of accessible units" ON public.learning_path_modules;
DROP POLICY IF EXISTS "Mentors can manage modules of their learning paths" ON public.learning_path_modules;

-- Anyone can view modules
CREATE POLICY "Anyone can view modules"
  ON public.learning_path_modules FOR SELECT
  USING (true);

-- Mentors can manage modules (simplified)
CREATE POLICY "Mentors can manage modules"
  ON public.learning_path_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_modules.unit_id
      AND learning_paths.mentor_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('mentor', 'admin')
      )
    )
  );

-- Drop existing policies for tests
DROP POLICY IF EXISTS "Users can view tests of accessible learning paths" ON public.learning_path_tests;
DROP POLICY IF EXISTS "Mentors can manage tests of their learning paths" ON public.learning_path_tests;

-- Anyone can view tests
CREATE POLICY "Anyone can view tests"
  ON public.learning_path_tests FOR SELECT
  USING (true);

-- Mentors can manage tests (simplified)
CREATE POLICY "Mentors can manage tests"
  ON public.learning_path_tests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    ) AND
    (
      (test_type = 'final' AND EXISTS (
        SELECT 1 FROM public.learning_paths
        WHERE learning_paths.id = learning_path_tests.learning_path_id
        AND learning_paths.mentor_id = auth.uid()
      )) OR
      (test_type = 'unit' AND EXISTS (
        SELECT 1 FROM public.learning_path_units
        JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
        WHERE learning_path_units.id = learning_path_tests.unit_id
        AND learning_paths.mentor_id = auth.uid()
      ))
    )
  );

-- Drop existing policies for questions
DROP POLICY IF EXISTS "Users can view questions of accessible tests" ON public.learning_path_questions;
DROP POLICY IF EXISTS "Mentors can manage questions of their tests" ON public.learning_path_questions;

-- Anyone can view questions
CREATE POLICY "Anyone can view questions"
  ON public.learning_path_questions FOR SELECT
  USING (true);

-- Mentors can manage questions (simplified)
CREATE POLICY "Mentors can manage questions"
  ON public.learning_path_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    ) AND
    EXISTS (
      SELECT 1 FROM public.learning_path_tests
      LEFT JOIN public.learning_paths ON learning_paths.id = learning_path_tests.learning_path_id
      LEFT JOIN public.learning_path_units ON learning_path_units.id = learning_path_tests.unit_id
      WHERE learning_path_tests.id = learning_path_questions.test_id
      AND (
        (learning_path_tests.test_type = 'final' AND learning_paths.mentor_id = auth.uid()) OR
        (learning_path_tests.test_type = 'unit' AND EXISTS (
          SELECT 1 FROM public.learning_paths lp
          WHERE lp.id = learning_path_units.learning_path_id
          AND lp.mentor_id = auth.uid()
        ))
      )
    )
  );

-- ============================================
-- Verify policies
-- ============================================
-- Run this to verify:
-- SELECT tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename LIKE 'learning_path%'
-- ORDER BY tablename, policyname;

