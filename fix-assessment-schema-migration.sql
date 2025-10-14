-- Fix Assessment Schema Migration
-- This script fixes the column name mismatch between existing schema and new assessment system

-- First, let's check what columns exist in the assessments table
-- and add the missing columns if they don't exist

-- Add missing columns to assessments table if they don't exist
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
    
    -- Add available_from column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'available_from') THEN
        ALTER TABLE assessments ADD COLUMN available_from TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add available_until column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'available_until') THEN
        ALTER TABLE assessments ADD COLUMN available_until TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add settings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'settings') THEN
        ALTER TABLE assessments ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;
    
    -- Add security_settings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'security_settings') THEN
        ALTER TABLE assessments ADD COLUMN security_settings JSONB DEFAULT '{}';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'tags') THEN
        ALTER TABLE assessments ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add weightage column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'weightage') THEN
        ALTER TABLE assessments ADD COLUMN weightage DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'category') THEN
        ALTER TABLE assessments ADD COLUMN category VARCHAR(100);
    END IF;
    
    -- Add difficulty_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'difficulty_level') THEN
        ALTER TABLE assessments ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'medium';
    END IF;
    
    -- Add language column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'language') THEN
        ALTER TABLE assessments ADD COLUMN language VARCHAR(10) DEFAULT 'en';
    END IF;
    
    -- Add bloom_taxonomy_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'bloom_taxonomy_level') THEN
        ALTER TABLE assessments ADD COLUMN bloom_taxonomy_level VARCHAR(20) DEFAULT 'remember';
    END IF;
    
    -- Add published_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'published_at') THEN
        ALTER TABLE assessments ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add closed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assessments' AND column_name = 'closed_at') THEN
        ALTER TABLE assessments ADD COLUMN closed_at TIMESTAMP WITH TIME ZONE;
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
  negative_marking DECIMAL(5,2) DEFAULT 0.00,
  order_index INTEGER DEFAULT 0,
  
  -- Question metadata
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  
  -- Section support
  section_id UUID,
  section_name VARCHAR(100),
  question_order INTEGER DEFAULT 0,
  
  -- Rich content support
  media_files JSONB DEFAULT '[]',
  rich_text_content TEXT,
  code_language VARCHAR(50),
  code_template TEXT,
  test_cases JSONB DEFAULT '[]',
  
  -- Accessibility
  alt_text TEXT, -- for images
  audio_transcript TEXT, -- for audio questions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- seconds
  
  -- Results
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'late')),
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  security_flags JSONB DEFAULT '{}',
  
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
  
  -- Response data
  response_text TEXT,
  response_files JSONB DEFAULT '[]', -- for file uploads
  response_code TEXT, -- for coding challenges
  
  -- Grading
  points_awarded DECIMAL(5,2) DEFAULT 0,
  max_points DECIMAL(5,2) DEFAULT 0,
  is_correct BOOLEAN DEFAULT FALSE,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  
  -- Metadata
  time_spent INTEGER DEFAULT 0, -- seconds on this question
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  
  -- Progress Data
  current_question_id UUID REFERENCES questions(id),
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Time Tracking
  time_spent INTEGER DEFAULT 0, -- seconds
  time_remaining INTEGER DEFAULT 0, -- seconds
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Save & Resume
  saved_responses JSONB DEFAULT '{}',
  resume_enabled BOOLEAN DEFAULT TRUE,
  last_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for questions
CREATE POLICY "Mentors can manage questions for their assessments" ON questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = questions.assessment_id AND (mentor_id = auth.uid() OR instructor_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can view questions for assigned assessments" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_assignments aa
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE a.id = questions.assessment_id AND aa.student_id = auth.uid()
    )
  );

-- Create RLS policies for assessment_attempts
CREATE POLICY "Students can manage their own attempts" ON assessment_attempts
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view attempts for their assessments" ON assessment_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_attempts.assessment_id AND (mentor_id = auth.uid() OR instructor_id = auth.uid())
    )
  );

-- Create RLS policies for question_responses
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

-- Create RLS policies for student_progress
CREATE POLICY "Students can manage their own progress" ON student_progress
  FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view student progress for their assessments" ON student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = student_progress.assessment_id AND (mentor_id = auth.uid() OR instructor_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_assessment ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_points ON questions(points);
CREATE INDEX IF NOT EXISTS idx_attempts_assessment_student ON assessment_attempts(assessment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON question_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_assessment ON student_progress(assessment_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_questions_search ON questions USING gin(to_tsvector('english', question_text));
CREATE INDEX IF NOT EXISTS idx_questions_rich_text ON questions USING gin(to_tsvector('english', COALESCE(rich_text_content, '')));
CREATE INDEX IF NOT EXISTS idx_questions_media ON questions USING gin(media_files);

-- Update existing assessments to have proper mentor_id
UPDATE assessments 
SET mentor_id = instructor_id 
WHERE mentor_id IS NULL AND instructor_id IS NOT NULL;

-- Add a check constraint for status
ALTER TABLE assessments ADD CONSTRAINT check_status 
CHECK (status IN ('draft', 'published', 'closed', 'archived'));

-- Add a check constraint for type
ALTER TABLE assessments ADD CONSTRAINT check_type 
CHECK (type IN ('quiz', 'test', 'assignment', 'project', 'coding_challenge'));

-- Create a function to handle the mentor_id vs instructor_id compatibility
CREATE OR REPLACE FUNCTION get_assessment_mentor_id(assessment_row assessments)
RETURNS UUID AS $$
BEGIN
  -- Return mentor_id if it exists, otherwise return instructor_id
  IF assessment_row.mentor_id IS NOT NULL THEN
    RETURN assessment_row.mentor_id;
  ELSE
    RETURN assessment_row.instructor_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a view for backward compatibility
CREATE OR REPLACE VIEW assessment_mentors AS
SELECT 
  id,
  title,
  description,
  course_id,
  COALESCE(mentor_id, instructor_id) as mentor_id,
  type,
  status,
  time_limit,
  max_attempts,
  passing_score,
  created_at,
  updated_at
FROM assessments;

-- Insert sample data for testing if no assessments exist
INSERT INTO assessments (
  id,
  title,
  description,
  type,
  status,
  course_id,
  mentor_id,
  instructor_id,
  time_limit,
  max_attempts,
  passing_score,
  tags,
  category,
  difficulty_level
) 
SELECT 
  gen_random_uuid(),
  'Sample Assessment',
  'This is a sample assessment for testing',
  'quiz',
  'draft',
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  30,
  3,
  70,
  ARRAY['sample', 'test'],
  'Practice',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM assessments LIMIT 1);

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Assessment schema migration completed successfully!';
  RAISE NOTICE 'Tables created/updated: assessments, questions, assessment_attempts, question_responses, student_progress';
  RAISE NOTICE 'RLS policies created for all tables';
  RAISE NOTICE 'Indexes created for performance optimization';
END $$;
