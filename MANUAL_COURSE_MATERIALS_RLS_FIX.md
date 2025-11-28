# Manual Course Materials RLS Policies Fix

## 🚨 Problem
You're getting "must be owner of table objects" error when trying to run SQL scripts. This happens when you don't have sufficient database privileges in your self-hosted Supabase instance.

## 🔧 Solution: Manual Setup via Dashboard

### Step 1: Access Storage Policies
1. Go to your Supabase Dashboard: `https://supabase.dcodesys.in`
2. Navigate to **Storage** in the left sidebar
3. Click on the **`course-materials`** bucket
4. Click on the **"Policies"** tab

### Step 2: Create 4 RLS Policies
You need to create these exact policies:

#### Policy 1: Upload Policy
- **Policy name**: `Users can upload course materials`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`

#### Policy 2: View Policy
- **Policy name**: `Users can view course materials`
- **Operation**: `SELECT`
- **Target roles**: `authenticated, anon`
- **USING expression**: `bucket_id = 'course-materials'`

#### Policy 3: Update Policy
- **Policy name**: `Users can update their own course materials`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`

#### Policy 4: Delete Policy
- **Policy name**: `Users can delete their own course materials`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`

### Step 3: Verify the Setup
After creating all 4 policies:
1. Go back to Storage in your dashboard
2. Check that the `course-materials` bucket exists
3. Verify it's marked as **Public**
4. Check the file size limit is 50MB
5. Verify the allowed MIME types include PDF and image formats

### Step 4: Test the Upload
1. Go to your application's mentor upload course page
2. Try uploading a small PDF or image file
3. Check browser console - the RLS error should be gone

## 🔍 Troubleshooting

### If you can't find the Policies tab:
1. Make sure you're in the Storage section
2. Click on the `course-materials` bucket specifically
3. Look for "Policies", "Security", or "RLS" tab

### If the policy creation fails:
1. Check that you have the right permissions in your Supabase instance
2. Try creating policies one at a time
3. Verify the exact syntax of the USING expressions

### If uploads still fail after creating policies:
1. Wait a few minutes for policies to propagate
2. Refresh your application page
3. Try uploading again
4. Check browser console for any remaining errors

## 📋 Quick Reference
**Policy Names to Create:**
1. `Users can upload course materials` (INSERT)
2. `Users can view course materials` (SELECT)  
3. `Users can update their own course materials` (UPDATE)
4. `Users can delete their own course materials` (DELETE)

**Common USING Expression:**
- Upload/Update/Delete: `bucket_id = 'course-materials' AND auth.role() = 'authenticated'`
- View: `bucket_id = 'course-materials'`

## ✅ Success Indicators
- No more "row violates row-level security policy" errors
- Course materials upload successfully to Supabase storage
- Upload progress shows correctly
- Files are accessible via public URLs

## 🎯 Expected Result
After creating these 4 RLS policies, course materials uploads should work without the "row violates row-level security policy" error. The mentor upload course functionality will be able to successfully upload PDFs, images, and other course materials to the `course-materials` bucket.
