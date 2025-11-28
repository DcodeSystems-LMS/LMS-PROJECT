// Verify Database Fix After SQL Execution
// Run this after you've executed the SQL in Supabase SQL Editor

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function verifyDatabaseFix() {
  console.log('🔍 Verifying database fix after SQL execution...');
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
    
    // Test 1: Check if assessment_attempts table has the new columns
    console.log('1. Testing assessment_attempts table structure...');
    try {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('assessment_attempts')
        .select('id, completed_at, answers, time_spent')
        .limit(1);
      
      if (attemptsError) {
        console.log(`   ❌ Error: ${attemptsError.message}`);
        if (attemptsError.message.includes('column') && attemptsError.message.includes('does not exist')) {
          console.log('   ⚠️  The database fix may not have been applied yet.');
          console.log('   💡 Please run the SQL script in your Supabase SQL Editor.');
        }
      } else {
        console.log('   ✅ assessment_attempts table has all required columns');
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
    
    // Test 2: Check if assessment_results table has the new columns
    console.log('2. Testing assessment_results table structure...');
    try {
      const { data: resultsData, error: resultsError } = await supabase
        .from('assessment_results')
        .select('id, attempt_id, score, total_points, answers')
        .limit(1);
      
      if (resultsError) {
        console.log(`   ❌ Error: ${resultsError.message}`);
        if (resultsError.message.includes('column') && resultsError.message.includes('does not exist')) {
          console.log('   ⚠️  The database fix may not have been applied yet.');
          console.log('   💡 Please run the SQL script in your Supabase SQL Editor.');
        }
      } else {
        console.log('   ✅ assessment_results table has all required columns');
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
    
    // Test 3: Test complete_assessment_attempt RPC function
    console.log('3. Testing complete_assessment_attempt RPC function...');
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('complete_assessment_attempt', {
        p_attempt_id: '00000000-0000-0000-0000-000000000000', // Dummy ID for testing
        p_score: 0,
        p_answers: {},
        p_time_spent: 0
      });
      
      if (rpcError) {
        console.log(`   ❌ Error: ${rpcError.message}`);
        if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
          console.log('   ⚠️  The RPC functions may not have been created yet.');
          console.log('   💡 Please run the SQL script in your Supabase SQL Editor.');
        }
      } else {
        console.log('   ✅ complete_assessment_attempt RPC function is working');
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
    
    // Test 4: Test save_assessment_result RPC function
    console.log('4. Testing save_assessment_result RPC function...');
    try {
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
        console.log(`   ❌ Error: ${saveError.message}`);
        if (saveError.message.includes('function') && saveError.message.includes('does not exist')) {
          console.log('   ⚠️  The RPC functions may not have been created yet.');
          console.log('   💡 Please run the SQL script in your Supabase SQL Editor.');
        }
      } else {
        console.log('   ✅ save_assessment_result RPC function is working');
      }
    } catch (err) {
      console.log(`   ❌ Exception: ${err.message}`);
    }
    
    console.log('');
    console.log('🎉 Database verification completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. If you see any errors above, run the SQL fix in Supabase');
    console.log('2. If all tests pass, your assessment system should work properly');
    console.log('3. Try taking an assessment to verify everything is working');
    console.log('');
    console.log('✅ Your assessment system should now work without database errors!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('');
    console.log('💡 Please ensure you have run the SQL fix in your Supabase SQL Editor.');
  }
}

// Run the verification
verifyDatabaseFix();
