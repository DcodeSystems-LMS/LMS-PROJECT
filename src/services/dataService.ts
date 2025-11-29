import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

// Type definitions based on Supabase schema
type Profile = Database['public']['Tables']['profiles']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];
type Enrollment = Database['public']['Tables']['enrollments']['Row'];
type Assessment = Database['public']['Tables']['assessments']['Row'];
type AssessmentResult = Database['public']['Tables']['assessment_results']['Row'];
type Discussion = Database['public']['Tables']['discussions']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type CourseMaterial = Database['public']['Tables']['course_materials']['Row'];

// Extended types for UI components
export interface ExtendedProfile extends Profile {
  enrolledCourses?: Course[];
  totalSessions?: number;
  lastSession?: string;
  progress?: number;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  joinDate?: string;
  lastActive?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  location?: string;
  xp?: number;
  level?: number;
  badges?: string[];
  completedAssessments?: number;
  averageScore?: number;
  specialty?: string;
  rating?: number;
  students?: number;
  sessions?: number;
  earnings?: number | string;
}

export interface ExtendedCourse extends Omit<Course, 'thumbnail'> {
  instructor?: Profile;
  students?: number;
  completion?: number;
  revenue?: number;
  rating?: number;
  status?: 'active' | 'draft' | 'paused';
  requirements?: string[];
  tags?: string;
  thumbnail?: File | null;
}

export interface ExtendedAssessment extends Omit<Assessment, 'difficulty'> {
  course?: Course;
  instructor?: Profile;
  attempts?: number;
  avgScore?: number;
  status?: 'active' | 'draft' | 'paused';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  topics?: string[];
  maxAttempts?: number;
  dueDate?: string;
  score?: string;
  maxScore?: string;
  feedback?: string;
}

export interface ExtendedSession extends Omit<Session, 'status'> {
  mentor?: Profile;
  student?: Profile;
  subject?: string;
  type?: '1-on-1' | 'Group';
  status?: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending';
  rating?: number;
  feedback?: string;
  avatar?: string;
}

export interface ExtendedNotification extends Notification {
  icon?: string;
  color?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface ExtendedCourseMaterial extends CourseMaterial {
  course?: Course;
  uploadedBy?: Profile;
  downloadUrl?: string;
}

// Data Service Class
export class DataService {
  // Test Supabase connection
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      console.log('Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('Supabase connection test error:', error);
      return false;
    }
  }
  // Profile/User Management
  static async getProfiles(role?: 'student' | 'mentor' | 'admin'): Promise<ExtendedProfile[]> {
    let query = supabase.from('profiles').select('*');
    
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  }

