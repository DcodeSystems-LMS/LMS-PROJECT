-- Fix API Errors for Questions and Assessment Attempts
-- This script fixes the 400 errors by ensuring proper table structure

-- 1. Check if questions table exists and has required columns
DO $$
BEGIN
    -- Check if questions table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions' AND table_schema = 'public') THEN
        -- Create questions table if it doesn't exist
        CREATE TABLE public.questions (
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
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created questions table';
    ELSE
        RAISE NOTICE 'Questions table already exists';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'assessment_id' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'question_text' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN question_text TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'question_type' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN question_type VARCHAR(50) NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'options' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN options JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'correct_answer' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN correct_answer TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'explanation' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN explanation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'points' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN points INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'order_index' AND table_schema = 'public') THEN
        ALTER TABLE public.questions ADD COLUMN order_index INTEGER NOT NULL;
    END IF;
    
    RAISE NOTICE 'Verified questions table structure';
END $$;

-- 2. Check if assessment_attempts table exists and has required columns
DO $$
BEGIN
    -- Check if assessment_attempts table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assessment_attempts' AND table_schema = 'public') THEN
        -- Create assessment_attempts table if it doesn't exist
        CREATE TABLE public.assessment_attempts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
            assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            score INTEGER,
            status VARCHAR(20) DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
            time_spent INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created assessment_attempts table';
    ELSE
        RAISE NOTICE 'Assessment_attempts table already exists';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_attempts' AND column_name = 'score' AND table_schema = 'public') THEN
        ALTER TABLE public.assessment_attempts ADD COLUMN score INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessment_attempts' AND column_name = 'status' AND table_schema = 'public') THEN
        ALTER TABLE public.assessment_attempts ADD COLUMN status VARCHAR(20) DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned'));
    END IF;
    
    RAISE NOTICE 'Verified assessment_attempts table structure';
END $$;

-- 3. Enable RLS on tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- 4. Create basic RLS policies
DROP POLICY IF EXISTS "Questions are viewable by enrolled students" ON public.questions;
DROP POLICY IF EXISTS "Instructors can manage questions" ON public.questions;

CREATE POLICY "Questions are viewable by enrolled students" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.assessments a ON a.id = questions.assessment_id
      WHERE e.student_id = auth.uid() 
      AND e.course_id = a.course_id
    )
  );

CREATE POLICY "Instructors can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = questions.assessment_id 
      AND a.instructor_id = auth.uid()
    )
  );

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions(question_type);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON public.assessment_attempts(assessment_id);

-- 6. Test the tables
SELECT 'Tables verified successfully' as status;

-- 7. Show table structures
SELECT 
    'questions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questions' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'assessment_attempts' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'assessment_attempts' AND table_schema = 'public'
ORDER BY ordinal_position;
