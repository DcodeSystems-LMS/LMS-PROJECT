// Enhanced Assessment Service with Lifecycle Management
import { supabase } from '@/lib/supabase';
import { roleBasedAccess } from '@/lib/roleBasedAccess';
import { notificationService } from '@/lib/notificationService';

export type AssessmentStatus = 'draft' | 'published' | 'closed' | 'archived';
export type AssessmentType = 'quiz' | 'test' | 'assignment' | 'project' | 'coding_challenge';

export interface EnhancedAssessment {
  id: string;
  title: string;
  description?: string;
  type: AssessmentType;
  status: AssessmentStatus;
  course_id: string;
  mentor_id: string;
  
  // Timing and Attempts
  time_limit: number;
  max_attempts: number;
  passing_score: number;
  
  // Availability
  available_from?: string;
  available_until?: string;
  
  // Settings
  settings: {
    shuffle_questions: boolean;
    shuffle_options: boolean;
    show_correct_answers: boolean;
    show_explanations: boolean;
    allow_review: boolean;
    auto_submit: boolean;
    prevent_copy_paste: boolean;
    require_fullscreen: boolean;
    webcam_monitoring: boolean;
    late_submission_penalty: number;
  };
  
  // Security
  security_settings: {
    ip_restrictions?: string[];
    browser_restrictions?: string[];
    proctoring_enabled: boolean;
    plagiarism_detection: boolean;
  };
  
  // Metadata
  created_at: string;
  updated_at: string;
  published_at?: string;
  closed_at?: string;
  
  // Related data
  course_title?: string;
  mentor_name?: string;
  question_count?: number;
  assigned_students?: number;
  total_attempts?: number;
  average_score?: number;
}

