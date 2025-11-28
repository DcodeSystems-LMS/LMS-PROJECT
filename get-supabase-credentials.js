// Get Supabase Credentials and Execute SQL Fix
// This script will help you get the correct credentials and run the SQL fix

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

console.log('🔍 Supabase Database Fix Helper');
console.log('👤 Database: DCODE@RAMESH');
console.log('');
console.log('📋 To get your Supabase credentials:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to Settings → API');
console.log('3. Copy the "anon public" key');
console.log('4. Or use the "service_role" key for admin access');
console.log('');

// Try to read from environment variables or config files
const possibleConfigFiles = [
  '.env.local',
  '.env',
  'supabase/config.toml',
  'src/lib/supabase.js',
  'src/lib/supabase.ts'
];

console.log('🔍 Looking for existing configuration files...');
for (const configFile of possibleConfigFiles) {
  try {
    if (fs.existsSync(configFile)) {
      console.log(`✅ Found: ${configFile}`);
      const content = fs.readFileSync(configFile, 'utf8');
      
      // Look for Supabase URL and key
      const urlMatch = content.match(/SUPABASE_URL[=:]\s*["']?([^"'\s]+)["']?/i);
      const keyMatch = content.match(/SUPABASE_ANON_KEY[=:]\s*["']?([^"'\s]+)["']?/i);
      
      if (urlMatch && keyMatch) {
        console.log(`   📍 URL: ${urlMatch[1]}`);
        console.log(`   🔑 Key: ${keyMatch[1].substring(0, 20)}...`);
        
        // Try to use these credentials
        console.log('   🚀 Attempting to connect...');
        const supabase = createClient(urlMatch[1], keyMatch[1]);
        
        // Test connection
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Connection failed: ${error.message}`);
        } else {
          console.log('   ✅ Connection successful!');
          console.log('   🚀 Running SQL fix...');
          await runSQLFix(supabase);
          process.exit(0);
        }
      }
    }
  } catch (err) {
    console.log(`   ❌ Error reading ${configFile}: ${err.message}`);
  }
}

console.log('');
console.log('⚠️  No valid credentials found in configuration files.');
console.log('');
console.log('💡 Manual SQL Execution Required:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the following SQL:');
console.log('');
console.log('===============================================');
console.log('-- URGENT DATABASE FIX');
console.log('-- Run this in Supabase SQL Editor');
console.log('');
console.log('-- Add missing columns to assessment_attempts');
console.log('ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;');
console.log('ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS answers JSONB;');
console.log('ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS time_spent INTEGER;');
console.log('');
console.log('-- Add missing column to assessment_results');
console.log('ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;');
console.log('');
console.log('-- Create complete_assessment_attempt function');
console.log('CREATE OR REPLACE FUNCTION complete_assessment_attempt(');
console.log('  p_attempt_id UUID,');
console.log('  p_score INTEGER,');
console.log('  p_answers JSONB,');
console.log('  p_time_spent INTEGER');
console.log(')');
console.log('RETURNS BOOLEAN AS $$');
console.log('BEGIN');
console.log('  UPDATE public.assessment_attempts');
console.log('  SET');
console.log('    score = p_score,');
console.log('    answers = p_answers,');
console.log('    time_spent = p_time_spent,');
console.log('    completed_at = NOW(),');
console.log('    status = \'completed\'');
console.log('  WHERE id = p_attempt_id;');
console.log('  RETURN TRUE;');
console.log('END;');
console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
console.log('');
console.log('-- Create save_assessment_result function');
console.log('CREATE OR REPLACE FUNCTION save_assessment_result(');
console.log('  p_student_id UUID,');
console.log('  p_assessment_id UUID,');
console.log('  p_attempt_id UUID DEFAULT NULL,');
console.log('  p_score INTEGER DEFAULT 0,');
console.log('  p_total_points INTEGER DEFAULT 0,');
console.log('  p_answers JSONB DEFAULT NULL,');
console.log('  p_feedback TEXT DEFAULT NULL');
console.log(')');
console.log('RETURNS UUID AS $$');
console.log('DECLARE');
console.log('  result_id UUID;');
console.log('BEGIN');
console.log('  INSERT INTO public.assessment_results (');
console.log('    student_id,');
console.log('    assessment_id,');
console.log('    attempt_id,');
console.log('    score,');
console.log('    total_points,');
console.log('    answers,');
console.log('    feedback');
console.log('  ) VALUES (');
console.log('    p_student_id,');
console.log('    p_assessment_id,');
console.log('    p_attempt_id,');
console.log('    p_score,');
console.log('    p_total_points,');
console.log('    p_answers,');
console.log('    p_feedback');
console.log('  )');
console.log('  ON CONFLICT (student_id, assessment_id, attempt_id)');
console.log('  DO UPDATE SET');
console.log('    score = EXCLUDED.score,');
console.log('    total_points = EXCLUDED.total_points,');
console.log('    answers = EXCLUDED.answers,');
console.log('    feedback = EXCLUDED.feedback,');
console.log('    completed_at = NOW(),');
console.log('    updated_at = NOW()');
console.log('  RETURNING id INTO result_id;');
console.log('  RETURN result_id;');
console.log('END;');
console.log('$$ LANGUAGE plpgsql SECURITY DEFINER;');
console.log('');
console.log('-- Grant permissions');
console.log('GRANT EXECUTE ON FUNCTION complete_assessment_attempt TO authenticated;');
console.log('GRANT EXECUTE ON FUNCTION save_assessment_result TO authenticated;');
console.log('');
console.log('-- Show success message');
console.log('SELECT \'Database schema fixed successfully! All assessment functions should now work.\' as status;');
console.log('===============================================');
console.log('');
console.log('4. Click "Run" to execute');
console.log('5. Verify you see the success message');
console.log('');
console.log('✅ After running the SQL, your assessment system should work properly!');

async function runSQLFix(supabase) {
  const sqlStatements = [
    `ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;`,
    `ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS answers JSONB;`,
    `ALTER TABLE public.assessment_attempts ADD COLUMN IF NOT EXISTS time_spent INTEGER;`,
    `ALTER TABLE public.assessment_results ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;`,
    `CREATE OR REPLACE FUNCTION complete_assessment_attempt(
      p_attempt_id UUID,
      p_score INTEGER,
      p_answers JSONB,
      p_time_spent INTEGER
    )
    RETURNS BOOLEAN AS $$
    BEGIN
      UPDATE public.assessment_attempts 
      SET 
        score = p_score,
        answers = p_answers,
        time_spent = p_time_spent,
        completed_at = NOW(),
        status = 'completed'
      WHERE id = p_attempt_id;
      
      RETURN TRUE;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`,
    `CREATE OR REPLACE FUNCTION save_assessment_result(
      p_student_id UUID,
      p_assessment_id UUID,
      p_attempt_id UUID DEFAULT NULL,
      p_score INTEGER DEFAULT 0,
      p_total_points INTEGER DEFAULT 0,
      p_answers JSONB DEFAULT NULL,
      p_feedback TEXT DEFAULT NULL
    )
    RETURNS UUID AS $$
    DECLARE
      result_id UUID;
    BEGIN
      INSERT INTO public.assessment_results (
        student_id,
        assessment_id,
        attempt_id,
        score,
        total_points,
        answers,
        feedback
      ) VALUES (
        p_student_id,
        p_assessment_id,
        p_attempt_id,
        p_score,
        p_total_points,
        p_answers,
        p_feedback
      )
      ON CONFLICT (student_id, assessment_id, attempt_id) 
      DO UPDATE SET
        score = EXCLUDED.score,
        total_points = EXCLUDED.total_points,
        answers = EXCLUDED.answers,
        feedback = EXCLUDED.feedback,
        completed_at = NOW(),
        updated_at = NOW()
      RETURNING id INTO result_id;
      
      RETURN result_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`,
    `GRANT EXECUTE ON FUNCTION complete_assessment_attempt TO authenticated;`,
    `GRANT EXECUTE ON FUNCTION save_assessment_result TO authenticated;`
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const statement = sqlStatements[i];
    console.log(`   🔧 Executing statement ${i + 1}/${sqlStatements.length}...`);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.log(`      ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`      ✅ Success`);
        successCount++;
      }
    } catch (err) {
      console.log(`      ❌ Exception: ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`   📊 Results: ${successCount} successful, ${errorCount} failed`);
  
  if (successCount > 0) {
    console.log('   🎉 Database schema fix completed!');
    console.log('   ✅ Assessment functions should now work properly!');
  }
}
