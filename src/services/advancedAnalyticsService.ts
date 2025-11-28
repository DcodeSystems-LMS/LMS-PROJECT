// Advanced Analytics Service
import { supabase } from '@/lib/supabase';

export interface QuestionLevelAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTimeSpent: number;
  difficultyScore: number;
  discriminationIndex: number;
  commonErrors: string[];
  mostMissedOptions: string[];
  bloomLevelPerformance: Record<string, number>;
}

export interface TimeTrackingAnalytics {
  studentId: string;
  questionId: string;
  timeSpent: number;
  keystrokes: number;
  mouseClicks: number;
  focusTime: number;
  interactionPattern: 'fast' | 'normal' | 'slow' | 'struggling';
}

export interface ExportReport {
  format: 'csv' | 'excel' | 'pdf';
  data: any[];
  filename: string;
  generatedAt: string;
  filters: any;
}

export interface LeaderboardEntry {
  studentId: string;
  studentName: string;
  score: number;
  rank: number;
  percentile: number;
  badges: string[];
  points: number;
  streakCount: number;
  achievements: string[];
}

export interface PlagiarismAnalytics {
  totalSubmissions: number;
  flaggedSubmissions: number;
  averageSimilarity: number;
  topSources: Array<{ source: string; count: number }>;
  confidenceDistribution: Record<string, number>;
  reviewStatus: Record<string, number>;
}

export class AdvancedAnalyticsService {
  private static instance: AdvancedAnalyticsService;

  static getInstance(): AdvancedAnalyticsService {
    if (!AdvancedAnalyticsService.instance) {
      AdvancedAnalyticsService.instance = new AdvancedAnalyticsService();
    }
    return AdvancedAnalyticsService.instance;
  }

  // Get question-level analytics
  async getQuestionLevelAnalytics(
    assessmentId: string,
    questionId?: string
  ): Promise<{ analytics: QuestionLevelAnalytics[]; error?: string }> {
    try {
      let query = supabase
        .from('question_analytics')
        .select(`
          *,
          questions!question_analytics_question_id_fkey(
            id,
            question_text,
            question_type
          )
        `)
        .eq('assessment_id', assessmentId);

      if (questionId) {
        query = query.eq('question_id', questionId);
      }

      const { data, error } = await query.order('accuracy_percentage', { ascending: false });

      if (error) {
        console.error('Error fetching question analytics:', error);
        return { analytics: [], error: error.message };
      }

      const analytics: QuestionLevelAnalytics[] = (data || []).map(item => ({
        questionId: item.question_id,
        questionText: item.questions?.question_text || '',
        questionType: item.questions?.question_type || '',
        totalAttempts: item.total_attempts,
        correctAttempts: item.correct_attempts,
        accuracy: item.accuracy_percentage,
        averageTimeSpent: item.average_time_spent,
        difficultyScore: item.difficulty_score,
        discriminationIndex: item.discrimination_index,
        commonErrors: item.common_errors || [],
        mostMissedOptions: item.most_missed_options || [],
        bloomLevelPerformance: item.bloom_level_performance || {}
      }));

      return { analytics };
    } catch (error) {
      console.error('Error in getQuestionLevelAnalytics:', error);
      return { analytics: [], error: 'Failed to fetch question analytics' };
    }
  }

  // Get time tracking analytics
  async getTimeTrackingAnalytics(
    assessmentId: string,
    studentId?: string
  ): Promise<{ analytics: TimeTrackingAnalytics[]; error?: string }> {
    try {
      let query = supabase
        .from('student_time_tracking')
        .select(`
          *,
          questions!student_time_tracking_question_id_fkey(
            id,
            question_text,
            question_type
          ),
          profiles!student_time_tracking_student_id_fkey(
            id,
            name
          )
        `)
        .eq('assessment_id', assessmentId);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query.order('time_spent', { ascending: false });

      if (error) {
        console.error('Error fetching time tracking analytics:', error);
        return { analytics: [], error: error.message };
      }

      const analytics: TimeTrackingAnalytics[] = (data || []).map(item => ({
        studentId: item.student_id,
        questionId: item.question_id,
        timeSpent: item.time_spent,
        keystrokes: item.keystrokes,
        mouseClicks: item.mouse_clicks,
        focusTime: item.focus_time,
        interactionPattern: this.calculateInteractionPattern(item)
      }));

      return { analytics };
    } catch (error) {
      console.error('Error in getTimeTrackingAnalytics:', error);
      return { analytics: [], error: 'Failed to fetch time tracking analytics' };
    }
  }

  // Calculate interaction pattern
  private calculateInteractionPattern(item: any): 'fast' | 'normal' | 'slow' | 'struggling' {
    const timeSpent = item.time_spent;
    const keystrokes = item.keystrokes;
    const mouseClicks = item.mouse_clicks;

    // Simple heuristic for interaction pattern
    if (timeSpent < 30 && keystrokes > 50) return 'fast';
    if (timeSpent > 300 && keystrokes < 10) return 'struggling';
    if (timeSpent > 180) return 'slow';
    return 'normal';
  }

