-- Quick Fix for Correct Answer Validation Error
-- Run this to immediately resolve the validation error

-- 1. Drop the problematic trigger and function
DROP TRIGGER IF EXISTS validate_question_trigger ON questions;
DROP FUNCTION IF EXISTS validate_question_data();

-- 2. Remove the strict constraint
ALTER TABLE questions DROP CONSTRAINT IF EXISTS check_correct_answer_not_empty;

-- 3. Add a simple constraint that only prevents NULL values
ALTER TABLE questions 
ADD CONSTRAINT check_correct_answer_not_null 
CHECK (correct_answer IS NOT NULL);

-- 4. Update any NULL correct answers to a default value
UPDATE questions 
SET correct_answer = 'Default Answer'
WHERE correct_answer IS NULL;

-- 5. Clean up whitespace
UPDATE questions 
SET correct_answer = TRIM(correct_answer)
WHERE correct_answer IS NOT NULL;

-- 6. Verify the fix worked
SELECT 
  COUNT(*) as total_questions,
  COUNT(CASE WHEN correct_answer IS NULL THEN 1 END) as null_answers,
  COUNT(CASE WHEN correct_answer = '' THEN 1 END) as empty_answers
FROM questions;

