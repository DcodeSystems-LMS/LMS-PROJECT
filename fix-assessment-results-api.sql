-- Fix Assessment Results API 406 Error
-- This script ensures the assessment_results table exists and has proper structure

-- 1. Create assessment_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_points > 0 THEN (score::DECIMAL / total_points::DECIMAL) * 100
      ELSE 0
    END
  ) STORED,
  answers JSONB,
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination
  UNIQUE(student_id, assessment_id, attempt_id)
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_student_id ON public.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_attempt_id ON public.assessment_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_completed_at ON public.assessment_results(completed_at);

-- 3. Enable RLS
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own results" ON public.assessment_results;
DROP POLICY IF EXISTS "Students can create results" ON public.assessment_results;
DROP POLICY IF EXISTS "Instructors can view results for their assessments" ON public.assessment_results;

-- 5. Create RLS policies
CREATE POLICY "Students can view their own results" ON public.assessment_results
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create results" ON public.assessment_results
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own results" ON public.assessment_results
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Instructors can view results for their assessments" ON public.assessment_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_results.assessment_id 
      AND a.instructor_id = auth.uid()
    )
  );

-- 6. Create function to save assessment results
CREATE OR REPLACE FUNCTION save_assessment_result(
  p_student_id UUID,
  p_assessment_id UUID,
  p_attempt_id UUID DEFAULT NULL,
  p_score INTEGER DEFAULT 0,
  p_total_points INTEGER DEFAULT 0,
  p_answers JSONB DEFAULT NULL,
  p_feedback TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  -- Insert or update the result
  INSERT INTO public.assessment_results (
    student_id,
    assessment_id,
    attempt_id,
    score,
    total_points,
    answers,
    feedback
  ) VALUES (
    p_student_id,
    p_assessment_id,
    p_attempt_id,
    p_score,
    p_total_points,
    p_answers,
    p_feedback
  )
  ON CONFLICT (student_id, assessment_id, attempt_id) 
  DO UPDATE SET
    score = EXCLUDED.score,
    total_points = EXCLUDED.total_points,
    answers = EXCLUDED.answers,
    feedback = EXCLUDED.feedback,
    completed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_assessment_result TO authenticated;

-- 8. Test the table structure
SELECT 
  'assessment_results' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessment_results' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'assessment_results';
