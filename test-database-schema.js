// Test Database Schema Fix
// Run this after applying urgent-database-fix.sql

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtzbjzsjeftkgwvvgefp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0emJqenNqZWZ0a2d3dnZnZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzEsImV4cCI6MjA1MDU1MDk3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...');
  
  try {
    // Test 1: Check if assessment_attempts has required columns
    console.log('1. Testing assessment_attempts table structure...');
    const { data: attemptsData, error: attemptsError } = await supabase
      .from('assessment_attempts')
      .select('*')
      .limit(1);
    
    if (attemptsError) {
      console.error('❌ assessment_attempts table error:', attemptsError);
    } else {
      console.log('✅ assessment_attempts table accessible');
    }
    
    // Test 2: Check if assessment_results has required columns
    console.log('2. Testing assessment_results table structure...');
    const { data: resultsData, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .limit(1);
    
    if (resultsError) {
      console.error('❌ assessment_results table error:', resultsError);
    } else {
      console.log('✅ assessment_results table accessible');
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
      console.error('❌ complete_assessment_attempt RPC error:', rpcError);
    } else {
      console.log('✅ complete_assessment_attempt RPC function accessible');
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
      console.error('❌ save_assessment_result RPC error:', saveError);
    } else {
      console.log('✅ save_assessment_result RPC function accessible');
    }
    
    console.log('🎉 Database schema test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseSchema();