# Manual Course Materials Table Setup

## 🚨 Problem
You're getting this error when trying to upload course materials:
```
❌ Error uploading material: Error: invalid input syntax for type uuid: "1"
POST https://supabase.dcodesys.in/rest/v1/course_materials?select=*%2Ccourse%3Acourses%28*%29%2CuploadedBy%3Aprofiles%28*%29 400 (Bad Request)
```

## 🔍 Root Cause
The `course_materials` table either:
1. Doesn't exist in your database
2. Has the wrong structure
3. Missing proper UUID default values
4. Missing RLS policies

## 🔧 Solution: Manual Setup via Dashboard

### Step 1: Check if Table Exists
1. Go to your Supabase Dashboard: `https://supabase.dcodesys.in`
2. Navigate to **Table Editor**
3. Look for `course_materials` table
4. If it doesn't exist, you need to create it

### Step 2: Create the Table (if missing)
If the table doesn't exist, you'll need to create it manually:

1. Go to **Table Editor** in your Supabase dashboard
2. Click **"New table"** or **"Create table"**
3. Configure with these exact settings:

#### Table Configuration:
- **Table name**: `course_materials`
- **Schema**: `public`

#### Columns to create:
1. **id** - UUID, Primary Key, Default: `gen_random_uuid()`
2. **course_id** - UUID, Foreign Key to `courses(id)`, NOT NULL
3. **lesson_id** - INTEGER, Nullable
4. **title** - TEXT, NOT NULL
5. **description** - TEXT, Nullable
6. **file_name** - TEXT, NOT NULL
7. **file_path** - TEXT, NOT NULL
8. **file_size** - INTEGER, NOT NULL
9. **file_type** - TEXT, NOT NULL
10. **file_extension** - TEXT, NOT NULL
11. **category** - TEXT, Default: 'general'
12. **is_public** - BOOLEAN, Default: true
13. **uploaded_by** - UUID, Foreign Key to `profiles(id)`, NOT NULL
14. **download_count** - INTEGER, Default: 0
15. **created_at** - TIMESTAMP WITH TIME ZONE, Default: NOW()
16. **updated_at** - TIMESTAMP WITH TIME ZONE, Default: NOW()

### Step 3: Create RLS Policies
1. Go to **Authentication** → **Policies** in your Supabase dashboard
2. Find the **course_materials** table
3. Create these policies:

#### Policy 1: Students can view materials
- **Policy name**: `Students can view materials for enrolled courses`
- **Operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: `is_public = true AND EXISTS (SELECT 1 FROM enrollments WHERE student_id = auth.uid() AND course_id = course_materials.course_id)`

#### Policy 2: Mentors can view materials
- **Policy name**: `Mentors can view materials for their courses`
- **Operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**: `EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND instructor_id = auth.uid())`

#### Policy 3: Mentors can upload materials
- **Policy name**: `Mentors can upload materials`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: `EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND instructor_id = auth.uid()) AND uploaded_by = auth.uid()`

#### Policy 4: Mentors can update materials
- **Policy name**: `Mentors can update their materials`
- **Operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**: `uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND instructor_id = auth.uid())`

#### Policy 5: Mentors can delete materials
- **Policy name**: `Mentors can delete their materials`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**: `uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM courses WHERE id = course_materials.course_id AND instructor_id = auth.uid())`

### Step 4: Test the Setup
After creating the table and policies:
1. Go to your application's mentor upload course page
2. Try uploading a PDF or image file
3. Check browser console - the UUID error should be gone

## 🔍 Troubleshooting

### If the table creation fails:
1. **Check permissions**: You might need admin access to create tables
2. **Check foreign keys**: Ensure `courses` and `profiles` tables exist
3. **Check data types**: Verify all column types are correct

### If uploads still fail after setup:
1. **Check RLS policies**: Ensure all 5 policies are created correctly
2. **Check authentication**: Ensure you're signed in as a mentor
3. **Check course ownership**: Ensure you're uploading to a course you created

### If you get permission errors:
1. **Contact admin**: You might need database admin privileges
2. **Use Supabase CLI**: If you have CLI access, you can create the table via command line
3. **Check instance status**: Ensure your Supabase instance is running properly

## 📋 Quick Checklist
- [ ] `course_materials` table exists
- [ ] Table has all required columns with correct data types
- [ ] `id` column has `gen_random_uuid()` default
- [ ] Foreign key constraints are properly set
- [ ] 5 RLS policies are created
- [ ] User is properly authenticated as mentor
- [ ] Test upload works without errors

## 🎯 Expected Result
After completing these steps, course materials uploads should work without the "invalid input syntax for type uuid" error. The mentor upload course functionality will be able to successfully upload PDFs, images, and other course materials.
