// Simple debug script to check assessments
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAssessments() {
  console.log('🔍 Debugging assessments...');
  
  try {
    // 1. Check if assessments table exists and has data
    console.log('\n1. Checking assessments table...');
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .limit(10);
    
    if (assessmentsError) {
      console.error('❌ Error fetching assessments:', assessmentsError);
    } else {
      console.log('✅ Assessments found:', assessments?.length || 0);
      if (assessments && assessments.length > 0) {
        console.log('📊 Sample assessment:', assessments[0]);
      }
    }
    
    // 2. Check enrollments for the specific student
    console.log('\n2. Checking enrollments for student: 945b82c6-fb28-4eb3-85b2-143dba7f7107');
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', '945b82c6-fb28-4eb3-85b2-143dba7f7107');
    
    if (enrollmentError) {
      console.error('❌ Error fetching enrollments:', enrollmentError);
    } else {
      console.log('✅ Enrollments found:', enrollments?.length || 0);
      if (enrollments && enrollments.length > 0) {
        console.log('📊 Sample enrollment:', enrollments[0]);
        const courseIds = enrollments.map(e => e.course_id);
        console.log('📚 Course IDs:', courseIds);
        
        // 3. Check assessments for these courses
        console.log('\n3. Checking assessments for enrolled courses...');
        const { data: courseAssessments, error: courseError } = await supabase
          .from('assessments')
          .select('*')
          .in('course_id', courseIds);
        
        if (courseError) {
          console.error('❌ Error fetching course assessments:', courseError);
        } else {
          console.log('✅ Course assessments found:', courseAssessments?.length || 0);
          if (courseAssessments && courseAssessments.length > 0) {
            console.log('📊 Sample course assessment:', courseAssessments[0]);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

// Run the debug function
debugAssessments();

