# 🚨 URGENT: Storage Bucket Setup Required

## Current Issue
Your application is trying to upload to `course-videos` bucket, but it doesn't exist in your self-hosted Supabase instance. This is causing the "new row violates row-level security policy" error.

## 🔧 IMMEDIATE SOLUTION

### Step 1: Access Your Supabase Dashboard
1. Go to `https://supabase.dcodesys.in`
2. Sign in with your admin credentials
3. Look for **Storage** in the left sidebar

### Step 2: Create Storage Buckets (CRITICAL)

#### Create `course-videos` bucket:
1. Click **"New bucket"** or **"Create bucket"**
2. **Bucket name**: `course-videos`
3. **Public bucket**: ✅ **YES** (this is crucial!)
4. **File size limit**: `2147483648` (2GB)
5. **Allowed MIME types**: 
   - `video/mp4`
   - `video/webm` 
   - `video/avi`
   - `video/mov`
   - `video/quicktime`
6. Click **"Create"**

#### Create `course-materials` bucket:
1. Click **"New bucket"**
2. **Bucket name**: `course-materials`
3. **Public bucket**: ✅ **YES**
4. **File size limit**: `209715200` (200MB)
5. **Allowed MIME types**:
   - `application/pdf`
   - `image/jpeg`
   - `image/png`
   - `image/gif`
   - `application/zip`
6. Click **"Create"**

### Step 3: Configure RLS Policies (CRITICAL)

#### Option A: Use SQL Editor (Recommended)
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste this SQL:

```sql
-- Create RLS policies for course-videos bucket
CREATE POLICY "Users can upload course videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view course videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-videos'
);

CREATE POLICY "Users can update course videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete course videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-videos' AND
  auth.role() = 'authenticated'
);

-- Create RLS policies for course-materials bucket
CREATE POLICY "Users can upload course materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view course materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'course-materials'
);

CREATE POLICY "Users can update course materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete course materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'course-materials' AND
  auth.role() = 'authenticated'
);
```

3. Click **"Run"**

#### Option B: Use Authentication → Policies
1. Go to **Authentication** → **Policies**
2. Find **storage.objects** table
3. Create policies manually for each operation (INSERT, SELECT, UPDATE, DELETE)

### Step 4: Test the Fix
After creating buckets and policies, run:
```bash
node verify-storage-setup.js
```

## 🎯 Expected Results
- ✅ No more "new row violates row-level security policy" errors
- ✅ Video uploads work successfully
- ✅ Files appear in Storage section of your dashboard

## ⚠️ IMPORTANT NOTES
1. **Both buckets MUST be public** - this is crucial for the application to work
2. **RLS policies are required** - without them, uploads will fail
3. **File size limits** - ensure they match the values above
4. **MIME types** - must include the video formats your app uses

## 🚨 If You Still Get Errors
1. **Check bucket exists**: Go to Storage section, verify both buckets are there
2. **Check bucket is public**: Bucket should show as "Public" 
3. **Check RLS policies**: Go to Authentication → Policies, verify storage.objects has policies
4. **Test with small file**: Try uploading a very small test file first

## 📞 Quick Test
After setup, try uploading a video in your application. The error should be gone and the upload should succeed.
