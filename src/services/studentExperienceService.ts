// Student Experience Service
import { supabase } from '@/lib/supabase';

export interface StudentProgress {
  id: string;
  studentId: string;
  assessmentId: string;
  attemptId: string;
  currentQuestionId?: string;
  questionsAnswered: number;
  totalQuestions: number;
  progressPercentage: number;
  timeSpent: number;
  timeRemaining: number;
  lastActivity: string;
  savedResponses: Record<string, any>;
  resumeEnabled: boolean;
  lastSaved: string;
}

export interface QuestionNavigation {
  questionId: string;
  questionNumber: number;
  isAnswered: boolean;
  isFlagged: boolean;
  timeSpent: number;
  status: 'not_started' | 'in_progress' | 'answered' | 'reviewed';
}

export interface AssessmentSession {
  id: string;
  assessmentId: string;
  studentId: string;
  attemptId: string;
  startTime: string;
  lastActivity: string;
  totalTimeSpent: number;
  questions: QuestionNavigation[];
  currentQuestionIndex: number;
  canResume: boolean;
  autoSaveEnabled: boolean;
  accessibilitySettings: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    extendedTime: boolean;
  };
}

export interface SaveAndResumeData {
  questionId: string;
  response: any;
  timeSpent: number;
  isFlagged: boolean;
  lastSaved: string;
}

export class StudentExperienceService {
  private static instance: StudentExperienceService;

  static getInstance(): StudentExperienceService {
    if (!StudentExperienceService.instance) {
      StudentExperienceService.instance = new StudentExperienceService();
    }
    return StudentExperienceService.instance;
  }

  // Start assessment session
  async startAssessmentSession(
    assessmentId: string,
    studentId: string,
    attemptId: string
  ): Promise<{ session: AssessmentSession | null; error?: string }> {
    try {
      // Get assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) {
        console.error('Error fetching assessment:', assessmentError);
        return { session: null, error: assessmentError.message };
      }

      // Get questions for this assessment
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, question_type, points, order_index')
        .eq('assessment_id', assessmentId)
        .order('order_index');

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        return { session: null, error: questionsError.message };
      }

