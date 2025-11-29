-- Learning Path Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- 1. Create learning_paths table (Main table)
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) NOT NULL DEFAULT 'Beginner',
  duration INTEGER NOT NULL DEFAULT 0, -- total duration in hours
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_units INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  total_tests INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create learning_path_units table
CREATE TABLE IF NOT EXISTS public.learning_path_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(learning_path_id, order_number)
);

-- 3. Create learning_path_modules table
CREATE TABLE IF NOT EXISTS public.learning_path_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES public.learning_path_units(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('PDF', 'Video', 'Text', 'Quiz', 'Assignment')) NOT NULL DEFAULT 'Text',
  content TEXT, -- For text content
  file_url TEXT, -- For PDF, Video, Assignment files
  duration INTEGER DEFAULT 0, -- duration in minutes
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(unit_id, order_number)
);

-- 4. Create learning_path_tests table (for both unit tests and final test)
CREATE TABLE IF NOT EXISTS public.learning_path_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.learning_path_units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  test_type TEXT CHECK (test_type IN ('unit', 'final')) NOT NULL,
  pass_percentage INTEGER NOT NULL DEFAULT 70,
  total_marks INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Either unit_id or learning_path_id should be set, but not both
  CHECK (
    (test_type = 'unit' AND unit_id IS NOT NULL AND learning_path_id IS NULL) OR
    (test_type = 'final' AND learning_path_id IS NOT NULL AND unit_id IS NULL)
  )
);

-- 5. Create learning_path_questions table
CREATE TABLE IF NOT EXISTS public.learning_path_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.learning_path_tests(id) ON DELETE CASCADE NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple-choice', 'true-false', 'fill-blanks', 'coding')) NOT NULL,
  question TEXT NOT NULL,
  options JSONB, -- Array of options for multiple-choice
  correct_answer JSONB, -- Can be string or array depending on question type
  points INTEGER NOT NULL DEFAULT 10,
  explanation TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_mentor_id ON public.learning_paths(mentor_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_level ON public.learning_paths(level);
CREATE INDEX IF NOT EXISTS idx_learning_path_units_path_id ON public.learning_path_units(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_modules_unit_id ON public.learning_path_modules(unit_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_tests_path_id ON public.learning_path_tests(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_tests_unit_id ON public.learning_path_tests(unit_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_questions_test_id ON public.learning_path_questions(test_id);

-- Enable Row Level Security
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_paths
-- Mentors can view their own learning paths
CREATE POLICY "Mentors can view their own learning paths"
  ON public.learning_paths FOR SELECT
  USING (auth.uid() = mentor_id);

-- Mentors can insert their own learning paths
CREATE POLICY "Mentors can insert their own learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

-- Mentors can update their own learning paths
CREATE POLICY "Mentors can update their own learning paths"
  ON public.learning_paths FOR UPDATE
  USING (auth.uid() = mentor_id);

-- Mentors can delete their own learning paths
CREATE POLICY "Mentors can delete their own learning paths"
  ON public.learning_paths FOR DELETE
  USING (auth.uid() = mentor_id);

-- Students can view all published learning paths
CREATE POLICY "Students can view all learning paths"
  ON public.learning_paths FOR SELECT
  USING (true);

-- RLS Policies for learning_path_units
CREATE POLICY "Users can view units of accessible learning paths"
  ON public.learning_path_units FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_units.learning_path_id
      AND (learning_paths.mentor_id = auth.uid() OR true) -- Students can view all
    )
  );

CREATE POLICY "Mentors can manage units of their learning paths"
  ON public.learning_path_units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_units.learning_path_id
      AND learning_paths.mentor_id = auth.uid()
    )
  );

-- RLS Policies for learning_path_modules
CREATE POLICY "Users can view modules of accessible units"
  ON public.learning_path_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_modules.unit_id
      AND (learning_paths.mentor_id = auth.uid() OR true)
    )
  );

CREATE POLICY "Mentors can manage modules of their learning paths"
  ON public.learning_path_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_modules.unit_id
      AND learning_paths.mentor_id = auth.uid()
    )
  );

-- RLS Policies for learning_path_tests
CREATE POLICY "Users can view tests of accessible learning paths"
  ON public.learning_path_tests FOR SELECT
  USING (
    (test_type = 'final' AND EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_tests.learning_path_id
      AND (learning_paths.mentor_id = auth.uid() OR true)
    )) OR
    (test_type = 'unit' AND EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_tests.unit_id
      AND (learning_paths.mentor_id = auth.uid() OR true)
    ))
  );

CREATE POLICY "Mentors can manage tests of their learning paths"
  ON public.learning_path_tests FOR ALL
  USING (
    (test_type = 'final' AND EXISTS (
      SELECT 1 FROM public.learning_paths
      WHERE learning_paths.id = learning_path_tests.learning_path_id
      AND learning_paths.mentor_id = auth.uid()
    )) OR
    (test_type = 'unit' AND EXISTS (
      SELECT 1 FROM public.learning_path_units
      JOIN public.learning_paths ON learning_paths.id = learning_path_units.learning_path_id
      WHERE learning_path_units.id = learning_path_tests.unit_id
      AND learning_paths.mentor_id = auth.uid()
    ))
  );

-- RLS Policies for learning_path_questions
CREATE POLICY "Users can view questions of accessible tests"
  ON public.learning_path_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_tests
      LEFT JOIN public.learning_paths ON learning_paths.id = learning_path_tests.learning_path_id
      LEFT JOIN public.learning_path_units ON learning_path_units.id = learning_path_tests.unit_id
      WHERE learning_path_tests.id = learning_path_questions.test_id
      AND (
        (learning_path_tests.test_type = 'final' AND (learning_paths.mentor_id = auth.uid() OR true)) OR
        (learning_path_tests.test_type = 'unit' AND EXISTS (
          SELECT 1 FROM public.learning_paths lp
          WHERE lp.id = learning_path_units.learning_path_id
          AND (lp.mentor_id = auth.uid() OR true)
        ))
      )
    )
  );

CREATE POLICY "Mentors can manage questions of their tests"
  ON public.learning_path_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.learning_path_tests
      LEFT JOIN public.learning_paths ON learning_paths.id = learning_path_tests.learning_path_id
      LEFT JOIN public.learning_path_units ON learning_path_units.id = learning_path_tests.unit_id
      WHERE learning_path_tests.id = learning_path_questions.test_id
      AND (
        (learning_path_tests.test_type = 'final' AND learning_paths.mentor_id = auth.uid()) OR
        (learning_path_tests.test_type = 'unit' AND EXISTS (
          SELECT 1 FROM public.learning_paths lp
          WHERE lp.id = learning_path_units.learning_path_id
          AND lp.mentor_id = auth.uid()
        ))
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_path_units_updated_at
  BEFORE UPDATE ON public.learning_path_units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_path_modules_updated_at
  BEFORE UPDATE ON public.learning_path_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_path_tests_updated_at
  BEFORE UPDATE ON public.learning_path_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_path_questions_updated_at
  BEFORE UPDATE ON public.learning_path_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

