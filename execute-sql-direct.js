// Execute SQL Directly with Supabase
// This script will execute the SQL fix using direct table operations

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Use the credentials we found
const supabaseUrl = 'https://gtzbjzsjeftkgwvvgefp.supabase.co';
const supabaseKey = 'sb_publishable_VUJBi...'; // This will be read from .env.local

async function executeSQLFixDirect() {
  console.log('🚀 Executing SQL fix directly...');
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
    
    const supabase = createClient(supabaseUrl, keyMatch[1]);
    console.log('✅ Connected to Supabase');
    console.log('');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Connection test successful');
    console.log('');
    
    // Since we can't execute raw SQL, let's try to create the functions using RPC
    console.log('🔧 Attempting to create RPC functions...');
    
    // Try to create the complete_assessment_attempt function
    try {
      const { data, error } = await supabase.rpc('complete_assessment_attempt', {
        p_attempt_id: '00000000-0000-0000-0000-000000000000',
        p_score: 0,
        p_answers: {},
        p_time_spent: 0
      });
      
      if (error) {
        console.log('⚠️  complete_assessment_attempt function does not exist yet');
        console.log('   This is expected - we need to create it first');
      } else {
        console.log('✅ complete_assessment_attempt function exists');
      }
    } catch (err) {
      console.log('⚠️  complete_assessment_attempt function does not exist yet');
    }
    
    // Try to create the save_assessment_result function
    try {
      const { data, error } = await supabase.rpc('save_assessment_result', {
        p_student_id: '00000000-0000-0000-0000-000000000000',
        p_assessment_id: '00000000-0000-0000-0000-000000000000',
        p_attempt_id: '00000000-0000-0000-0000-000000000000',
        p_score: 0,
        p_total_points: 0,
        p_answers: {},
        p_feedback: 'Test'
      });
      
      if (error) {
        console.log('⚠️  save_assessment_result function does not exist yet');
        console.log('   This is expected - we need to create it first');
      } else {
        console.log('✅ save_assessment_result function exists');
      }
    } catch (err) {
      console.log('⚠️  save_assessment_result function does not exist yet');
    }
    
    console.log('');
    console.log('⚠️  Cannot execute raw SQL through Supabase client');
    console.log('💡 Manual execution required in Supabase SQL Editor');
    console.log('');
    console.log('📋 SQL to execute in Supabase SQL Editor:');
    console.log('===============================================');
    
    // Read and display the SQL file
    const sqlContent = fs.readFileSync('urgent-database-fix.sql', 'utf8');
    console.log(sqlContent);
    
    console.log('===============================================');
    console.log('');
    console.log('📋 Instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the SQL content above');
    console.log('4. Paste it in the SQL Editor');
    console.log('5. Click "Run" to execute');
    console.log('6. Verify you see the success message');
    console.log('');
    console.log('✅ After running the SQL, your assessment system should work properly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Please run the SQL manually in Supabase SQL Editor');
  }
}

// Run the fix
executeSQLFixDirect();
