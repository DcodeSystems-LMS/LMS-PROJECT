-- Check Current Storage Configuration
-- Run this in your Supabase SQL Editor to see current settings

-- Check all storage buckets and their configurations
SELECT 
  name,
  id,
  public,
  file_size_limit,
  ROUND(file_size_limit / 1024.0 / 1024.0, 2) as file_size_limit_mb,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
ORDER BY name;

-- Check storage policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
