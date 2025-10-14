# Assessment Database Setup Guide

## 🚨 **URGENT: Database Setup Required**

The error `relation "questions" does not exist` indicates that the assessment database tables haven't been created yet. Follow these steps to set up the complete database schema.

## 📋 **Step-by-Step Setup**

### **1. Access Your Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**

### **2. Run the Complete Database Setup**
Copy and paste the entire contents of `complete-assessment-database-setup.sql` into the SQL Editor and execute it.

**⚠️ Important:** This will create all necessary tables for the assessment system.

### **3. Verify Tables Created**
After running the script, verify these tables exist:
- `assessments`
- `questions`
- `assessment_attempts`
- `question_responses`
- `student_progress`
- `notifications`
- `audit_logs`
- `assessment_analytics`
- `question_analytics`
- And many more...

### **4. Check RLS Policies**
The script automatically creates Row Level Security (RLS) policies for:
- **Mentors**: Can manage their own assessments
- **Students**: Can view assigned assessments
- **Admins**: Can view all assessments

### **5. Test the Setup**
After running the script, try creating an assessment in your application. The error should be resolved.

## 🔧 **Troubleshooting**

### **If you get permission errors:**
```sql
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

### **If tables still don't exist:**
1. Check the SQL Editor for any error messages
2. Ensure you're running the script in the correct Supabase project
3. Verify you have admin permissions on the project

### **If RLS policies cause issues:**
```sql
-- Temporarily disable RLS for testing
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
```

## 📊 **What Gets Created**

### **Core Assessment Tables:**
- ✅ `assessments` - Main assessment data
- ✅ `questions` - Individual questions
- ✅ `assessment_attempts` - Student attempts
- ✅ `question_responses` - Student answers

### **Advanced Features:**
- ✅ `assessment_sections` - Question sections
- ✅ `student_progress` - Progress tracking
- ✅ `notifications` - Notification system
- ✅ `audit_logs` - Security logging
- ✅ `question_analytics` - Performance analytics

### **Security & Integrity:**
- ✅ `plagiarism_reports` - Plagiarism detection
- ✅ `security_events` - Security monitoring
- ✅ `assessment_delivery_settings` - Delivery controls

### **Gamification:**
- ✅ `leaderboards` - Performance rankings
- ✅ `assessment_groups` - Group assessments
- ✅ `student_accessibility_settings` - Accessibility

## 🚀 **After Setup**

Once the database is set up:

1. **Test Assessment Creation** - Try creating a new assessment
2. **Test Question Addition** - Add questions to assessments
3. **Test Student Access** - Verify students can view assigned assessments
4. **Check Analytics** - Verify analytics data is being collected

## 📞 **Need Help?**

If you encounter any issues:

1. **Check the SQL Editor** for error messages
2. **Verify table creation** by running:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name LIKE '%assessment%';
   ```
3. **Test with a simple query**:
   ```sql
   SELECT COUNT(*) FROM assessments;
   ```

## ✅ **Success Indicators**

You'll know the setup is successful when:
- ✅ No more "relation does not exist" errors
- ✅ Assessment creation works
- ✅ Questions can be added
- ✅ Students can access assessments
- ✅ Analytics data is collected

---

**🎉 Once this is complete, your assessment system will be fully functional with all advanced features!**
