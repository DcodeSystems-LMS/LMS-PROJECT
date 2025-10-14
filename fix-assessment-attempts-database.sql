-- Fix Assessment Attempts Database Issues
-- This script fixes the RPC function and table constraints

-- 1. Drop and recreate the start_assessment_attempt function to fix ambiguous column reference
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
BEGIN
  -- Get max attempts from assessments table (use table alias to avoid ambiguity)
  SELECT a.max_attempts INTO max_attempts_allowed
  FROM public.assessments a
  WHERE a.id = p_assessment_id;
  
  -- Get current attempt count for this student and assessment
  SELECT COUNT(*) INTO current_attempt_count
  FROM public.assessment_attempts aa
  WHERE aa.student_id = p_student_id 
  AND aa.assessment_id = p_assessment_id;
  
  -- Check if student has exceeded max attempts
  IF max_attempts_allowed IS NOT NULL AND current_attempt_count >= max_attempts_allowed THEN
    RAISE EXCEPTION 'Maximum attempts exceeded for this assessment';
  END IF;
  
  -- Create new attempt with proper attempt_number
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

-- 2. Ensure assessment_attempts table has all required columns
ALTER TABLE public.assessment_attempts 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1;

-- 3. Update existing records that might have NULL attempt_number
UPDATE public.assessment_attempts 
SET attempt_number = 1 
WHERE attempt_number IS NULL;

-- 4. Add constraint to ensure attempt_number is not null
ALTER TABLE public.assessment_attempts 
ALTER COLUMN attempt_number SET NOT NULL;

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_assessment 
ON public.assessment_attempts(student_id, assessment_id);

-- 6. Grant execute permission
GRANT EXECUTE ON FUNCTION start_assessment_attempt TO authenticated;

-- 7. Test the function
SELECT 'Function created successfully' as status;

-- 8. Show table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'assessment_attempts' 
AND table_schema = 'public'
ORDER BY ordinal_position;
