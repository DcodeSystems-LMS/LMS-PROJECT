-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('quiz', 'project', 'assignment')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    time_limit_minutes INTEGER,
    passing_score INTEGER DEFAULT 60,
    questions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'paused', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_results table
CREATE TABLE IF NOT EXISTS public.assessment_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    answers JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_taken_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessments
CREATE POLICY "Anyone can view assessments" ON public.assessments
    FOR SELECT USING (true);

CREATE POLICY "Instructors can create assessments" ON public.assessments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY "Instructors can update their assessments" ON public.assessments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('mentor', 'admin')
        )
    );

CREATE POLICY "Instructors can delete their assessments" ON public.assessments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('mentor', 'admin')
        )
    );

-- Create RLS policies for assessment_results
CREATE POLICY "Students can view their own results" ON public.assessment_results
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own results" ON public.assessment_results
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own results" ON public.assessment_results
    FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Instructors can view all results" ON public.assessment_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('mentor', 'admin')
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_course_id ON public.assessments(course_id);
CREATE INDEX IF NOT EXISTS idx_assessments_instructor_id ON public.assessments(instructor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON public.assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_student_id ON public.assessment_results(student_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON public.assessments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_results_updated_at 
    BEFORE UPDATE ON public.assessment_results 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample assessments
INSERT INTO public.assessments (title, description, course_id, instructor_id, type, difficulty, time_limit_minutes, passing_score, status) VALUES
('React Fundamentals Quiz', 'Test your knowledge of React basics', 
 (SELECT id FROM public.courses LIMIT 1), 
 (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), 
 'quiz', 'beginner', 30, 70, 'active'),
('JavaScript Advanced Project', 'Build a complex JavaScript application', 
 (SELECT id FROM public.courses LIMIT 1), 
 (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), 
 'project', 'advanced', NULL, 80, 'active'),
('HTML/CSS Assignment', 'Create a responsive website layout', 
 (SELECT id FROM public.courses LIMIT 1), 
 (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1), 
 'assignment', 'intermediate', 60, 75, 'draft');
