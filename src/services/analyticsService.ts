// Analytics and Reporting Service
import { supabase } from '@/lib/supabase';

export interface AssessmentAnalytics {
  assessmentId: string;
  assessmentTitle: string;
  totalStudents: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionAnalytics: QuestionAnalytics[];
  studentPerformance: StudentPerformance[];
  timeDistribution: TimeDistribution[];
  difficultyAnalysis: DifficultyAnalysis;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTimeSpent: number;
  commonWrongAnswers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  timeSpent: number;
  lastAttempt: string;
  status: 'completed' | 'in_progress' | 'not_started';
}

export interface TimeDistribution {
  timeRange: string;
  count: number;
  percentage: number;
}

export interface DifficultyAnalysis {
  easy: number;
  medium: number;
  hard: number;
  averageDifficulty: number;
}

export interface PlagiarismReport {
  studentId: string;
  studentName: string;
  similarityScore: number;
  matchedSources: string[];
  flaggedContent: string[];
  confidence: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Get comprehensive assessment analytics
  async getAssessmentAnalytics(
    assessmentId: string,
    userId: string
  ): Promise<{ analytics: AssessmentAnalytics | null; error?: string }> {
    try {
      // Get assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, title, type, settings')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) {
        console.error('Error fetching assessment:', assessmentError);
        return { analytics: null, error: assessmentError.message };
      }

      // Get all attempts for this assessment
      const { data: attempts, error: attemptsError } = await supabase
        .from('assessment_attempts')
        .select(`
          *,
          profiles!assessment_attempts_student_id_fkey(name)
        `)
        .eq('assessment_id', assessmentId);

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        return { analytics: null, error: attemptsError.message };
      }

