# 🔧 Fix: Course Materials Not Showing in Download Modal

## 🎯 **Problem Identified**

The "Download Materials" button is working correctly, but the modal shows "No materials available for this course yet" even when materials have been uploaded by the mentor. This is likely due to **Row Level Security (RLS) policies** blocking access.

## 🔍 **Root Cause Analysis**

The issue is in the RLS policy for the `course_materials` table:

```sql
CREATE POLICY "Students can view materials for enrolled courses" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (
      SELECT 1 FROM public.enrollments 
      WHERE student_id = auth.uid() 
      AND course_id = course_materials.course_id
    )
  );
```

This policy requires that:
1. ✅ Material is public (`is_public = true`)
2. ❌ **Student is enrolled in the course** (exists in `enrollments` table)

## 🚀 **Solutions (Choose One)**

### **Solution 1: Quick Fix - Update RLS Policy (Recommended)**

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;

-- Create a more permissive policy for testing
CREATE POLICY "Authenticated users can view public materials" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND
    auth.uid() IS NOT NULL
  );
```

### **Solution 2: Enroll Student in Course**

If you want to keep the enrollment requirement, enroll the student:

```sql
-- Replace with actual student ID and course ID
INSERT INTO public.enrollments (student_id, course_id)
VALUES ('STUDENT_USER_ID', 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b')
ON CONFLICT (student_id, course_id) DO NOTHING;
```

### **Solution 3: Comprehensive Policy (Best for Production)**

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Students can view materials for enrolled courses" ON public.course_materials;

-- Create comprehensive policy
CREATE POLICY "Students and instructors can view materials" ON public.course_materials
  FOR SELECT USING (
    is_public = true AND (
      -- Students enrolled in the course
      EXISTS (
        SELECT 1 FROM public.enrollments 
        WHERE student_id = auth.uid() 
        AND course_id = course_materials.course_id
      ) OR
      -- Course instructors
      EXISTS (
        SELECT 1 FROM public.courses 
        WHERE id = course_materials.course_id 
        AND instructor_id = auth.uid()
      )
    )
  );
```

## 🧪 **Testing Steps**

1. **Apply one of the solutions above**
2. **Refresh the course page**
3. **Click "Download Materials"**
4. **Verify materials appear in the modal**

## 🔧 **Alternative: Temporary Bypass**

If you need an immediate fix, you can temporarily disable RLS for testing:

```sql
-- TEMPORARY: Disable RLS for testing (NOT for production)
ALTER TABLE public.course_materials DISABLE ROW LEVEL SECURITY;
```

**⚠️ Remember to re-enable RLS after testing:**

```sql
-- Re-enable RLS
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
```

## 📋 **Files Created for Debugging**

- `fix-materials-rls-policy.sql` - Complete RLS policy fixes
- `fix-student-enrollment.sql` - Enrollment management
- `test-materials-debug.html` - Browser-based debugging tool
- `debug-course-materials.js` - Node.js debugging script

## 🎯 **Expected Result**

After applying the fix:
1. ✅ Download Materials button opens modal
2. ✅ Modal shows available course materials
3. ✅ Students can select and download materials
4. ✅ Download functionality works correctly

## 🔍 **Debugging Commands**

If issues persist, check:

```sql
-- Check if materials exist
SELECT * FROM public.course_materials WHERE course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';

-- Check enrollments
SELECT * FROM public.enrollments WHERE course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'course_materials';
```

## ✅ **Status**

- ✅ Download Materials button functionality implemented
- ✅ Modal UI created and working
- ✅ Download service integrated
- 🔧 RLS policy issue identified and solutions provided
- ⏳ **Next Step**: Apply one of the SQL solutions above


