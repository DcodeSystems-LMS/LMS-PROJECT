-- Create Assessment Results Table
-- This script creates the assessment_results table if it doesn't exist

-- Create assessment_results table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL, -- percentage score
  total_points INTEGER,
  earned_points INTEGER,
  answers JSONB DEFAULT '{}', -- student's answers
  time_spent INTEGER, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_student_id ON public.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_completed_at ON public.assessment_results(completed_at);

-- Enable RLS
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own results" ON public.assessment_results;
DROP POLICY IF EXISTS "Students can create results" ON public.assessment_results;
DROP POLICY IF EXISTS "Instructors can view results for their assessments" ON public.assessment_results;

-- Create RLS policies for assessment_results
CREATE POLICY "Students can view their own results" ON public.assessment_results
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create results" ON public.assessment_results
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view results for their assessments" ON public.assessment_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.profiles p ON p.id = a.instructor_id
      WHERE a.id = assessment_results.assessment_id 
      AND p.id = auth.uid()
      AND p.role IN ('mentor', 'admin')
    )
  );

-- Test the table
SELECT 'Assessment results table created successfully' as status;