  // Export analytics to various formats
  async exportAnalytics(
    assessmentId: string,
    format: 'csv' | 'excel' | 'pdf',
    filters: any = {}
  ): Promise<{ report: ExportReport | null; error?: string }> {
    try {
      // Get analytics data
      const { analytics, error: analyticsError } = await this.getQuestionLevelAnalytics(assessmentId);
      
      if (analyticsError) {
        return { report: null, error: analyticsError };
      }

      // Apply filters
      const filteredData = this.applyFilters(analytics, filters);

      // Generate report based on format
      const report: ExportReport = {
        format,
        data: filteredData,
        filename: `assessment_analytics_${assessmentId}_${Date.now()}.${format}`,
        generatedAt: new Date().toISOString(),
        filters
      };

      return { report };
    } catch (error) {
      console.error('Error in exportAnalytics:', error);
      return { report: null, error: 'Failed to export analytics' };
    }
  }

  // Apply filters to analytics data
  private applyFilters(data: any[], filters: any): any[] {
    let filtered = [...data];

    if (filters.questionType) {
      filtered = filtered.filter(item => item.questionType === filters.questionType);
    }

    if (filters.minAccuracy !== undefined) {
      filtered = filtered.filter(item => item.accuracy >= filters.minAccuracy);
    }

    if (filters.maxAccuracy !== undefined) {
      filtered = filtered.filter(item => item.accuracy <= filters.maxAccuracy);
    }

    if (filters.difficultyRange) {
      const [min, max] = filters.difficultyRange;
      filtered = filtered.filter(item => 
        item.difficultyScore >= min && item.difficultyScore <= max
      );
    }

    return filtered;
  }

