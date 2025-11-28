# Storage Setup Guide for Self-Hosted Supabase

## 🚨 Issue Identified
Your self-hosted Supabase instance doesn't have the required storage buckets and RLS policies configured. This is causing the video upload errors.

## 🔧 Solution

### Option 1: Manual Setup (Recommended)
1. **Access your Supabase dashboard** at `https://supabase.dcodesys.in`
2. **Go to SQL Editor** in the left sidebar
3. **Run the following SQL** to create storage buckets and RLS policies:

```sql
-- Create storage buckets
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

-- Create RLS policies for course videos
CREATE POLICY "Users can upload course videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view course videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-videos'
);

CREATE POLICY "Users can update their own course videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own course videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

-- Create RLS policies for course materials
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
```

### Option 2: Use the SQL File
1. **Open** `fix-storage-rls-complete.sql` in your text editor
2. **Copy the entire contents**
3. **Paste into your Supabase SQL Editor**
4. **Run the SQL**

## 🧪 Verification
After running the SQL, test the setup:

```bash
node test-storage-config.js
```

## 🎯 Expected Results
- ✅ `course-videos` bucket created
- ✅ `course-materials` bucket created  
- ✅ RLS policies configured
- ✅ Video uploads working
- ✅ No more "new row violates row-level security policy" errors

## 📱 Testing
1. **Go to your application** at `http://localhost:3000`
2. **Try uploading a video**
3. **Check browser console** - should show successful upload
4. **Verify in Supabase dashboard** - file should appear in Storage

## 🔍 Troubleshooting
If you still get errors:
1. **Check authentication** - make sure you're logged in
2. **Verify bucket exists** - check Storage section in dashboard
3. **Check RLS policies** - ensure policies are active
4. **Test with small file** - try uploading a small test file first
