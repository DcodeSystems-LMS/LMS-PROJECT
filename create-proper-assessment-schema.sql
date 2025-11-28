-- Create Proper Assessment Database Schema
-- This script creates the correct relational structure for assessments

-- 1. Create questions table (if not exists)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'multiple-choice',
    options JSONB, -- For multiple choice options
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create student_assessments table for mapping students to assessments
CREATE TABLE IF NOT EXISTS student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id), -- Who assigned this assessment
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'assigned', -- assigned, in_progress, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assessment_id)
);

-- 3. Create assessment_attempts table for tracking student attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    time_taken INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create assessment_responses table for storing student answers
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    student_answer TEXT,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on all tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for questions
CREATE POLICY "Mentors can manage questions for their assessments" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE id = questions.assessment_id 
            AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Students can view questions for assigned assessments" ON questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_assessments 
            WHERE assessment_id = questions.assessment_id 
            AND student_id = auth.uid()
        )
    );

-- 7. Create RLS policies for student_assessments
CREATE POLICY "Students can view their assigned assessments" ON student_assessments
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Mentors can assign assessments to students" ON student_assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE id = student_assessments.assessment_id 
            AND instructor_id = auth.uid()
        )
    );

CREATE POLICY "Mentors can update their assigned assessments" ON student_assessments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE id = student_assessments.assessment_id 
            AND instructor_id = auth.uid()
        )
    );

-- 8. Create RLS policies for assessment_attempts
CREATE POLICY "Students can manage their own attempts" ON assessment_attempts
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Mentors can view attempts for their assessments" ON assessment_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assessments 
            WHERE id = assessment_attempts.assessment_id 
            AND instructor_id = auth.uid()
        )
    );

-- 9. Create RLS policies for assessment_responses
CREATE POLICY "Students can manage their own responses" ON assessment_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM assessment_attempts 
            WHERE id = assessment_responses.attempt_id 
            AND student_id = auth.uid()
        )
    );

CREATE POLICY "Mentors can view responses for their assessments" ON assessment_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assessment_attempts aa
            JOIN assessments a ON aa.assessment_id = a.id
            WHERE aa.id = assessment_responses.attempt_id 
            AND a.instructor_id = auth.uid()
        )
    );

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(assessment_id, order_index);
CREATE INDEX IF NOT EXISTS idx_student_assessments_student_id ON student_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assessments_assessment_id ON student_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_attempt_id ON assessment_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_id ON assessment_responses(question_id);

-- 11. Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers for updated_at
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Migrate existing data (if any)
-- This will move questions from JSON in assessments table to questions table
DO $$
DECLARE
    assessment_record RECORD;
    question_data JSONB;
    question_item JSONB;
BEGIN
    -- Loop through assessments that have questions stored as JSON
    FOR assessment_record IN 
        SELECT id, questions 
        FROM assessments 
        WHERE questions IS NOT NULL 
        AND questions::text != 'null'
        AND questions::text != '[]'
    LOOP
        -- Parse the JSON questions array
        question_data := assessment_record.questions::JSONB;
        
        -- Insert each question into the questions table
        FOR question_item IN SELECT * FROM jsonb_array_elements(question_data)
        LOOP
            INSERT INTO questions (
                assessment_id,
                question_text,
                question_type,
                options,
                correct_answer,
                explanation,
                points,
                order_index
            ) VALUES (
                assessment_record.id,
                question_item->>'question_text',
                COALESCE(question_item->>'type', 'multiple-choice'),
                question_item->'options',
                question_item->>'correct_answer',
                question_item->>'explanation',
                COALESCE((question_item->>'points')::INTEGER, 1),
                COALESCE((question_item->>'order_index')::INTEGER, 1)
            );
        END LOOP;
    END LOOP;
END $$;

-- 14. Create student assignments for existing assessments
-- This will create student_assessments entries for students enrolled in courses
INSERT INTO student_assessments (student_id, assessment_id, assigned_by)
SELECT 
    e.student_id,
    a.id as assessment_id,
    a.instructor_id as assigned_by
FROM enrollments e
JOIN assessments a ON e.course_id = a.course_id
WHERE a.status = 'active'
ON CONFLICT (student_id, assessment_id) DO NOTHING;

-- 15. Clean up - Remove questions column from assessments table (optional)
-- ALTER TABLE assessments DROP COLUMN IF EXISTS questions;

COMMENT ON TABLE questions IS 'Individual questions for assessments';
COMMENT ON TABLE student_assessments IS 'Mapping of which students can access which assessments';
COMMENT ON TABLE assessment_attempts IS 'Student attempts at assessments';
COMMENT ON TABLE assessment_responses IS 'Student answers to individual questions';

