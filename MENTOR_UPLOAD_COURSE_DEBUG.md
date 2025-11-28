# 🔍 Debug: Mentor Upload Course Materials Issue

## 🎯 **Problem**
You uploaded materials during course creation in the mentor's "Upload Course" section, but those materials are not showing up in the student's download modal.

## 🔍 **Debugging Steps**

### **Step 1: Check What Materials Exist**
Run this SQL in your Supabase SQL Editor:

```sql
-- Check all courses and their materials
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.created_at as course_created,
  COUNT(cm.id) as material_count
FROM public.courses c
LEFT JOIN public.course_materials cm ON c.id = cm.course_id
GROUP BY c.id, c.title, c.created_at
ORDER BY c.created_at DESC;
```

### **Step 2: Check Materials for Your ReactJS Course**
```sql
-- Check specifically for the ReactJS course
SELECT 
  cm.id,
  cm.title as material_title,
  cm.file_name,
  cm.category,
  cm.created_at as material_created,
  c.title as course_title
FROM public.course_materials cm
JOIN public.courses c ON cm.course_id = c.id
WHERE c.id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';
```

### **Step 3: Check Course Creation Logs**
1. Go to your browser's Developer Console
2. Look for logs when you created the course
3. Check for any error messages during material upload

## 🚀 **Possible Issues & Solutions**

### **Issue 1: Materials Uploaded to Wrong Course**
**Symptoms:** Materials exist but linked to different course ID
**Solution:** Move materials to correct course:
```sql
-- Move materials from HTML course to ReactJS course
UPDATE public.course_materials 
SET course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b'
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b';
```

### **Issue 2: Materials Upload Failed During Course Creation**
**Symptoms:** No materials in database for the course
**Solution:** Upload materials manually:
1. Go to `/mentor/materials`
2. Select the ReactJS course
3. Upload materials again

### **Issue 3: Course Creation Failed**
**Symptoms:** Course doesn't exist or has wrong ID
**Solution:** Check if course was created properly:
```sql
-- Check if ReactJS course exists
SELECT * FROM public.courses 
WHERE id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b';
```

## 🧪 **Test the Fix**

After applying any solution:

1. **Refresh the course page**
2. **Click "Download Materials"**
3. **Check console logs** for:
   - `📋 Materials received in frontend: [array]`
   - `✅ Materials set in state: X materials`
4. **Verify materials appear in modal**

## 📋 **Quick Fix Commands**

### **If materials exist but are in wrong course:**
```sql
UPDATE public.course_materials 
SET course_id = 'ca0d81e2-8ec0-4abe-bb47-06df8d35b52b'
WHERE course_id = '5cbd507d-45fc-4faa-b38c-fa04fd91944b';
```

### **If no materials exist:**
1. Go to `/mentor/materials`
2. Select ReactJS course
3. Upload materials manually

## 🔍 **Debug Console Commands**

Add this to your browser console to debug:

```javascript
// Check what materials are being fetched
console.log('Current course ID:', window.location.pathname.split('/').pop());

// Check if materials are in state
// (Run this after clicking Download Materials)
console.log('Available materials:', document.querySelector('[data-testid="materials-list"]')?.children.length || 'Not found');
```

## ✅ **Expected Result**

After fixing:
- ✅ Materials appear in download modal
- ✅ Students can select and download materials
- ✅ Console shows successful material fetch
- ✅ No "No materials available" message


