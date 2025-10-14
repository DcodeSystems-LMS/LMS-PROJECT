// Test After Fix - Quick verification
// Run this after executing the fixed SQL to verify everything works

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function testAfterFix() {
  console.log('🧪 Testing Assessment System After SQL Fix');
  console.log('👤 Database: DCODE@RAMESH');
  console.log('');
  
  try {
    // Read the actual key from .env.local
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const keyMatch = envContent.match(/SUPABASE_ANON_KEY[=:]\s*["']?([^"'\s]+)["']?/i);
    
    if (!keyMatch) {
      console.log('❌ Could not find Supabase key in .env.local');
      return;
    }
    
    const supabase = createClient('https://gtzbjzsjeftkgwvvgefp.supabase.co', keyMatch[1]);
    console.log('✅ Connected to Supabase');
    console.log('');
    
    // Test 1: Check if columns exist
    console.log('1. Testing table columns...');
    try {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('assessment_attempts')
        .select('id, completed_at, answers, time_spent')
        .limit(1);
      
      if (attemptsError) {
        console.log(`   ❌ assessment_attempts: ${attemptsError.message}`);
      } else {
        console.log('   ✅ assessment_attempts table has all required columns');
      }
    } catch (err) {
      console.log(`   ❌ assessment_attempts: ${err.message}`);
    }
    
    try {
      const { data: resultsData, error: resultsError } = await supabase
        .from('assessment_results')
        .select('id, attempt_id, score, total_points, answers')
        .limit(1);
      
      if (resultsError) {
        console.log(`   ❌ assessment_results: ${resultsError.message}`);
      } else {
        console.log('   ✅ assessment_results table has all required columns');
      }
    } catch (err) {
      console.log(`   ❌ assessment_results: ${err.message}`);
    }
    
    // Test 2: Check if functions exist
    console.log('2. Testing RPC functions...');
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('complete_assessment_attempt', {
        p_attempt_id: '00000000-0000-0000-0000-000000000000',
        p_score: 0,
        p_answers: {},
        p_time_spent: 0
      });
      
      if (rpcError) {
        console.log(`   ❌ complete_assessment_attempt: ${rpcError.message}`);
      } else {
        console.log('   ✅ complete_assessment_attempt function is working');
      }
    } catch (err) {
      console.log(`   ❌ complete_assessment_attempt: ${err.message}`);
    }
    
    try {
      const { data: saveData, error: saveError } = await supabase.rpc('save_assessment_result', {
        p_student_id: '00000000-0000-0000-0000-000000000000',
        p_assessment_id: '00000000-0000-0000-0000-000000000000',
        p_attempt_id: '00000000-0000-0000-0000-000000000000',
        p_score: 0,
        p_total_points: 0,
        p_answers: {},
        p_feedback: 'Test'
      });
      
      if (saveError) {
        console.log(`   ❌ save_assessment_result: ${saveError.message}`);
      } else {
        console.log('   ✅ save_assessment_result function is working');
      }
    } catch (err) {
      console.log(`   ❌ save_assessment_result: ${err.message}`);
    }
    
    console.log('');
    console.log('🎉 Test completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. If you see any errors above, the SQL fix may not have been applied yet');
    console.log('2. If all tests pass, your assessment system should work properly');
    console.log('3. Try taking an assessment to verify everything is working');
    console.log('');
    console.log('✅ Your assessment system should now work without database errors!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('💡 Please ensure you have run the fixed SQL in your Supabase SQL Editor.');
  }
}

// Run the test
testAfterFix();
