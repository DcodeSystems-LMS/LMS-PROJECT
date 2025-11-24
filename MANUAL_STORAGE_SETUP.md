# Manual Storage Setup for Self-Hosted Supabase

## 🚨 Issue
Your self-hosted Supabase instance has restrictive RLS policies that prevent automatic bucket creation. You need to create the storage buckets manually.

## 🔧 Manual Setup Steps

### Step 1: Access Your Supabase Dashboard
1. Go to `https://supabase.dcodesys.in`
2. Sign in with your admin credentials
3. Navigate to the **Storage** section in the left sidebar

### Step 2: Create Storage Buckets

#### Create `course-videos` bucket:
1. Click **"New bucket"**
2. **Name**: `course-videos`
3. **Public**: ✅ Yes (check this box)
4. **File size limit**: `2147483648` (2GB)
5. **Allowed MIME types**: 
   - `video/mp4`
   - `video/webm`
   - `video/avi`
   - `video/mov`
   - `video/quicktime`
6. Click **"Create bucket"**

#### Create `course-materials` bucket:
1. Click **"New bucket"**
2. **Name**: `course-materials`
3. **Public**: ✅ Yes (check this box)
4. **File size limit**: `209715200` (200MB)
5. **Allowed MIME types**:
   - `application/pdf`
   - `image/jpeg`
   - `image/png`
   - `image/gif`
   - `application/zip`
6. Click **"Create bucket"**

### Step 3: Configure RLS Policies
1. Go to **Authentication** → **Policies** in the left sidebar
2. Find the **storage.objects** table
3. Create the following policies:

#### For course-videos bucket:
- **Policy Name**: "Users can upload course videos"
- **Operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-videos' AND auth.role() = 'authenticated'`

- **Policy Name**: "Users can view course videos"
- **Operation**: SELECT
- **Target roles**: authenticated, anon
- **USING expression**: `bucket_id = 'course-videos'`

- **Policy Name**: "Users can update course videos"
- **Operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-videos' AND auth.role() = 'authenticated'`

- **Policy Name**: "Users can delete course videos"
- **Operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-videos' AND auth.role() = 'authenticated'`

#### For course-materials bucket:
- **Policy Name**: "Users can upload course materials"
- **Operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`

- **Policy Name**: "Users can view course materials"
- **Operation**: SELECT
- **Target roles**: authenticated, anon
- **USING expression**: `bucket_id = 'course-materials'`

- **Policy Name**: "Users can update course materials"
- **Operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`

- **Policy Name**: "Users can delete course materials"
- **Operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`

### Step 4: Alternative - Use SQL Editor
If you have admin access, you can run the SQL directly:

1. Go to **SQL Editor** in the left sidebar
2. Copy and paste the contents of `fix-storage-permissions.sql`
3. Click **"Run"**

## 🧪 Verification
After setting up the buckets, test the configuration:

```bash
node test-storage-config.js
```

## 🎯 Expected Results
- ✅ `course-videos` bucket visible in Storage section
- ✅ `course-materials` bucket visible in Storage section
- ✅ Both buckets marked as public
- ✅ Video uploads working in your application
- ✅ No more "new row violates row-level security policy" errors

## 📱 Testing
1. **Go to your application** at `http://localhost:3000`
2. **Try uploading a video**
3. **Check browser console** - should show successful upload
4. **Verify in Supabase dashboard** - file should appear in Storage → course-videos

## 🔍 Troubleshooting
If you still get errors:
1. **Check bucket permissions** - ensure buckets are public
2. **Verify RLS policies** - check that policies are active
3. **Test authentication** - make sure you're logged in
4. **Check file size** - ensure file is under the limit
5. **Verify MIME type** - ensure file type is allowed
