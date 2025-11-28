// Enhanced AI Generation Service
import { supabase } from '@/lib/supabase';

export interface AIGenerationRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  assessmentType: 'quiz' | 'test' | 'assignment' | 'project' | 'coding_challenge';
  language: string;
  bloomTaxonomyLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  
  // Question Variety Control
  questionVariety: {
    mcq: number; // percentage
    trueFalse: number;
    shortAnswer: number;
    essay: number;
    coding: number;
    fileUpload: number;
  };
  
  // Advanced Options
  includeMedia: boolean;
  includeCodeExamples: boolean;
  includeDiagrams: boolean;
  focusAreas: string[];
  learningObjectives: string[];
  
  // Assessment Settings
  timeLimit: number;
  passingScore: number;
  negativeMarking: boolean;
  partialCredit: boolean;
}

export interface GeneratedQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'coding' | 'file-upload';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  difficulty: number;
  bloomLevel: string;
  tags: string[];
  mediaFiles?: Array<{
    type: 'image' | 'audio' | 'video';
    url: string;
    altText: string;
  }>;
  codeLanguage?: string;
  codeTemplate?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
}

export interface AIGenerationResult {
  success: boolean;
  questions: GeneratedQuestion[];
  metadata: {
    totalQuestions: number;
    averageDifficulty: number;
    bloomDistribution: Record<string, number>;
    estimatedTime: number;
    tags: string[];
  };
  error?: string;
}

export class AIGenerationService {
  private static instance: AIGenerationService;

  static getInstance(): AIGenerationService {
    if (!AIGenerationService.instance) {
      AIGenerationService.instance = new AIGenerationService();
    }
    return AIGenerationService.instance;
  }

  // Generate questions using AI
  async generateQuestions(
    request: AIGenerationRequest,
    userId: string
  ): Promise<AIGenerationResult> {
    try {
      // Validate request
      const validation = this.validateGenerationRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          questions: [],
          metadata: this.getEmptyMetadata(),
          error: validation.error
        };
      }

      // Simulate AI generation process
      const questions = await this.simulateAIGeneration(request);
      const metadata = this.calculateMetadata(questions, request);

      // Save generation history
      await this.saveGenerationHistory(userId, request, questions);

