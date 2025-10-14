// Debug Assessment Creation
// This script helps debug what's happening when creating assessments

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://gtzbjzsjeftkgwvvgefp.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VUJBiFw6N4Kfeh1gCRoXZQ_-stK7oOf'
);

async function debugAssessmentCreation() {
  console.log('🔍 Debugging Assessment Creation...\n');

  try {
    // 1. Check if assessments table exists and its structure
    console.log('1. Checking assessments table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'assessments')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
    } else {
      console.log('✅ Assessments table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 2. Check existing assessments
    console.log('\n2. Checking existing assessments...');
    const { data: assessments, error: assessmentsError } = await supabase
      .from('assessments')
      .select('*')
      .limit(5);

    if (assessmentsError) {
      console.error('❌ Error fetching assessments:', assessmentsError);
    } else {
      console.log(`✅ Found ${assessments.length} existing assessments:`);
      assessments.forEach(assessment => {
        console.log(`   - ID: ${assessment.id}`);
        console.log(`   - Title: ${assessment.title}`);
        console.log(`   - Type: ${assessment.type || 'N/A'}`);
        console.log(`   - Status: ${assessment.status || 'N/A'}`);
        console.log(`   - Mentor ID: ${assessment.mentor_id || 'N/A'}`);
        console.log(`   - Instructor ID: ${assessment.instructor_id || 'N/A'}`);
        console.log('   ---');
      });
    }

    // 3. Test creating a new assessment
    console.log('\n3. Testing assessment creation...');
    const testAssessment = {
      title: 'Debug Test Assessment',
      description: 'This is a test assessment to debug field saving',
      course_id: null, // Will be set if courses exist
      instructor_id: null, // Will be set if users exist
      mentor_id: null, // Will be set if users exist
      type: 'quiz',
      status: 'draft',
      time_limit: 30,
      max_attempts: 3,
      passing_score: 70
    };

    // Get a course ID if available
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .limit(1);

    if (courses && courses.length > 0) {
      testAssessment.course_id = courses[0].id;
    }

    // Get a user ID if available
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (users && users.length > 0) {
      testAssessment.instructor_id = users[0].id;
      testAssessment.mentor_id = users[0].id;
    }

    console.log('📝 Test assessment data:', testAssessment);

    // Try to create the assessment
    const { data: newAssessment, error: createError } = await supabase
      .from('assessments')
      .insert(testAssessment)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating assessment:', createError);
    } else {
      console.log('✅ Assessment created successfully:');
      console.log('   - ID:', newAssessment.id);
      console.log('   - Title:', newAssessment.title);
      console.log('   - Type:', newAssessment.type);
      console.log('   - Status:', newAssessment.status);
      console.log('   - Time Limit:', newAssessment.time_limit);
      console.log('   - Max Attempts:', newAssessment.max_attempts);
      console.log('   - Passing Score:', newAssessment.passing_score);
      console.log('   - Created At:', newAssessment.created_at);

      // Clean up the test assessment
      await supabase
        .from('assessments')
        .delete()
        .eq('id', newAssessment.id);
      
      console.log('🧹 Test assessment cleaned up');
    }

    // 4. Check if questions table exists
    console.log('\n4. Checking questions table...');
    const { data: questionsColumns, error: questionsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'questions')
      .order('ordinal_position');

    if (questionsError) {
      console.error('❌ Questions table does not exist or error:', questionsError);
    } else {
      console.log('✅ Questions table exists with columns:');
      questionsColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    // 5. Check if assessment_attempts table exists
    console.log('\n5. Checking assessment_attempts table...');
    const { data: attemptsColumns, error: attemptsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'assessment_attempts')
      .order('ordinal_position');

    if (attemptsError) {
      console.error('❌ Assessment_attempts table does not exist or error:', attemptsError);
    } else {
      console.log('✅ Assessment_attempts table exists with columns:');
      attemptsColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug function
debugAssessmentCreation();
