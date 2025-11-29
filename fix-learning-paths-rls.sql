-- Fix RLS Policies for Learning Paths Tables
-- Run this in your Supabase SQL Editor to fix the 401/RLS errors

-- ============================================
-- 1. Enable RLS on all learning path tables
-- ============================================
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_questions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Drop existing policies (if any)
-- ============================================
DROP POLICY IF EXISTS "Mentors can view their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Mentors can insert their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Mentors can update their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Mentors can delete their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Students can view all learning paths" ON public.learning_paths;

-- Drop unit policies
DROP POLICY IF EXISTS "Users can view units of accessible learning paths" ON public.learning_path_units;
DROP POLICY IF EXISTS "Mentors can manage units of their learning paths" ON public.learning_path_units;

-- Drop module policies
DROP POLICY IF EXISTS "Users can view modules of accessible units" ON public.learning_path_modules;
DROP POLICY IF EXISTS "Mentors can manage modules of their learning paths" ON public.learning_path_modules;

-- Drop test policies
DROP POLICY IF EXISTS "Users can view tests of accessible learning paths" ON public.learning_path_tests;
DROP POLICY IF EXISTS "Mentors can manage tests of their learning paths" ON public.learning_path_tests;

-- Drop question policies
DROP POLICY IF EXISTS "Users can view questions of accessible tests" ON public.learning_path_questions;
DROP POLICY IF EXISTS "Mentors can manage questions of their tests" ON public.learning_path_questions;

-- ============================================
-- 3. Create RLS Policies for learning_paths
-- ============================================

-- Anyone can view learning paths (for students to browse)
CREATE POLICY "Anyone can view learning paths"
  ON public.learning_paths FOR SELECT
  USING (true);

-- Mentors can insert their own learning paths
CREATE POLICY "Mentors can insert their own learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (
    auth.uid() = mentor_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
  );

-- Mentors can update their own learning paths
CREATE POLICY "Mentors can update their own learning paths"
  ON public.learning_paths FOR UPDATE
  USING (
    auth.uid() = mentor_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
  )
  WITH CHECK (
    auth.uid() = mentor_id AND
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
    auth.uid() = mentor_id AND
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
-- 4. Create RLS Policies for learning_path_units
-- ============================================

-- Anyone can view units (if they can view the learning path)
CREATE POLICY "Anyone can view units"
  ON public.learning_path_units FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_units.learning_path_id
    )
  );

-- Mentors can manage units of their learning paths
CREATE POLICY "Mentors can manage units of their learning paths"
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
  )
  WITH CHECK (
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

-- ============================================
-- 5. Create RLS Policies for learning_path_modules
-- ============================================

-- Anyone can view modules (if they can view the unit)
CREATE POLICY "Anyone can view modules"
  ON public.learning_path_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_modules.unit_id
    )
  );

-- Mentors can manage modules of their learning paths
CREATE POLICY "Mentors can manage modules of their learning paths"
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
  )
  WITH CHECK (
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

-- ============================================
-- 6. Create RLS Policies for learning_path_tests
-- ============================================

-- Anyone can view tests (if they can view the learning path/unit)
CREATE POLICY "Anyone can view tests"
  ON public.learning_path_tests FOR SELECT
  USING (
    (test_type = 'final' AND EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_tests.learning_path_id
    )) OR
    (test_type = 'unit' AND EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_tests.unit_id
    ))
  );

-- Mentors can manage tests of their learning paths
CREATE POLICY "Mentors can manage tests of their learning paths"
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
  )
  WITH CHECK (
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

-- ============================================
-- 7. Create RLS Policies for learning_path_questions
-- ============================================

-- Anyone can view questions (if they can view the test)
CREATE POLICY "Anyone can view questions"
  ON public.learning_path_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_tests
      WHERE learning_path_tests.id = learning_path_questions.test_id
    )
  );

-- Mentors can manage questions of their tests
CREATE POLICY "Mentors can manage questions of their tests"
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
  )
  WITH CHECK (
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
-- 8. Verify policies were created
-- ============================================
-- Run this query to verify:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename LIKE 'learning_path%'
-- ORDER BY tablename, policyname;

