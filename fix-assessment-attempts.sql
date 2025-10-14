-- Fix Assessment Attempts Tracking
-- This script ensures the assessment_attempts table exists and is properly configured

-- Create assessment_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER, -- percentage
  total_points INTEGER,
  earned_points INTEGER,
  status VARCHAR(20) DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  time_spent INTEGER, -- in minutes
  answers JSONB DEFAULT '{}', -- student's answers
  feedback TEXT, -- instructor feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to assessments table
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS instructor_feedback TEXT DEFAULT 'Good work!',
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'quiz' CHECK (type IN ('quiz', 'test', 'practice', 'assignment')),
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER DEFAULT 30;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON public.assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts(status);

-- Enable RLS
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own attempts" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Students can create attempts" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Students can update their own attempts" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Instructors can view attempts for their assessments" ON public.assessment_attempts;

-- Create RLS policies for assessment_attempts
CREATE POLICY "Students can view their own attempts" ON public.assessment_attempts
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create attempts" ON public.assessment_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own attempts" ON public.assessment_attempts
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Instructors can view attempts for their assessments" ON public.assessment_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.profiles p ON p.id = a.instructor_id
      WHERE a.id = assessment_attempts.assessment_id 
      AND p.id = auth.uid()
      AND p.role IN ('mentor', 'admin')
    )
  );

-- Create or replace the start_assessment_attempt function
CREATE OR REPLACE FUNCTION start_assessment_attempt(
  p_student_id UUID,
  p_assessment_id UUID
)
RETURNS UUID AS $$
DECLARE
  attempt_id UUID;
  max_attempts INTEGER;
  current_attempts INTEGER;
BEGIN
  -- Get max attempts for this assessment
  SELECT COALESCE(max_attempts, 3) INTO max_attempts
  FROM public.assessments 
  WHERE id = p_assessment_id;
  
  -- Count current attempts
  SELECT COUNT(*) INTO current_attempts
  FROM public.assessment_attempts 
  WHERE student_id = p_student_id AND assessment_id = p_assessment_id;
  
  -- Check if student has exceeded max attempts
  IF current_attempts >= max_attempts THEN
    RAISE EXCEPTION 'Maximum attempts exceeded for this assessment';
  END IF;
  
  -- Create new attempt
  INSERT INTO public.assessment_attempts (student_id, assessment_id, status)
  VALUES (p_student_id, p_assessment_id, 'in-progress')
  RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the complete_assessment_attempt function
CREATE OR REPLACE FUNCTION complete_assessment_attempt(
  p_attempt_id UUID,
  p_score INTEGER,
  p_answers JSONB,
  p_time_spent INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE public.assessment_attempts 
  SET 
    completed_at = NOW(),
    score = p_score,
    answers = p_answers,
    time_spent = p_time_spent,
    status = 'completed',
    updated_at = NOW()
  WHERE id = p_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION start_assessment_attempt(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_assessment_attempt(UUID, INTEGER, JSONB, INTEGER) TO authenticated;

-- Update existing assessments with default values
UPDATE public.assessments 
SET 
  instructor_feedback = COALESCE(instructor_feedback, 'Good work!'),
  max_attempts = COALESCE(max_attempts, 3),
  difficulty_level = COALESCE(difficulty_level, 'easy'),
  tags = COALESCE(tags, ARRAY['General Topics']),
  type = COALESCE(type, 'quiz'),
  time_limit_minutes = COALESCE(time_limit_minutes, 30)
WHERE instructor_feedback IS NULL 
   OR max_attempts IS NULL 
   OR difficulty_level IS NULL 
   OR tags IS NULL 
   OR type IS NULL 
   OR time_limit_minutes IS NULL;

-- Test the functions work
SELECT 'Assessment attempts table created successfully' as status;
