/**
 * Shared utilities for AI question generation
 * Handles question type mapping, distribution, and formatting
 */

export type QuestionType = 
  | 'MCQ' 
  | 'MSQ' 
  | 'TrueFalse' 
  | 'ShortAnswer' 
  | 'Essay' 
  | 'Coding' 
  | 'FillBlanks' 
  | 'FileUpload' 
  | 'Debugging' 
  | 'CodeReview'
  | 'Mixed';

export interface QuestionTypeDistribution {
  MCQ?: number;
  MSQ?: number;
  TrueFalse?: number;
  ShortAnswer?: number;
  Essay?: number;
  Coding?: number;
  FillBlanks?: number;
  FileUpload?: number;
  Debugging?: number;
  CodeReview?: number;
}

/**
 * Map frontend question type IDs to AI format
 */
export function mapQuestionTypeToAI(type: string): QuestionType {
  const mapping: Record<string, QuestionType> = {
    'multiple-choice': 'MCQ',
    'multiple-select': 'MSQ',
    'true-false': 'TrueFalse',
    'short-answer': 'ShortAnswer',
    'essay': 'Essay',
    'coding': 'Coding',
    'fill-blanks': 'FillBlanks',
    'file-upload': 'FileUpload'
  };
  
  return mapping[type] || 'MCQ';
}

/**
 * Calculate question distribution based on selected types and mode
 */
export function calculateQuestionDistribution(
  totalQuestions: number,
  selectedTypes: string[],
  distributionMode: 'auto' | 'manual',
  manualDistribution?: Record<string, number>,
  difficulty?: 'Easy' | 'Medium' | 'Hard'
): QuestionTypeDistribution {
  const distribution: QuestionTypeDistribution = {};

  // If single type selected
  if (selectedTypes.length === 1 && selectedTypes[0] !== 'Mixed') {
    const type = mapQuestionTypeToAI(selectedTypes[0]);
    distribution[type] = totalQuestions;
    return distribution;
  }

  // If manual distribution provided
  if (distributionMode === 'manual' && manualDistribution) {
    Object.entries(manualDistribution).forEach(([type, count]) => {
      const aiType = mapQuestionTypeToAI(type);
      if (count > 0) {
        distribution[aiType] = count;
      }
    });
    return distribution;
  }

  // Auto distribution
  if (selectedTypes.includes('Mixed') || selectedTypes.length === 0) {
    // Default auto distribution
    const isHard = difficulty === 'Hard';
    const isEasy = difficulty === 'Easy';
    
    if (isHard) {
      distribution.Coding = Math.ceil(totalQuestions * 0.25);
      distribution.Debugging = Math.ceil(totalQuestions * 0.15);
      distribution.MCQ = Math.ceil(totalQuestions * 0.20);
      distribution.FillBlanks = Math.ceil(totalQuestions * 0.15);
      distribution.ShortAnswer = Math.ceil(totalQuestions * 0.10);
      distribution.Essay = Math.ceil(totalQuestions * 0.10);
      distribution.TrueFalse = Math.ceil(totalQuestions * 0.05);
    } else if (isEasy) {
      distribution.MCQ = Math.ceil(totalQuestions * 0.50);
      distribution.TrueFalse = Math.ceil(totalQuestions * 0.20);
      distribution.FillBlanks = Math.ceil(totalQuestions * 0.15);
      distribution.ShortAnswer = Math.ceil(totalQuestions * 0.10);
      distribution.Coding = Math.ceil(totalQuestions * 0.05);
    } else {
      // Medium - balanced distribution
      distribution.MCQ = Math.ceil(totalQuestions * 0.40);
      distribution.FillBlanks = Math.ceil(totalQuestions * 0.20);
      distribution.TrueFalse = Math.ceil(totalQuestions * 0.10);
      distribution.Coding = Math.ceil(totalQuestions * 0.10);
      distribution.ShortAnswer = Math.ceil(totalQuestions * 0.10);
      distribution.Essay = Math.ceil(totalQuestions * 0.10);
    }
  } else {
    // Distribute evenly among selected types
    const countPerType = Math.floor(totalQuestions / selectedTypes.length);
    const remainder = totalQuestions % selectedTypes.length;
    
    selectedTypes.forEach((type, index) => {
      const aiType = mapQuestionTypeToAI(type);
      distribution[aiType] = countPerType + (index < remainder ? 1 : 0);
    });
  }

  // Normalize to ensure total matches
  const total = Object.values(distribution).reduce((sum, count) => sum + (count || 0), 0);
  if (total !== totalQuestions) {
    const diff = totalQuestions - total;
    const firstType = Object.keys(distribution)[0] as QuestionType;
    if (firstType) {
      distribution[firstType] = (distribution[firstType] || 0) + diff;
    }
  }

  return distribution;
}

