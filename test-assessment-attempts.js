// Test Assessment Attempts Tracking
// This script tests the assessment attempt functionality

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);

async function testAssessmentAttempts() {
  console.log('🧪 Testing Assessment Attempts Functionality...\n');
  
  try {
    // Test 1: Check if assessment_attempts table exists
    console.log('1️⃣ Checking if assessment_attempts table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('assessment_attempts')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.log('❌ assessment_attempts table does not exist or has issues:', tableError.message);
      console.log('💡 Please run the fix-assessment-attempts.sql script first\n');
      return;
    } else {
      console.log('✅ assessment_attempts table exists\n');
    }
    
    // Test 2: Check if RPC functions exist
    console.log('2️⃣ Testing RPC functions...');
    
    // Test start_assessment_attempt function
    const testStudentId = '00000000-0000-0000-0000-000000000000';
    const testAssessmentId = '00000000-0000-0000-0000-000000000001';
    
    const { data: startData, error: startError } = await supabase.rpc('start_assessment_attempt', {
      p_student_id: testStudentId,
      p_assessment_id: testAssessmentId
    });
    
    if (startError) {
      console.log('❌ start_assessment_attempt function failed:', startError.message);
    } else {
      console.log('✅ start_assessment_attempt function works');
    }
    
    // Test 3: Check assessments table structure
    console.log('\n3️⃣ Checking assessments table structure...');
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('id, title, max_attempts, time_limit_minutes, tags, type, difficulty_level')
      .limit(1);
    
    if (assessmentsError) {
      console.log('❌ Error fetching assessments:', assessmentsError.message);
    } else {
      console.log('✅ Assessments table accessible');
      if (assessments && assessments.length > 0) {
        console.log('📊 Sample assessment:', assessments[0]);
      }
    }
    
    // Test 4: Check questions table
    console.log('\n4️⃣ Checking questions table...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, assessment_id, question_text, question_type')
      .limit(1);
    
    if (questionsError) {
      console.log('❌ Error fetching questions:', questionsError.message);
    } else {
      console.log('✅ Questions table accessible');
      if (questions && questions.length > 0) {
        console.log('📊 Sample question:', questions[0]);
      }
    }
    
    console.log('\n🎉 Assessment attempts testing completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the fix-assessment-attempts.sql script if tables are missing');
    console.log('2. Create some assessments and questions');
    console.log('3. Test the student assessment flow');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAssessmentAttempts();
