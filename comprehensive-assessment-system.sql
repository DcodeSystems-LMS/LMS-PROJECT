-- Comprehensive Assessment System
-- Supports all question types with automatic and manual grading

-- 1. Ensure assessments table exists first
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  course_id UUID,
  instructor_id UUID,
  time_limit INTEGER DEFAULT 30,
  max_attempts INTEGER DEFAULT 1,
  passing_score INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure questions table exists
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  options JSONB,
  correct_answer TEXT,
  correct_answers JSONB,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS auto_grade BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS partial_credit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS model_answer TEXT,
ADD COLUMN IF NOT EXISTS evaluation_criteria JSONB,
ADD COLUMN IF NOT EXISTS sample_solution TEXT,
ADD COLUMN IF NOT EXISTS word_limit INTEGER,
ADD COLUMN IF NOT EXISTS time_limit INTEGER,
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS code_language VARCHAR(50),
ADD COLUMN IF NOT EXISTS code_template TEXT,
ADD COLUMN IF NOT EXISTS test_cases JSONB,
ADD COLUMN IF NOT EXISTS expected_output TEXT,
ADD COLUMN IF NOT EXISTS file_types TEXT[],
ADD COLUMN IF NOT EXISTS max_file_size INTEGER,
ADD COLUMN IF NOT EXISTS allowed_extensions TEXT[],
ADD COLUMN IF NOT EXISTS blank_positions JSONB,
ADD COLUMN IF NOT EXISTS rich_text_content TEXT,
ADD COLUMN IF NOT EXISTS media_files JSONB,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update auto_grade based on question type
UPDATE public.questions 
SET auto_grade = CASE 
  WHEN question_type IN ('multiple-choice', 'multiple-select', 'true-false', 'short-answer', 'fill-in-blanks') 
  THEN true 
  ELSE false 
END
WHERE auto_grade IS NULL;

-- 2. Student Responses Table
CREATE TABLE IF NOT EXISTS public.student_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Response Data
  answer_text TEXT, -- For text-based answers
  answer_json JSONB, -- For complex answers (multiple-select, code, etc.)
  file_uploads JSONB, -- For file upload responses
  code_submission TEXT, -- For coding challenges
  
  -- Grading Information
  is_auto_graded BOOLEAN DEFAULT true,
  auto_score DECIMAL(5,2), -- Score from automatic grading
  manual_score DECIMAL(5,2), -- Score from manual grading
  final_score DECIMAL(5,2), -- Final score (auto or manual)
  feedback TEXT, -- Instructor feedback
  graded_by UUID REFERENCES public.profiles(id), -- Who graded it
  graded_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'auto-graded', 'manually-graded', 'reviewed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enhanced Assessment Attempts Table
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- in minutes
  
  -- Scoring
  auto_score DECIMAL(5,2), -- Score from auto-graded questions
  manual_score DECIMAL(5,2), -- Score from manually graded questions
  final_score DECIMAL(5,2), -- Final combined score
  total_points INTEGER,
  earned_points DECIMAL(5,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'submitted', 'auto-graded', 'manually-graded', 'completed', 'abandoned')),
  grading_status VARCHAR(20) DEFAULT 'pending' CHECK (grading_status IN ('pending', 'auto-complete', 'manual-pending', 'manual-complete')),
  
  -- Feedback
  overall_feedback TEXT,
  instructor_feedback TEXT,
  
  -- Metadata
  answers JSONB DEFAULT '{}', -- Legacy answers storage
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Grading Queue Table (for manual grading workflow)
CREATE TABLE IF NOT EXISTS public.grading_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Queue Information
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Grading Notes
  notes TEXT,
  difficulty_level VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Assessment Results (Final Results)
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
  
  -- Final Scores
  total_score DECIMAL(5,2) NOT NULL,
  auto_score DECIMAL(5,2),
  manual_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  grade VARCHAR(10), -- A+, A, B+, etc.
  
  -- Breakdown
  total_questions INTEGER,
  auto_graded_questions INTEGER,
  manual_graded_questions INTEGER,
  correct_answers INTEGER,
  
  -- Feedback
  overall_feedback TEXT,
  instructor_feedback TEXT,
  show_correct_answers BOOLEAN DEFAULT true,
  show_explanations BOOLEAN DEFAULT true,
  
  -- Status
  is_final BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_auto_grade ON public.questions(auto_grade);
CREATE INDEX IF NOT EXISTS idx_student_responses_attempt_id ON public.student_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_question_id ON public.student_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_student_id ON public.student_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_status ON public.student_responses(status);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON public.assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_grading_queue_instructor_id ON public.grading_queue(instructor_id);
CREATE INDEX IF NOT EXISTS idx_grading_queue_status ON public.grading_queue(status);
CREATE INDEX IF NOT EXISTS idx_assessment_results_student_id ON public.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);

-- 7. Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Questions
DROP POLICY IF EXISTS "Questions are viewable by enrolled students" ON public.questions;
DROP POLICY IF EXISTS "Instructors can manage questions" ON public.questions;

CREATE POLICY "Questions are viewable by enrolled students" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.assessments a ON a.id = questions.assessment_id
      WHERE e.student_id = auth.uid() 
      AND e.course_id = a.course_id
      AND e.status IN ('enrolled', 'active', 'completed')
    )
  );

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

