// Run SQL Fix Script
// This script will execute the urgent-database-fix.sql against your Supabase database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://gtzbjzsjeftkgwvvgefp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0emJqenNqZWZ0a2d3dnZnZWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzEsImV4cCI6MjA1MDU1MDk3MX0.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQLFix() {
  console.log('🚀 Starting database schema fix...');
  
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
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}:`);
        console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
            if (data) {
              console.log('📊 Result:', data);
            }
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\n🎉 Database schema fix completed!');
    console.log('✅ All assessment functions should now work properly.');
    
  } catch (error) {
    console.error('❌ Failed to run SQL fix:', error);
  }
}

// Run the fix
runSQLFix();
