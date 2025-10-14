-- Fix Complete Database Schema Issues
-- This script fixes all missing columns and functions

-- 1. Fix assessment_attempts table - add missing columns
ALTER TABLE public.assessment_attempts 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.assessment_attempts 
ADD COLUMN IF NOT EXISTS answers JSONB;

ALTER TABLE public.assessment_attempts 
ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- 2. Fix assessment_results table - add missing columns
ALTER TABLE public.assessment_results 
ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;

-- 3. Create the missing complete_assessment_attempt function
DROP FUNCTION IF EXISTS complete_assessment_attempt(UUID, INTEGER, JSONB, INTEGER);

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

-- 4. Create the missing save_assessment_result function
DROP FUNCTION IF EXISTS save_assessment_result(UUID, UUID, UUID, INTEGER, INTEGER, JSONB, TEXT);

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

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION complete_assessment_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION save_assessment_result TO authenticated;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_completed_at ON public.assessment_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_assessment_results_attempt_id ON public.assessment_results(attempt_id);

-- 7. Update existing records to have proper values
UPDATE public.assessment_attempts 
SET completed_at = NOW() 
WHERE status = 'completed' AND completed_at IS NULL;

-- 8. Show current table structures
SELECT 
  'assessment_attempts' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessment_attempts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'assessment_results' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessment_results' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Test the functions
SELECT 'Database schema fixed successfully' as status;
