-- Create Learning Path Progress Tracking Table
-- Run this in your Supabase SQL Editor

-- Create table to track student progress in learning paths
CREATE TABLE IF NOT EXISTS public.learning_path_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_path_modules(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.learning_path_units(id) ON DELETE CASCADE NOT NULL,
  
  -- Progress Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Time Tracking
  time_spent INTEGER DEFAULT 0, -- in seconds
  
  -- Position Tracking
  last_position JSONB DEFAULT '{}', -- for video position, scroll position, etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one progress record per student per module
  UNIQUE(student_id, module_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_learning_path_progress_student_path 
  ON public.learning_path_progress(student_id, learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_progress_module 
  ON public.learning_path_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_progress_completed 
  ON public.learning_path_progress(student_id, learning_path_id, is_completed);

-- Enable RLS
ALTER TABLE public.learning_path_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Students can view their own progress" ON public.learning_path_progress;
DROP POLICY IF EXISTS "Students can insert their own progress" ON public.learning_path_progress;
DROP POLICY IF EXISTS "Students can update their own progress" ON public.learning_path_progress;
DROP POLICY IF EXISTS "Mentors can view progress for their learning paths" ON public.learning_path_progress;

-- RLS Policies
-- Students can view and manage their own progress
CREATE POLICY "Students can view their own progress" 
  ON public.learning_path_progress
  FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own progress" 
  ON public.learning_path_progress
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own progress" 
  ON public.learning_path_progress
  FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Mentors can view progress for their learning paths"
  ON public.learning_path_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths lp
      WHERE lp.id = learning_path_progress.learning_path_id
      AND lp.mentor_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_learning_path_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_learning_path_progress_timestamp ON public.learning_path_progress;
CREATE TRIGGER update_learning_path_progress_timestamp
  BEFORE UPDATE ON public.learning_path_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_path_progress_updated_at();

