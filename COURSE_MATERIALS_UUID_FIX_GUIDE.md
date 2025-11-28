# Course Materials UUID Error Fix Guide

## 🚨 Problem
You're getting this error when trying to upload course materials:
```
❌ Error uploading material: Error: invalid input syntax for type uuid: "1"
POST https://supabase.dcodesys.in/rest/v1/course_materials?select=*%2Ccourse%3Acourses%28*%29%2CuploadedBy%3Aprofiles%28*%29 400 (Bad Request)
```

## 🔍 Root Cause
The issue is caused by two problems:
1. **UUID Type Mismatch**: The system is trying to use the number "1" as a UUID, which is invalid
2. **Missing Table**: The `course_materials` table might not exist or have proper structure
3. **Data Type Conversion**: The `lesson_id` field expects an integer but receives a string

## 🔧 Solution

### Step 1: Code Fix Applied
✅ **Fixed the `dataService.ts` file** - Added proper integer conversion for `lesson_id` field

### Step 2: Run the SQL Fix Script
1. Go to your Supabase Dashboard: `https://supabase.dcodesys.in`
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `fix-course-materials-uuid-error.sql`
4. Click **Run** to execute the script

### Step 3: What the Script Will Do
The script will:
- ✅ Create the `course_materials` table if it doesn't exist
- ✅ Add proper UUID default value for the `id` column
- ✅ Create necessary indexes for performance
- ✅ Set up RLS policies for course materials
- ✅ Ensure proper data types for all columns

## 📋 What the Fix Does

### Code Fix:
**Before Fix:**
```javascript
lesson_id: materialData.lessonId,  // ❌ Could be string "1"
```

**After Fix:**
```javascript
lesson_id: materialData.lessonId ? parseInt(materialData.lessonId.toString()) : null,  // ✅ Properly converted to integer
```

### SQL Script Fixes:
- ✅ Creates `course_materials` table with proper structure
- ✅ Adds UUID default value for `id` column
- ✅ Creates indexes for better performance
- ✅ Sets up RLS policies for security
- ✅ Ensures proper data types for all columns

## 🧪 Testing

### Test Course Materials Upload:
1. Go to your application's mentor upload course page
2. Try uploading a PDF or image file
3. Check browser console - no more UUID errors
4. Verify the material appears in the course materials list

## 🔍 Troubleshooting

### If the SQL script fails:
1. **Check permissions**: You might need admin access to create tables
2. **Check table exists**: Verify the `course_materials` table exists after running the script
3. **Check column types**: Ensure all columns have proper data types

### If uploads still fail after the fix:
1. **Wait for propagation**: Database changes might take a few minutes to propagate
2. **Refresh your application**: Clear browser cache and refresh the page
3. **Check authentication**: Ensure you're signed in as a mentor
4. **Check course ownership**: Ensure you're uploading to a course you created

### If you get permission errors:
1. **Check user role**: Ensure you're signed in as a mentor
2. **Check RLS policies**: Verify course materials policies are created
3. **Check database permissions**: Ensure proper database access

## 📁 Files Created
- `fix-course-materials-uuid-error.sql` - SQL script to fix the course materials table
- `COURSE_MATERIALS_UUID_FIX_GUIDE.md` - This guide

## ✅ Success Indicators
- No more "invalid input syntax for type uuid" errors
- Course materials upload successfully
- Materials appear in the course materials list
- No more 400 Bad Request errors

## 🎯 Expected Result
After running the fix:
- ✅ Course materials upload works without UUID errors
- ✅ Materials are properly stored in the database
- ✅ Mentors can upload PDFs, images, and other materials
- ✅ Students can access materials for enrolled courses

## 🔄 Related Issues
This fix also resolves similar issues with:
- Course creation (courses table)
- Enrollment creation (enrollments table)
- Any other table with missing UUID defaults
- Data type conversion errors
