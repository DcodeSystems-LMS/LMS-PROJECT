# Fix for Learning Path 406 Error

## Problem

When uploading/updating a learning path on the mentor page, the following error occurs:

```
GET https://supabase.dcodesys.in/rest/v1/learning_paths?select=id&id=eq.XXX&mentor_id=eq.XXX 406 (Not Acceptable)
Error deleting learning path: Error: Learning path not found or access denied
Error updating learning path: Error: Learning path not found or access denied
```

## Root Cause

The 406 (Not Acceptable) error was occurring in the `deleteLearningPath` function when it tried to verify ownership before deletion. The ownership check was making a GET request with `.select('id').single()` which was causing PostgREST to return a 406 error, likely due to:

1. **Query format issue**: The combination of `.select('id')` with `.single()` when no rows match can sometimes cause PostgREST to return 406 instead of a proper "not found" error.

2. **Unnecessary verification**: The ownership verification was redundant since RLS (Row Level Security) policies already handle authorization.

3. **Error handling**: The error handling wasn't properly distinguishing between different error scenarios.

## Solution

### Updated `deleteLearningPath` Function

**Before:**
- Made a separate GET request to verify ownership
- Used `.single()` which caused 406 errors
- Had complex error handling

**After:**
- Removed the separate ownership check
- Let RLS policies handle authorization automatically
- Delete directly with mentor_id filter
- Use `.select('id')` on delete to verify rows were deleted
- Better error messages for different scenarios

### Key Changes:

1. **Simplified Flow:**
   ```typescript
   // OLD: Verify ownership first, then delete
   const { data } = await supabase.from('learning_paths').select('id').eq(...).single();
   await supabase.from('learning_paths').delete().eq(...);
   
   // NEW: Delete directly, let RLS handle authorization
   const { data, error } = await supabase
     .from('learning_paths')
     .delete()
     .eq('id', learningPathId)
     .eq('mentor_id', mentorId)
     .select('id');
   ```

2. **Better Error Handling:**
   - Specific handling for error codes (PGRST116 = not found)
   - Clear error messages
   - Verify deletion succeeded by checking returned data

3. **RLS Policy Reliance:**
   - Trusts RLS policies to handle authorization
   - No redundant ownership checks
   - Cleaner, more efficient code

## Files Changed

- `src/services/learningPathService.ts` - Updated `deleteLearningPath` function

## Testing

After this fix, when a mentor tries to:
1. **Delete a learning path** - Should work smoothly without 406 errors
2. **Update a learning path** - The delete-before-recreate flow should work without errors

## Benefits

✅ **No more 406 errors** - Removed the problematic GET request
✅ **Better performance** - One query instead of two
✅ **Cleaner code** - Rely on RLS policies instead of manual checks
✅ **Better error messages** - Clear distinction between different error types

## RLS Policy Note

The fix relies on RLS policies being properly configured. Make sure you have:

1. **DELETE policy** on `learning_paths` table that checks `mentor_id = auth.uid()`
2. **Role check** in the policy to ensure user is mentor/admin

If you see permission errors after this fix, check that the RLS policies in `fix-learning-paths-rls-simple.sql` or `fix-learning-paths-rls.sql` are properly applied.

## Related Files

- `fix-learning-paths-rls-simple.sql` - RLS policies for learning_paths
- `fix-learning-paths-rls.sql` - Alternative RLS policy definitions

---

**Fix Applied!** ✅ The 406 error should no longer occur when deleting/updating learning paths.

