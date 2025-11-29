-- Learning Path Test Results Table
-- This table stores completions/results when students complete learning path tests

CREATE TABLE IF NOT EXISTS public.learning_path_test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.learning_path_tests(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.learning_path_units(id) ON DELETE CASCADE,
  
  -- Test Type
  test_type TEXT CHECK (test_type IN ('unit', 'final')) NOT NULL,
  
  -- Scoring
  score INTEGER NOT NULL DEFAULT 0, -- percentage score (0-100)
  total_points INTEGER NOT NULL DEFAULT 0, -- total possible points
  earned_points INTEGER NOT NULL DEFAULT 0, -- points earned
  
  -- Student Answers
  answers JSONB DEFAULT '{}', -- Store all answers as JSON
  
  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'abandoned')),
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_spent INTEGER DEFAULT 0, -- time spent in seconds
  
  -- Metadata
  attempt_number INTEGER DEFAULT 1, -- which attempt (1st, 2nd, etc.)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Allow multiple attempts per student per test
  UNIQUE(test_id, student_id, attempt_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_path_test_results_test_id ON public.learning_path_test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_test_results_student_id ON public.learning_path_test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_test_results_learning_path_id ON public.learning_path_test_results(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_test_results_completed_at ON public.learning_path_test_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_learning_path_test_results_status ON public.learning_path_test_results(status);

-- Enable Row Level Security
ALTER TABLE public.learning_path_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_path_test_results

-- Students can view their own results
CREATE POLICY "Students can view their own test results"
  ON public.learning_path_test_results FOR SELECT
  USING (student_id = auth.uid());

-- Students can insert their own test results
CREATE POLICY "Students can insert their own test results"
  ON public.learning_path_test_results FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Students can update their own test results (for in_progress updates)
CREATE POLICY "Students can update their own test results"
  ON public.learning_path_test_results FOR UPDATE
  USING (student_id = auth.uid());

-- Mentors can view results for their learning paths
CREATE POLICY "Mentors can view results for their learning paths"
  ON public.learning_path_test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_test_results.learning_path_id
      AND learning_paths.mentor_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE TRIGGER update_learning_path_test_results_updated_at
  BEFORE UPDATE ON public.learning_path_test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get next attempt number
CREATE OR REPLACE FUNCTION get_next_attempt_number(
  p_test_id UUID,
  p_student_id UUID
) RETURNS INTEGER AS $$
DECLARE
  max_attempt INTEGER;
BEGIN
  SELECT COALESCE(MAX(attempt_number), 0) INTO max_attempt
  FROM public.learning_path_test_results
  WHERE test_id = p_test_id AND student_id = p_student_id;
  
  RETURN max_attempt + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_next_attempt_number TO authenticated;

