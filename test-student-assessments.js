// Test script to debug student assessments issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudentAssessments() {
  console.log('🧪 Testing student assessments...');
  
  try {
    // 1. Check if we have any enrollments
    console.log('\n1. Checking enrollments...');
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(5);
    
    if (enrollmentError) {
      console.error('❌ Error fetching enrollments:', enrollmentError);
      return;
    }
    
    console.log('✅ Enrollments found:', enrollments?.length || 0);
    if (enrollments && enrollments.length > 0) {
      console.log('📊 Sample enrollment:', enrollments[0]);
      
      // 2. Get assessments for the first student
      const studentId = enrollments[0].student_id;
      const courseIds = enrollments.map(e => e.course_id);
      
      console.log('\n2. Testing assessment query for student:', studentId);
      console.log('📚 Course IDs:', courseIds);
      
      // 3. Try to get assessments for enrolled courses
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(*),
          instructor:profiles!instructor_id(*)
        `)
        .in('course_id', courseIds)
        .order('created_at', { ascending: false });
      
      if (assessmentError) {
        console.error('❌ Error fetching assessments:', assessmentError);
      } else {
        console.log('✅ Assessments found:', assessments?.length || 0);
        if (assessments && assessments.length > 0) {
          console.log('📊 Sample assessment:', assessments[0]);
        }
      }
      
      // 4. Test the exact query from DataService
      console.log('\n3. Testing DataService query...');
      const { data: filteredAssessments, error: filteredError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(*),
          instructor:profiles!instructor_id(*)
        `)
        .in('course_id', courseIds)
        .in('status', ['active', 'published', 'draft'])
        .order('created_at', { ascending: false });
      
      if (filteredError) {
        console.log('⚠️ Status filter error (status column might not exist):', filteredError.message);
        
        // Try without status filter
        const { data: allAssessments, error: allError } = await supabase
          .from('assessments')
          .select(`
            *,
            course:courses(*),
            instructor:profiles!instructor_id(*)
          `)
          .in('course_id', courseIds)
          .order('created_at', { ascending: false });
        
        if (allError) {
          console.error('❌ Error fetching all assessments:', allError);
        } else {
          console.log('✅ All assessments found (no status filter):', allAssessments?.length || 0);
        }
      } else {
        console.log('✅ Filtered assessments found:', filteredAssessments?.length || 0);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testStudentAssessments();

