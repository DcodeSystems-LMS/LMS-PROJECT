-- Setup Demo Videos Bucket for DCodesystems LMS
-- Run this in your Supabase SQL Editor

-- Create storage bucket for demo videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demo-videos',
  'demo-videos',
  true,
  1073741824, -- 1GB limit
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 1073741824,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'];

-- Create RLS policies for demo videos bucket
CREATE POLICY "Anyone can view demo videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'demo-videos'
);

CREATE POLICY "Authenticated users can upload demo videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'demo-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update demo videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'demo-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete demo videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'demo-videos' AND
  auth.role() = 'authenticated'
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets TO anon;

-- Verify bucket creation
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'demo-videos';