      return {
        success: true,
        questions,
        metadata
      };
    } catch (error) {
      console.error('Error in generateQuestions:', error);
      return {
        success: false,
        questions: [],
        metadata: this.getEmptyMetadata(),
        error: 'Failed to generate questions'
      };
    }
  }

  // Validate generation request
  private validateGenerationRequest(request: AIGenerationRequest): { valid: boolean; error?: string } {
    // Check if question variety percentages add up to 100
    const totalPercentage = Object.values(request.questionVariety).reduce((sum, val) => sum + val, 0);
    if (totalPercentage !== 100) {
      return { valid: false, error: 'Question variety percentages must add up to 100%' };
    }

    // Check if question count is reasonable
    if (request.questionCount < 1 || request.questionCount > 100) {
      return { valid: false, error: 'Question count must be between 1 and 100' };
    }

    // Check if time limit is reasonable
    if (request.timeLimit < 5 || request.timeLimit > 300) {
      return { valid: false, error: 'Time limit must be between 5 and 300 minutes' };
    }

    return { valid: true };
  }

  // Simulate AI generation (replace with actual AI service)
  private async simulateAIGeneration(request: AIGenerationRequest): Promise<GeneratedQuestion[]> {
    const questions: GeneratedQuestion[] = [];
    const questionCounts = this.calculateQuestionCounts(request);

    // Generate MCQ questions
    for (let i = 0; i < questionCounts.mcq; i++) {
      questions.push(this.generateMCQQuestion(request, i));
    }

    // Generate True/False questions
    for (let i = 0; i < questionCounts.trueFalse; i++) {
      questions.push(this.generateTrueFalseQuestion(request, i));
    }

    // Generate Short Answer questions
    for (let i = 0; i < questionCounts.shortAnswer; i++) {
      questions.push(this.generateShortAnswerQuestion(request, i));
    }

    // Generate Essay questions
    for (let i = 0; i < questionCounts.essay; i++) {
      questions.push(this.generateEssayQuestion(request, i));
    }

    // Generate Coding questions
    for (let i = 0; i < questionCounts.coding; i++) {
      questions.push(this.generateCodingQuestion(request, i));
    }

    // Generate File Upload questions
    for (let i = 0; i < questionCounts.fileUpload; i++) {
      questions.push(this.generateFileUploadQuestion(request, i));
    }

    return questions;
  }

  // Calculate question counts based on percentages
  private calculateQuestionCounts(request: AIGenerationRequest) {
    const total = request.questionCount;
    return {
      mcq: Math.round((request.questionVariety.mcq / 100) * total),
      trueFalse: Math.round((request.questionVariety.trueFalse / 100) * total),
      shortAnswer: Math.round((request.questionVariety.shortAnswer / 100) * total),
      essay: Math.round((request.questionVariety.essay / 100) * total),
      coding: Math.round((request.questionVariety.coding / 100) * total),
      fileUpload: Math.round((request.questionVariety.fileUpload / 100) * total)
    };
  }

  // Generate MCQ question
  private generateMCQQuestion(request: AIGenerationRequest, index: number): GeneratedQuestion {
    const difficulty = this.getDifficultyMultiplier(request.difficulty);
    const bloomLevel = this.getBloomLevelDescription(request.bloomTaxonomyLevel);
    
    return {
      id: `mcq_${Date.now()}_${index}`,
      questionText: `${request.language === 'en' ? 'What is' : '¿Qué es'} ${request.topic}? (Question ${index + 1})`,
      questionType: 'multiple-choice',
      options: [
        `Option A for ${request.topic}`,
        `Option B for ${request.topic}`,
        `Option C for ${request.topic}`,
        `Option D for ${request.topic}`
      ],
      correctAnswer: '0',
      explanation: `This question tests ${bloomLevel.toLowerCase()} understanding of ${request.topic}.`,
      points: 1 * difficulty,
      difficulty: this.getDifficultyScore(request.difficulty),
      bloomLevel: request.bloomTaxonomyLevel,
      tags: [request.topic, ...request.focusAreas],
      mediaFiles: request.includeMedia ? [{
        type: 'image',
        url: `https://example.com/image_${index}.jpg`,
        altText: `Diagram illustrating ${request.topic}`
      }] : undefined
    };
  }

  // Generate True/False question
  private generateTrueFalseQuestion(request: AIGenerationRequest, index: number): GeneratedQuestion {
    const difficulty = this.getDifficultyMultiplier(request.difficulty);
    
    return {
      id: `tf_${Date.now()}_${index}`,
      questionText: `${request.topic} is a fundamental concept in this field. (True/False)`,
      questionType: 'true-false',
      options: ['True', 'False'],
      correctAnswer: '0',
      explanation: `This statement about ${request.topic} is true based on fundamental principles.`,
      points: 1 * difficulty,
      difficulty: this.getDifficultyScore(request.difficulty),
      bloomLevel: request.bloomTaxonomyLevel,
      tags: [request.topic]
    };
  }

  // Generate Short Answer question
  private generateShortAnswerQuestion(request: AIGenerationRequest, index: number): GeneratedQuestion {
    const difficulty = this.getDifficultyMultiplier(request.difficulty);
    
    return {
      id: `sa_${Date.now()}_${index}`,
      questionText: `Explain the key concept of ${request.topic} in 2-3 sentences.`,
      questionType: 'short-answer',
      correctAnswer: `A comprehensive explanation of ${request.topic} should include...`,
      explanation: `This question requires students to demonstrate understanding of ${request.topic}.`,
      points: 2 * difficulty,
      difficulty: this.getDifficultyScore(request.difficulty),
      bloomLevel: request.bloomTaxonomyLevel,
      tags: [request.topic]
    };
  }

  // Generate Essay question
  private generateEssayQuestion(request: AIGenerationRequest, index: number): GeneratedQuestion {
    const difficulty = this.getDifficultyMultiplier(request.difficulty);
    
    return {
      id: `essay_${Date.now()}_${index}`,
      questionText: `Write a comprehensive essay analyzing ${request.topic} and its implications.`,
      questionType: 'essay',
      correctAnswer: `A well-structured essay should include: introduction, main arguments, evidence, analysis, and conclusion.`,
      explanation: `This essay question tests higher-order thinking skills related to ${request.topic}.`,
      points: 5 * difficulty,
      difficulty: this.getDifficultyScore(request.difficulty),
      bloomLevel: request.bloomTaxonomyLevel,
      tags: [request.topic, 'essay', 'analysis']
    };
  }

  // Generate Coding question
  private generateCodingQuestion(request: AIGenerationRequest, index: number): GeneratedQuestion {
    const difficulty = this.getDifficultyMultiplier(request.difficulty);
    const languages = ['javascript', 'python', 'java', 'cpp'];
    const selectedLanguage = request.focusAreas.includes('programming') ? 'javascript' : languages[Math.floor(Math.random() * languages.length)];
    
    return {
      id: `coding_${Date.now()}_${index}`,
      questionText: `Write a function to solve the following problem related to ${request.topic}:`,
      questionType: 'coding',
      correctAnswer: `// Solution code here`,
      explanation: `This coding question tests practical application of ${request.topic} concepts.`,
      points: 3 * difficulty,
      difficulty: this.getDifficultyScore(request.difficulty),
      bloomLevel: request.bloomTaxonomyLevel,
      tags: [request.topic, 'coding', selectedLanguage],
      codeLanguage: selectedLanguage,
      codeTemplate: `function solution() {\n  // Your code here\n}`,
      testCases: [
        { input: 'test1', expectedOutput: 'expected1', isHidden: false },
        { input: 'test2', expectedOutput: 'expected2', isHidden: true }
      ]
    };
  }

  // Generate File Upload question
  private generateFileUploadQuestion(request: AIGenerationRequest, index: number): GeneratedQuestion {
    const difficulty = this.getDifficultyMultiplier(request.difficulty);
    
    return {
      id: `file_${Date.now()}_${index}`,
      questionText: `Create a document or presentation about ${request.topic} and upload it.`,
      questionType: 'file-upload',
      correctAnswer: `Upload a well-structured document covering ${request.topic}.`,
      explanation: `This question requires students to create and submit a document about ${request.topic}.`,
      points: 4 * difficulty,
      difficulty: this.getDifficultyScore(request.difficulty),
      bloomLevel: request.bloomTaxonomyLevel,
      tags: [request.topic, 'document', 'presentation']
    };
  }

  // Get difficulty multiplier
  private getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 0.8;
      case 'medium': return 1.0;
      case 'hard': return 1.2;
      default: return 1.0;
    }
  }

  // Get difficulty score
  private getDifficultyScore(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 0.3;
      case 'medium': return 0.6;
      case 'hard': return 0.9;
      default: return 0.6;
    }
  }

  // Get Bloom's taxonomy description
  private getBloomLevelDescription(level: string): string {
    const descriptions = {
      'remember': 'recall of facts and basic concepts',
      'understand': 'explanation of ideas or concepts',
      'apply': 'use information in new situations',
      'analyze': 'draw connections among ideas',
      'evaluate': 'justify a stand or decision',
      'create': 'produce new or original work'
    };
    return descriptions[level] || 'understanding';
  }

  // Calculate metadata
  private calculateMetadata(questions: GeneratedQuestion[], request: AIGenerationRequest) {
    const totalQuestions = questions.length;
    const averageDifficulty = questions.reduce((sum, q) => sum + q.difficulty, 0) / totalQuestions;
    
    const bloomDistribution = questions.reduce((dist, q) => {
      dist[q.bloomLevel] = (dist[q.bloomLevel] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    const allTags = questions.flatMap(q => q.tags);
    const uniqueTags = [...new Set(allTags)];

    const estimatedTime = questions.reduce((sum, q) => {
      const baseTime = q.questionType === 'essay' ? 10 : 
                      q.questionType === 'coding' ? 15 : 
                      q.questionType === 'file-upload' ? 20 : 2;
      return sum + baseTime;
    }, 0);

    return {
      totalQuestions,
      averageDifficulty: Math.round(averageDifficulty * 100) / 100,
      bloomDistribution,
      estimatedTime,
      tags: uniqueTags
    };
  }

  // Get empty metadata
  private getEmptyMetadata() {
    return {
      totalQuestions: 0,
      averageDifficulty: 0,
      bloomDistribution: {},
      estimatedTime: 0,
      tags: []
    };
  }

  // Save generation history
  private async saveGenerationHistory(
    userId: string,
    request: AIGenerationRequest,
    questions: GeneratedQuestion[]
  ): Promise<void> {
    try {
      await supabase
        .from('ai_generation_history')
        .insert({
          user_id: userId,
          request_data: request,
          generated_questions: questions,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving generation history:', error);
    }
  }

  // Get generation history
  async getGenerationHistory(
    userId: string,
    limit: number = 20
  ): Promise<{ history: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('ai_generation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching generation history:', error);
        return { history: [], error: error.message };
      }

      return { history: data || [] };
    } catch (error) {
      console.error('Error in getGenerationHistory:', error);
      return { history: [], error: 'Failed to fetch generation history' };
    }
  }

  // Get AI generation templates
  async getGenerationTemplates(): Promise<{ templates: any[]; error?: string }> {
    try {
      // Return predefined templates for different assessment types
      const templates = [
        {
          id: 'quiz_template',
          name: 'Quick Quiz',
          description: 'Fast-paced quiz with multiple choice questions',
          settings: {
            questionVariety: { mcq: 80, trueFalse: 20, shortAnswer: 0, essay: 0, coding: 0, fileUpload: 0 },
            timeLimit: 15,
            difficulty: 'easy'
          }
        },
        {
          id: 'comprehensive_test',
          name: 'Comprehensive Test',
          description: 'Full assessment with mixed question types',
          settings: {
            questionVariety: { mcq: 40, trueFalse: 10, shortAnswer: 30, essay: 20, coding: 0, fileUpload: 0 },
            timeLimit: 60,
            difficulty: 'medium'
          }
        },
        {
          id: 'coding_assessment',
          name: 'Coding Assessment',
          description: 'Programming-focused assessment',
          settings: {
            questionVariety: { mcq: 20, trueFalse: 0, shortAnswer: 20, essay: 0, coding: 60, fileUpload: 0 },
            timeLimit: 90,
            difficulty: 'hard'
          }
        }
      ];

      return { templates };
    } catch (error) {
      console.error('Error in getGenerationTemplates:', error);
      return { templates: [], error: 'Failed to fetch templates' };
    }
  }
}

export const aiGenerationService = AIGenerationService.getInstance();