export interface AssessmentFilters {
  status?: AssessmentStatus[];
  type?: AssessmentType[];
  course_id?: string;
  mentor_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export class EnhancedAssessmentService {
  private static instance: EnhancedAssessmentService;

  static getInstance(): EnhancedAssessmentService {
    if (!EnhancedAssessmentService.instance) {
      EnhancedAssessmentService.instance = new EnhancedAssessmentService();
    }
    return EnhancedAssessmentService.instance;
  }

  // Create new assessment
  async createAssessment(
    assessmentData: Partial<EnhancedAssessment>,
    userId: string
  ): Promise<{ success: boolean; assessment?: EnhancedAssessment; error?: string }> {
    try {
      // Check permissions
      const canCreate = await roleBasedAccess.canPerformAction(
        userId,
        'create',
        'assessments'
      );

      if (!canCreate) {
        return { success: false, error: 'Insufficient permissions to create assessments' };
      }

      const { data, error } = await supabase
        .from('assessments')
        .insert({
          ...assessmentData,
          mentor_id: userId,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          courses(title),
          profiles!assessments_mentor_id_fkey(name)
        `)
        .single();

      if (error) {
        console.error('Error creating assessment:', error);
        return { success: false, error: error.message };
      }

      // Log audit trail
      await this.logAuditAction(userId, 'create', 'assessments', data.id, null, assessmentData);

      return { success: true, assessment: this.mapAssessmentData(data) };
    } catch (error) {
      console.error('Error in createAssessment:', error);
      return { success: false, error: 'Failed to create assessment' };
    }
  }

  // Update assessment
  async updateAssessment(
    assessmentId: string,
    updates: Partial<EnhancedAssessment>,
    userId: string
  ): Promise<{ success: boolean; assessment?: EnhancedAssessment; error?: string }> {
    try {
      // Check permissions
      const canUpdate = await roleBasedAccess.canPerformAction(
        userId,
        'update',
        'assessments',
        assessmentId
      );

      if (!canUpdate) {
        return { success: false, error: 'Insufficient permissions to update this assessment' };
      }

      // Get current assessment for audit
      const { data: currentAssessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      const { data, error } = await supabase
        .from('assessments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select(`
          *,
          courses(title),
          profiles!assessments_mentor_id_fkey(name)
        `)
        .single();

      if (error) {
        console.error('Error updating assessment:', error);
        return { success: false, error: error.message };
      }

      // Log audit trail
      await this.logAuditAction(userId, 'update', 'assessments', assessmentId, currentAssessment, updates);

      return { success: true, assessment: this.mapAssessmentData(data) };
    } catch (error) {
      console.error('Error in updateAssessment:', error);
      return { success: false, error: 'Failed to update assessment' };
    }
  }

  // Publish assessment
  async publishAssessment(
    assessmentId: string,
    userId: string,
    studentIds?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check permissions
      const canUpdate = await roleBasedAccess.canPerformAction(
        userId,
        'update',
        'assessments',
        assessmentId
      );

      if (!canUpdate) {
        return { success: false, error: 'Insufficient permissions to publish this assessment' };
      }

      // Update assessment status
      const { data: assessment, error: updateError } = await supabase
        .from('assessments')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select('*')
        .single();

      if (updateError) {
        console.error('Error publishing assessment:', updateError);
        return { success: false, error: updateError.message };
      }

      // Assign to students if provided
      if (studentIds && studentIds.length > 0) {
        await this.assignAssessmentToStudents(assessmentId, studentIds, userId);
      }

      // Send notifications
      if (studentIds && studentIds.length > 0) {
        await notificationService.notifyAssessmentPublished(
          assessmentId,
          assessment.title,
          userId,
          studentIds
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in publishAssessment:', error);
      return { success: false, error: 'Failed to publish assessment' };
    }
  }

  // Close assessment
  async closeAssessment(
    assessmentId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check permissions
      const canUpdate = await roleBasedAccess.canPerformAction(
        userId,
        'update',
        'assessments',
        assessmentId
      );

      if (!canUpdate) {
        return { success: false, error: 'Insufficient permissions to close this assessment' };
      }

      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) {
        console.error('Error closing assessment:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in closeAssessment:', error);
      return { success: false, error: 'Failed to close assessment' };
    }
  }

  // Archive assessment
  async archiveAssessment(
    assessmentId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check permissions
      const canUpdate = await roleBasedAccess.canPerformAction(
        userId,
        'update',
        'assessments',
        assessmentId
      );

      if (!canUpdate) {
        return { success: false, error: 'Insufficient permissions to archive this assessment' };
      }

      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      if (error) {
        console.error('Error archiving assessment:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in archiveAssessment:', error);
      return { success: false, error: 'Failed to archive assessment' };
    }
  }

  // Get assessments with filters
  async getAssessments(
    filters: AssessmentFilters = {},
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ assessments: EnhancedAssessment[]; total: number; error?: string }> {
    try {
      // Check permissions
      const userPermissions = await roleBasedAccess.getUserPermissions(userId);
      
      let query = supabase
        .from('assessments')
        .select(`
          *,
          courses(title),
          profiles!assessments_mentor_id_fkey(name)
        `, { count: 'exact' });

      // Apply role-based filtering
      if (userPermissions.role === 'mentor') {
        query = query.eq('mentor_id', userId);
      } else if (userPermissions.role === 'student') {
        query = query.in('id', 
          supabase
            .from('assessment_assignments')
            .select('assessment_id')
            .eq('student_id', userId)
        );
      }

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      if (filters.course_id) {
        query = query.eq('course_id', filters.course_id);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching assessments:', error);
        return { assessments: [], total: 0, error: error.message };
      }

      const assessments = (data || []).map(this.mapAssessmentData);
      return { assessments, total: count || 0 };
    } catch (error) {
      console.error('Error in getAssessments:', error);
      return { assessments: [], total: 0, error: 'Failed to fetch assessments' };
    }
  }

  // Assign assessment to students
  async assignAssessmentToStudents(
    assessmentId: string,
    studentIds: string[],
    assignedBy: string,
    dueDate?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const assignments = studentIds.map(studentId => ({
        assessment_id: assessmentId,
        student_id: studentId,
        assigned_by: assignedBy,
        due_date: dueDate,
        assigned_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('assessment_assignments')
        .insert(assignments);

      if (error) {
        console.error('Error assigning assessment:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in assignAssessmentToStudents:', error);
      return { success: false, error: 'Failed to assign assessment' };
    }
  }

  // Get assessment analytics
  async getAssessmentAnalytics(
    assessmentId: string,
    userId: string
  ): Promise<{ analytics: any; error?: string }> {
    try {
      // Check permissions
      const canView = await roleBasedAccess.canPerformAction(
        userId,
        'read',
        'assessments',
        assessmentId
      );

      if (!canView) {
        return { analytics: null, error: 'Insufficient permissions to view analytics' };
      }

      // Get basic analytics
      const { data: attempts, error: attemptsError } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('assessment_id', assessmentId);

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        return { analytics: null, error: attemptsError.message };
      }

      // Calculate analytics
      const totalAttempts = attempts?.length || 0;
      const completedAttempts = attempts?.filter(a => a.status === 'submitted').length || 0;
      const averageScore = attempts?.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts || 0;
      const passRate = attempts?.filter(a => a.passed).length / totalAttempts * 100 || 0;

      const analytics = {
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        attempts: attempts || []
      };

      return { analytics };
    } catch (error) {
      console.error('Error in getAssessmentAnalytics:', error);
      return { analytics: null, error: 'Failed to fetch analytics' };
    }
  }

  // Map database data to EnhancedAssessment interface
  private mapAssessmentData(data: any): EnhancedAssessment {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      course_id: data.course_id,
      mentor_id: data.mentor_id,
      time_limit: data.time_limit,
      max_attempts: data.max_attempts,
      passing_score: data.passing_score,
      available_from: data.available_from,
      available_until: data.available_until,
      settings: data.settings || {},
      security_settings: data.security_settings || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
      published_at: data.published_at,
      closed_at: data.closed_at,
      course_title: data.courses?.title,
      mentor_name: data.profiles?.name
    };
  }

  // Log audit action
  private async logAuditAction(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues: any,
    newValues: any
  ): Promise<void> {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }
}

export const enhancedAssessmentService = EnhancedAssessmentService.getInstance();
