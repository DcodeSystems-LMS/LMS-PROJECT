# Setup Course Thumbnails Storage Bucket

## 🚨 Issue
The Learning Path feature requires a storage bucket named `course-thumbnails` to upload course thumbnail images. If you see the error "Bucket not found", you need to create this bucket in Supabase.

## 🔧 Quick Fix

### Option 1: Using SQL Editor (Recommended)

1. **Access your Supabase Dashboard**
   - Go to `https://supabase.dcodesys.in`
   - Sign in with your admin credentials

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the SQL Script**
   - Open the file `create-course-thumbnails-bucket.sql` in your project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`

4. **Verify the Bucket**
   - Go to **Storage** in the left sidebar
   - You should see `course-thumbnails` bucket listed
   - Ensure it's marked as **Public**

### Option 2: Manual Setup via Dashboard

1. **Access Supabase Dashboard**
   - Go to `https://supabase.dcodesys.in`
   - Sign in with your admin credentials

2. **Create Storage Bucket**
   - Click on **Storage** in the left sidebar
   - Click **"New bucket"** or **"Create bucket"** button

3. **Configure the Bucket**
   - **Bucket name**: `course-thumbnails` (exact name required)
   - **Public bucket**: ✅ **YES** (check this box - very important!)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/gif`
     - `image/webp`

4. **Create the Bucket**
   - Click **"Create bucket"**

5. **Set up RLS Policies**
   - Click on the `course-thumbnails` bucket you just created
   - Go to the **Policies** tab
   - Create the following policies:

#### Policy 1: Upload Policy
- **Policy Name**: "Users can upload course thumbnails"
- **Operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated'`

#### Policy 2: View Policy
- **Policy Name**: "Anyone can view course thumbnails"
- **Operation**: SELECT
- **Target roles**: authenticated, anon
- **USING expression**: `bucket_id = 'course-thumbnails'`

#### Policy 3: Update Policy
- **Policy Name**: "Users can update course thumbnails"
- **Operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated'`

#### Policy 4: Delete Policy
- **Policy Name**: "Users can delete course thumbnails"
- **Operation**: DELETE
- **Target roles**: authenticated
- **USING expression**: `bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated'`

## ✅ Verification

After setup, verify the bucket exists:
1. Go to **Storage** → **Buckets**
2. You should see `course-thumbnails` listed
3. Click on it to verify it's set to **Public**
4. Check the **Policies** tab to ensure all 4 policies are created

## 🔍 Troubleshooting

If you still see errors after setup:
1. **Check bucket name**: Must be exactly `course-thumbnails` (lowercase, with hyphen)
2. **Check public setting**: The bucket must be marked as public
3. **Check RLS policies**: All 4 policies must be created
4. **Refresh the page**: Clear browser cache and refresh
5. **Check user authentication**: Ensure you're logged in as an authenticated user

## 📝 Note

- The bucket is used specifically for learning path thumbnails
- Maximum file size is 10MB (suitable for thumbnail images)
- Only image files are allowed (JPEG, PNG, GIF, WebP)
- The bucket must be public to allow direct access to thumbnail URLs