  // Get leaderboard data
  async getLeaderboard(
    assessmentId: string,
    limit: number = 50
  ): Promise<{ leaderboard: LeaderboardEntry[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profiles!leaderboards_student_id_fkey(
            id,
            name
          )
        `)
        .eq('assessment_id', assessmentId)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return { leaderboard: [], error: error.message };
      }

      const leaderboard: LeaderboardEntry[] = (data || []).map((item, index) => ({
        studentId: item.student_id,
        studentName: item.profiles?.name || 'Unknown',
        score: item.score,
        rank: index + 1,
        percentile: item.percentile,
        badges: item.badges || [],
        points: item.points,
        streakCount: item.streak_count,
        achievements: this.getAchievements(item)
      }));

      return { leaderboard };
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return { leaderboard: [], error: 'Failed to fetch leaderboard' };
    }
  }

  // Get achievements based on performance
  private getAchievements(item: any): string[] {
    const achievements: string[] = [];

    if (item.score >= 90) achievements.push('High Achiever');
    if (item.streak_count >= 5) achievements.push('Consistent Performer');
    if (item.points >= 1000) achievements.push('Point Master');
    if (item.rank <= 3) achievements.push('Top Performer');

    return achievements;
  }

  // Get plagiarism analytics
  async getPlagiarismAnalytics(
    assessmentId: string
  ): Promise<{ analytics: PlagiarismAnalytics | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('plagiarism_reports')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (error) {
        console.error('Error fetching plagiarism analytics:', error);
        return { analytics: null, error: error.message };
      }

      const totalSubmissions = data?.length || 0;
      const flaggedSubmissions = data?.filter(item => item.similarity_score > 70).length || 0;
      const averageSimilarity = data?.reduce((sum, item) => sum + item.similarity_score, 0) / totalSubmissions || 0;

      // Get top sources
      const sourceCounts: Record<string, number> = {};
      data?.forEach(item => {
        (item.matched_sources || []).forEach((source: string) => {
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
      });

      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get confidence distribution
      const confidenceDistribution = data?.reduce((dist, item) => {
        const range = Math.floor(item.confidence_level * 10) / 10;
        dist[range.toString()] = (dist[range.toString()] || 0) + 1;
        return dist;
      }, {} as Record<string, number>) || {};

      // Get review status distribution
      const reviewStatus = data?.reduce((status, item) => {
        status[item.status] = (status[item.status] || 0) + 1;
        return status;
      }, {} as Record<string, number>) || {};

      const analytics: PlagiarismAnalytics = {
        totalSubmissions,
        flaggedSubmissions,
        averageSimilarity: Math.round(averageSimilarity * 100) / 100,
        topSources,
        confidenceDistribution,
        reviewStatus
      };

      return { analytics };
    } catch (error) {
      console.error('Error in getPlagiarismAnalytics:', error);
      return { analytics: null, error: 'Failed to fetch plagiarism analytics' };
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics(
    assessmentId: string
  ): Promise<{
    activeStudents: number;
    currentAttempts: number;
    averageProgress: number;
    timeDistribution: Record<string, number>;
    questionProgress: Record<string, number>;
    error?: string;
  }> {
    try {
      // Get active attempts
      const { data: activeAttempts, error: attemptsError } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('status', 'in_progress');

      if (attemptsError) {
        console.error('Error fetching active attempts:', attemptsError);
        return {
          activeStudents: 0,
          currentAttempts: 0,
          averageProgress: 0,
          timeDistribution: {},
          questionProgress: {}
        };
      }

      const activeStudents = new Set(activeAttempts?.map(a => a.student_id)).size;
      const currentAttempts = activeAttempts?.length || 0;
      const averageProgress = activeAttempts?.reduce((sum, a) => sum + (a.progress || 0), 0) / currentAttempts || 0;

      // Get time distribution
      const timeDistribution = this.calculateTimeDistribution(activeAttempts || []);

      // Get question progress
      const questionProgress = await this.calculateQuestionProgress(assessmentId);

      return {
        activeStudents,
        currentAttempts,
        averageProgress: Math.round(averageProgress * 100) / 100,
        timeDistribution,
        questionProgress
      };
    } catch (error) {
      console.error('Error in getRealTimeAnalytics:', error);
      return {
        activeStudents: 0,
        currentAttempts: 0,
        averageProgress: 0,
        timeDistribution: {},
        questionProgress: {}
      };
    }
  }

  // Calculate time distribution
  private calculateTimeDistribution(attempts: any[]): Record<string, number> {
    const distribution: Record<string, number> = {
      '0-15min': 0,
      '15-30min': 0,
      '30-45min': 0,
      '45-60min': 0,
      '60+min': 0
    };

    attempts.forEach(attempt => {
      const timeSpent = attempt.time_spent || 0;
      const minutes = Math.floor(timeSpent / 60);

      if (minutes < 15) distribution['0-15min']++;
      else if (minutes < 30) distribution['15-30min']++;
      else if (minutes < 45) distribution['30-45min']++;
      else if (minutes < 60) distribution['45-60min']++;
      else distribution['60+min']++;
    });

    return distribution;
  }

  // Calculate question progress
  private async calculateQuestionProgress(assessmentId: string): Promise<Record<string, number>> {
    try {
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('assessment_id', assessmentId);

      const { data: responses } = await supabase
        .from('question_responses')
        .select('question_id')
        .in('question_id', questions?.map(q => q.id) || []);

      const progress: Record<string, number> = {};
      questions?.forEach(question => {
        const questionResponses = responses?.filter(r => r.question_id === question.id) || [];
        progress[question.id] = questionResponses.length;
      });

      return progress;
    } catch (error) {
      console.error('Error calculating question progress:', error);
      return {};
    }
  }

  // Generate comprehensive report
  async generateComprehensiveReport(
    assessmentId: string,
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<{ report: any; error?: string }> {
    try {
      // Gather all analytics data
      const [
        questionAnalytics,
        timeTracking,
        plagiarismAnalytics,
        leaderboard
      ] = await Promise.all([
        this.getQuestionLevelAnalytics(assessmentId),
        this.getTimeTrackingAnalytics(assessmentId),
        this.getPlagiarismAnalytics(assessmentId),
        this.getLeaderboard(assessmentId)
      ]);

      const report = {
        assessmentId,
        generatedAt: new Date().toISOString(),
        format,
        data: {
          questionAnalytics: questionAnalytics.analytics,
          timeTracking: timeTracking.analytics,
          plagiarismAnalytics: plagiarismAnalytics.analytics,
          leaderboard: leaderboard.leaderboard
        },
        summary: this.generateReportSummary(
          questionAnalytics.analytics,
          timeTracking.analytics,
          plagiarismAnalytics.analytics,
          leaderboard.leaderboard
        )
      };

      return { report };
    } catch (error) {
      console.error('Error in generateComprehensiveReport:', error);
      return { report: null, error: 'Failed to generate comprehensive report' };
    }
  }

  // Generate report summary
  private generateReportSummary(
    questionAnalytics: any[],
    timeTracking: any[],
    plagiarismAnalytics: any,
    leaderboard: any[]
  ): any {
    return {
      totalQuestions: questionAnalytics.length,
      averageAccuracy: questionAnalytics.reduce((sum, q) => sum + q.accuracy, 0) / questionAnalytics.length,
      totalStudents: leaderboard.length,
      averageScore: leaderboard.reduce((sum, s) => sum + s.score, 0) / leaderboard.length,
      plagiarismRate: plagiarismAnalytics ? (plagiarismAnalytics.flaggedSubmissions / plagiarismAnalytics.totalSubmissions) * 100 : 0,
      averageTimeSpent: timeTracking.reduce((sum, t) => sum + t.timeSpent, 0) / timeTracking.length
    };
  }
}

export const advancedAnalyticsService = AdvancedAnalyticsService.getInstance();
