-- Create Storage Bucket for Course Materials (PDFs, Documents, etc.)
-- Run this in your Supabase SQL Editor

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  52428800, -- 50MB limit for PDFs and documents
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'application/zip']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'application/zip'];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can update course materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete course materials" ON storage.objects;

-- Create RLS policies for course-materials bucket
-- Allow authenticated users to upload materials
CREATE POLICY "Users can upload course materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

-- Allow everyone to view materials (public bucket)
CREATE POLICY "Anyone can view course materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-materials'
);

-- Allow authenticated users to update materials
CREATE POLICY "Users can update course materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete materials
CREATE POLICY "Users can delete course materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

