// Test Questions After Migration
// This script tests if questions are properly fetched after schema migration

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://gtzbjzsjeftkgwvvgefp.supabase.co',
  'sb_publishable_VUJBiFw6N4Kfeh1gCRoXZQ_-stK7oOf'
);

async function testQuestionsAfterMigration() {
  console.log('🧪 Testing questions after migration...\n');

  try {
    // 1. Check questions table
    console.log('1. Checking questions table...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(10);
    
    if (questionsError) {
      console.log('❌ Error fetching questions:', questionsError.message);
    } else {
      console.log('✅ Questions in table:', questions?.length || 0);
      if (questions && questions.length > 0) {
        console.log('📝 Sample questions:');
        questions.slice(0, 3).forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question_text} (Assessment: ${q.assessment_id})`);
        });
      }
    }

    // 2. Check student assignments
    console.log('\n2. Checking student assignments...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('student_assessments')
      .select('*')
      .limit(5);
    
    if (assignmentsError) {
      console.log('❌ Error fetching assignments:', assignmentsError.message);
    } else {
      console.log('✅ Student assignments:', assignments?.length || 0);
      if (assignments && assignments.length > 0) {
        console.log('📝 Sample assignments:');
        assignments.slice(0, 3).forEach((a, index) => {
          console.log(`   ${index + 1}. Student ${a.student_id} -> Assessment ${a.assessment_id}`);
        });
      }
    }

    // 3. Test specific assessment questions
    console.log('\n3. Testing specific assessment: 7d525b39-1688-4e03-9c39-1071b50663bb');
    const { data: specificQuestions, error: specificError } = await supabase
      .from('questions')
      .select('*')
      .eq('assessment_id', '7d525b39-1688-4e03-9c39-1071b50663bb');
    
    if (specificError) {
      console.log('❌ Error fetching specific questions:', specificError.message);
    } else {
      console.log('✅ Questions for specific assessment:', specificQuestions?.length || 0);
      if (specificQuestions && specificQuestions.length > 0) {
        console.log('📝 Questions:');
        specificQuestions.forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question_text}`);
          console.log(`      Type: ${q.question_type}`);
          console.log(`      Options: ${JSON.stringify(q.options)}`);
          console.log(`      Correct Answer: ${q.correct_answer}`);
        });
      }
    }

    // 4. Test DataService method
    console.log('\n4. Testing DataService.getAssessmentQuestions method...');
    
    // Simulate the DataService method
    const { data: questionsData, error: questionsDataError } = await supabase
      .from('questions')
      .select('*')
      .eq('assessment_id', '7d525b39-1688-4e03-9c39-1071b50663bb')
      .order('order_index');
    
    if (questionsDataError) {
      console.log('❌ DataService method would fail:', questionsDataError.message);
    } else {
      console.log('✅ DataService method would work:', questionsData?.length || 0, 'questions');
      if (questionsData && questionsData.length > 0) {
        console.log('📝 Questions that would be returned:');
        questionsData.forEach((q, index) => {
          console.log(`   ${index + 1}. ${q.question_text}`);
        });
      }
    }

    // 5. Summary
    console.log('\n📊 Migration Test Summary:');
    console.log(`✅ Questions table: ${questions?.length || 0} questions`);
    console.log(`✅ Student assignments: ${assignments?.length || 0} assignments`);
    console.log(`✅ Specific assessment questions: ${specificQuestions?.length || 0} questions`);
    
    if (questions && questions.length > 0) {
      console.log('\n🎉 SUCCESS: Questions have been migrated!');
      console.log('✅ The student assessment page should now work properly');
    } else {
      console.log('\n⚠️ WARNING: No questions found in questions table');
      console.log('❌ The schema migration may not have run successfully');
      console.log('📋 Please check the Supabase SQL Editor for any error messages');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
testQuestionsAfterMigration();

