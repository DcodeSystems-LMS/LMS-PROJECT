-- Create course_materials table for mentor-uploaded materials
-- Run this in your Supabase SQL editor

-- Create course_materials table
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER, -- Optional: link to specific lesson
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size INTEGER NOT NULL, -- Size in bytes
  file_type TEXT NOT NULL, -- MIME type
  file_extension TEXT NOT NULL, -- e.g., 'pdf', 'docx', 'pptx'
  category TEXT DEFAULT 'general', -- e.g., 'slides', 'handout', 'code', 'reference'
  is_public BOOLEAN DEFAULT true, -- Whether students can download
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON public.course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_lesson_id ON public.course_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_uploaded_by ON public.course_materials(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_course_materials_category ON public.course_materials(category);

-- Enable Row Level Security
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for course_materials
-- Students can view materials for courses they're enrolled in
CREATE POLICY "Students can view materials for enrolled courses" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE student_id = auth.uid() 
      AND course_id = course_materials.course_id
    )
  );

-- Mentors can view all materials for their courses
CREATE POLICY "Mentors can view materials for their courses" ON public.course_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_materials.course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Mentors can insert materials for their courses
CREATE POLICY "Mentors can insert materials for their courses" ON public.course_materials
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Mentors can update materials for their courses
CREATE POLICY "Mentors can update materials for their courses" ON public.course_materials
  FOR UPDATE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Mentors can delete materials for their courses
CREATE POLICY "Mentors can delete materials for their courses" ON public.course_materials
  FOR DELETE USING (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE id = course_id 
      AND instructor_id = auth.uid()
    )
  );

-- Admins can manage all materials
CREATE POLICY "Admins can manage all materials" ON public.course_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update download count
CREATE OR REPLACE FUNCTION increment_material_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.course_materials 
  SET download_count = download_count + 1,
      updated_at = NOW()
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_material_download_count(UUID) TO authenticated;

-- Insert some sample materials for testing (optional)
-- INSERT INTO public.course_materials (
--   course_id, title, description, file_name, file_path, file_size, file_type, file_extension, category, uploaded_by
-- ) VALUES (
--   (SELECT id FROM public.courses LIMIT 1),
--   'CSS Flexbox Lecture Slides',
--   'Complete presentation slides for CSS Flexbox lesson',
--   'css-flexbox-slides.pdf',
--   'materials/css-flexbox-slides.pdf',
--   2516582,
--   'application/pdf',
--   'pdf',
--   'slides',
--   (SELECT id FROM public.profiles WHERE role = 'mentor' LIMIT 1)
-- );
