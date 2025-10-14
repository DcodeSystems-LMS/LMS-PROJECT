-- Add missing columns to courses table for upload course functionality
-- Run this in your Supabase SQL editor

-- Add difficulty column (separate from level)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';

-- Add objectives column as JSON array
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]';

-- Add requirements column as JSON array
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]';

-- Add tags column as JSON array
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Add lessons column as JSON array
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS lessons JSONB DEFAULT '[]';

-- Add thumbnail column (rename from thumbnail_url for consistency)
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS thumbnail TEXT;

-- Update existing thumbnail_url to thumbnail if needed
UPDATE public.courses 
SET thumbnail = thumbnail_url 
WHERE thumbnail_url IS NOT NULL AND thumbnail IS NULL;

-- Drop thumbnail_url column if it exists and we have thumbnail
-- ALTER TABLE public.courses DROP COLUMN IF EXISTS thumbnail_url;
