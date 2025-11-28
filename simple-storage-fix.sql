-- Simple Storage Fix for Self-Hosted Supabase
-- This version avoids syntax issues

-- Step 1: Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  2147483648, -- 2GB limit
  ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 2147483648,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/quicktime'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  209715200, -- 200MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/zip'];

-- Step 2: Create basic RLS policies
CREATE POLICY "course_videos_upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'course-videos');

CREATE POLICY "course_videos_view" ON storage.objects
FOR SELECT USING (bucket_id = 'course-videos');

CREATE POLICY "course_materials_upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "course_materials_view" ON storage.objects
FOR SELECT USING (bucket_id = 'course-materials');

-- Step 3: Grant permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
