# Assessment Schema Fix Guide

## 🚨 **URGENT: Column Name Mismatch Fix**

The error `column "mentor_id" does not exist` occurs because your existing database schema uses `instructor_id` instead of `mentor_id`. This migration script will fix this issue.

## 📋 **Quick Fix Steps**

### **1. Run the Migration Script**
1. Go to your **Supabase SQL Editor**
2. Copy the entire contents of `fix-assessment-schema-migration.sql`
3. Paste and execute it

### **2. What This Script Does**
✅ **Adds missing columns** to the existing `assessments` table
✅ **Creates new tables** for the assessment system
✅ **Copies data** from `instructor_id` to `mentor_id`
✅ **Creates RLS policies** for security
✅ **Adds performance indexes**
✅ **Maintains backward compatibility**

## 🔧 **What Gets Fixed**

### **Assessment Table Updates:**
- ✅ Adds `mentor_id` column (copies from `instructor_id`)
- ✅ Adds `status` column (draft, published, closed, archived)
- ✅ Adds `type` column (quiz, test, assignment, project, coding_challenge)
- ✅ Adds `time_limit`, `max_attempts`, `available_from`, `available_until`
- ✅ Adds `settings`, `security_settings`, `tags`, `weightage`, `category`
- ✅ Adds `difficulty_level`, `language`, `bloom_taxonomy_level`

### **New Tables Created:**
- ✅ `questions` - Individual questions with rich content support
- ✅ `assessment_attempts` - Student attempts with timing
- ✅ `question_responses` - Student answers with grading
- ✅ `student_progress` - Progress tracking and save/resume

### **Security & Performance:**
- ✅ **RLS Policies** for all tables
- ✅ **Performance Indexes** for fast queries
- ✅ **Full-text Search** capabilities
- ✅ **Backward Compatibility** view

## 🎯 **After Running the Script**

### **Verify Success:**
```sql
-- Check if mentor_id column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'assessments' AND column_name = 'mentor_id';

-- Check if questions table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'questions';

-- Test creating an assessment
INSERT INTO assessments (title, description, mentor_id, course_id) 
VALUES ('Test Assessment', 'Test Description', auth.uid(), (SELECT id FROM courses LIMIT 1));
```

### **Expected Results:**
- ✅ No more "column does not exist" errors
- ✅ Assessment creation works
- ✅ Questions can be added
- ✅ Students can access assessments
- ✅ All advanced features available

## 🔍 **Troubleshooting**

### **If you get permission errors:**
```sql
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### **If mentor_id is still NULL:**
```sql
-- Manually copy instructor_id to mentor_id
UPDATE assessments 
SET mentor_id = instructor_id 
WHERE mentor_id IS NULL;
```

### **If tables still don't exist:**
1. Check the SQL Editor for error messages
2. Ensure you're running the script in the correct Supabase project
3. Verify you have admin permissions

## 📊 **Data Migration**

The script automatically:
- ✅ **Preserves existing data** in the assessments table
- ✅ **Copies instructor_id to mentor_id** for compatibility
- ✅ **Maintains all existing relationships**
- ✅ **Creates new tables without affecting existing data**

## 🚀 **Next Steps**

After running the migration:

1. **Test Assessment Creation** - Try creating a new assessment
2. **Test Question Addition** - Add questions to assessments
3. **Test Student Access** - Verify students can view assigned assessments
4. **Check Analytics** - Verify analytics data is being collected

## ✅ **Success Indicators**

You'll know the migration is successful when:
- ✅ No more "column does not exist" errors
- ✅ Assessment creation works without errors
- ✅ Questions can be added to assessments
- ✅ Students can access assigned assessments
- ✅ All advanced features are functional

---

**🎉 Once this migration is complete, your assessment system will be fully functional with all advanced features!**

The script is designed to be safe and non-destructive, preserving all existing data while adding the new functionality.
