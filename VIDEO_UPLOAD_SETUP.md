# Video Upload Setup Guide

## Problem
Mentors were unable to upload video files via drag and drop in the upload course section. Videos were not being uploaded to Supabase storage.

## Solution Implemented

### 1. Created VideoUploadDropzone Component
- **File**: `src/components/feature/VideoUploadDropzone.tsx`
- **Features**:
  - Drag and drop functionality
  - File validation (size, type)
  - Progress tracking
  - Supabase storage integration
  - Error handling

### 2. Updated Upload Course Page
- **File**: `src/pages/mentor/upload-course/page.tsx`
- **Changes**:
  - Added VideoUploadDropzone component
  - Added video upload handlers
  - Replaced old file input with drag & drop

### 3. Supabase Storage Setup
- **File**: `setup-supabase-storage.sql`
- **Required**: Run this SQL script in Supabase SQL Editor

## Setup Instructions

### Step 1: Run Supabase Storage Setup
```sql
-- Run setup-supabase-storage.sql in Supabase SQL Editor
-- This creates the 'course-materials' bucket with proper permissions
```

### Step 2: Verify Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Check if 'course-materials' bucket exists
3. Verify it's public and has proper file size limits

### Step 3: Test Video Upload
1. Go to Mentor Dashboard → Upload Course
2. Add a lesson and select "Upload Video File"
3. Drag and drop a video file or click to browse
4. Check Supabase Storage for uploaded files

## Features

### VideoUploadDropzone Component
```typescript
<VideoUploadDropzone
  lessonId={lesson.id}
  onVideoUploaded={(videoUrl, videoFile) => handleVideoUploaded(lesson.id, videoUrl, videoFile)}
  onUploadError={handleVideoUploadError}
  maxFileSize={500} // 500MB
  acceptedFormats={['video/mp4', 'video/webm', 'video/avi', 'video/mov']}
/>
```

### Supported Features
- ✅ **Drag & Drop**: Drop video files directly onto the upload area
- ✅ **File Validation**: Size and format validation
- ✅ **Progress Tracking**: Real-time upload progress
- ✅ **Error Handling**: Clear error messages
- ✅ **Supabase Integration**: Direct upload to Supabase storage
- ✅ **Multiple Formats**: MP4, WebM, AVI, MOV support
- ✅ **Large Files**: Up to 500MB file size

### File Structure
```
course-materials/
├── course-videos/
│   ├── 1703123456789-abc123.mp4
│   ├── 1703123456790-def456.webm
│   └── ...
└── course-materials/
    ├── pdf-files/
    └── images/
```

## Troubleshooting

### Common Issues

1. **"Upload failed" Error**
   - Check if Supabase storage bucket exists
   - Verify RLS policies are set correctly
   - Check file size limits

2. **"File type not supported"**
   - Ensure file is one of: MP4, WebM, AVI, MOV
   - Check file extension matches MIME type

3. **"File too large" Error**
   - Default limit is 500MB
   - Can be adjusted in component props

4. **Storage Permission Denied**
   - Run the SQL setup script
   - Check user authentication
   - Verify bucket permissions

### Debug Steps
1. Check browser console for errors
2. Verify Supabase storage bucket exists
3. Check network tab for upload requests
4. Verify file format and size

## Files Modified/Created

### New Files:
- `src/components/feature/VideoUploadDropzone.tsx`
- `setup-supabase-storage.sql`
- `VIDEO_UPLOAD_SETUP.md`

### Modified Files:
- `src/pages/mentor/upload-course/page.tsx`

## Testing Checklist

- [ ] Supabase storage bucket created
- [ ] RLS policies applied
- [ ] Drag and drop works
- [ ] File validation works
- [ ] Upload progress shows
- [ ] Files appear in Supabase storage
- [ ] Error handling works
- [ ] Multiple file formats supported
- [ ] Large files (up to 500MB) work

## Next Steps

1. **Run the SQL setup script** in Supabase
2. **Test the upload functionality** with different file types
3. **Monitor storage usage** in Supabase dashboard
4. **Set up CDN** for better video delivery (optional)

The video upload functionality should now work properly with drag and drop support! 🎉
