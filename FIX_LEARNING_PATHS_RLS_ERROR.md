# Fix Learning Paths RLS Error (401 Unauthorized)

## Error
```
POST https://supabase.dcodesys.in/rest/v1/learning_paths?select=* 401 (Unauthorized)
Error: new row violates row-level security policy for table "learning_paths"
```

## Root Cause
The `learning_paths` table has Row Level Security (RLS) enabled, but the RLS policies are either:
1. Not created in the database
2. Too restrictive
3. Not checking authentication properly

## Solution

### Step 1: Run SQL Fix in Supabase

1. **Open Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the SQL Script:**
   - Open `fix-learning-paths-rls-simple.sql` 
   - Copy and paste the entire script
   - Click **Run** or press F5

This script will:
- Drop existing policies (if any)
- Create proper RLS policies that:
  - Allow anyone to view learning paths
  - Allow mentors/admins to create learning paths
  - Allow mentors to update/delete their own learning paths
  - Match the pattern used for the `courses` table

### Step 2: Verify User Authentication

The service now includes authentication verification, but ensure:

1. **User is logged in:**
   - The mentor must be authenticated
   - Session must be valid

2. **User has mentor role:**
   - Check in `profiles` table that user's `role` is `'mentor'` or `'admin'`
   - If not, update it:
     ```sql
     UPDATE public.profiles 
     SET role = 'mentor' 
     WHERE id = 'USER_ID_HERE';
     ```

3. **mentor_id matches authenticated user:**
   - The `mentorId` in the request must match `auth.uid()`
   - The service now verifies this automatically

### Step 3: Test the Fix

1. **Clear browser cache and reload**
2. **Sign in as a mentor**
3. **Try creating/updating a learning path**
4. **Check browser console for errors**

## Quick SQL Fix (Copy & Paste)

If you just want the essential policies, run this:

```sql
-- Enable RLS
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Mentors can insert their own learning paths" ON public.learning_paths;
DROP POLICY IF EXISTS "Anyone can view learning paths" ON public.learning_paths;

-- Allow anyone to view
CREATE POLICY "Anyone can view learning paths"
  ON public.learning_paths FOR SELECT
  USING (true);

-- Allow mentors to create
CREATE POLICY "Mentors can create learning paths"
  ON public.learning_paths FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
    AND mentor_id = auth.uid()
  );

-- Allow mentors to update their own
CREATE POLICY "Mentors can update their own learning paths"
  ON public.learning_paths FOR UPDATE
  USING (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
  );

-- Allow mentors to delete their own
CREATE POLICY "Mentors can delete their own learning paths"
  ON public.learning_paths FOR DELETE
  USING (
    mentor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('mentor', 'admin')
    )
  );
```

## Troubleshooting

### Still Getting 401 Error?

1. **Check if user is authenticated:**
   ```javascript
   // In browser console
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```

2. **Check user role:**
   ```sql
   SELECT id, email, role 
   FROM public.profiles 
   WHERE id = 'YOUR_USER_ID';
   ```

3. **Check RLS policies exist:**
   ```sql
   SELECT tablename, policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'learning_paths';
   ```

4. **Verify Supabase client is using correct session:**
   - Check that `supabase.auth.getSession()` returns a valid session
   - Ensure the session token is being sent with requests

### If Policies Don't Work

Try temporarily disabling RLS to test:
```sql
ALTER TABLE public.learning_paths DISABLE ROW LEVEL SECURITY;
```

**⚠️ Remember to re-enable RLS after testing!**

## Files Modified

1. ✅ `fix-learning-paths-rls-simple.sql` - SQL script with RLS policies
2. ✅ `src/services/learningPathService.ts` - Added authentication verification

## Next Steps

1. Run the SQL script in Supabase
2. Verify user role is 'mentor' or 'admin'
3. Test creating/updating a learning path
4. Check console for any remaining errors

