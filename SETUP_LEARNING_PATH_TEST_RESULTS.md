# Learning Path Test Results Setup

## Overview
This document explains how to set up the learning path test results tracking system.

## Steps to Complete

### 1. Create Database Table
Run the SQL script to create the `learning_path_test_results` table:

```bash
# Run this SQL file in Supabase SQL Editor
create-learning-path-test-results.sql
```

This will create:
- Table: `learning_path_test_results`
- Indexes for performance
- RLS (Row Level Security) policies
- Function to get next attempt number

### 2. Code Changes Completed

#### Student Side (Test Completion)
**File**: `src/pages/student/learning-path/detail/page.tsx`
- ✅ Updated `handleTestComplete` function to save test results to database
- ✅ Saves score, answers, test info, student info
- ✅ Handles attempt numbering
- ✅ Supports both unit tests and final tests

#### Mentor Side (View Completions)
**File**: `src/pages/mentor/learning-path/page.tsx`
- ✅ Updated `fetchTestCompletions` function
- ✅ Queries `learning_path_test_results` table (primary source)
- ✅ Falls back to `assessment_results` and `assessment_attempts` for old data
- ✅ Displays both unit tests and final tests
- ✅ Shows student name, score, completion date

### 3. What Gets Saved

When a student completes a test:
- Test ID
- Student ID
- Learning Path ID
- Unit ID (for unit tests)
- Test Type (unit/final)
- Score (percentage)
- Total Points
- Earned Points
- All Answers (as JSON)
- Completion Date/Time
- Attempt Number

### 4. Testing

1. **Create the table**: Run the SQL script in Supabase
2. **Student completes a test**: Take a learning path test
3. **Check database**: Verify the result is saved in `learning_path_test_results`
4. **Mentor views**: Click "Test Completions" button to see results

### 5. Database Schema

```sql
learning_path_test_results
├── id (UUID, Primary Key)
├── test_id (UUID, Foreign Key → learning_path_tests)
├── student_id (UUID, Foreign Key → profiles)
├── learning_path_id (UUID, Foreign Key → learning_paths)
├── unit_id (UUID, Foreign Key → learning_path_units, nullable)
├── test_type (unit | final)
├── score (INTEGER, 0-100)
├── total_points (INTEGER)
├── earned_points (INTEGER)
├── answers (JSONB)
├── status (completed | in_progress | abandoned)
├── started_at (TIMESTAMP)
├── completed_at (TIMESTAMP)
├── time_spent (INTEGER, seconds)
├── attempt_number (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 6. RLS Policies

- **Students**: Can view and create their own results
- **Mentors**: Can view results for their learning paths
- **Admins**: Can view all results (via admin role)

## Notes

- The system supports multiple attempts per test
- Old test results from `assessment_results` will still be visible (backward compatibility)
- New completions will be saved in `learning_path_test_results` table
- Both unit tests and final tests are tracked

## Next Steps

1. Run the SQL script to create the table
2. Test by completing a learning path test
3. Verify results appear in mentor's "Test Completions" view

