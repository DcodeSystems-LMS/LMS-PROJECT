-- Add Lesson 2 to Existing Course
-- Run this in your Supabase SQL editor

-- Step 1: Find your course ID
-- Replace 'Your Course Title' with your actual course title
SELECT id, title, lessons 
FROM public.courses 
WHERE title LIKE '%Your Course Title%';

-- Step 2: Add Lesson 2 to the existing course
-- Replace 'YOUR_COURSE_ID' with the actual course ID from Step 1
-- Replace the lesson data with your actual Lesson 2 details

UPDATE public.courses 
SET lessons = lessons || '[
  {
    "id": 2,
    "title": "Lesson 2 Title",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    "language": "English",
    "description": "Description of Lesson 2"
  }
]'::jsonb
WHERE id = 'YOUR_COURSE_ID';

-- Step 3: Verify the lesson was added
SELECT id, title, lessons 
FROM public.courses 
WHERE id = 'YOUR_COURSE_ID';

-- Alternative: If you want to add multiple lessons at once
UPDATE public.courses 
SET lessons = lessons || '[
  {
    "id": 2,
    "title": "Lesson 2: Advanced Concepts",
    "videoType": "youtube", 
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID_2",
    "language": "English",
    "description": "Learn advanced concepts in this lesson"
  },
  {
    "id": 3,
    "title": "Lesson 3: Practical Examples",
    "videoType": "youtube",
    "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID_3", 
    "language": "English",
    "description": "See practical examples and implementations"
  }
]'::jsonb
WHERE id = 'YOUR_COURSE_ID';