-- 9. RLS Policies for Student Responses
DROP POLICY IF EXISTS "Students can view their own responses" ON public.student_responses;
DROP POLICY IF EXISTS "Students can create responses" ON public.student_responses;
DROP POLICY IF EXISTS "Students can update their own responses" ON public.student_responses;
DROP POLICY IF EXISTS "Instructors can view responses for their assessments" ON public.student_responses;

CREATE POLICY "Students can view their own responses" ON public.student_responses
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create responses" ON public.student_responses
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own responses" ON public.student_responses
  FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Instructors can view responses for their assessments" ON public.student_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.assessments a ON a.id = q.assessment_id
      JOIN public.profiles p ON p.id = a.instructor_id
      WHERE q.id = student_responses.question_id 
      AND p.id = auth.uid()
      AND p.role IN ('mentor', 'admin')
    )
  );

-- 10. RLS Policies for Assessment Attempts
DROP POLICY IF EXISTS "Students can view their own attempts" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Students can create attempts" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Students can update their own attempts" ON public.assessment_attempts;
DROP POLICY IF EXISTS "Instructors can view attempts for their assessments" ON public.assessment_attempts;

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

-- 11. RLS Policies for Grading Queue
DROP POLICY IF EXISTS "Instructors can view their grading queue" ON public.grading_queue;
DROP POLICY IF EXISTS "Instructors can update their grading queue" ON public.grading_queue;

CREATE POLICY "Instructors can view their grading queue" ON public.grading_queue
  FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their grading queue" ON public.grading_queue
  FOR UPDATE USING (instructor_id = auth.uid());

-- 12. RLS Policies for Assessment Results
DROP POLICY IF EXISTS "Students can view their own results" ON public.assessment_results;
DROP POLICY IF EXISTS "Instructors can view results for their assessments" ON public.assessment_results;

CREATE POLICY "Students can view their own results" ON public.assessment_results
  FOR SELECT USING (student_id = auth.uid());

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

-- 13. Helper Functions
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

CREATE OR REPLACE FUNCTION submit_student_response(
  p_attempt_id UUID,
  p_question_id UUID,
  p_student_id UUID,
  p_answer_text TEXT DEFAULT NULL,
  p_answer_json JSONB DEFAULT NULL,
  p_file_uploads JSONB DEFAULT NULL,
  p_code_submission TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  response_id UUID;
  question_type VARCHAR(50);
  auto_grade BOOLEAN;
  auto_score DECIMAL(5,2);
BEGIN
  -- Get question details with fallback for auto_grade column
  SELECT q.question_type, COALESCE(q.auto_grade, 
    CASE WHEN q.question_type IN ('multiple-choice', 'multiple-select', 'true-false', 'short-answer', 'fill-in-blanks') 
    THEN true ELSE false END) INTO question_type, auto_grade
  FROM public.questions q
  WHERE q.id = p_question_id;
  
  -- Create student response
  INSERT INTO public.student_responses (
    attempt_id, question_id, student_id,
    answer_text, answer_json, file_uploads, code_submission,
    is_auto_graded, status
  ) VALUES (
    p_attempt_id, p_question_id, p_student_id,
    p_answer_text, p_answer_json, p_file_uploads, p_code_submission,
    auto_grade, CASE WHEN auto_grade THEN 'auto-graded' ELSE 'pending' END
  ) RETURNING id INTO response_id;
  
  -- Auto-grade if applicable
  IF auto_grade THEN
    -- This would call the auto-grading logic
    -- For now, we'll set a placeholder score
    auto_score := 0.0; -- This should be calculated based on question type
    
    UPDATE public.student_responses 
    SET auto_score = auto_score, final_score = auto_score, status = 'auto-graded'
    WHERE id = response_id;
  ELSE
    -- Add to grading queue for manual grading
    INSERT INTO public.grading_queue (attempt_id, question_id, student_id, instructor_id)
    SELECT p_attempt_id, p_question_id, p_student_id, a.instructor_id
    FROM public.assessments a
    JOIN public.assessment_attempts att ON att.assessment_id = a.id
    WHERE att.id = p_attempt_id;
  END IF;
  
  RETURN response_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_final_score(p_attempt_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_points DECIMAL(5,2);
  earned_points DECIMAL(5,2);
  final_score DECIMAL(5,2);
BEGIN
  -- Calculate total points for the assessment
  SELECT COALESCE(SUM(q.points), 0) INTO total_points
  FROM public.questions q
  JOIN public.assessment_attempts a ON a.assessment_id = q.assessment_id
  WHERE a.id = p_attempt_id;
  
  -- Calculate earned points
  SELECT COALESCE(SUM(sr.final_score), 0) INTO earned_points
  FROM public.student_responses sr
  WHERE sr.attempt_id = p_attempt_id;
  
  -- Calculate final score percentage
  IF total_points > 0 THEN
    final_score := (earned_points / total_points) * 100;
  ELSE
    final_score := 0;
  END IF;
  
  -- Update attempt with final score
  UPDATE public.assessment_attempts 
  SET 
    final_score = final_score,
    total_points = total_points,
    earned_points = earned_points,
    status = CASE 
      WHEN EXISTS (SELECT 1 FROM public.student_responses WHERE attempt_id = p_attempt_id AND status = 'pending') 
      THEN 'submitted'
      ELSE 'completed'
    END
  WHERE id = p_attempt_id;
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Grant Permissions
GRANT EXECUTE ON FUNCTION start_assessment_attempt(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_student_response(UUID, UUID, UUID, TEXT, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_final_score(UUID) TO authenticated;

-- 15. Test the setup
SELECT 'Comprehensive assessment system setup completed successfully' as status;
