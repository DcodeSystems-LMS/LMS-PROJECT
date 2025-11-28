-- Add coding_only column to assessments table
-- This column tracks whether an assessment contains only coding challenges
-- Run this in your Supabase SQL Editor if you want to store the coding-only preference

-- Check if column already exists before adding
DO $$ 
BEGIN
    -- Add coding_only column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessments' 
        AND column_name = 'coding_only'
    ) THEN
        ALTER TABLE assessments 
        ADD COLUMN coding_only BOOLEAN DEFAULT false;
        
        -- Add comment to document the column
        COMMENT ON COLUMN assessments.coding_only IS 
        'Indicates if the assessment contains only coding challenge questions';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'assessments' 
AND column_name = 'coding_only';