      // Create session
      const session: AssessmentSession = {
        id: `session_${Date.now()}`,
        assessmentId,
        studentId,
        attemptId,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        totalTimeSpent: 0,
        questions: questions.map((q, index) => ({
          questionId: q.id,
          questionNumber: index + 1,
          isAnswered: false,
          isFlagged: false,
          timeSpent: 0,
          status: 'not_started'
        })),
        currentQuestionIndex: 0,
        canResume: true,
        autoSaveEnabled: true,
        accessibilitySettings: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          extendedTime: false
        }
      };

      // Save session to database
      await this.saveSessionToDatabase(session);

      return { session };
    } catch (error) {
      console.error('Error in startAssessmentSession:', error);
      return { session: null, error: 'Failed to start assessment session' };
    }
  }

  // Resume assessment session
  async resumeAssessmentSession(
    sessionId: string,
    studentId: string
  ): Promise<{ session: AssessmentSession | null; error?: string }> {
    try {
      const { data: sessionData, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('id', sessionId)
        .eq('student_id', studentId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return { session: null, error: error.message };
      }

      // Reconstruct session from database
      const session: AssessmentSession = {
        id: sessionData.id,
        assessmentId: sessionData.assessment_id,
        studentId: sessionData.student_id,
        attemptId: sessionData.attempt_id,
        startTime: sessionData.created_at,
        lastActivity: sessionData.last_activity,
        totalTimeSpent: sessionData.time_spent,
        questions: this.parseQuestionNavigation(sessionData.saved_responses),
        currentQuestionIndex: this.findCurrentQuestionIndex(sessionData.saved_responses),
        canResume: sessionData.resume_enabled,
        autoSaveEnabled: true,
        accessibilitySettings: this.parseAccessibilitySettings(sessionData.saved_responses)
      };

      return { session };
    } catch (error) {
      console.error('Error in resumeAssessmentSession:', error);
      return { session: null, error: 'Failed to resume assessment session' };
    }
  }

  // Save student progress
  async saveStudentProgress(
    sessionId: string,
    questionId: string,
    response: any,
    timeSpent: number,
    isFlagged: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Error fetching current progress:', fetchError);
        return { success: false, error: fetchError.message };
      }

      // Update saved responses
      const savedResponses = currentProgress.saved_responses || {};
      savedResponses[questionId] = {
        response,
        timeSpent,
        isFlagged,
        lastSaved: new Date().toISOString()
      };

      // Update progress
      const { error: updateError } = await supabase
        .from('student_progress')
        .update({
          current_question_id: questionId,
          questions_answered: Object.keys(savedResponses).length,
          progress_percentage: (Object.keys(savedResponses).length / currentProgress.total_questions) * 100,
          time_spent: currentProgress.time_spent + timeSpent,
          saved_responses: savedResponses,
          last_saved: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating progress:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in saveStudentProgress:', error);
      return { success: false, error: 'Failed to save student progress' };
    }
  }

  // Get student progress
  async getStudentProgress(
    studentId: string,
    assessmentId: string
  ): Promise<{ progress: StudentProgress | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('assessment_id', assessmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching student progress:', error);
        return { progress: null, error: error.message };
      }

      const progress: StudentProgress = {
        id: data.id,
        studentId: data.student_id,
        assessmentId: data.assessment_id,
        attemptId: data.attempt_id,
        currentQuestionId: data.current_question_id,
        questionsAnswered: data.questions_answered,
        totalQuestions: data.total_questions,
        progressPercentage: data.progress_percentage,
        timeSpent: data.time_spent,
        timeRemaining: data.time_remaining,
        lastActivity: data.last_activity,
        savedResponses: data.saved_responses,
        resumeEnabled: data.resume_enabled,
        lastSaved: data.last_saved
      };

      return { progress };
    } catch (error) {
      console.error('Error in getStudentProgress:', error);
      return { progress: null, error: 'Failed to fetch student progress' };
    }
  }

  // Navigate to question
  async navigateToQuestion(
    sessionId: string,
    questionIndex: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get questions for this assessment
      const { data: progress } = await supabase
        .from('student_progress')
        .select('assessment_id')
        .eq('id', sessionId)
        .single();

      if (!progress) {
        return { success: false, error: 'Session not found' };
      }

      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('assessment_id', progress.assessment_id)
        .order('order_index');

      if (!questions || questionIndex >= questions.length) {
        return { success: false, error: 'Invalid question index' };
      }

      const questionId = questions[questionIndex].id;

      // Update current question
      const { error } = await supabase
        .from('student_progress')
        .update({
          current_question_id: questionId,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error navigating to question:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in navigateToQuestion:', error);
      return { success: false, error: 'Failed to navigate to question' };
    }
  }

  // Flag question for review
  async flagQuestion(
    sessionId: string,
    questionId: string,
    isFlagged: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current saved responses
      const { data: progress } = await supabase
        .from('student_progress')
        .select('saved_responses')
        .eq('id', sessionId)
        .single();

      if (!progress) {
        return { success: false, error: 'Session not found' };
      }

      const savedResponses = progress.saved_responses || {};
      if (savedResponses[questionId]) {
        savedResponses[questionId].isFlagged = isFlagged;
      } else {
        savedResponses[questionId] = {
          isFlagged,
          lastSaved: new Date().toISOString()
        };
      }

      // Update flag status
      const { error } = await supabase
        .from('student_progress')
        .update({
          saved_responses: savedResponses,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error flagging question:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in flagQuestion:', error);
      return { success: false, error: 'Failed to flag question' };
    }
  }

  // Auto-save functionality
  async autoSave(
    sessionId: string,
    questionId: string,
    response: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current saved responses
      const { data: progress } = await supabase
        .from('student_progress')
        .select('saved_responses')
        .eq('id', sessionId)
        .single();

      if (!progress) {
        return { success: false, error: 'Session not found' };
      }

      const savedResponses = progress.saved_responses || {};
      savedResponses[questionId] = {
        ...savedResponses[questionId],
        response,
        lastSaved: new Date().toISOString(),
        autoSaved: true
      };

      // Update with auto-save
      const { error } = await supabase
        .from('student_progress')
        .update({
          saved_responses: savedResponses,
          last_saved: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error auto-saving:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in autoSave:', error);
      return { success: false, error: 'Failed to auto-save' };
    }
  }

  // Get accessibility settings
  async getAccessibilitySettings(
    studentId: string
  ): Promise<{ settings: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('student_accessibility_settings')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        console.error('Error fetching accessibility settings:', error);
        return { settings: null, error: error.message };
      }

      const defaultSettings = {
        highContrast: false,
        largeText: false,
        screenReader: false,
        extendedTime: false,
        keyboardNavigation: true,
        reducedMotion: false
      };

      return { settings: data || defaultSettings };
    } catch (error) {
      console.error('Error in getAccessibilitySettings:', error);
      return { settings: null, error: 'Failed to fetch accessibility settings' };
    }
  }

  // Update accessibility settings
  async updateAccessibilitySettings(
    studentId: string,
    settings: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('student_accessibility_settings')
        .upsert({
          student_id: studentId,
          settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating accessibility settings:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateAccessibilitySettings:', error);
      return { success: false, error: 'Failed to update accessibility settings' };
    }
  }

  // Helper methods
  private async saveSessionToDatabase(session: AssessmentSession): Promise<void> {
    try {
      await supabase
        .from('student_progress')
        .insert({
          id: session.id,
          student_id: session.studentId,
          assessment_id: session.assessmentId,
          attempt_id: session.attemptId,
          current_question_id: session.questions[0]?.questionId,
          questions_answered: 0,
          total_questions: session.questions.length,
          progress_percentage: 0,
          time_spent: 0,
          time_remaining: 0,
          saved_responses: {},
          resume_enabled: session.canResume,
          last_saved: new Date().toISOString(),
          last_activity: session.lastActivity
        });
    } catch (error) {
      console.error('Error saving session to database:', error);
    }
  }

  private parseQuestionNavigation(savedResponses: any): QuestionNavigation[] {
    // This would parse the saved responses to create question navigation
    // For now, return empty array
    return [];
  }

  private findCurrentQuestionIndex(savedResponses: any): number {
    // This would find the current question index from saved responses
    return 0;
  }

  private parseAccessibilitySettings(savedResponses: any): any {
    // This would parse accessibility settings from saved responses
    return {
      highContrast: false,
      largeText: false,
      screenReader: false,
      extendedTime: false
    };
  }
}

export const studentExperienceService = StudentExperienceService.getInstance();
