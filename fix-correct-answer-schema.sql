-- Fix Correct Answer Schema and Data Issues
-- This script ensures the correct_answer field is properly handled

-- 1. Check current questions table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questions' 
AND column_name IN ('correct_answer', 'correct_answers');

-- 2. Update any existing questions with empty correct_answer
UPDATE questions 
SET correct_answer = 'Not specified'
WHERE correct_answer IS NULL OR correct_answer = '';

-- 3. Add constraint to ensure correct_answer is not empty
ALTER TABLE questions 
ADD CONSTRAINT check_correct_answer_not_empty 
CHECK (correct_answer IS NOT NULL AND correct_answer != '');

-- 4. Create a function to validate question data (more flexible)
CREATE OR REPLACE FUNCTION validate_question_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure correct_answer is provided
  IF NEW.correct_answer IS NULL OR NEW.correct_answer = '' THEN
    RAISE EXCEPTION 'correct_answer cannot be null or empty';
  END IF;
  
  -- For multiple choice questions, check if correct_answer matches one of the options
  -- (but don't fail if it doesn't - just log a warning)
  IF NEW.question_type = 'multiple-choice' AND NEW.options IS NOT NULL THEN
    -- Check if correct_answer matches any option (case-insensitive and trimmed)
    IF NOT EXISTS (
      SELECT 1 
      FROM jsonb_array_elements_text(NEW.options) AS option_text
      WHERE TRIM(LOWER(option_text)) = TRIM(LOWER(NEW.correct_answer))
    ) THEN
      -- Log warning but don't fail - this allows for flexibility
      RAISE WARNING 'correct_answer "%" does not exactly match any option in options array', NEW.correct_answer;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to validate question data
DROP TRIGGER IF EXISTS validate_question_trigger ON questions;
CREATE TRIGGER validate_question_trigger
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION validate_question_data();

-- 6. Update existing questions to ensure data consistency
UPDATE questions 
SET correct_answer = TRIM(correct_answer)
WHERE correct_answer IS NOT NULL;

-- 7. Create index for better performance on answer comparisons
CREATE INDEX IF NOT EXISTS idx_questions_correct_answer ON questions(correct_answer);
CREATE INDEX IF NOT EXISTS idx_questions_type_answer ON questions(question_type, correct_answer);

-- 8. Display current questions with their correct answers for verification
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
