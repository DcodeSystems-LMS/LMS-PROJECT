-- Simple Assessment Schema Fix
-- This script only fixes the immediate mentor_id issue without creating complex tables

-- Add mentor_id column to assessments table if it doesn't exist
DO $$ 
BEGIN
    -- Add mentor_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'mentor_id') THEN
        ALTER TABLE assessments ADD COLUMN mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'status') THEN
        ALTER TABLE assessments ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'type') THEN
        ALTER TABLE assessments ADD COLUMN type VARCHAR(50) DEFAULT 'quiz';
    END IF;
    
    -- Add time_limit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'time_limit') THEN
        ALTER TABLE assessments ADD COLUMN time_limit INTEGER DEFAULT 30;
    END IF;
    
    -- Add max_attempts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'max_attempts') THEN
        ALTER TABLE assessments ADD COLUMN max_attempts INTEGER DEFAULT 1;
    END IF;
    
    -- Add passing_score column if it doesn't exist (it might already exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'passing_score') THEN
        ALTER TABLE assessments ADD COLUMN passing_score INTEGER DEFAULT 70;
    END IF;
END $$;

-- Copy instructor_id to mentor_id for existing records
UPDATE assessments 
SET mentor_id = instructor_id 
WHERE mentor_id IS NULL AND instructor_id IS NOT NULL;

-- Create questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  explanation TEXT,
  points DECIMAL(5,2) DEFAULT 1.00,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, student_id, attempt_number)
);

-- Create question_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  response_text TEXT,
  response_files JSONB DEFAULT '[]',
  points_awarded DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 0,
  is_correct BOOLEAN DEFAULT FALSE,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies for questions
CREATE POLICY "Mentors can manage questions for their assessments" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = questions.assessment_id AND (mentor_id = auth.uid() OR instructor_id = auth.uid())
    )
  );

CREATE POLICY "Students can view questions for their assessments" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = questions.assessment_id
    )
  );

-- Create simple RLS policies for assessment_attempts
CREATE POLICY "Students can manage their own attempts" ON assessment_attempts
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view attempts for their assessments" ON assessment_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_attempts.assessment_id AND (mentor_id = auth.uid() OR instructor_id = auth.uid())
    )
  );

-- Create simple RLS policies for question_responses
CREATE POLICY "Students can manage their own responses" ON question_responses
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view responses for their assessments" ON question_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      JOIN assessment_attempts aa ON a.id = aa.assessment_id
      WHERE aa.id = question_responses.attempt_id AND (a.mentor_id = auth.uid() OR a.instructor_id = auth.uid())
    )
  );

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment_student ON assessment_attempts(assessment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON question_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON question_responses(question_id);

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Simple assessment schema fix completed successfully!';
  RAISE NOTICE 'Added mentor_id column to assessments table';
  RAISE NOTICE 'Created questions, assessment_attempts, and question_responses tables';
  RAISE NOTICE 'Created basic RLS policies';
  RAISE NOTICE 'Created performance indexes';
END $$;
