-- Fix start_assessment_attempt RPC Function to Explicitly Generate UUID
-- This fixes the null value in column "id" error

-- Drop existing function
DROP FUNCTION IF EXISTS start_assessment_attempt(UUID, UUID);

-- Recreate function with explicit UUID generation
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
  ORDER BY started_at DESC
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
  IF max_attempts_allowed IS NOT NULL AND current_attempt_count >= max_attempts_allowed THEN
    RAISE EXCEPTION 'Maximum attempts exceeded for this assessment';
  END IF;
  
  -- Create new attempt with explicit UUID generation
  INSERT INTO public.assessment_attempts (
    id,
    student_id,
    assessment_id,
    attempt_number,
    status,
    started_at
  ) VALUES (
    gen_random_uuid(),  -- Explicitly generate UUID
    p_student_id,
    p_assessment_id,
    COALESCE(current_attempt_count, 0) + 1,
    'in-progress',
    NOW()
  ) RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the table structure is correct
-- Add attempt_number column if it doesn't exist
ALTER TABLE public.assessment_attempts 
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;

-- Update existing records that might have NULL attempt_number
UPDATE public.assessment_attempts 
SET attempt_number = 1 
WHERE attempt_number IS NULL;

-- Ensure id column has a default (though we're explicitly generating it now)
-- This is just a safety measure
DO $$
BEGIN
  -- Check if the id column exists and has a default
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'assessment_attempts' 
    AND column_name = 'id'
  ) THEN
    -- Ensure the default is set (this won't change existing values)
    ALTER TABLE public.assessment_attempts 
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
  END IF;
END $$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION start_assessment_attempt(UUID, UUID) TO authenticated;

-- Verify the function exists
SELECT 'Function start_assessment_attempt updated successfully' as status;

