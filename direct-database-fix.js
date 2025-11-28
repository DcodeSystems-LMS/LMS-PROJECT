// Direct Database Fix
// This script will attempt to connect directly to your database

import { createClient } from '@supabase/supabase-js';

// Try different approaches to connect to your database
const databaseConfigs = [
  {
    name: 'Supabase Public',
    url: 'https://gtzbjzsjeftkgwvvgefp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0emJqenNqZWZ0a2d3dnZnZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzEsImV4cCI6MjA1MDU1MDk3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
  },
  {
    name: 'Supabase Service Role',
    url: 'https://gtzbjzsjeftkgwvvgefp.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0emJqenNqZWZ0a2d3dnZnZWZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3NDk3MSwiZXhwIjoyMDUwNTUwOTcxfQ.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq'
  }
];

async function testDatabaseConnection() {
  console.log('🔍 Testing database connections...');
  console.log('👤 Database: DCODE@RAMESH');
  console.log('');
  
  for (const config of databaseConfigs) {
    console.log(`🔧 Testing ${config.name}...`);
    
    try {
      const supabase = createClient(config.url, config.key);
      
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ ${config.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${config.name}: Connection successful`);
        
        // If connection works, try to execute the SQL fix
        console.log(`   🚀 Attempting to run SQL fix with ${config.name}...`);
        await executeSQLFix(supabase);
        return; // Exit if successful
      }
    } catch (err) {
      console.log(`   ❌ ${config.name}: ${err.message}`);
    }
    
    console.log('');
  }
  
  console.log('⚠️  All connection attempts failed.');
  console.log('💡 Please run the SQL manually in Supabase SQL Editor:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log('   2. Copy the content from urgent-database-fix.sql');
  console.log('   3. Paste and run the SQL');
}

async function executeSQLFix(supabase) {
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

// Run the database fix
testDatabaseConnection();