      // Get question responses
      const { data: responses, error: responsesError } = await supabase
        .from('question_responses')
        .select(`
          *,
          questions!question_responses_question_id_fkey(*)
        `)
        .in('attempt_id', attempts?.map(a => a.id) || []);

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
        return { analytics: null, error: responsesError.message };
      }

      // Calculate analytics
      const analytics = this.calculateAssessmentAnalytics(
        assessment,
        attempts || [],
        responses || []
      );

      return { analytics };
    } catch (error) {
      console.error('Error in getAssessmentAnalytics:', error);
      return { analytics: null, error: 'Failed to fetch analytics' };
    }
  }

  // Calculate assessment analytics
  private calculateAssessmentAnalytics(
    assessment: any,
    attempts: any[],
    responses: any[]
  ): AssessmentAnalytics {
    const totalStudents = new Set(attempts.map(a => a.student_id)).size;
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.status === 'submitted').length;
    const averageScore = attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts || 0;
    const passRate = attempts.filter(a => a.passed).length / totalAttempts * 100 || 0;
    const averageTimeSpent = attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0) / totalAttempts || 0;

    return {
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      totalStudents,
      totalAttempts,
      completedAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      averageTimeSpent: Math.round(averageTimeSpent),
      questionAnalytics: this.calculateQuestionAnalytics(responses),
      studentPerformance: this.calculateStudentPerformance(attempts),
      timeDistribution: this.calculateTimeDistribution(attempts),
      difficultyAnalysis: this.calculateDifficultyAnalysis(responses)
    };
  }

  // Calculate question-level analytics
  private calculateQuestionAnalytics(responses: any[]): QuestionAnalytics[] {
    const questionGroups = responses.reduce((groups, response) => {
      const questionId = response.question_id;
      if (!groups[questionId]) {
        groups[questionId] = {
          question: response.questions,
          responses: []
        };
      }
      groups[questionId].responses.push(response);
      return groups;
    }, {});

    return Object.values(questionGroups).map((group: any) => {
      const totalAttempts = group.responses.length;
      const correctAttempts = group.responses.filter(r => r.is_correct).length;
      const accuracy = (correctAttempts / totalAttempts) * 100 || 0;
      const averageTimeSpent = group.responses.reduce((sum, r) => sum + (r.time_spent || 0), 0) / totalAttempts || 0;

      return {
        questionId: group.question.id,
        questionText: group.question.question_text,
        questionType: group.question.question_type,
        totalAttempts,
        correctAttempts,
        accuracy: Math.round(accuracy * 100) / 100,
        averageTimeSpent: Math.round(averageTimeSpent),
        commonWrongAnswers: this.getCommonWrongAnswers(group.responses),
        difficulty: this.calculateQuestionDifficulty(accuracy)
      };
    });
  }

  // Calculate student performance
  private calculateStudentPerformance(attempts: any[]): StudentPerformance[] {
    const studentGroups = attempts.reduce((groups, attempt) => {
      const studentId = attempt.student_id;
      if (!groups[studentId]) {
        groups[studentId] = {
          student: attempt.profiles,
          attempts: []
        };
      }
      groups[studentId].attempts.push(attempt);
      return groups;
    }, {});

    return Object.values(studentGroups).map((group: any) => {
      const totalAttempts = group.attempts.length;
      const bestScore = Math.max(...group.attempts.map(a => a.percentage || 0));
      const averageScore = group.attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts || 0;
      const timeSpent = group.attempts.reduce((sum, a) => sum + (a.time_spent || 0), 0);
      const lastAttempt = group.attempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      return {
        studentId: group.student.id,
        studentName: group.student.name,
        totalAttempts,
        bestScore: Math.round(bestScore * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        timeSpent: Math.round(timeSpent),
        lastAttempt: lastAttempt?.created_at,
        status: this.getStudentStatus(lastAttempt)
      };
    });
  }

  // Calculate time distribution
  private calculateTimeDistribution(attempts: any[]): TimeDistribution[] {
    const timeRanges = [
      { label: '0-15 min', min: 0, max: 900 },
      { label: '15-30 min', min: 900, max: 1800 },
      { label: '30-45 min', min: 1800, max: 2700 },
      { label: '45-60 min', min: 2700, max: 3600 },
      { label: '60+ min', min: 3600, max: Infinity }
    ];

    return timeRanges.map(range => {
      const count = attempts.filter(a => {
        const timeSpent = a.time_spent || 0;
        return timeSpent >= range.min && timeSpent < range.max;
      }).length;

      return {
        timeRange: range.label,
        count,
        percentage: Math.round((count / attempts.length) * 100) || 0
      };
    });
  }

  // Calculate difficulty analysis
  private calculateDifficultyAnalysis(responses: any[]): DifficultyAnalysis {
    const difficulties = responses.map(r => this.calculateQuestionDifficulty(r.is_correct ? 100 : 0));
    const easy = difficulties.filter(d => d === 'easy').length;
    const medium = difficulties.filter(d => d === 'medium').length;
    const hard = difficulties.filter(d => d === 'hard').length;
    const total = difficulties.length;

    return {
      easy: Math.round((easy / total) * 100) || 0,
      medium: Math.round((medium / total) * 100) || 0,
      hard: Math.round((hard / total) * 100) || 0,
      averageDifficulty: Math.round(((easy * 1) + (medium * 2) + (hard * 3)) / total * 100) / 100 || 0
    };
  }

  // Get common wrong answers
  private getCommonWrongAnswers(responses: any[]): string[] {
    const wrongAnswers = responses
      .filter(r => !r.is_correct)
      .map(r => r.response_text)
      .filter(Boolean);

    const answerCounts = wrongAnswers.reduce((counts, answer) => {
      counts[answer] = (counts[answer] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(answerCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([answer]) => answer);
  }

  // Calculate question difficulty
  private calculateQuestionDifficulty(accuracy: number): 'easy' | 'medium' | 'hard' {
    if (accuracy >= 80) return 'easy';
    if (accuracy >= 60) return 'medium';
    return 'hard';
  }

  // Get student status
  private getStudentStatus(lastAttempt: any): 'completed' | 'in_progress' | 'not_started' {
    if (!lastAttempt) return 'not_started';
    if (lastAttempt.status === 'submitted') return 'completed';
    return 'in_progress';
  }

  // Export analytics to CSV
  async exportAnalyticsToCSV(
    assessmentId: string,
    format: 'csv' | 'excel' = 'csv'
  ): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const { analytics, error } = await this.getAssessmentAnalytics(assessmentId, '');
      
      if (error || !analytics) {
        return { success: false, error: error || 'Failed to fetch analytics' };
      }

      const csvData = this.convertAnalyticsToCSV(analytics);
      return { success: true, data: csvData };
    } catch (error) {
      console.error('Error exporting analytics:', error);
      return { success: false, error: 'Failed to export analytics' };
    }
  }

  // Convert analytics to CSV format
  private convertAnalyticsToCSV(analytics: AssessmentAnalytics): string {
    const headers = [
      'Assessment Title',
      'Total Students',
      'Total Attempts',
      'Completed Attempts',
      'Average Score',
      'Pass Rate',
      'Average Time Spent'
    ];

    const data = [
      analytics.assessmentTitle,
      analytics.totalStudents,
      analytics.totalAttempts,
      analytics.completedAttempts,
      analytics.averageScore,
      analytics.passRate,
      analytics.averageTimeSpent
    ];

    return [headers.join(','), data.join(',')].join('\n');
  }

  // Get plagiarism detection results
  async getPlagiarismReport(
    assessmentId: string
  ): Promise<{ reports: PlagiarismReport[]; error?: string }> {
    try {
      // This would integrate with a plagiarism detection service
      // For now, return mock data
      const reports: PlagiarismReport[] = [
        {
          studentId: 'student-1',
          studentName: 'John Doe',
          similarityScore: 85,
          matchedSources: ['Source A', 'Source B'],
          flaggedContent: ['Paragraph 1', 'Paragraph 3'],
          confidence: 0.92
        }
      ];

      return { reports };
    } catch (error) {
      console.error('Error in getPlagiarismReport:', error);
      return { reports: [], error: 'Failed to fetch plagiarism report' };
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics(
    assessmentId: string
  ): Promise<{ 
    activeStudents: number; 
    currentAttempts: number; 
    averageProgress: number; 
    error?: string 
  }> {
    try {
      const { data: activeAttempts, error } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('status', 'in_progress');

      if (error) {
        console.error('Error fetching active attempts:', error);
        return { activeStudents: 0, currentAttempts: 0, averageProgress: 0, error: error.message };
      }

      const activeStudents = new Set(activeAttempts?.map(a => a.student_id)).size;
      const currentAttempts = activeAttempts?.length || 0;
      const averageProgress = activeAttempts?.reduce((sum, a) => sum + (a.progress || 0), 0) / currentAttempts || 0;

      return {
        activeStudents,
        currentAttempts,
        averageProgress: Math.round(averageProgress * 100) / 100
      };
    } catch (error) {
      console.error('Error in getRealTimeAnalytics:', error);
      return { activeStudents: 0, currentAttempts: 0, averageProgress: 0, error: 'Failed to fetch real-time analytics' };
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
