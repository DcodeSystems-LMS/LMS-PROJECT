-- Assessment Database Schema
-- Run this in your Supabase SQL Editor

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Quiz', 'Test', 'Practice', 'Project')),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  time_limit INTEGER DEFAULT 30, -- in minutes
  max_attempts INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 60, -- percentage
  is_active BOOLEAN DEFAULT true,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple-choice', 'true-false', 'short-answer', 'essay')),
  options JSONB, -- For multiple choice options
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_attempts table
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER, -- percentage
  total_points INTEGER,
  earned_points INTEGER,
  status VARCHAR(20) DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  time_spent INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_assignments table (for assigning to specific students)
CREATE TABLE IF NOT EXISTS assessment_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_course_id ON assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_mentor_id ON assessments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_attempt_id ON assessment_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_assessment_id ON assessment_assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_assignments_student_id ON assessment_assignments(student_id);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Mentors can manage their assessments" ON assessments
FOR ALL USING (mentor_id = auth.uid());

CREATE POLICY "Students can view assigned assessments" ON assessments
FOR SELECT USING (
  is_active = true AND (
    course_id IN (
      SELECT course_id FROM course_enrollments 
      WHERE student_id = auth.uid()
    ) OR
    id IN (
      SELECT assessment_id FROM assessment_assignments 
      WHERE student_id = auth.uid()
    )
  )
);

-- RLS Policies for assessment_questions
CREATE POLICY "Mentors can manage questions for their assessments" ON assessment_questions
FOR ALL USING (
  assessment_id IN (
    SELECT id FROM assessments WHERE mentor_id = auth.uid()
  )
);

CREATE POLICY "Students can view questions for assigned assessments" ON assessment_questions
FOR SELECT USING (
  assessment_id IN (
    SELECT id FROM assessments WHERE is_active = true AND (
      course_id IN (
        SELECT course_id FROM course_enrollments 
        WHERE student_id = auth.uid()
      ) OR
      id IN (
        SELECT assessment_id FROM assessment_assignments 
        WHERE student_id = auth.uid()
      )
    )
  )
);

-- RLS Policies for assessment_attempts
CREATE POLICY "Students can manage their own attempts" ON assessment_attempts
FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view attempts for their assessments" ON assessment_attempts
FOR SELECT USING (
  assessment_id IN (
    SELECT id FROM assessments WHERE mentor_id = auth.uid()
  )
);

-- RLS Policies for assessment_responses
CREATE POLICY "Students can manage their own responses" ON assessment_responses
FOR ALL USING (
  attempt_id IN (
    SELECT id FROM assessment_attempts WHERE student_id = auth.uid()
  )
);

CREATE POLICY "Mentors can view responses for their assessments" ON assessment_responses
FOR SELECT USING (
  attempt_id IN (
    SELECT id FROM assessment_attempts 
    WHERE assessment_id IN (
      SELECT id FROM assessments WHERE mentor_id = auth.uid()
    )
  )
);

-- RLS Policies for assessment_assignments
CREATE POLICY "Mentors can manage assignments for their assessments" ON assessment_assignments
FOR ALL USING (
  assessment_id IN (
    SELECT id FROM assessments WHERE mentor_id = auth.uid()
  )
);

CREATE POLICY "Students can view their assignments" ON assessment_assignments
FOR SELECT USING (student_id = auth.uid());

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_assessment_stats(assessment_uuid UUID)
RETURNS TABLE (
  total_students BIGINT,
  completed_attempts BIGINT,
  average_score NUMERIC,
  highest_score INTEGER,
  lowest_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT aa.student_id) as total_students,
    COUNT(CASE WHEN aa.status = 'completed' THEN 1 END) as completed_attempts,
    ROUND(AVG(aa.score), 2) as average_score,
    MAX(aa.score) as highest_score,
    MIN(aa.score) as lowest_score
  FROM assessment_attempts aa
  WHERE aa.assessment_id = assessment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate assessment score
CREATE OR REPLACE FUNCTION calculate_assessment_score(attempt_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_points INTEGER;
  earned_points INTEGER;
  score_percentage INTEGER;
BEGIN
  SELECT 
    SUM(aq.points) as total,
    SUM(ar.points_earned) as earned
  INTO total_points, earned_points
  FROM assessment_questions aq
  LEFT JOIN assessment_responses ar ON aq.id = ar.question_id AND ar.attempt_id = attempt_uuid
  WHERE aq.assessment_id = (
    SELECT assessment_id FROM assessment_attempts WHERE id = attempt_uuid
  );
  
  IF total_points > 0 THEN
    score_percentage := ROUND((earned_points::NUMERIC / total_points::NUMERIC) * 100);
  ELSE
    score_percentage := 0;
  END IF;
  
  RETURN score_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
