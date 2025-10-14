-- Add dark_mode column to profiles table
-- Run this in your Supabase SQL Editor

-- Add dark_mode column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.dark_mode IS 'User preference for dark mode theme';

-- Update existing profiles to have dark_mode = false by default
UPDATE public.profiles 
SET dark_mode = FALSE 
WHERE dark_mode IS NULL;

-- Make the column NOT NULL with default value
ALTER TABLE public.profiles 
ALTER COLUMN dark_mode SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_dark_mode ON public.profiles(dark_mode);
