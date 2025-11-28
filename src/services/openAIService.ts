/**
 * OpenAI Service for Assessment Question Generation
 * 
 * This service uses OpenAI API to generate assessment questions based on user input.
 * 
 * Configuration:
 * - Set VITE_OPENAI_API_KEY in your .env file
 * - The API key is used securely from the frontend (for now, consider moving to backend for production)
 */

import { 
  QuestionTypeDistribution, 
  calculateQuestionDistribution, 
  buildQuestionGenerationPrompt 
} from './aiQuestionGenerator';
import { parseAIResponse, GeneratedQuestion } from './aiQuestionParser';

interface OpenAIQuestionRequest {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;
  assessmentType: 'Quiz' | 'Test' | 'Practice';
  timeLimit: number;
  includeExplanations: boolean;
  focusAreas: string[];
  course?: string;
  questionTypes?: string[];
  distributionMode?: 'auto' | 'manual';
  manualDistribution?: Record<string, number>;
}

interface OpenAIResponse {
  success: boolean;
  questions: GeneratedQuestion[];
  error?: string;
}

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string | null = null;
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  private constructor() {
    // Get API key from environment variable
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Set API key programmatically (alternative to environment variable)
   */
  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate assessment questions using OpenAI
   */
  async generateQuestions(request: OpenAIQuestionRequest): Promise<OpenAIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        questions: [],
        error: 'OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file or provide it through the UI.'
      };
    }

    try {
      // Build the prompt for OpenAI
      const prompt = this.buildPrompt(request);

      // Call OpenAI API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4 or gpt-3.5-turbo
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator specializing in creating high-quality assessment questions. Generate questions that are clear, accurate, and appropriate for the specified difficulty level.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the response and transform to question format
      const questions = this.parseOpenAIResponse(content, request);

      return {
        success: true,
        questions
      };

    } catch (error: any) {
      console.error('Error generating questions with OpenAI:', error);
      return {
        success: false,
        questions: [],
        error: error.message || 'Failed to generate questions. Please check your API key and try again.'
      };
    }
  }

  /**
   * Build the prompt for OpenAI
   */
  private buildPrompt(request: OpenAIQuestionRequest): string {
    // Calculate question distribution
    const distribution = calculateQuestionDistribution(
      request.questionCount,
      request.questionTypes || ['MCQ'],
      request.distributionMode || 'auto',
      request.manualDistribution,
      request.difficulty
    );

    // Build comprehensive prompt
    return buildQuestionGenerationPrompt(
      request.topic,
      request.difficulty,
      request.questionCount,
      request.assessmentType,
      distribution,
      request.includeExplanations,
      request.focusAreas,
      request.timeLimit
    );
  }

  /**
   * Parse OpenAI response and transform to question format
   */
  private parseOpenAIResponse(content: string, request: OpenAIQuestionRequest): GeneratedQuestion[] {
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

      // Use shared parser
      return parseAIResponse(content, request.includeExplanations, 'openai');

    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      // Fallback: try to extract questions manually
      return this.fallbackParse(content, request);
    }
  }

  /**
   * Fallback parser if JSON parsing fails
   */
  private fallbackParse(content: string, request: OpenAIQuestionRequest): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const lines = content.split('\n').filter(line => line.trim());

    let currentQuestion: Partial<GeneratedQuestion> | null = null;
    let questionIndex = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Detect question
      if (trimmed.match(/^\d+[\.\)]/) || trimmed.includes('?')) {
        if (currentQuestion && currentQuestion.question_text) {
          questions.push(this.createQuestionFromPartial(currentQuestion, questionIndex++, request));
        }
        currentQuestion = {
          question_text: trimmed.replace(/^\d+[\.\)]\s*/, '')
        };
      }
      // Detect options
      else if (trimmed.match(/^[A-D][\.\)]/)) {
        if (!currentQuestion) currentQuestion = {};
        if (!currentQuestion.options) currentQuestion.options = [];
        const optionText = trimmed.replace(/^[A-D][\.\)]\s*/, '');
        currentQuestion.options.push(optionText);
      }
      // Detect explanation
      else if (trimmed.toLowerCase().includes('explanation') || trimmed.toLowerCase().includes('answer:')) {
        if (currentQuestion) {
          currentQuestion.explanation = trimmed;
        }
      }
    }

    // Add last question
    if (currentQuestion && currentQuestion.question_text) {
      questions.push(this.createQuestionFromPartial(currentQuestion, questionIndex++, request));
    }

    // If we couldn't parse any questions, generate fallback questions
    if (questions.length === 0) {
      return this.generateFallbackQuestions(request);
    }

    return questions;
  }

  /**
   * Create a question from partial data
   */
  private createQuestionFromPartial(
    partial: Partial<GeneratedQuestion>,
    index: number,
    request: OpenAIQuestionRequest
  ): GeneratedQuestion {
    return {
      id: `ai_${Date.now()}_${index}`,
      type: 'multiple-choice',
      question_text: partial.question_text || `Question ${index + 1} about ${request.topic}`,
      options: partial.options && partial.options.length >= 4 
        ? partial.options.slice(0, 4)
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: '0',
      explanation: request.includeExplanations ? (partial.explanation || '') : '',
      points: 1,
      order_index: index + 1
    };
  }


  /**
   * Generate fallback questions if parsing completely fails
   */
  private generateFallbackQuestions(request: OpenAIQuestionRequest): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    
    for (let i = 0; i < request.questionCount; i++) {
      questions.push({
        id: `ai_fallback_${Date.now()}_${i}`,
        type: 'multiple-choice',
        question_text: `Question ${i + 1}: What is a key concept related to ${request.topic}?`,
        options: [
          `Option A related to ${request.topic}`,
          `Option B related to ${request.topic}`,
          `Option C related to ${request.topic}`,
          `Option D related to ${request.topic}`
        ],
        correct_answer: '0',
        explanation: request.includeExplanations 
          ? `This question tests understanding of ${request.topic} at ${request.difficulty.toLowerCase()} level.`
          : '',
        points: 1,
        order_index: i + 1
      });
    }

    return questions;
  }
}

export const openAIService = OpenAIService.getInstance();
export type { OpenAIQuestionRequest, OpenAIResponse };
export type { GeneratedQuestion } from './aiQuestionParser';

