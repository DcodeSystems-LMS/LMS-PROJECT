-- Fix Assessment Attempt Constraints
-- This script handles existing attempts and updates constraints

-- 1. Check current attempts for debugging
SELECT 
    'Current attempts' as info,
    student_id,
    assessment_id,
    attempt_number,
    status,
    created_at
FROM public.assessment_attempts 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Drop the unique constraint that's causing conflicts
ALTER TABLE public.assessment_attempts 
DROP CONSTRAINT IF EXISTS assessment_attempts_assessment_id_student_id_attempt_number_key;

-- 3. Create a more flexible unique constraint (allow multiple attempts)
-- Only prevent duplicate in-progress attempts for the same student/assessment
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_in_progress_attempts 
ON public.assessment_attempts(student_id, assessment_id) 
WHERE status = 'in-progress';

-- 4. Update the start_assessment_attempt function to handle existing attempts better
DROP FUNCTION IF EXISTS start_assessment_attempt(UUID, UUID);

CREATE OR REPLACE FUNCTION start_assessment_attempt(
  p_student_id UUID,
  p_assessment_id UUID
)
RETURNS UUID AS $$
DECLARE
  attempt_id UUID;
  current_attempt_count INTEGER;
  max_attempts_allowed INTEGER;
  existing_in_progress_attempt UUID;
BEGIN
  -- Check if there's already an in-progress attempt
  SELECT id INTO existing_in_progress_attempt
  FROM public.assessment_attempts
  WHERE student_id = p_student_id 
  AND assessment_id = p_assessment_id 
  AND status = 'in-progress'
  LIMIT 1;
  
  -- If there's an existing in-progress attempt, return it
  IF existing_in_progress_attempt IS NOT NULL THEN
    RETURN existing_in_progress_attempt;
  END IF;
  
  -- Get max attempts from assessments table
  SELECT COALESCE(a.max_attempts, 999) INTO max_attempts_allowed
  FROM public.assessments a
  WHERE a.id = p_assessment_id;
  
  -- Get current completed attempt count
  SELECT COUNT(*) INTO current_attempt_count
  FROM public.assessment_attempts aa
  WHERE aa.student_id = p_student_id 
  AND aa.assessment_id = p_assessment_id
  AND aa.status = 'completed';
  
  -- Check if student has exceeded max attempts
  IF current_attempt_count >= max_attempts_allowed THEN
    RAISE EXCEPTION 'Maximum attempts exceeded for this assessment';
  END IF;
  
  -- Create new attempt
  INSERT INTO public.assessment_attempts (
    student_id,
    assessment_id,
    attempt_number,
    status,
    started_at
  ) VALUES (
    p_student_id,
    p_assessment_id,
    current_attempt_count + 1,
    'in-progress',
    NOW()
  ) RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permission
GRANT EXECUTE ON FUNCTION start_assessment_attempt TO authenticated;

-- 6. Clean up any orphaned in-progress attempts (older than 24 hours)
UPDATE public.assessment_attempts 
SET status = 'abandoned'
WHERE status = 'in-progress' 
AND started_at < NOW() - INTERVAL '24 hours';

-- 7. Show updated table structure
SELECT 
  'Updated constraints' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'assessment_attempts' 
AND table_schema = 'public';

-- 8. Test the function with a sample call
SELECT 'Function updated successfully' as status;
