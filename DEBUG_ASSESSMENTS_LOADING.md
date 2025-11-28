# Debug Assessments Loading Issue

## Problem
The assessments are not loading from the database, showing empty array `[]` in console logs.

## Debug Steps

### 1. Check Database Connection
Run the `debug-assessments-loading.sql` script in Supabase SQL Editor to check:
- If `assessments` table exists
- If there are any assessments in the database
- If RLS policies are blocking access
- If the user has proper permissions

### 2. Check Console Logs
Look for these specific log messages:
- `Testing Supabase connection...`
- `Supabase connection test passed` or `Supabase connection test failed`
- `Loaded assessments:` with actual data
- `Assessment count:` with number

### 3. Common Issues and Solutions

#### Issue 1: Table doesn't exist
**Error:** `relation "assessments" does not exist`
**Solution:** Run the database setup scripts:
```sql
-- Run simple-assessment-fix.sql first
-- Then run complete-assessment-database-setup.sql
```

#### Issue 2: RLS Policies blocking access
**Error:** No error but empty results
**Solution:** Check RLS policies and ensure user has access:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'assessments';

-- Disable RLS temporarily for testing
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
```

#### Issue 3: No assessments in database
**Solution:** Create a test assessment:
```sql
INSERT INTO assessments (
    title, description, type, course_id, instructor_id, mentor_id,
    time_limit, max_attempts, passing_score, is_active, status
) VALUES (
    'Test Assessment', 'Test Description', 'Quiz', 
    (SELECT id FROM courses LIMIT 1),
    'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9',
    'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9',
    30, 1, 60, true, 'draft'
);
```

#### Issue 4: Column name mismatch
**Error:** `column "mentor_id" does not exist`
**Solution:** Check if column is named `instructor_id` instead:
```sql
-- Check column names
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'assessments';

-- If mentor_id doesn't exist, add it:
ALTER TABLE assessments ADD COLUMN mentor_id UUID;
UPDATE assessments SET mentor_id = instructor_id;
```

### 4. Test Database Connection
The updated code now includes a connection test. Check console for:
- `Supabase connection test passed` - Database is accessible
- `Supabase connection test failed` - Database connection issue

### 5. Manual Database Check
Run this query in Supabase SQL Editor:
```sql
SELECT 
    a.*,
    c.title as course_title
FROM assessments a
LEFT JOIN courses c ON a.course_id = c.id
WHERE a.mentor_id = 'ffd9003f-4fc8-4010-89bf-9a1cb3c1cfa9'
ORDER BY a.created_at DESC;
```

## Expected Results
After fixing the issue, you should see:
- Console: `Supabase connection test passed`
- Console: `Loaded assessments: [array of assessments]`
- Console: `Assessment count: [number]`
- UI: Assessments list populated with data

## Next Steps
1. Run the debug SQL script
2. Check console logs for connection test results
3. Fix any database issues found
4. Test assessment creation to verify full functionality

