/**
 * Shared parser for AI-generated questions
 * Handles parsing and transformation of different question types
 */

export interface GeneratedQuestion {
  id: string;
  type: string;
  question_text: string;
  options?: string[];
  correct_answer?: string | string[];
  explanation?: string;
  points: number;
  order_index: number;
  code_language?: string;
  code_template?: string;
  test_cases?: any[];
  file_types?: string[];
}

interface AIParsedQuestion {
  type: string;
  question?: string;
  question_text?: string;
  options?: string[];
  correctAnswer?: any;
  correct_answer?: any;
  explanation?: string;
  starterCode?: string;
  codeTemplate?: string;
  testCases?: any[];
  codeLanguage?: string;
  buggyCode?: string;
  codeToReview?: string;
  expectedOutput?: string;
  allowedFileTypes?: string[];
}

/**
 * Map AI question type to internal question type
 */
function mapAITypeToInternalType(aiType: string): string {
  const mapping: Record<string, string> = {
    'MCQ': 'multiple-choice',
    'MSQ': 'multiple-select',
    'TrueFalse': 'true-false',
    'ShortAnswer': 'short-answer',
    'Essay': 'essay',
    'Coding': 'coding',
    'FillBlanks': 'fill-blanks',
    'FileUpload': 'file-upload',
    'Debugging': 'coding', // Debugging uses coding type
    'CodeReview': 'essay' // Code review uses essay type
  };
  return mapping[aiType] || 'multiple-choice';
}

/**
 * Parse AI-generated question to internal format
 */
export function parseAIQuestion(
  item: AIParsedQuestion,
  index: number,
  includeExplanations: boolean,
  prefix: string = 'ai'
): GeneratedQuestion {
  const questionType = mapAITypeToInternalType(item.type || 'MCQ');
  
  const question: GeneratedQuestion = {
    id: `${prefix}_${Date.now()}_${index}`,
    type: questionType,
    question_text: item.question || item.question_text || '',
    explanation: includeExplanations ? (item.explanation || '') : '',
    points: 1,
    order_index: index + 1
  };

  // Handle different question types
  switch (item.type) {
    case 'MCQ':
    case 'MSQ':
      question.options = item.options || [];
      if (item.type === 'MCQ') {
        // Ensure exactly 4 options for MCQ
        while (question.options.length < 4) {
          question.options.push('');
        }
        question.options = question.options.slice(0, 4);
      }
      // Handle correct answer (can be string like "A" or number like 0)
      if (Array.isArray(item.correctAnswer)) {
        question.correct_answer = item.correctAnswer.map((ans: any) => 
          typeof ans === 'string' && ans.match(/^[A-D]$/) 
            ? String(ans.charCodeAt(0) - 65) 
            : String(ans)
        );
      } else {
        const ans = item.correctAnswer ?? item.correct_answer ?? 0;
        question.correct_answer = typeof ans === 'string' && ans.match(/^[A-D]$/)
          ? String(ans.charCodeAt(0) - 65)
          : String(ans);
      }
      break;

    case 'TrueFalse':
      question.options = ['True', 'False'];
      question.correct_answer = item.correctAnswer === true || item.correctAnswer === 'True' ? '0' : '1';
      break;

    case 'ShortAnswer':
    case 'Essay':
      question.correct_answer = item.correctAnswer || item.correct_answer || '';
      break;

    case 'Coding':
      question.question_text = item.question || item.question_text || '';
      question.code_language = item.codeLanguage || 'javascript';
      question.code_template = item.starterCode || item.codeTemplate || '';
      question.test_cases = item.testCases || [];
      question.correct_answer = item.expectedOutput || item.correctAnswer || '';
      break;

    case 'FillBlanks':
      question.correct_answer = Array.isArray(item.correctAnswer) 
        ? item.correctAnswer 
        : [item.correctAnswer || ''];
      break;

    case 'FileUpload':
      question.correct_answer = item.correctAnswer || item.correct_answer || '';
      question.file_types = item.allowedFileTypes || ['pdf', 'doc', 'docx'];
      break;

    case 'Debugging':
      question.question_text = `${item.question || ''}\n\nBuggy Code:\n\`\`\`${item.codeLanguage || 'javascript'}\n${item.buggyCode || ''}\n\`\`\``;
      question.correct_answer = item.correctAnswer || '';
      question.code_language = item.codeLanguage || 'javascript';
      break;

    case 'CodeReview':
      question.question_text = `${item.question || ''}\n\nCode to Review:\n\`\`\`${item.codeLanguage || 'javascript'}\n${item.codeToReview || ''}\n\`\`\``;
      question.correct_answer = Array.isArray(item.correctAnswer) 
        ? item.correctAnswer.join('\n') 
        : item.correctAnswer || '';
      question.code_language = item.codeLanguage || 'javascript';
      break;

    default:
      // Default to MCQ
      question.options = item.options || ['', '', '', ''];
      question.correct_answer = String(item.correctAnswer ?? 0);
  }

  return question;
}

/**
 * Parse AI response JSON array to questions
 */
export function parseAIResponse(
  content: string,
  includeExplanations: boolean,
  prefix: string = 'ai'
): GeneratedQuestion[] {
  try {
    // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').trim();
    }

    // Parse JSON
    const parsed = JSON.parse(jsonContent);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    // Transform to question format
    return parsed.map((item: AIParsedQuestion, index: number) => 
      parseAIQuestion(item, index, includeExplanations, prefix)
    );

  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
}

