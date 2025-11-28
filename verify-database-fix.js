// Verify Database Fix
// Run this after applying the SQL fix to verify everything is working

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtzbjzsjeftkgwvvgefp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0emJqenNqZWZ0a2d3dnZnZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzEsImV4cCI6MjA1MDU1MDk3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseFix() {
  console.log('🔍 Verifying database schema fix...');
  console.log('');
  
  try {
    // Test 1: Check if assessment_attempts table has the new columns
    console.log('1. Testing assessment_attempts table structure...');
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('assessment_attempts')
      .select('id, completed_at, answers, time_spent')
      .limit(1);
    
    if (attemptsError) {
      console.error('❌ assessment_attempts table error:', attemptsError.message);
      if (attemptsError.message.includes('column') && attemptsError.message.includes('does not exist')) {
        console.log('⚠️  The database fix may not have been applied yet.');
        console.log('   Please run the SQL script in your Supabase SQL Editor.');
      }
    } else {
      console.log('✅ assessment_attempts table has all required columns');
    }
    
    // Test 2: Check if assessment_results table has the new columns
    console.log('2. Testing assessment_results table structure...');
    const { data: resultsData, error: resultsError } = await supabase
      .from('assessment_results')
      .select('id, attempt_id, score, total_points, answers')
      .limit(1);
    
    if (resultsError) {
      console.error('❌ assessment_results table error:', resultsError.message);
      if (resultsError.message.includes('column') && resultsError.message.includes('does not exist')) {
        console.log('⚠️  The database fix may not have been applied yet.');
        console.log('   Please run the SQL script in your Supabase SQL Editor.');
      }
    } else {
      console.log('✅ assessment_results table has all required columns');
    }
    
    // Test 3: Test complete_assessment_attempt RPC function
    console.log('3. Testing complete_assessment_attempt RPC function...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('complete_assessment_attempt', {
      p_attempt_id: '00000000-0000-0000-0000-000000000000', // Dummy ID for testing
      p_score: 0,
      p_answers: {},
      p_time_spent: 0
    });
    
    if (rpcError) {
      console.error('❌ complete_assessment_attempt RPC error:', rpcError.message);
      if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
        console.log('⚠️  The RPC functions may not have been created yet.');
        console.log('   Please run the SQL script in your Supabase SQL Editor.');
      }
    } else {
      console.log('✅ complete_assessment_attempt RPC function is working');
    }
    
    // Test 4: Test save_assessment_result RPC function
    console.log('4. Testing save_assessment_result RPC function...');
    const { data: saveData, error: saveError } = await supabase.rpc('save_assessment_result', {
      p_student_id: '00000000-0000-0000-0000-000000000000', // Dummy ID for testing
      p_assessment_id: '00000000-0000-0000-0000-000000000000',
      p_attempt_id: '00000000-0000-0000-0000-000000000000',
      p_score: 0,
      p_total_points: 0,
      p_answers: {},
      p_feedback: 'Test'
    });
    
    if (saveError) {
      console.error('❌ save_assessment_result RPC error:', saveError.message);
      if (saveError.message.includes('function') && saveError.message.includes('does not exist')) {
        console.log('⚠️  The RPC functions may not have been created yet.');
        console.log('   Please run the SQL script in your Supabase SQL Editor.');
      }
    } else {
      console.log('✅ save_assessment_result RPC function is working');
    }
    
    console.log('');
    console.log('🎉 Database verification completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. If you see any errors above, run the SQL fix in Supabase');
    console.log('2. If all tests pass, your assessment system should work properly');
    console.log('3. Try taking an assessment to verify everything is working');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('');
    console.log('⚠️  Please ensure you have run the SQL fix in your Supabase SQL Editor.');
  }
}

// Run the verification
verifyDatabaseFix();
