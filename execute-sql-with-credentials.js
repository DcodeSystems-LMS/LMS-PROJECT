// Execute SQL Fix with Database Credentials
// This script will connect to your database and run the urgent-database-fix.sql

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Database credentials
const supabaseUrl = 'https://gtzbjzsjeftkgwvvgefp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0emJqenNqZWZ0a2d3dnZnZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzEsImV4cCI6MjA1MDU1MDk3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFix() {
  console.log('🚀 Starting database schema fix with credentials...');
  console.log('👤 Database: DCODE@RAMESH');
  console.log('');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('urgent-database-fix.sql', 'utf8');
    console.log('📄 SQL file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`🔧 Executing statement ${i + 1}/${statements.length}:`);
        console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);
        
        try {
          // Use the rpc function to execute SQL
          const { data, error } = await supabase.rpc('exec_sql', { 
            sql: statement 
          });
          
          if (error) {
            console.error(`   ❌ Error: ${error.message}`);
            errorCount++;
          } else {
            console.log(`   ✅ Success`);
            if (data) {
              console.log(`   📊 Result: ${JSON.stringify(data)}`);
            }
            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ Exception: ${err.message}`);
          errorCount++;
        }
        
        console.log('');
      }
    }
    
    console.log('🎉 Database schema fix completed!');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log('');
    
    if (errorCount === 0) {
      console.log('🎯 All assessment functions should now work properly!');
      console.log('📋 Next steps:');
      console.log('   1. Refresh your application');
      console.log('   2. Try taking an assessment');
      console.log('   3. Verify that scores are saved correctly');
    } else {
      console.log('⚠️  Some statements failed. Please check the errors above.');
      console.log('💡 You may need to run the SQL manually in Supabase SQL Editor.');
    }
    
  } catch (error) {
    console.error('❌ Failed to execute SQL fix:', error.message);
    console.log('');
    console.log('💡 Alternative: Run the SQL manually in Supabase SQL Editor');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log('   2. Copy the content from urgent-database-fix.sql');
    console.log('   3. Paste and run the SQL');
  }
}

// Run the fix
executeSQLFix();
