-- Create Storage Bucket for Course Thumbnails
-- Run this in your Supabase SQL Editor

-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  10485760, -- 10MB limit for thumbnails
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update course thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete course thumbnails" ON storage.objects;

-- Create RLS policies for course-thumbnails bucket
-- Allow authenticated users to upload thumbnails
CREATE POLICY "Users can upload course thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Allow everyone to view thumbnails (public bucket)
CREATE POLICY "Anyone can view course thumbnails" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-thumbnails'
);

-- Allow authenticated users to update thumbnails
CREATE POLICY "Users can update course thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete thumbnails
CREATE POLICY "Users can delete course thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

