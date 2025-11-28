import { supabase } from '@/lib/supabase';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  duration_hours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  mentor_name?: string;
}

class CourseService {
  // Get courses created by a specific mentor
  async getMentorCourses(mentorId: string): Promise<{ data: Course[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(name)
        `)
        .eq('instructor_id', mentorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const courses = data?.map(course => ({
        ...course,
        mentor_name: course.profiles?.name
      })) || [];

      return { data: courses, error: null };
    } catch (error) {
      console.error('Error fetching mentor courses:', error);
      return { data: null, error };
    }
  }

  // Get all published courses (for students)
  async getPublishedCourses(): Promise<{ data: Course[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const courses = data?.map(course => ({
        ...course,
        mentor_name: course.profiles?.name
      })) || [];

      return { data: courses, error: null };
    } catch (error) {
      console.error('Error fetching published courses:', error);
      return { data: null, error };
    }
  }

  // Get course by ID
  async getCourseById(courseId: string): Promise<{ data: Course | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(name)
        `)
        .eq('id', courseId)
        .single();

      if (error) throw error;

      const course = data ? {
        ...data,
        mentor_name: data.profiles?.name
      } : null;

      return { data: course, error: null };
    } catch (error) {
      console.error('Error fetching course:', error);
      return { data: null, error };
    }
  }

  // Create new course
  async createCourse(courseData: Partial<Course>): Promise<{ data: Course | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating course:', error);
      return { data: null, error };
    }
  }

  // Update course
  async updateCourse(courseId: string, updates: Partial<Course>): Promise<{ data: Course | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating course:', error);
      return { data: null, error };
    }
  }

  // Delete course
  async deleteCourse(courseId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting course:', error);
      return { error };
    }
  }
}

export default new CourseService();
