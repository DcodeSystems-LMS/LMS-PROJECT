# Assessment Creation Debug Guide

## 🔍 **Check Assessment Fields Database Save**

You want to verify if assessment fields are being saved to the database when creating a new assessment. Here's how to check:

## 📋 **Step 1: Run Database Check**

### **Option A: SQL Check (Recommended)**
1. Go to your **Supabase SQL Editor**
2. Copy and run the contents of `test-assessment-creation.sql`
3. This will show you:
   - What columns exist in the assessments table
   - What data is currently saved
   - Test creating an assessment

### **Option B: JavaScript Check**
1. Run the `debug-assessment-creation.js` script
2. This will show you detailed information about the database structure

## 🔧 **Step 2: Check What Fields Are Available**

### **Expected Assessment Fields:**
```sql
-- Check what columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;
```

### **Expected Fields:**
- ✅ `id` - Primary key
- ✅ `title` - Assessment title
- ✅ `description` - Assessment description
- ✅ `course_id` - Course reference
- ✅ `instructor_id` - Instructor reference (existing)
- ✅ `mentor_id` - Mentor reference (new)
- ✅ `type` - Assessment type (quiz, test, etc.)
- ✅ `status` - Assessment status (draft, published, etc.)
- ✅ `time_limit` - Time limit in minutes
- ✅ `max_attempts` - Maximum attempts allowed
- ✅ `passing_score` - Passing score percentage
- ✅ `created_at` - Creation timestamp
- ✅ `updated_at` - Update timestamp

## 🎯 **Step 3: Test Assessment Creation**

### **Create a Test Assessment:**
```sql
-- Test creating an assessment
INSERT INTO assessments (
    title,
    description,
    course_id,
    instructor_id,
    mentor_id,
    type,
    status,
    time_limit,
    max_attempts,
    passing_score
) VALUES (
    'Test Assessment',
    'Test Description',
    (SELECT id FROM courses LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    'quiz',
    'draft',
    30,
    3,
    70
);
```

### **Check What Was Saved:**
```sql
-- Check the created assessment
SELECT 
    id,
    title,
    description,
    course_id,
    instructor_id,
    mentor_id,
    type,
    status,
    time_limit,
    max_attempts,
    passing_score,
    created_at,
    updated_at
FROM assessments 
WHERE title = 'Test Assessment';
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Column does not exist"**
**Solution:** Run the `simple-assessment-fix.sql` script first

### **Issue 2: "Relation does not exist"**
**Solution:** The tables haven't been created yet. Run the database setup scripts

### **Issue 3: Fields not saving**
**Possible causes:**
- Frontend not sending the data
- Backend not processing the data
- Database constraints preventing save
- RLS policies blocking the insert

## 🔍 **Debug Steps**

### **1. Check Frontend Data:**
```javascript
// In your React component, check what data is being sent
console.log('Assessment data being sent:', assessmentData);
```

### **2. Check Backend Processing:**
```javascript
// In your service, check what's being received
console.log('Received assessment data:', data);
```

### **3. Check Database Insert:**
```sql
-- Check if the insert is successful
SELECT COUNT(*) FROM assessments WHERE title = 'Your Assessment Title';
```

## 📊 **Expected Results**

### **After Running the Fix Script:**
- ✅ `mentor_id` column exists
- ✅ `status` column exists
- ✅ `type` column exists
- ✅ `time_limit` column exists
- ✅ `max_attempts` column exists
- ✅ All fields save correctly

### **After Creating an Assessment:**
- ✅ Assessment appears in database
- ✅ All fields are populated
- ✅ No error messages
- ✅ Can add questions to assessment

## 🎯 **Quick Test**

Run this simple test to verify everything is working:

```sql
-- 1. Check table structure
SELECT column_name FROM information_schema.columns WHERE table_name = 'assessments';

-- 2. Create test assessment
INSERT INTO assessments (title, description, type, status) 
VALUES ('Test', 'Test Description', 'quiz', 'draft');

-- 3. Check if it was saved
SELECT * FROM assessments WHERE title = 'Test';

-- 4. Clean up
DELETE FROM assessments WHERE title = 'Test';
```

## ✅ **Success Indicators**

You'll know everything is working when:
- ✅ No error messages when creating assessments
- ✅ All fields are visible in the database
- ✅ Assessment data is properly saved
- ✅ Questions can be added to assessments
- ✅ Students can access the assessments

---

**🎉 Once this is working, your assessment system will be fully functional!**

If you're still having issues, run the debug scripts and share the output so we can identify the specific problem.
