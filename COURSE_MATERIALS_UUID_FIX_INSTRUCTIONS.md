# 🔧 Fix for Course Materials UUID Error

## Problem
When uploading course materials in the mentor interface (`http://localhost:3000/mentor/materials`), you're getting this error:
```
POST https://supabase.dcodesys.in/rest/v1/course_materials?select=*%2Ccourse%3Acourses%28*%29%2CuploadedBy%3Aprofiles%28*%29 400 (Bad Request)
❌ Error uploading material: Error: invalid input syntax for type uuid: "1"
```

## Root Cause
The error occurs because the `course_materials` table in your Supabase database either:
1. Doesn't exist, or
2. Has the wrong schema where `lesson_id` is defined as UUID instead of INTEGER, or
3. The RLS policies reference `mentor_id` instead of `instructor_id` (the correct column name)

## Solution

### Step 1: Apply the Database Fix
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `fix-course-materials-uuid-complete.sql`
4. Run the SQL script

This will:
- Drop and recreate the `course_materials` table with the correct schema
- Set up proper Row Level Security (RLS) policies
- Create necessary indexes
- Ensure `lesson_id` is INTEGER (not UUID)

### Step 2: Verify the Fix
1. Run the test script: `node test-course-materials-fix.js`
2. This will verify that the table structure is correct
3. Test inserting materials with lesson IDs

### Step 3: Test the Upload
1. Go to `http://localhost:3000/mentor/materials`
2. Select a course
3. Try uploading a material with a specific lesson
4. The upload should now work without the UUID error

## What the Fix Does

### Database Schema
```sql
CREATE TABLE public.course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER, -- ✅ INTEGER, not UUID
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_extension TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_public BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Points
- `lesson_id` is correctly defined as `INTEGER` (not UUID)
- The frontend code correctly passes integer lesson IDs (1, 2, 3, etc.)
- RLS policies are set up for proper access control
- Indexes are created for better performance

## Files Created
- `fix-course-materials-uuid-complete.sql` - Complete database fix
- `test-course-materials-fix.js` - Test script to verify the fix
- `COURSE_MATERIALS_UUID_FIX_INSTRUCTIONS.md` - This instruction file

## After Applying the Fix
1. The UUID error should be resolved
2. You can upload materials linked to specific lessons
3. Materials will be properly stored in the database
4. Students will be able to download materials for enrolled courses

## Troubleshooting
If you still get errors after applying the fix:
1. Check that the SQL script ran successfully
2. Verify the table structure in Supabase Dashboard
3. Run the test script to identify any remaining issues
4. Check the browser console for any new error messages

The fix addresses the core issue where the database was expecting UUIDs but receiving integers for the `lesson_id` field.