/**
 * Build prompt for AI generation with question type specifications
 */
export function buildQuestionGenerationPrompt(
  topic: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  totalQuestions: number,
  assessmentType: string,
  questionDistribution: QuestionTypeDistribution,
  includeExplanations: boolean,
  focusAreas: string[],
  timeLimit: number
): string {
  const focusAreasText = focusAreas.length > 0 
    ? `\nFocus Areas: ${focusAreas.join(', ')}`
    : '';

  const distributionText = Object.entries(questionDistribution)
    .filter(([_, count]) => count && count > 0)
    .map(([type, count]) => `- ${count} ${type} questions`)
    .join('\n');

  return `You are an expert educational content creator specializing in creating high-quality assessment questions.

Generate ${totalQuestions} ${difficulty.toLowerCase()} difficulty assessment questions for the topic: "${topic}".

Assessment Type: ${assessmentType}
Time Limit: ${timeLimit} minutes
${focusAreasText}

QUESTION DISTRIBUTION:
${distributionText}

REQUIREMENTS FOR EACH QUESTION TYPE:

1. MCQ (Multiple Choice):
   - Exactly 4 options (A, B, C, D)
   - One correct answer
   - Options should be plausible distractors
   - Format: { "type": "MCQ", "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "A" or 0, "explanation": "..." }

2. MSQ (Multiple Select):
   - At least 4 options
   - Multiple correct answers (2-3)
   - Format: { "type": "MSQ", "question": "...", "options": ["...", "..."], "correctAnswer": ["A", "C"] or [0, 2], "explanation": "..." }

3. TrueFalse:
   - Only two options: "True" and "False"
   - Format: { "type": "TrueFalse", "question": "...", "correctAnswer": "True" or "False", "explanation": "..." }

4. ShortAnswer:
   - Brief answer expected (1-2 sentences)
   - Format: { "type": "ShortAnswer", "question": "...", "correctAnswer": "expected answer text", "explanation": "..." }

5. Essay:
   - Detailed response expected (5-10 lines)
   - Format: { "type": "Essay", "question": "...", "correctAnswer": "sample answer or rubric", "explanation": "..." }

6. Coding:
   - Programming problem with code solution
   - Include starter code template
   - Include test cases
   - Format: { "type": "Coding", "question": "...", "starterCode": "...", "expectedOutput": "...", "testCases": [{"input": "...", "output": "..."}], "codeLanguage": "javascript" or "python", "explanation": "..." }

7. FillBlanks:
   - Text with blanks to fill
   - Format: { "type": "FillBlanks", "question": "Text with ___ blanks", "correctAnswer": ["answer1", "answer2"], "explanation": "..." }

8. FileUpload:
   - Scenario-based file submission
   - Format: { "type": "FileUpload", "question": "...", "correctAnswer": "description of expected file", "explanation": "..." }

9. Debugging:
   - Code with errors to fix
   - Format: { "type": "Debugging", "question": "...", "buggyCode": "...", "correctAnswer": "fixed code", "explanation": "..." }

10. CodeReview:
    - Code to review and find issues
    - Format: { "type": "CodeReview", "question": "...", "codeToReview": "...", "correctAnswer": "list of issues found", "explanation": "..." }

${includeExplanations ? 'Include explanations for all questions.' : 'No explanations needed.'}

IMPORTANT:
- All questions must be relevant to the topic: ${topic}
- Questions should be ${difficulty.toLowerCase()} difficulty level
- No placeholders, no empty values
- Use real-world, practical, exam-level questions
- Keep questions clear and technically accurate

Return ONLY a JSON array of questions in the exact format specified above. No additional text or markdown formatting outside the JSON array.`;
}