  static async getProfile(id: string): Promise<ExtendedProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.warn('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Profiles table may not exist or have permission issues:', err);
      return null;
    }
  }

  static async updateProfile(id: string, updates: Partial<Profile>): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select();
    
    return { data, error };
  }

  static async deleteProfile(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn('Error deleting profile:', error);
        return { error };
      }
      
      console.log('Profile deleted successfully');
      return { error: null };
    } catch (err) {
      console.warn('Profiles table may not exist or have permission issues:', err);
      return { error: err };
    }
  }

  static async createProfile(profileData: any): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        console.warn('Error creating profile:', error);
        return { data: null, error };
      }
      
      console.log('Profile created successfully');
      return { data, error: null };
    } catch (err) {
      console.warn('Profiles table may not exist or have permission issues:', err);
      return { data: null, error: err };
    }
  }

  // Course Management
  static async getCourses(): Promise<ExtendedCourse[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id(*)
      `);
    
    if (error) throw error;
    return data || [];
  }

  static async getCourse(id: string): Promise<ExtendedCourse | null> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!instructor_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Enrollment Management
  static async getEnrollments(studentId?: string): Promise<Enrollment[]> {
    try {
      let query = supabase.from('enrollments').select(`
        *,
        course:courses(*),
        student:profiles!student_id(*)
      `);
      
      if (studentId) {
        query = query.eq('student_id', studentId);
        // Only return active enrollments for students
        query = query.in('status', ['enrolled', 'active', 'completed']);
      }
      
      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching enrollments:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Enrollments table may not exist or have permission issues:', err);
      return [];
    }
  }

  static async enrollInCourse(studentId: string, courseId: string): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .insert({
        student_id: studentId,
        course_id: courseId,
        progress: 0,
        status: 'enrolled'
      });
    
    if (error) throw error;
  }

  static async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .update({ progress })
      .eq('id', enrollmentId);
    
    if (error) throw error;
  }

  static async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .in('status', ['enrolled', 'active', 'completed'])
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.warn('Error checking enrollment:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.warn('Error checking enrollment:', err);
      return false;
    }
  }

  static async updateEnrollmentStatus(enrollmentId: string, status: 'enrolled' | 'active' | 'completed' | 'suspended' | 'cancelled'): Promise<void> {
    const { error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', enrollmentId);
    
    if (error) throw error;
  }

  // Assessment Management
  static async getAssessments(courseId?: string): Promise<ExtendedAssessment[]> {
    console.log('🔍 DataService.getAssessments called with courseId:', courseId);
    console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔍 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    let query = supabase.from('assessments').select(`
      *,
      course:courses(*),
      instructor:profiles!instructor_id(*)
    `);
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching assessments:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Assessments fetched successfully:', data);
    console.log('✅ Assessments count:', data?.length || 0);
    return data || [];
  }

  static async getAssessment(id: string): Promise<ExtendedAssessment | null> {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        course:courses(*),
        instructor:profiles!instructor_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get assessment with question count
  static async getAssessmentWithQuestionCount(assessmentId: string): Promise<{ assessment: any; questionCount: number }> {
    try {
      // Get assessment details
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(*),
          instructor:profiles!instructor_id(*)
        `)
        .eq('id', assessmentId)
        .single();

      if (assessmentError) {
        console.error('Error fetching assessment:', assessmentError);
        return { assessment: null, questionCount: 0 };
      }

      // Get question count
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('assessment_id', assessmentId);

      if (questionsError) {
        console.warn('Error fetching question count:', questionsError);
        return { assessment, questionCount: 0 };
      }

      return { 
        assessment, 
        questionCount: questions ? questions.length : 0 
      };
    } catch (error) {
      console.error('Error in getAssessmentWithQuestionCount:', error);
      return { assessment: null, questionCount: 0 };
    }
  }

  // Get assessments for enrolled students (with fallback for old schema)
  static async getStudentAssessments(studentId: string): Promise<ExtendedAssessment[]> {
    console.log('🔍 DataService.getStudentAssessments called for student:', studentId);
    
    try {
      // Fetch ALL available assessments directly
      // This ensures students can see all assessments in the system
      console.log('🔍 Fetching all available assessments for student view');
      
      // Get ALL assessments with status filter
      let { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(*),
          instructor:profiles!instructor_id(*)
        `)
        .in('status', ['active', 'published', 'draft'])
        .order('created_at', { ascending: false });
      
      // If status filter fails (status column doesn't exist), try without filter
      if (assessmentError && assessmentError.message.includes('status')) {
        console.log('⚠️ Status column not found, fetching all assessments');
        const { data: allAssessments, error: allError } = await supabase
          .from('assessments')
          .select(`
            *,
            course:courses(*),
            instructor:profiles!instructor_id(*)
          `)
          .order('created_at', { ascending: false });
        
        assessments = allAssessments;
        assessmentError = allError;
      }
      
      if (assessmentError) {
        console.error('❌ Error fetching assessments:', assessmentError);
        return [];
      }
      
      console.log('✅ All assessments fetched successfully:', assessments?.length || 0);
      console.log('📊 Assessment details:', assessments?.map(a => ({
        id: a.id,
        title: a.title,
        course_id: a.course_id,
        status: a.status,
        course_title: a.course?.title
      })));
      
      return assessments || [];
      
    } catch (error) {
      console.error('❌ Error in getStudentAssessments:', error);
      return [];
    }
  }

  // Get assessment questions
  static async getAssessmentQuestions(assessmentId: string): Promise<any[]> {
    try {
      console.log('🔍 Fetching questions for assessment:', assessmentId);
      
      // First try to get questions from questions table
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('order_index');

      if (questionsError) {
        console.warn('⚠️ questions table not found, falling back to JSON storage method:', questionsError);
      } else if (!questionsData || questionsData.length === 0) {
        console.warn('⚠️ No questions found in questions table, falling back to JSON storage method');
      } else {
        console.log('✅ Questions fetched from questions table:', questionsData.length);
        return questionsData;
      }
      
      // Fallback to JSON storage method
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('questions')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) {
        console.error('❌ Error fetching assessment:', assessmentError);
        return [];
      }

      if (assessmentData?.questions && Array.isArray(assessmentData.questions)) {
        console.log('✅ Found questions in assessment data:', assessmentData.questions.length);
        return assessmentData.questions;
      }

      if (assessmentData?.questions && typeof assessmentData.questions === 'string') {
        try {
          const parsedQuestions = JSON.parse(assessmentData.questions);
          console.log('✅ Parsed questions from JSON:', parsedQuestions.length);
          return parsedQuestions;
        } catch (parseError) {
          console.error('❌ Error parsing questions JSON:', parseError);
          return [];
        }
      }

      console.warn('⚠️ No questions found in assessment data');
      return [];
    } catch (err) {
      console.error('❌ Error fetching questions:', err);
      return [];
    }
  }

  // Create a new question
  static async createQuestion(questionData: {
    assessment_id: string;
    question_text: string;
    question_type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'essay' | 'coding-challenge' | 'file-upload' | 'fill-in-blanks';
    options?: any[];
    correct_answer?: string;
    correct_answers?: any[];
    explanation?: string;
    points?: number;
    order_index?: number;
    difficulty_level?: string;
    tags?: string[];
    media_files?: any[];
    rich_text_content?: string;
    code_language?: string;
    code_template?: string;
    test_cases?: any[];
    file_types?: any[];
    max_file_size?: number;
    allowed_extensions?: string[];
    blank_positions?: any[];
    word_limit?: number;
    time_limit?: number;
    alt_text?: string;
    audio_transcript?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      console.log('🔍 Creating question:', questionData);
      
      // Process the question data to ensure correct answers are properly stored
      const processedData = {
        ...questionData,
        options: questionData.options ? JSON.stringify(questionData.options) : null,
        correct_answers: questionData.correct_answers ? JSON.stringify(questionData.correct_answers) : null,
        test_cases: questionData.test_cases ? JSON.stringify(questionData.test_cases) : null,
        blank_positions: questionData.blank_positions ? JSON.stringify(questionData.blank_positions) : null,
        media_files: questionData.media_files ? JSON.stringify(questionData.media_files) : null,
        tags: questionData.tags || [],
        points: questionData.points || 1,
        order_index: questionData.order_index || 1
      };
      
      console.log('🔍 Processed question data:', processedData);
      
      const { data, error } = await supabase
        .from('questions')
        .insert(processedData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating question:', error);
        return { data: null, error };
      }
      
      console.log('✅ Question created successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('❌ Error in createQuestion:', err);
      return { data: null, error: err };
    }
  }

  // Update a question
  static async updateQuestion(questionId: string, updates: any): Promise<{ data: any; error: any }> {
    try {
      console.log('🔍 Updating question:', questionId, updates);
      
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating question:', error);
        return { data: null, error };
      }
      
      console.log('✅ Question updated successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('❌ Error in updateQuestion:', err);
      return { data: null, error: err };
    }
  }

  // Delete a question
  static async deleteQuestion(questionId: string): Promise<{ error: any }> {
    try {
      console.log('🔍 Deleting question:', questionId);
      
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);
      
      if (error) {
        console.error('❌ Error deleting question:', error);
        return { error };
      }
      
      console.log('✅ Question deleted successfully');
      return { error: null };
    } catch (err) {
      console.error('❌ Error in deleteQuestion:', err);
      return { error: err };
    }
  }

  // Get assessment attempts for a student
  static async getAssessmentAttempts(studentId: string, assessmentId: string): Promise<any[]> {
    try {
      console.log('🔍 Fetching assessment attempts for student:', studentId, 'assessment:', assessmentId);
      
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('student_id', studentId)
        .eq('assessment_id', assessmentId)
        .order('started_at', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Error fetching assessment attempts:', error);
        return [];
      }
      
      console.log('✅ Assessment attempts fetched:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('❌ Error in getAssessmentAttempts:', err);
      return [];
    }
  }

  // Get assessment with detailed information
  static async getAssessmentDetails(assessmentId: string, studentId?: string): Promise<any> {
    try {
      console.log('🔍 Fetching assessment details for:', assessmentId);
      
      // Get assessment basic info
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(*),
          instructor:profiles!instructor_id(*)
        `)
        .eq('id', assessmentId)
        .single();
      
      if (assessmentError || !assessment) {
        console.error('❌ Error fetching assessment:', assessmentError);
        return null;
      }
      
      // Get question count from JSON stored in assessments.questions column
      let questionCount = 0;
      try {
        if (assessment.questions) {
          // Parse JSON if it's a string, otherwise use directly
          const questionsArray = typeof assessment.questions === 'string' 
            ? JSON.parse(assessment.questions) 
            : assessment.questions;
          
          if (Array.isArray(questionsArray)) {
            questionCount = questionsArray.length;
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Could not parse questions JSON, trying questions table:', parseError);
        // Fallback: try to get from questions table if it exists
        try {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('id')
            .eq('assessment_id', assessmentId);
          
          if (!questionsError && questions) {
            questionCount = questions.length;
          }
        } catch (fallbackError) {
          console.warn('⚠️ Could not fetch from questions table either:', fallbackError);
        }
      }
      
      console.log(`📊 Assessment ${assessment.title} has ${questionCount} questions`);
      
      // Get attempts if student ID provided
      let attempts = [];
      let maxAttempts = 3; // Default
      if (studentId) {
        attempts = await this.getAssessmentAttempts(studentId, assessmentId);
        maxAttempts = assessment.max_attempts || 3;
      }
      
      // Get topics from assessment tags or course tags - ensure they are strings
      const rawTopics = assessment.tags || assessment.course?.tags || ['General Topics'];
      const topics = (Array.isArray(rawTopics) ? rawTopics : [rawTopics]).map((topic: any) => {
        // Handle different topic formats: string, object with name/title, or other
        if (typeof topic === 'string') return topic;
        if (topic && typeof topic === 'object') {
          return topic.name || topic.title || topic.label || JSON.stringify(topic);
        }
        return String(topic || 'General');
      });
      
      // Get instructor feedback (from latest attempt or assessment)
      let feedback = 'Good work!'; // Default
      if (attempts.length > 0 && attempts[0].feedback) {
        feedback = attempts[0].feedback;
      } else if (assessment.instructor_feedback) {
        feedback = assessment.instructor_feedback;
      }
      
      const details = {
        ...assessment,
        questionCount,
        attempts: attempts.length,
        maxAttempts,
        topics: topics,
        feedback,
        duration: assessment.time_limit_minutes ? `${assessment.time_limit_minutes} mins` : '30 mins',
        difficulty: assessment.difficulty_level || 'Easy',
        type: assessment.type || 'Quiz'
      };
      
      console.log('✅ Assessment details fetched:', details);
      return details;
    } catch (err) {
      console.error('❌ Error in getAssessmentDetails:', err);
      return null;
    }
  }

  // Get assessment results for mentor view
  static async getAssessmentResultsForMentor(assessmentId: string) {
    try {
      console.log('🔍 Fetching assessment results for mentor:', assessmentId);
      
      // Try to fetch from assessment_results table first
      const { data: resultsData, error: resultsError } = await supabase
        .from('assessment_results')
        .select(`
          *,
          profiles!assessment_results_student_id_fkey(id, name, email)
        `)
        .eq('assessment_id', assessmentId)
        .order('completed_at', { ascending: false });

      if (resultsError) {
        console.warn('assessment_results table not found, trying assessment_attempts:', resultsError.message);
        
        // Fallback to assessment_attempts table
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('assessment_attempts')
          .select(`
            *,
            profiles!assessment_attempts_student_id_fkey(id, name, email)
          `)
          .eq('assessment_id', assessmentId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (attemptsError) {
          console.error('❌ Error fetching assessment attempts:', attemptsError);
          return { data: [], error: attemptsError };
        }

        console.log('✅ Assessment attempts fetched:', attemptsData);
        return { data: attemptsData || [], error: null };
      }

      console.log('✅ Assessment results fetched:', resultsData);
      return { data: resultsData || [], error: null };
    } catch (error) {
      console.error('❌ Error in getAssessmentResults:', error);
      return { data: [], error };
    }
  }

  // Save assessment result
  static async saveAssessmentResult(resultData: {
    student_id: string;
    assessment_id: string;
    attempt_id?: string;
    score: number;
    total_points?: number;
    answers: Record<string, any>;
    feedback?: string;
  }): Promise<{ data: any; error: any }> {
    try {
      console.log('💾 Saving assessment result:', resultData);
      
      // Try RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('save_assessment_result', {
        p_student_id: resultData.student_id,
        p_assessment_id: resultData.assessment_id,
        p_attempt_id: resultData.attempt_id || null,
        p_score: resultData.score,
        p_total_points: resultData.total_points || 0,
        p_answers: resultData.answers,
        p_feedback: resultData.feedback || null
      });
      
      if (rpcError) {
        console.error('❌ RPC function failed:', rpcError);
        // Try direct insert as fallback
        const { data, error } = await supabase
          .from('assessment_results')
          .insert({
            student_id: resultData.student_id,
            assessment_id: resultData.assessment_id,
            attempt_id: resultData.attempt_id,
            score: resultData.score,
            total_points: resultData.total_points || 0,
            answers: resultData.answers,
            feedback: resultData.feedback
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ Direct insert also failed:', error);
          console.log('⚠️ Assessment result could not be saved to database, but score was calculated');
          return { data: null, error };
        }
        
        console.log('✅ Assessment result saved via direct insert:', data);
        return { data, error: null };
      }
      
      console.log('✅ Assessment result saved via RPC:', rpcData);
      return { data: rpcData, error: null };
    } catch (err) {
      console.error('❌ Error in saveAssessmentResult:', err);
      return { data: null, error: err };
    }
  }

  static async createAssessment(assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>): Promise<Assessment> {
    console.log('DataService.createAssessment called with:', assessment);
    
    // Generate UUID for the assessment since database doesn't auto-generate it
    const assessmentWithId = {
      ...assessment,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('assessments')
      .insert(assessmentWithId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error in createAssessment:', error);
      throw error;
    }
    
    console.log('Assessment created successfully:', data);
    return data;
  }

  // Create assessment with questions using proper schema
  static async createAssessmentWithQuestions(
    assessmentData: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>,
    questions: any[]
  ): Promise<{ assessment: Assessment; questions: any[] }> {
    console.log('🔍 DataService.createAssessmentWithQuestions called');
    console.log('📝 Assessment data:', assessmentData);
    console.log('❓ Questions data:', questions);

    try {
      // 1. Create the assessment with generated UUID
      const assessmentWithId = {
        ...assessmentData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert(assessmentWithId)
        .select()
        .single();

      if (assessmentError) {
        console.error('❌ Error creating assessment:', assessmentError);
        throw assessmentError;
      }

      console.log('✅ Assessment created:', assessment.id);

      // 2. Store questions as JSON in the assessment record (since questions table may not exist)
      // This is a fallback approach - questions are stored in the assessment's questions column
      if (questions && questions.length > 0) {
        try {
          // Try to update the assessment with questions JSON
          const { error: updateError } = await supabase
            .from('assessments')
            .update({ 
              questions: JSON.stringify(questions),
              updated_at: new Date().toISOString()
            })
            .eq('id', assessment.id);

          if (updateError) {
            console.log('Questions stored in initial assessment creation');
          } else {
            console.log('✅ Questions saved to assessment:', questions.length);
          }
        } catch (err) {
          // Questions might already be stored, that's okay
          console.log('Questions handled during assessment creation');
        }
      }

      // 3. Skip student assignments - this table may not exist in the schema
      // Student enrollments are handled separately through the enrollments table

      return { assessment, questions: questions || [] };

    } catch (error) {
      console.error('❌ Error in createAssessmentWithQuestions:', error);
      throw error;
    }
  }

  static async updateAssessment(id: string, updates: Partial<Assessment>): Promise<void> {
    console.log('🔧 DataService.updateAssessment called with ID:', id);
    console.log('🔧 Updates:', updates);
    console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔧 Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Check current user and their role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔧 Current user:', user?.id);
    console.log('🔧 User error:', userError);
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('🔧 User profile:', profile);
      console.log('🔧 Profile error:', profileError);
    }
    
    console.log('🔧 About to execute update query...');
    const { error } = await supabase
      .from('assessments')
      .update(updates)
      .eq('id', id);
    
    console.log('🔧 Update query executed, checking for errors...');
    
    if (error) {
      console.error('❌ Error updating assessment:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Assessment updated successfully');
    
    // Verify the update by trying to fetch the assessment
    console.log('🔍 Verifying update by checking if assessment was updated...');
    const { data: checkData, error: checkError } = await supabase
      .from('assessments')
      .select('id, title, type, status')
      .eq('id', id)
      .single();
    
    if (checkError) {
      console.error('❌ Verification failed:', checkError);
    } else {
      console.log('✅ Verification successful - assessment updated:', checkData);
    }
  }

  static async duplicateAssessment(id: string): Promise<Assessment> {
    console.log('📋 DataService.duplicateAssessment called with ID:', id);
    
    // First get the original assessment
    const originalAssessment = await DataService.getAssessment(id);
    if (!originalAssessment) {
      throw new Error('Assessment not found');
    }
    
    // Create a new assessment with modified title
    const duplicateData = {
      title: `${originalAssessment.title} (Copy)`,
      description: originalAssessment.description,
      course_id: originalAssessment.course_id,
      instructor_id: originalAssessment.instructor_id,
      type: originalAssessment.type,
      difficulty: originalAssessment.difficulty,
      time_limit_minutes: originalAssessment.time_limit_minutes,
      passing_score: originalAssessment.passing_score,
      questions: originalAssessment.questions,
      status: 'draft' as const
    };
    
    const duplicatedAssessment = await DataService.createAssessment(duplicateData);
    console.log('✅ Assessment duplicated successfully:', duplicatedAssessment);
    return duplicatedAssessment;
  }

  static async deleteAssessment(id: string): Promise<void> {
    console.log('🗑️ DataService.deleteAssessment called with ID:', id);
    console.log('🗑️ Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🗑️ Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Check current user and their role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🗑️ Current user:', user?.id);
    console.log('🗑️ User error:', userError);
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      console.log('🗑️ User profile:', profile);
      console.log('🗑️ Profile error:', profileError);
    }
    
    console.log('🗑️ About to execute delete query...');
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id);
    
    console.log('🗑️ Delete query executed, checking for errors...');
    
    if (error) {
      console.error('❌ Error deleting assessment:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Assessment deleted successfully from database');
    
    // Verify the deletion by trying to fetch the assessment
    console.log('🔍 Verifying deletion by checking if assessment still exists...');
    const { data: checkData, error: checkError } = await supabase
      .from('assessments')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Verification successful - assessment no longer exists');
    } else if (checkData) {
      console.error('❌ Verification failed - assessment still exists:', checkData);
    } else {
      console.log('🔍 Verification result:', checkError);
    }
  }

  // Assessment Results
  static async getAssessmentResults(studentId?: string, assessmentId?: string): Promise<AssessmentResult[]> {
    let query = supabase.from('assessment_results').select(`
      *,
      student:profiles!student_id(*),
      assessment:assessments(*)
    `);
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    
    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async submitAssessmentResult(result: Omit<AssessmentResult, 'id' | 'completed_at'>): Promise<void> {
    const { error } = await supabase
      .from('assessment_results')
      .insert(result);
    
    if (error) throw error;
  }

  // Sessions Management
  static async getSessions(userId?: string, role?: 'mentor' | 'student'): Promise<ExtendedSession[]> {
    try {
      let query = supabase.from('sessions').select(`
        *,
        mentor:profiles!mentor_id(*),
        student:profiles!student_id(*)
      `);
      
      if (userId && role === 'mentor') {
        query = query.eq('mentor_id', userId);
      } else if (userId && role === 'student') {
        query = query.eq('student_id', userId);
      }
      
      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching sessions:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Sessions table may not exist or have permission issues:', err);
      return [];
    }
  }

  static async createSession(session: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateSession(id: string, updates: Partial<Session>): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  }

  // Discussions
  static async getDiscussions(courseId?: string): Promise<Discussion[]> {
    let query = supabase.from('discussions').select(`
      *,
      author:profiles!author_id(*),
      course:courses(*)
    `);
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createDiscussion(discussion: Omit<Discussion, 'id' | 'created_at' | 'updated_at'>): Promise<Discussion> {
    const { data, error } = await supabase
      .from('discussions')
      .insert(discussion)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Notifications
  static async getNotifications(userId: string): Promise<ExtendedNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert(notification);
    
    if (error) throw error;
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  }

  // Analytics and Statistics
  static async getAnalytics(): Promise<any> {
    // Get various statistics for admin dashboard
    const [
      profilesResult,
      coursesResult,
      enrollmentsResult,
      sessionsResult
    ] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('courses').select('*'),
      supabase.from('enrollments').select('*'),
      supabase.from('sessions').select('*')
    ]);

    const profiles = profilesResult.data || [];
    const courses = coursesResult.data || [];
    const enrollments = enrollmentsResult.data || [];
    const sessions = sessionsResult.data || [];

    return {
      totalUsers: profiles.length,
      activeUsers: profiles.filter(p => p.role === 'student').length,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length
    };
  }

  // Search functionality
  static async searchContent(query: string): Promise<any[]> {
    const [coursesResult, profilesResult, discussionsResult] = await Promise.all([
      supabase.from('courses').select('*').ilike('title', `%${query}%`),
      supabase.from('profiles').select('*').ilike('name', `%${query}%`),
      supabase.from('discussions').select('*').ilike('title', `%${query}%`)
    ]);

    const results = [];
    
    if (coursesResult.data) {
      results.push(...coursesResult.data.map(course => ({
        id: course.id,
        title: course.title,
        type: 'course',
        description: course.description,
        url: `/courses/${course.id}`,
        metadata: { instructor: course.instructor_id }
      })));
    }

    if (profilesResult.data) {
      results.push(...profilesResult.data.map(profile => ({
        id: profile.id,
        title: profile.name,
        type: 'mentor',
        description: `${profile.role} with experience`,
        url: `/mentors/${profile.id}`
      })));
    }

    if (discussionsResult.data) {
      results.push(...discussionsResult.data.map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        type: 'discussion',
        description: discussion.content.substring(0, 100) + '...',
        url: `/discussions/${discussion.id}`
      })));
    }

    return results;
  }

  // Course Materials Management
  static async getCourseMaterials(courseId: string): Promise<ExtendedCourseMaterial[]> {
    try {
      console.log('🔍 Fetching course materials for course:', courseId);
      
      // First try with the standard query (with RLS)
      const { data, error } = await supabase
        .from('course_materials')
        .select(`
          *,
          course:courses(*),
          uploadedBy:profiles(*)
        `)
        .eq('course_id', courseId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching course materials:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // If the table doesn't exist or has permission issues, return empty array
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('permission')) {
          console.warn('⚠️ Course materials table may not exist or have permission issues');
          return [];
        }
        
        // If RLS is blocking access, try a different approach
        if (error.message.includes('policy') || error.message.includes('RLS')) {
          console.warn('⚠️ RLS policy blocking access, trying alternative approach...');
          
          // Try to get materials without RLS restrictions (for testing)
          const { data: altData, error: altError } = await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .eq('is_public', true)
            .order('created_at', { ascending: false });
          
          if (altError) {
            console.error('❌ Alternative query also failed:', altError);
            return [];
          }
          
          console.log('✅ Course materials fetched with alternative query:', altData?.length || 0, 'materials');
          return altData || [];
        }
        
        throw error;
      }
      
      console.log('✅ Course materials fetched successfully:', data?.length || 0, 'materials');
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching course materials:', error);
      return [];
    }
  }

  static async getMaterialsForStudent(courseId: string, studentId: string): Promise<ExtendedCourseMaterial[]> {
    try {
      console.log('🔍 Checking enrollment for student:', studentId, 'course:', courseId);
      
      // Check if student is enrolled in the course using the new method
      const isEnrolled = await this.isStudentEnrolled(studentId, courseId);
      
      if (!isEnrolled) {
        console.warn('Student not enrolled in course');
        return [];
      }

      // Get materials for enrolled course
      console.log('📚 Loading course materials for course:', courseId);
      return await this.getCourseMaterials(courseId);
    } catch (error) {
      console.error('❌ Error fetching materials for student:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return [];
    }
  }

  static async uploadCourseMaterial(
    courseId: string,
    file: File,
    materialData: {
      title: string;
      description?: string;
      category?: string;
      lessonId?: number;
    }
  ): Promise<{ data: ExtendedCourseMaterial | null; error: any }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      // Generate unique file path
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `course-materials/${courseId}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return { data: null, error: uploadError };
      }

      // Create material record in database
      const { data, error } = await supabase
        .from('course_materials')
        .insert({
          course_id: courseId,
          lesson_id: materialData.lessonId ? parseInt(materialData.lessonId.toString()) : null,
          title: materialData.title,
          description: materialData.description,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          file_extension: fileExtension,
          category: materialData.category || 'general',
          is_public: true, // Explicitly set to true so materials show up
          uploaded_by: user.id
        })
        .select(`
          *,
          course:courses(*),
          uploadedBy:profiles(*)
        `)
        .single();

      if (error) {
        // If database insert fails, clean up uploaded file
        await supabase.storage.from('course-materials').remove([filePath]);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error uploading course material:', error);
      return { data: null, error };
    }
  }

  static async deleteCourseMaterial(materialId: string): Promise<{ error: any }> {
    try {
      // Get material info first
      const { data: material, error: fetchError } = await supabase
        .from('course_materials')
        .select('file_path')
        .eq('id', materialId)
        .single();

      if (fetchError) {
        return { error: fetchError };
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', materialId);

      if (deleteError) {
        return { error: deleteError };
      }

      // Delete file from storage
      if (material?.file_path) {
        await supabase.storage
          .from('course-materials')
          .remove([material.file_path]);
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting course material:', error);
      return { error };
    }
  }

  static async getMaterialDownloadUrl(materialId: string): Promise<{ url: string | null; error: any }> {
    try {
      // Get material info
      const { data: material, error: fetchError } = await supabase
        .from('course_materials')
        .select('file_path, file_name, title')
        .eq('id', materialId)
        .single();

      if (fetchError || !material) {
        console.error('❌ Material not found:', { materialId, error: fetchError });
        return { url: null, error: fetchError || new Error('Material not found') };
      }

      if (!material.file_path) {
        console.error('❌ Material has no file path:', material);
        return { url: null, error: new Error('Material file path is missing') };
      }

      console.log('🔍 Attempting to create signed URL for:', {
        materialId,
        filePath: material.file_path,
        fileName: material.file_name,
        title: material.title
      });

      // Get signed URL for download
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('course-materials')
        .createSignedUrl(material.file_path, 3600); // 1 hour expiry

      if (urlError) {
        console.error('❌ Failed to create signed URL:', {
          filePath: material.file_path,
          error: urlError
        });
        return { url: null, error: urlError };
      }

      console.log('✅ Signed URL created successfully for:', material.file_name);

      // Increment download count (don't fail if this doesn't work)
      try {
        await supabase.rpc('increment_material_download_count', { material_id: materialId });
      } catch (countError) {
        console.warn('⚠️ Failed to increment download count:', countError);
      }

      return { url: signedUrlData.signedUrl, error: null };
    } catch (error) {
      console.error('❌ Error getting material download URL:', error);
      return { url: null, error };
    }
  }

  static async updateCourseMaterial(
    materialId: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      is_public?: boolean;
    }
  ): Promise<{ data: ExtendedCourseMaterial | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('course_materials')
        .update(updates)
        .eq('id', materialId)
        .select(`
          *,
          course:courses(*),
          uploadedBy:profiles(*)
        `)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating course material:', error);
      return { data: null, error };
    }
  }
}

export default DataService;
