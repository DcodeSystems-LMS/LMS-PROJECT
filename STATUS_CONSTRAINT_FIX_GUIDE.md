# 🔧 Status Constraint Error Fix Guide

## 🚨 **Problem:**
The database has a check constraint that doesn't allow 'active' status values, causing this error:
```
new row for relation "assessments" violates check constraint "assessments_status_check"
```

## ✅ **Solution Steps:**

### **Step 1: Fix Existing Database Data**
Run this SQL in Supabase SQL Editor to update existing assessments:

```sql
-- Fix existing assessments with invalid status values
-- 1. Update any 'active' status to 'published'
UPDATE assessments 
SET status = 'published' 
WHERE status = 'active';

-- 2. Update any 'inactive' status to 'draft'  
UPDATE assessments 
SET status = 'draft' 
WHERE status = 'inactive';

-- 3. Check the results
SELECT DISTINCT status, COUNT(*) as count
FROM assessments 
GROUP BY status;
```

### **Step 2: Verify Status Values**
Check what status values are actually allowed:

```sql
-- Check the constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%status%' 
AND conrelid = 'assessments'::regclass;
```

### **Step 3: Test the Fix**
After running the SQL:
1. Refresh the assessments page
2. Try toggling assessment status
3. Check that no more constraint errors occur

## 🎯 **Expected Results:**

- ✅ **Before:** Assessments with 'active'/'inactive' status (causing errors)
- ✅ **After:** Assessments with 'draft'/'published' status (working properly)

## 📊 **Status Mapping:**

| Old Status | New Status | Display | Color |
|------------|------------|---------|-------|
| `active`   | `published` | Published | Green |
| `inactive` | `draft`     | Draft     | Gray  |

## 🔄 **Code Changes Made:**

1. **Toggle Logic:** Handles both old and new status values
2. **Display Logic:** Shows correct labels for both status types
3. **Statistics:** Counts both 'published' and 'active' as active
4. **Database Updates:** Always saves as 'draft' or 'published'

## 🚀 **Next Steps:**

1. Run the SQL script in Supabase
2. Test the status toggle functionality
3. Verify no more constraint errors
4. All assessments should now work properly





