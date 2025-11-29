# Learning Path Supabase Integration Guide

## Step 1: Create Tables in Supabase

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `create-learning-path-tables.sql`
4. Run the SQL script

## Step 2: Update Your Component

Update `src/pages/mentor/learning-path/page.tsx` to use Supabase:

### Import the functions:

```typescript
import { saveLearningPath, fetchLearningPaths, deleteLearningPath } from '@/services/learningPathService';
```

### Update `handleSubmit` function:

```typescript
const handleSubmit = async () => {
  try {
    if (!courseIntro.title || !courseIntro.description) {
      setError('Please fill in course title and description');
      return;
    }

    if (units.length === 0) {
      setError('Please add at least one unit');
      return;
    }

    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    setUploadLoading(true);
    setError('');

    // Upload thumbnail if exists
    let thumbnailUrl = '';
    if (courseIntro.thumbnail) {
      const fileExt = courseIntro.thumbnail.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `learning-paths/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(filePath, courseIntro.thumbnail);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(filePath);
      
      thumbnailUrl = data.publicUrl;
    }

    // Calculate summary
    const summary = calculateSummary();

    // Prepare data for Supabase
    const learningPathData = {
      title: courseIntro.title,
      description: courseIntro.description,
      thumbnail: thumbnailUrl,
      level: courseIntro.level,
      duration: parseInt(courseIntro.duration) || summary.estimatedDuration,
      mentorId: currentUser.id,
      units: units.map(unit => ({
        title: unit.title,
        description: unit.description,
        order: unit.order,
        modules: unit.modules.map(module => ({
          title: module.title,
          contentType: module.contentType,
          content: module.content,
          fileUrl: module.fileUrl,
          duration: module.duration,
          order: module.order,
        })),
        test: unit.test ? {
          name: unit.test.name,
          questions: unit.test.questions.map(q => ({
            type: q.type,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            explanation: q.explanation,
          })),
          passPercentage: unit.test.passPercentage,
          totalMarks: unit.test.totalMarks,
        } : null,
      })),
      finalTest: finalTest ? {
        name: finalTest.name,
        questions: finalTest.questions.map(q => ({
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          explanation: q.explanation,
        })),
        passPercentage: finalTest.passPercentage,
        totalMarks: finalTest.totalMarks,
      } : null,
    };

    // Save to Supabase
    const result = await saveLearningPath(learningPathData);

    if (!result.success) {
      throw new Error(result.error || 'Failed to save learning path');
    }

    // Reset form
    setCourseIntro({
      title: '',
      description: '',
      thumbnail: null,
      thumbnailUrl: '',
      level: 'Beginner',
      duration: ''
    });
    setUnits([]);
    setFinalTest(null);
    setShowUploadModal(false);

    // Refresh list
    await fetchLearningPaths(currentUser.id);

    alert('Learning Path created successfully!');
  } catch (error: any) {
    console.error('Error creating learning path:', error);
    setError(error.message || 'Failed to create learning path');
  } finally {
    setUploadLoading(false);
  }
};
```

### Update `fetchLearningPaths` function:

```typescript
const fetchLearningPaths = async (mentorId: string) => {
  try {
    const paths = await fetchLearningPaths(mentorId);
    setLearningPaths(paths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    setError('Failed to fetch learning paths');
  }
};
```

### Update `handleDelete` function:

```typescript
const handleDelete = async (pathId: string) => {
  if (!window.confirm('Are you sure you want to delete this learning path?')) {
    return;
  }

  if (!currentUser) {
    setError('User not authenticated');
    return;
  }

  try {
    const result = await deleteLearningPath(pathId, currentUser.id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete learning path');
    }

    setLearningPaths(learningPaths.filter(p => p.id !== pathId));
    alert('Learning Path deleted successfully!');
  } catch (error: any) {
    console.error('Error deleting learning path:', error);
    setError(error.message || 'Failed to delete learning path');
  }
};
```

## Step 3: Create Service File

Create `src/services/learningPathService.ts` and copy the contents from `learning-path-supabase-functions.ts`.

## Step 4: Storage Bucket Setup

Make sure you have a storage bucket named `course-thumbnails` in Supabase:

1. Go to Storage in Supabase dashboard
2. Create a bucket named `course-thumbnails`
3. Set it to public if you want public access
4. Or configure RLS policies for authenticated access

## Notes

- All tables have Row Level Security (RLS) enabled
- Mentors can only manage their own learning paths
- Students can view all learning paths
- Cascade deletes ensure data integrity
- Timestamps are automatically managed

