-- Complete Database Fix - Address All Missing Columns
-- This script ensures all required columns exist in both tables

-- 1. Add ALL missing columns to assessment_attempts
ALTER TABLE public.assessment_attempts
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.assessment_attempts
ADD COLUMN IF NOT EXISTS answers JSONB;

ALTER TABLE public.assessment_attempts
ADD COLUMN IF NOT EXISTS time_spent INTEGER;

ALTER TABLE public.assessment_attempts
ADD COLUMN IF NOT EXISTS score INTEGER;

ALTER TABLE public.assessment_attempts
ADD COLUMN IF NOT EXISTS total_points INTEGER;

ALTER TABLE public.assessment_attempts
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- 2. Add ALL missing columns to assessment_results
ALTER TABLE public.assessment_results
ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;

ALTER TABLE public.assessment_results
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

ALTER TABLE public.assessment_results
ADD COLUMN IF NOT EXISTS answers JSONB;

ALTER TABLE public.assessment_results
ADD COLUMN IF NOT EXISTS feedback TEXT;

ALTER TABLE public.assessment_results
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.assessment_results
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Drop existing functions first (if they exist)
DROP FUNCTION IF EXISTS complete_assessment_attempt(UUID, INTEGER, JSONB, INTEGER);
DROP FUNCTION IF EXISTS save_assessment_result(UUID, UUID, UUID, INTEGER, INTEGER, JSONB, TEXT);

-- 4. Create the complete_assessment_attempt function
CREATE OR REPLACE FUNCTION complete_assessment_attempt(
  p_attempt_id UUID,
  p_score INTEGER,
  p_answers JSONB,
  p_time_spent INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.assessment_attempts
  SET
    score = p_score,
    answers = p_answers,
    time_spent = p_time_spent,
    completed_at = NOW(),
    status = 'completed'
  WHERE id = p_attempt_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the save_assessment_result function
CREATE OR REPLACE FUNCTION save_assessment_result(
  p_student_id UUID,
  p_assessment_id UUID,
  p_attempt_id UUID DEFAULT NULL,
  p_score INTEGER DEFAULT 0,
  p_total_points INTEGER DEFAULT 0,
  p_answers JSONB DEFAULT NULL,
  p_feedback TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO public.assessment_results (
    student_id,
    assessment_id,
    attempt_id,
    score,
    total_points,
    answers,
    feedback,
    completed_at
  ) VALUES (
    p_student_id,
    p_assessment_id,
    p_attempt_id,
    p_score,
    p_total_points,
    p_answers,
    p_feedback,
    NOW()
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

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION complete_assessment_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION save_assessment_result TO authenticated;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_completed_at ON public.assessment_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_assessment_results_attempt_id ON public.assessment_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_completed_at ON public.assessment_results(completed_at);

-- 8. Show success message
SELECT 'Complete database schema fixed successfully! All assessment functions should now work.' as status;
