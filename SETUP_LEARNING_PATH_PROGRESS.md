# Setup Learning Path Progress Tracking

This guide will help you set up the database table for tracking student progress in learning paths.

## Quick Setup

### Step 1: Run the SQL Script

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `create-learning-path-progress-table.sql`
4. Click **"Run"** to execute the script

### Step 2: Verify Table Creation

After running the script, verify the table was created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see `learning_path_progress` table
3. Check that it has the following columns:
   - `id` (UUID, Primary Key)
   - `student_id` (UUID, Foreign Key to auth.users)
   - `learning_path_id` (UUID, Foreign Key to learning_paths)
   - `module_id` (UUID, Foreign Key to learning_path_modules)
   - `unit_id` (UUID, Foreign Key to learning_path_units)
   - `is_completed` (Boolean)
   - `completed_at` (Timestamp)
   - `time_spent` (Integer)
   - `last_position` (JSONB)
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

### Step 3: Verify RLS Policies

1. Go to **Authentication** → **Policies** in Supabase Dashboard
2. Find `learning_path_progress` table
3. Verify these policies exist:
   - ✅ "Students can view their own progress"
   - ✅ "Students can insert their own progress"
   - ✅ "Students can update their own progress"
   - ✅ "Mentors can view progress for their learning paths"

## How It Works

### When "Mark as Complete" Button is Clicked:

1. **Check Authentication**: Verifies user is logged in
2. **Check Existing Progress**: Looks for existing progress record
3. **Save to Database**:
   - If record exists: **Updates** the record with `is_completed = true`
   - If record doesn't exist: **Inserts** a new record with `is_completed = true`
4. **Update UI**: Marks module as completed in the sidebar with checkmark
5. **Navigate**: Automatically moves to next module

### When "Next" Button is Clicked:

1. **Save Progress**: Marks current module as complete (same as above)
2. **Navigate**: Moves to next module in the unit
3. **If Last Module**: Moves to first module of next unit

### When Learning Path is Reopened:

1. **Load Progress**: Fetches all completed modules for the student
2. **Resume Position**: Finds the last completed module
3. **Auto-Navigate**: Opens the next incomplete module automatically

## Database Schema Details

### Table: `learning_path_progress`

```sql
CREATE TABLE public.learning_path_progress (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id),
  module_id UUID NOT NULL REFERENCES learning_path_modules(id),
  unit_id UUID NOT NULL REFERENCES learning_path_units(id),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0,
  last_position JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);
```

### Key Features:

- **Unique Constraint**: One progress record per student per module
- **Cascade Delete**: Progress is deleted when student, learning path, or module is deleted
- **Automatic Timestamps**: `created_at` and `updated_at` are automatically managed
- **RLS Enabled**: Row Level Security ensures students can only see their own progress

## Troubleshooting

### Error: "Table does not exist"

**Solution**: Run the SQL script `create-learning-path-progress-table.sql` in Supabase SQL Editor

### Error: "Permission denied" or "Row Level Security policy violation"

**Solution**: 
1. Check that RLS policies are created correctly
2. Verify the user is authenticated
3. Check that `auth.uid()` matches the `student_id`

### Error: "Foreign key constraint violation"

**Solution**: 
1. Ensure the learning path, unit, and module exist in the database
2. Check that the IDs being used are valid UUIDs

### Progress Not Saving

**Check Console Logs**: The code includes detailed logging. Check browser console for:
- `💾 Saving module progress` - Shows when save starts
- `✅ Progress saved successfully` - Shows successful save
- `❌ Error saving progress` - Shows error details

**Common Issues**:
1. **User not authenticated**: Make sure user is logged in
2. **Table not created**: Run the SQL script
3. **RLS policies missing**: Re-run the SQL script to create policies
4. **Network error**: Check internet connection

### Testing the Setup

1. **Open Browser Console** (F12)
2. **Navigate to a learning path**
3. **Click "Mark as Complete"** on any module
4. **Check Console** for logs:
   - Should see: `💾 Saving module progress`
   - Should see: `✅ Progress saved successfully`
5. **Check Database**:
   - Go to Supabase Table Editor
   - Open `learning_path_progress` table
   - Should see a new row with your progress

## Manual Database Check

To manually verify progress is being saved:

```sql
-- View all progress for a specific student
SELECT * FROM learning_path_progress 
WHERE student_id = 'YOUR_STUDENT_ID'
ORDER BY completed_at DESC;

-- View progress for a specific learning path
SELECT * FROM learning_path_progress 
WHERE learning_path_id = 'YOUR_LEARNING_PATH_ID'
ORDER BY completed_at DESC;

-- Count completed modules per student
SELECT 
  student_id,
  learning_path_id,
  COUNT(*) as completed_modules
FROM learning_path_progress
WHERE is_completed = true
GROUP BY student_id, learning_path_id;
```

## Notes

- Progress is saved automatically when "Mark as Complete" or "Next" button is clicked
- The system automatically resumes from the last incomplete module
- Completed modules show a green checkmark (✓) in the sidebar
- Progress is tied to the authenticated user's ID
- Each module can only be marked as complete once per student (enforced by UNIQUE constraint)

