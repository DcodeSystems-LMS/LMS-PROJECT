# Setup Course Storage Buckets

This guide will help you set up the storage buckets needed for learning path file uploads in the mentor learning path page.

## Buckets Needed

1. **course-materials** - For PDF files and documents
2. **course-videos** - For video files

## Quick Setup

### Option 1: Run the Combined SQL Script (Recommended)

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `setup-course-storage-buckets.sql`
4. Click "Run" to execute the script
5. This will create both buckets with proper RLS policies

### Option 2: Run Individual Scripts

If you prefer to set up buckets separately:

#### For PDF Uploads (course-materials):
1. Run `create-course-materials-bucket.sql` in Supabase SQL Editor

#### For Video Uploads (course-videos):
1. Run `create-course-videos-bucket.sql` in Supabase SQL Editor (if not already created)

## Manual Setup via Dashboard

If you prefer to set up via the Supabase Dashboard:

### Create course-materials Bucket

1. Go to **Storage** in your Supabase Dashboard
2. Click **"New bucket"**
3. Fill in the details:
   - **Name**: `course-materials`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: `52428800` (50 MB)
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
     - `image/jpeg`
     - `image/png`
     - `image/gif`
     - `application/zip`
4. Click **"Create bucket"**

### Set Up RLS Policies for course-materials

1. After creating the bucket, go to **Storage** → **Policies**
2. Select the `course-materials` bucket
3. Create the following policies:

#### Policy 1: Upload
- **Policy name**: `Users can upload course materials`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'course-materials' AND auth.role() = 'authenticated'
  ```

#### Policy 2: View
- **Policy name**: `Anyone can view course materials`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'course-materials'
  ```

#### Policy 3: Update
- **Policy name**: `Users can update course materials`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  bucket_id = 'course-materials' AND auth.role() = 'authenticated'
  ```

#### Policy 4: Delete
- **Policy name**: `Users can delete course materials`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'course-materials' AND auth.role() = 'authenticated'
  ```

### Create course-videos Bucket (if needed)

1. Go to **Storage** in your Supabase Dashboard
2. Click **"New bucket"**
3. Fill in the details:
   - **Name**: `course-videos`
   - **Public bucket**: ✅ Enable (checked)
   - **File size limit**: `524288000` (500 MB)
   - **Allowed MIME types**: 
     - `video/mp4`
     - `video/webm`
     - `video/avi`
     - `video/mov`
     - `video/quicktime`
4. Click **"Create bucket"**

Set up similar RLS policies for `course-videos` bucket.

## Troubleshooting

### Error: "Bucket not found"

If you get a "Bucket not found" error:

1. **Check if bucket exists**: Go to Storage in Supabase Dashboard and verify the bucket name is exactly `course-materials` (case-sensitive)

2. **Verify RLS policies**: Make sure the RLS policies are created correctly:
   - Go to Storage → Policies
   - Check that policies exist for the bucket
   - Verify the policy conditions match the SQL script

3. **Check permissions**: Ensure authenticated users have permissions:
   ```sql
   GRANT ALL ON storage.objects TO authenticated;
   GRANT ALL ON storage.buckets TO authenticated;
   ```

4. **Re-run the SQL script**: Sometimes it helps to drop and recreate policies:
   - The SQL scripts include `DROP POLICY IF EXISTS` statements
   - Re-running the script will recreate everything cleanly

### Error: "Permission denied"

If you get permission errors:

1. Check that the user is authenticated
2. Verify RLS policies allow the operation
3. Ensure the bucket is public (for SELECT operations)

### Error: "File size exceeds limit"

If you get file size errors:

1. Check the bucket's file size limit in Storage settings
2. Increase the limit if needed (update in both SQL script and dashboard)
3. Note: Very large files may require different storage solutions

## Verification

After setup, verify the buckets exist:

1. Go to **Storage** in Supabase Dashboard
2. You should see both buckets:
   - `course-materials`
   - `course-videos`
3. Try uploading a test PDF file through the mentor learning path page

## Notes

- Bucket names are case-sensitive: `course-materials` (with hyphen, lowercase)
- PDF files go to `course-materials` bucket
- Video files go to `course-videos` bucket
- All buckets are public for easy access by students
- Authenticated users can upload, update, and delete files

