import { supabase } from '@/lib/supabase';

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: 'Quiz' | 'Test' | 'Practice' | 'Project';
  course_id: string;
  mentor_id: string;
  time_limit: number;
  max_attempts: number;
  passing_score: number;
  is_active: boolean;
  due_date?: string;
  created_at: string;
  updated_at: string;
  course_title?: string;
  mentor_name?: string;
  stats?: {
    total_students: number;
    completed_attempts: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
  };
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  question_type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  points: number;
  order_index: number;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  student_id: string;
  started_at: string;
  completed_at?: string;
  score?: number;
  total_points?: number;
  earned_points?: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  time_spent?: number;
}

export interface AssessmentResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  student_answer?: string;
  is_correct?: boolean;
  points_earned: number;
}

class AssessmentService {
  // Get all assessments for a mentor
  async getMentorAssessments(mentorId: string): Promise<{ data: Assessment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          courses(title),
          profiles!assessments_mentor_id_fkey(name)
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assessments = data?.map(assessment => ({
        ...assessment,
        course_title: assessment.courses?.title,
        mentor_name: assessment.profiles?.name
      })) || [];

      return { data: assessments, error: null };
    } catch (error) {
      console.error('Error fetching mentor assessments:', error);
      return { data: null, error };
    }
  }

  // Get assessment statistics
  async getAssessmentStats(assessmentId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .rpc('get_assessment_stats', { assessment_uuid: assessmentId });

      if (error) throw error;

      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error fetching assessment stats:', error);
      return { data: null, error };
    }
  }

  // Create new assessment
  async createAssessment(assessmentData: Partial<Assessment>): Promise<{ data: Assessment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert([assessmentData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating assessment:', error);
      return { data: null, error };
    }
  }

  // Update assessment
  async updateAssessment(assessmentId: string, updates: Partial<Assessment>): Promise<{ data: Assessment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating assessment:', error);
      return { data: null, error };
    }
  }

  // Delete assessment
  async deleteAssessment(assessmentId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting assessment:', error);
      return { error };
    }
  }

  // Get assessment questions
  async getAssessmentQuestions(assessmentId: string): Promise<{ data: AssessmentQuestion[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('order_index');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      return { data: null, error };
    }
  }

  // Add question to assessment
  async addQuestion(questionData: Partial<AssessmentQuestion>): Promise<{ data: AssessmentQuestion | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .insert([questionData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error adding question:', error);
      return { data: null, error };
    }
  }

  // Update question
  async updateQuestion(questionId: string, updates: Partial<AssessmentQuestion>): Promise<{ data: AssessmentQuestion | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating question:', error);
      return { data: null, error };
    }
  }

  // Delete question
  async deleteQuestion(questionId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('assessment_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting question:', error);
      return { data: null, error };
    }
  }

  // Get student assessments
  async getStudentAssessments(studentId: string): Promise<{ data: Assessment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          courses(title),
          profiles!assessments_mentor_id_fkey(name),
          assessment_attempts!inner(student_id, status, score)
        `)
        .eq('assessment_attempts.student_id', studentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assessments = data?.map(assessment => ({
        ...assessment,
        course_title: assessment.courses?.title,
        mentor_name: assessment.profiles?.name
      })) || [];

      return { data: assessments, error: null };
    } catch (error) {
      console.error('Error fetching student assessments:', error);
      return { data: null, error };
    }
  }

  // Start assessment attempt
  async startAttempt(assessmentId: string, studentId: string): Promise<{ data: AssessmentAttempt | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .insert([{
          assessment_id: assessmentId,
          student_id: studentId,
          status: 'in-progress'
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error starting assessment attempt:', error);
      return { data: null, error };
    }
  }

  // Submit assessment response
  async submitResponse(responseData: Partial<AssessmentResponse>): Promise<{ data: AssessmentResponse | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_responses')
        .insert([responseData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error submitting response:', error);
      return { data: null, error };
    }
  }

  // Complete assessment attempt
  async completeAttempt(attemptId: string, score: number): Promise<{ data: AssessmentAttempt | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .update({
          status: 'completed',
          score: score,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error completing assessment attempt:', error);
      return { data: null, error };
    }
  }

  // Get assessment attempts for a mentor
  async getAssessmentAttempts(assessmentId: string): Promise<{ data: AssessmentAttempt[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select(`
          *,
          profiles!assessment_attempts_student_id_fkey(name, email)
        `)
        .eq('assessment_id', assessmentId)
        .order('started_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching assessment attempts:', error);
      return { data: null, error };
    }
  }
}

export default new AssessmentService();
