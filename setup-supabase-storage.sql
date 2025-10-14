-- Setup Supabase Storage for Course Materials
-- Run this in your Supabase SQL Editor

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'application/pdf', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'application/pdf', 'image/jpeg', 'image/png', 'image/gif'];

-- Create RLS policies for course materials bucket
CREATE POLICY "Users can upload course materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view course materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-materials'
);

CREATE POLICY "Users can update their own course materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own course materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;