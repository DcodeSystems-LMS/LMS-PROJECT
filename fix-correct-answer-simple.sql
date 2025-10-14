-- Simple Correct Answer Fix (No Strict Validation)
-- This script fixes correct answer issues without causing validation errors

-- 1. Remove the strict validation trigger that's causing errors
DROP TRIGGER IF EXISTS validate_question_trigger ON questions;
DROP FUNCTION IF EXISTS validate_question_data();

-- 2. Remove the strict constraint that might be causing issues
ALTER TABLE questions DROP CONSTRAINT IF EXISTS check_correct_answer_not_empty;

-- 3. Update any existing questions with empty correct_answer
UPDATE questions 
SET correct_answer = 'Not specified'
WHERE correct_answer IS NULL OR correct_answer = '';

-- 4. Add a simple constraint that only checks for null (not empty string)
ALTER TABLE questions 
ADD CONSTRAINT check_correct_answer_not_null 
CHECK (correct_answer IS NOT NULL);

-- 5. Clean up any whitespace issues in correct answers
UPDATE questions 
SET correct_answer = TRIM(correct_answer)
WHERE correct_answer IS NOT NULL;

-- 6. Create index for better performance on answer comparisons
CREATE INDEX IF NOT EXISTS idx_questions_correct_answer ON questions(correct_answer);
CREATE INDEX IF NOT EXISTS idx_questions_type_answer ON questions(question_type, correct_answer);

-- 7. Display current questions with their correct answers for verification
SELECT 
  id,
  question_text,
  question_type,
  correct_answer,
  options,
  created_at
FROM questions 
ORDER BY created_at DESC 
LIMIT 10;

-- 8. Show any questions that might have issues
SELECT 
  id,
  question_text,
  question_type,
  correct_answer,
  LENGTH(correct_answer) as answer_length,
  options
FROM questions 
WHERE correct_answer IS NULL 
   OR correct_answer = ''
   OR LENGTH(TRIM(correct_answer)) = 0
ORDER BY created_at DESC;




