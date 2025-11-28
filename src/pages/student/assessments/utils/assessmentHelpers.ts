/**
 * Assessment Helper Utilities
 * Functions to help determine assessment type and behavior
 */

import DataService from '@/services/dataService';

interface Question {
  id: string;
  type: string;
  question_type?: string;
}

/**
 * Check if all questions in an assessment are coding challenges
 * @param questions Array of questions to check
 * @returns true if all questions are coding challenges, false otherwise
 */
export function isAllCodingChallenges(questions: Question[]): boolean {
  if (!questions || questions.length === 0) {
    return false;
  }

  // Check if all questions are coding challenges
  return questions.every(q => {
    const questionType = q.question_type || q.type || '';
    const normalizedType = questionType.toLowerCase().replace(/_/g, '-');
    
    return normalizedType === 'coding-challenge' || 
           normalizedType === 'coding' ||
           questionType === 'coding_challenge';
  });
}

/**
 * Fetch questions for an assessment and check if all are coding challenges
 * @param assessmentId The assessment ID
 * @returns Promise resolving to { questions, isAllCoding }
 */
export async function checkAssessmentQuestionTypes(assessmentId: string): Promise<{
  questions: Question[];
  isAllCoding: boolean;
}> {
  try {
    const questions = await DataService.getAssessmentQuestions(assessmentId);
    
    return {
      questions: questions || [],
      isAllCoding: isAllCodingChallenges(questions || [])
    };
  } catch (error) {
    console.error('Error checking assessment question types:', error);
    return {
      questions: [],
      isAllCoding: false
    };
  }
}

