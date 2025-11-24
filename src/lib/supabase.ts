import { createClient } from '@supabase/supabase-js'

// Supabase configuration with debugging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

// Debug environment variables
console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Not found');
console.log('Environment:', import.meta.env.MODE);

// Validate configuration
if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseAnonKey === 'your-anon-key-here') {
  console.warn('⚠️ Supabase configuration is using default values!');
  console.warn('Please create a .env.local file with your actual Supabase credentials.');
  console.warn('Real-time features will be disabled until proper configuration is provided.');
}

// Create Supabase client singleton to prevent multiple instances
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    try {
      // Check if we have valid configuration
      const hasValidConfig = supabaseUrl !== 'https://your-project-id.supabase.co' && 
                           supabaseAnonKey !== 'your-anon-key-here' &&
                           supabaseUrl && supabaseAnonKey;
      
      if (!hasValidConfig) {
        console.warn('⚠️ Creating Supabase client with default configuration - real-time features will be limited');
      }

      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
      
      if (hasValidConfig) {
        console.log('✅ Supabase client created successfully with real-time enabled');
      } else {
        console.log('✅ Supabase client created successfully (real-time disabled due to configuration)');
      }
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error);
      // Don't throw error, create a fallback client for offline scenarios
      console.warn('⚠️ Creating fallback Supabase client for offline mode');
      supabaseInstance = createClient('https://fallback.supabase.co', 'fallback-key', {
        auth: { persistSession: false }
      });
    }
  }
  return supabaseInstance
})()

// Make Supabase available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  console.log('🌐 Supabase client made available globally');
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'student' | 'mentor' | 'admin'
          avatar_url?: string
          phone?: string
          address?: string
          student_status?: string
          progress?: number
          course_id?: string
          join_date?: string
          last_active?: string
          skills?: string[]
          interests?: string[]
          bio?: string
          location?: string
          specialty?: string
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          xp?: number
          level?: number
          badges?: string[]
          completed_assessments?: number
          average_score?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'student' | 'mentor' | 'admin'
          avatar_url?: string
          phone?: string
          address?: string
          student_status?: string
          progress?: number
          course_id?: string
          join_date?: string
          last_active?: string
          skills?: string[]
          interests?: string[]
          bio?: string
          location?: string
          xp?: number
          level?: number
          badges?: string[]
          completed_assessments?: number
          average_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'student' | 'mentor' | 'admin'
          avatar_url?: string
          phone?: string
          address?: string
          student_status?: string
          progress?: number
          course_id?: string
          join_date?: string
          last_active?: string
          skills?: string[]
          interests?: string[]
          bio?: string
          location?: string
          xp?: number
          level?: number
          badges?: string[]
          completed_assessments?: number
          average_score?: number
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          instructor_id: string
          price: number
          duration_hours: number
          level: 'beginner' | 'intermediate' | 'advanced'
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          thumbnail_url?: string
          thumbnail?: string
          objectives: any[]
          requirements: any[]
          tags: any[]
          lessons: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          instructor_id: string
          price: number
          duration_hours: number
          level: 'beginner' | 'intermediate' | 'advanced'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category: string
          thumbnail_url?: string
          thumbnail?: string
          objectives?: any[]
          requirements?: any[]
          tags?: any[]
          lessons?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          instructor_id?: string
          price?: number
          duration_hours?: number
          level?: 'beginner' | 'intermediate' | 'advanced'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          thumbnail_url?: string
          thumbnail?: string
          objectives?: any[]
          requirements?: any[]
          tags?: any[]
          lessons?: any[]
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
          progress: number
          completed_at?: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
          progress?: number
          completed_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          progress?: number
          completed_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          title: string
          description?: string
          course_id: string
          instructor_id: string
          type: 'quiz' | 'project' | 'assignment'
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          time_limit_minutes?: number
          passing_score: number
          questions: any[]
          status: 'active' | 'draft' | 'paused' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          course_id: string
          instructor_id: string
          type: 'quiz' | 'project' | 'assignment'
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          time_limit_minutes?: number
          passing_score?: number
          questions?: any[]
          status?: 'active' | 'draft' | 'paused' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          course_id?: string
          instructor_id?: string
          type?: 'quiz' | 'project' | 'assignment'
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          time_limit_minutes?: number
          passing_score?: number
          questions?: any[]
          status?: 'active' | 'draft' | 'paused' | 'archived'
          updated_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          assessment_id: string
          student_id: string
          score: number
          answers: any
          started_at: string
          completed_at?: string
          time_taken_minutes?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          student_id: string
          score: number
          answers?: any
          started_at?: string
          completed_at?: string
          time_taken_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          student_id?: string
          score?: number
          answers?: any
          started_at?: string
          completed_at?: string
          time_taken_minutes?: number
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          mentor_id: string
          student_id: string
          title: string
          description?: string
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'completed' | 'cancelled'
          meeting_url?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mentor_id: string
          student_id: string
          title: string
          description?: string
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          meeting_url?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mentor_id?: string
          student_id?: string
          title?: string
          description?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          meeting_url?: string
          notes?: string
          updated_at?: string
        }
      }
      course_materials: {
        Row: {
          id: string
          course_id: string
          lesson_id?: number
          title: string
          description?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_extension: string
          category: string
          is_public: boolean
          uploaded_by: string
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          lesson_id?: number
          title: string
          description?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_extension: string
          category?: string
          is_public?: boolean
          uploaded_by: string
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          lesson_id?: number
          title?: string
          description?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          file_extension?: string
          category?: string
          is_public?: boolean
          uploaded_by?: string
          download_count?: number
          updated_at?: string
        }
      }
    }
  }
}

// User type for compatibility
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'mentor' | 'admin'
  avatar?: string
  dark_mode?: boolean
  created_at?: string
  updated_at?: string
}

// Auth response type
export interface AuthResponse {
  user: User | null
  error: string | null
}