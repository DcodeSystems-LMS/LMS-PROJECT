-- Enhanced Questions Schema to Support All Question Types
-- This script extends the questions table to support all question types

-- First, let's add new columns to support all question types
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'multiple-choice',
ADD COLUMN IF NOT EXISTS question_text TEXT,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS correct_answer TEXT,
ADD COLUMN IF NOT EXISTS correct_answers JSONB DEFAULT '[]', -- For multiple select
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS points DECIMAL(5,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_files JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS rich_text_content TEXT,
ADD COLUMN IF NOT EXISTS code_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS code_template TEXT,
ADD COLUMN IF NOT EXISTS test_cases JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS file_types JSONB DEFAULT '[]', -- For file upload questions
ADD COLUMN IF NOT EXISTS max_file_size INTEGER DEFAULT 10485760, -- 10MB default
ADD COLUMN IF NOT EXISTS allowed_extensions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS blank_positions JSONB DEFAULT '[]', -- For fill in the blanks
ADD COLUMN IF NOT EXISTS word_limit INTEGER, -- For essay questions
ADD COLUMN IF NOT EXISTS time_limit INTEGER, -- Time limit for coding challenges
ADD COLUMN IF NOT EXISTS alt_text TEXT, -- For accessibility
ADD COLUMN IF NOT EXISTS audio_transcript TEXT; -- For audio questions

-- Update the question_type constraint to include all supported types
ALTER TABLE public.questions 
DROP CONSTRAINT IF EXISTS questions_question_type_check;

ALTER TABLE public.questions 
ADD CONSTRAINT questions_question_type_check 
CHECK (question_type IN (
  'multiple-choice',
  'multiple-select', 
  'true-false',
  'true_false',
  'short-answer',
  'essay',
  'coding-challenge',
  'file-upload',
  'fill-in-blanks'
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(order_index);

-- Update RLS policies for questions
DROP POLICY IF EXISTS "Students can view questions for enrolled assessments" ON public.questions;
DROP POLICY IF EXISTS "Instructors can manage questions" ON public.questions;

-- Students can view questions for assessments they're enrolled in
CREATE POLICY "Students can view questions for enrolled assessments" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.enrollments e ON e.course_id = a.course_id
      WHERE a.id = questions.assessment_id 
      AND e.student_id = auth.uid()
      AND e.status IN ('enrolled', 'active', 'completed')
    )
  );

-- Instructors can manage questions for their assessments
CREATE POLICY "Instructors can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      JOIN public.profiles p ON p.id = a.instructor_id
      WHERE a.id = questions.assessment_id 
      AND p.id = auth.uid()
      AND p.role IN ('mentor', 'admin')
    )
  );

-- Function to create a question with proper type handling
CREATE OR REPLACE FUNCTION create_question(
  p_assessment_id UUID,
  p_question_text TEXT,
  p_question_type VARCHAR(50),
  p_options JSONB DEFAULT '[]',
  p_correct_answer TEXT DEFAULT NULL,
  p_correct_answers JSONB DEFAULT '[]',
  p_explanation TEXT DEFAULT NULL,
  p_points DECIMAL(5,2) DEFAULT 1.00,
  p_order_index INTEGER DEFAULT 0,
  p_difficulty_level VARCHAR(20) DEFAULT 'medium',
  p_tags TEXT[] DEFAULT '{}',
  p_media_files JSONB DEFAULT '[]',
  p_rich_text_content TEXT DEFAULT NULL,
  p_code_language VARCHAR(50) DEFAULT NULL,
  p_code_template TEXT DEFAULT NULL,
  p_test_cases JSONB DEFAULT '[]',
  p_file_types JSONB DEFAULT '[]',
  p_max_file_size INTEGER DEFAULT 10485760,
  p_allowed_extensions TEXT[] DEFAULT '{}',
  p_blank_positions JSONB DEFAULT '[]',
  p_word_limit INTEGER DEFAULT NULL,
  p_time_limit INTEGER DEFAULT NULL,
  p_alt_text TEXT DEFAULT NULL,
  p_audio_transcript TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  question_id UUID;
BEGIN
  INSERT INTO public.questions (
    assessment_id,
    question_text,
    question_type,
    options,
    correct_answer,
    correct_answers,
    explanation,
    points,
    order_index,
    difficulty_level,
    tags,
    media_files,
    rich_text_content,
    code_language,
    code_template,
    test_cases,
    file_types,
    max_file_size,
    allowed_extensions,
    blank_positions,
    word_limit,
    time_limit,
    alt_text,
    audio_transcript
  ) VALUES (
    p_assessment_id,
    p_question_text,
    p_question_type,
    p_options,
    p_correct_answer,
    p_correct_answers,
    p_explanation,
    p_points,
    p_order_index,
    p_difficulty_level,
    p_tags,
    p_media_files,
    p_rich_text_content,
    p_code_language,
    p_code_template,
    p_test_cases,
    p_file_types,
    p_max_file_size,
    p_allowed_extensions,
    p_blank_positions,
    p_word_limit,
    p_time_limit,
    p_alt_text,
    p_audio_transcript
  ) RETURNING id INTO question_id;
  
  RETURN question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_question(UUID, TEXT, VARCHAR, JSONB, TEXT, JSONB, TEXT, DECIMAL, INTEGER, VARCHAR, TEXT[], JSONB, TEXT, VARCHAR, TEXT, JSONB, JSONB, INTEGER, TEXT[], JSONB, INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- Function to get questions by assessment with proper type handling
CREATE OR REPLACE FUNCTION get_assessment_questions(p_assessment_id UUID)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  question_type VARCHAR(50),
  options JSONB,
  correct_answer TEXT,
  correct_answers JSONB,
  explanation TEXT,
  points DECIMAL(5,2),
  order_index INTEGER,
  difficulty_level VARCHAR(20),
  tags TEXT[],
  media_files JSONB,
  rich_text_content TEXT,
  code_language VARCHAR(50),
  code_template TEXT,
  test_cases JSONB,
  file_types JSONB,
  max_file_size INTEGER,
  allowed_extensions TEXT[],
  blank_positions JSONB,
  word_limit INTEGER,
  time_limit INTEGER,
  alt_text TEXT,
  audio_transcript TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.question_type,
    q.options,
    q.correct_answer,
    q.correct_answers,
    q.explanation,
    q.points,
    q.order_index,
    q.difficulty_level,
    q.tags,
    q.media_files,
    q.rich_text_content,
    q.code_language,
    q.code_template,
    q.test_cases,
    q.file_types,
    q.max_file_size,
    q.allowed_extensions,
    q.blank_positions,
    q.word_limit,
    q.time_limit,
    q.alt_text,
    q.audio_transcript
  FROM public.questions q
  WHERE q.assessment_id = p_assessment_id
  ORDER BY q.order_index, q.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_assessment_questions(UUID) TO authenticated;

