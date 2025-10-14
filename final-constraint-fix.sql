-- Final Constraint Fix - Add Unique Constraint for ON CONFLICT
-- This script adds the missing unique constraint for assessment_results

-- 1. Add unique constraint for ON CONFLICT to work
ALTER TABLE public.assessment_results
ADD CONSTRAINT unique_student_assessment_attempt 
UNIQUE (student_id, assessment_id, attempt_id);

-- 2. Update the save_assessment_result function to handle the constraint properly
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
  -- First try to update existing record
  UPDATE public.assessment_results
  SET
    score = p_score,
    total_points = p_total_points,
    answers = p_answers,
    feedback = p_feedback,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE student_id = p_student_id
    AND assessment_id = p_assessment_id
    AND attempt_id = p_attempt_id
  RETURNING id INTO result_id;
  
  -- If no record was updated, insert a new one
  IF result_id IS NULL THEN
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
    RETURNING id INTO result_id;
  END IF;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION save_assessment_result TO authenticated;

-- 4. Show success message
SELECT 'Final constraint fix applied successfully! All assessment functions should now work.' as status;
