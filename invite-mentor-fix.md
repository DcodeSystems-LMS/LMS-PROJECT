# Fix for "Invite Mentor" Database Schema Issue

## Problem
The invite mentor functionality was failing with the error:
```
Failed to create mentor profile: Could not find the 'specialty' column of 'profiles' in the schema cache
```

This happened because the `profiles` table in your database doesn't have the `specialty` column that the invite mentor functionality was trying to use.

## Solution

### Option 1: Quick Fix (Immediate)
I've updated the invite mentor functionality to work with your existing database schema:

1. **Removed specialty requirement** - Made specialty optional in form validation
2. **Updated mentor data structure** - Removed specialty and status columns that don't exist
3. **Added fallback handling** - The form will work even without specialty information

### Option 2: Complete Fix (Recommended)
Run the SQL script `add-profile-columns.sql` in your Supabase SQL editor to add all missing columns:

```sql
-- This will add columns like specialty, status, phone, address, etc.
-- Run the entire contents of add-profile-columns.sql
```

## What I Fixed

### 1. **Updated Form Validation**
- Changed from requiring Name, Email, Specialty to just Name, Email
- Made specialty optional with clear labeling

### 2. **Updated Mentor Data Structure**
- Removed `specialty` and `status` columns that don't exist in your schema
- Added proper null handling for optional fields

### 3. **Created Database Schema Update Script**
- `add-profile-columns.sql` adds all missing columns to the profiles table
- Includes proper indexes and RLS policies
- Updates the trigger function to handle new columns

## How to Apply the Fix

### Immediate Fix (Already Applied)
The invite mentor functionality should now work with your existing database schema. You can test it by:

1. Going to Admin Mentors page
2. Clicking "Invite New Mentor"
3. Filling out Name and Email (Specialty is optional)
4. Clicking "Send Invitation"

### Complete Fix (Recommended)
1. Open your Supabase SQL editor
2. Copy and paste the contents of `add-profile-columns.sql`
3. Run the script
4. The invite mentor functionality will then have full access to specialty and other fields

## Testing

After applying either fix, you can test the functionality:

1. **Navigate to Admin Mentors page** (`/admin/mentors`)
2. **Click "Invite New Mentor"**
3. **Fill out the form**:
   - Name: Required
   - Email: Required (with validation)
   - Specialty: Optional
   - Message: Optional
4. **Click "Send Invitation"**
5. **Check the mentors list** - the new mentor should appear

## What the Fix Includes

- ✅ Form validation that works with existing schema
- ✅ Proper error handling for missing columns
- ✅ Optional specialty field with clear labeling
- ✅ Database schema update script for complete functionality
- ✅ Proper RLS policies for new columns
- ✅ Indexes for better performance

The invite mentor functionality should now work correctly with your current database setup!
