# Course Materials Upload System - Setup Guide

This guide will help you set up the mentor materials upload functionality that allows mentors to upload course materials that students can download.

## 🚀 Quick Setup

### 1. Database Setup

Run the following SQL scripts in your Supabase SQL editor in this order:

```sql
-- 1. Create the course materials table
\i create-course-materials-table.sql

-- 2. Setup Supabase Storage
\i setup-supabase-storage.sql
```

### 2. Storage Bucket Setup

The storage setup script will create a private bucket called `course-materials` with:
- 100MB file size limit
- Support for common file types (PDF, DOC, PPT, ZIP, images, videos, code files)
- Proper security policies for mentors and students

### 3. Test the Implementation

1. **As a Mentor:**
   - Go to `/mentor/upload-course`
   - Create a new course
   - In Step 3 (Materials), upload some files
   - Publish the course

2. **As a Student:**
   - Go to `/student/continue`
   - Click "Download Materials" in Quick Actions
   - Select and download the materials uploaded by the mentor

## 📁 File Structure

The system creates the following structure:

```
course-materials/
├── {course_id}/
│   ├── {timestamp}-{filename}.pdf
│   ├── {timestamp}-{filename}.zip
│   └── ...
```

## 🔧 Features Implemented

### For Mentors:
- ✅ Upload multiple file types (PDF, DOC, PPT, ZIP, images, videos, code files)
- ✅ Categorize materials (slides, handouts, code, reference, etc.)
- ✅ Add descriptions for each material
- ✅ Preview materials before publishing
- ✅ Automatic file organization by course

### For Students:
- ✅ View available materials for enrolled courses
- ✅ Download individual or multiple materials
- ✅ See file types, sizes, and descriptions
- ✅ Real-time download with progress tracking
- ✅ Secure access (only enrolled students can download)

### Security Features:
- ✅ Row Level Security (RLS) policies
- ✅ Private storage bucket
- ✅ Course enrollment verification
- ✅ Mentor ownership verification
- ✅ File type validation
- ✅ Size limits (100MB per file)

## 🗄️ Database Schema

### course_materials table:
```sql
- id: UUID (Primary Key)
- course_id: UUID (Foreign Key to courses)
- lesson_id: INTEGER (Optional - link to specific lesson)
- title: TEXT (Material title)
- description: TEXT (Optional description)
- file_name: TEXT (Original filename)
- file_path: TEXT (Storage path)
- file_size: INTEGER (Size in bytes)
- file_type: TEXT (MIME type)
- file_extension: TEXT (File extension)
- category: TEXT (Material category)
- is_public: BOOLEAN (Whether students can download)
- uploaded_by: UUID (Foreign Key to profiles)
- download_count: INTEGER (Download statistics)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🔄 API Endpoints

The system uses these DataService methods:

```typescript
// Get materials for a course
DataService.getCourseMaterials(courseId: string)

// Get materials for a student (with enrollment check)
DataService.getMaterialsForStudent(courseId: string, studentId: string)

// Upload a new material
DataService.uploadCourseMaterial(courseId: string, file: File, materialData: object)

// Get download URL for a material
DataService.getMaterialDownloadUrl(materialId: string)

// Update material metadata
DataService.updateCourseMaterial(materialId: string, updates: object)

// Delete a material
DataService.deleteCourseMaterial(materialId: string)
```

## 🎯 Usage Examples

### Upload Materials (Mentor):
```typescript
const materialData = {
  title: "CSS Flexbox Lecture Slides",
  description: "Complete presentation slides",
  category: "slides",
  lessonId: 8 // Optional
};

const result = await DataService.uploadCourseMaterial(
  courseId, 
  file, 
  materialData
);
```

### Download Materials (Student):
```typescript
const { url, error } = await DataService.getMaterialDownloadUrl(materialId);
if (url) {
  // Trigger download
  const link = document.createElement('a');
  link.href = url;
  link.click();
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Storage bucket not found:**
   - Run the `setup-supabase-storage.sql` script
   - Check if the bucket was created in Supabase Dashboard

2. **Permission denied:**
   - Verify RLS policies are enabled
   - Check if user has proper role (mentor/student)
   - Ensure student is enrolled in the course

3. **File upload fails:**
   - Check file size (must be < 100MB)
   - Verify file type is allowed
   - Check browser console for errors

4. **Download fails:**
   - Verify material is public (`is_public = true`)
   - Check if student is enrolled in course
   - Verify signed URL generation

### Debug Steps:

1. Check browser console for errors
2. Verify database tables exist
3. Check Supabase Storage bucket exists
4. Verify RLS policies are active
5. Test with different file types and sizes

## 🔮 Future Enhancements

Potential improvements:
- [ ] Bulk upload with drag & drop
- [ ] Material versioning
- [ ] Download analytics dashboard
- [ ] Material templates
- [ ] Integration with lesson timestamps
- [ ] Mobile app support
- [ ] Offline download capability

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all SQL scripts were run successfully
3. Test with different user roles and permissions
4. Check Supabase logs for storage errors

The system is now ready for mentors to upload materials and students to download them! 🎉
