// Debug script to check student assessments
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStudentAssessments() {
  console.log('🔍 Debugging student assessments...');
  
  try {
    // 1. Check if assessments table exists and has data
    console.log('\n1. Checking assessments table...');
    const { data: allAssessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .limit(5);
    
    if (assessmentsError) {
      console.error('❌ Error fetching assessments:', assessmentsError);
    } else {
      console.log('✅ Assessments found:', allAssessments?.length || 0);
      console.log('📊 Assessment details:', allAssessments);
    }
    
    // 2. Check enrollments table
    console.log('\n2. Checking enrollments table...');
    const { data: allEnrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*')
      .limit(5);
    
    if (enrollmentsError) {
      console.error('❌ Error fetching enrollments:', enrollmentsError);
    } else {
      console.log('✅ Enrollments found:', allEnrollments?.length || 0);
      console.log('📊 Enrollment details:', allEnrollments);
    }
    
    // 3. Check if student_assessments table exists
    console.log('\n3. Checking student_assessments table...');
    const { data: studentAssessments, error: studentAssessmentsError } = await supabase
      .from('student_assessments')
      .select('*')
      .limit(5);
    
    if (studentAssessmentsError) {
      console.log('⚠️ student_assessments table not found or has issues:', studentAssessmentsError.message);
    } else {
      console.log('✅ Student assessments found:', studentAssessments?.length || 0);
      console.log('📊 Student assessment details:', studentAssessments);
    }
    
    // 4. Test the enrollment-based query
    console.log('\n4. Testing enrollment-based assessment query...');
    if (allEnrollments && allEnrollments.length > 0) {
      const studentId = allEnrollments[0].student_id;
      const courseIds = allEnrollments.map(e => e.course_id);
      
      console.log('🎓 Testing for student:', studentId);
      console.log('📚 Course IDs:', courseIds);
      
      const { data: assessments, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          *,
          course:courses(*),
          instructor:profiles!instructor_id(*)
        `)
        .in('course_id', courseIds)
        .in('status', ['active', 'published', 'draft'])
        .order('created_at', { ascending: false });
      
      if (assessmentError) {
        console.error('❌ Error in enrollment-based query:', assessmentError);
      } else {
        console.log('✅ Assessments found for enrolled courses:', assessments?.length || 0);
        console.log('📊 Assessment details:', assessments);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug function
debugStudentAssessments();

