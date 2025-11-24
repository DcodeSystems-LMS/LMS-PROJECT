// Check Course Materials Table Status
// This script checks if the course_materials table exists and has proper structure

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://supabase.dcodesys.in';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCourseMaterialsTable() {
  console.log('🔍 Checking Course Materials Table Status...\n');
  
  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Not authenticated. Please sign in to your application first.');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    
    // Step 2: Test table access (this will fail if table doesn't exist)
    console.log('\n2. Checking course_materials table access...');
    try {
      const { data: materials, error: listError } = await supabase
        .from('course_materials')
        .select('*')
        .limit(1);
      
      if (listError) {
        if (listError.message.includes('relation "course_materials" does not exist')) {
          console.log('❌ course_materials table does not exist');
          console.log('💡 You need to create the table manually in your Supabase Dashboard');
          console.log('   Go to Table Editor > Create table > course_materials');
          console.log('   Follow the MANUAL_COURSE_MATERIALS_TABLE_SETUP.md guide');
          return;
        } else {
          console.log('❌ Table access error:', listError.message);
          return;
        }
      }
      
      console.log('✅ course_materials table exists and is accessible');
      
    } catch (error) {
      console.log('❌ Table access failed:', error.message);
      console.log('💡 The table may not exist or you may not have access');
      return;
    }
    
    // Step 3: Test table structure (try to insert a test record)
    console.log('\n3. Testing table structure...');
    const testMaterial = {
      course_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      title: 'Test Material',
      file_name: 'test.pdf',
      file_path: 'test/test.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      file_extension: 'pdf',
      category: 'general',
      uploaded_by: user.id
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('course_materials')
      .insert([testMaterial])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Table structure test failed:', insertError.message);
      
      if (insertError.message.includes('invalid input syntax for type uuid')) {
        console.log('💡 The table structure is incorrect');
        console.log('   The id column may not have gen_random_uuid() default');
        console.log('   Follow the MANUAL_COURSE_MATERIALS_TABLE_SETUP.md guide');
      } else if (insertError.message.includes('foreign key constraint')) {
        console.log('💡 Foreign key constraint error');
        console.log('   The course_id or uploaded_by references may be invalid');
      } else {
        console.log('💡 Different error - check your table structure');
      }
      return;
    }
    
    console.log('✅ Table structure test successful!');
    console.log('   Test material ID:', insertData.id);
    
    // Step 4: Clean up test record
    console.log('\n4. Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.log('⚠️ Failed to clean up test record:', deleteError.message);
    } else {
      console.log('✅ Test record cleaned up');
    }
    
    // Final result
    console.log('\n🎉 SUCCESS! Course materials table is working correctly!');
    console.log('✅ The table exists and has proper structure');
    console.log('✅ Course materials uploads should work in your application');
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the check
checkCourseMaterialsTable();
