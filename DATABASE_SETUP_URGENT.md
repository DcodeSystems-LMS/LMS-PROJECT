# 🚨 URGENT: Database Setup Required

## The Issue
Your Supabase database is missing the required tables, causing 406/400 errors.

## Quick Fix Steps

### 1. **Access Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in and select your project: `gtzbjzsjeftkgwvvgefp`
3. Go to **SQL Editor** (left sidebar)

### 2. **Run Database Schema**
1. Copy the entire contents of `supabase-schema-final.sql`
2. Paste into the SQL Editor
3. Click **Run** button
4. Wait for all tables to be created

### 3. **Verify Tables Created**
After running the schema, you should see these tables:
- ✅ `profiles`
- ✅ `courses` 
- ✅ `enrollments`
- ✅ `assessments`
- ✅ `assessment_results`
- ✅ `sessions`
- ✅ `discussions`
- ✅ `notifications`

### 4. **Test Your Application**
1. Refresh your website: `https://app.dcodesys.in`
2. Try signing up for a new account
3. Check browser console for errors

## Alternative: Use Setup Script

If you prefer, you can also run the setup script:

```bash
# Copy the schema to clipboard
cat supabase-schema-final.sql | clip

# Then paste into Supabase SQL Editor
```

## Expected Result
After setup, you should see:
- ✅ No more 406/400 errors
- ✅ User registration working
- ✅ Profiles being created
- ✅ Data loading properly

## Need Help?
If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your API keys are correct
3. Ensure RLS policies are enabled
4. Check table permissions

---

**Run the schema setup and your application will work perfectly!** 🚀
