// Test Course Materials Upload with Environment Variables
// This script tests the course materials functionality using the project's environment

import { createClient } from '@supabase/supabase-js';

// Use the environment variables from the template
const supabaseUrl = 'https://supabase.dcodesys.in';
const supabaseKey = 'eyJ0eXAiOiAiSldUIiwiYWxnIjogIkhTMjU2In0.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzYwNDM0ODIyLAogICJleHAiOiAxOTE4MTE0ODIyCn0.6TJ8-Qb52iax8Lo--Ks8MgC2V9A4EDLPuz2x4zl2_bI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCourseMaterialsUpload() {
  console.log('🧪 Testing Course Materials Upload...\n');
  
  try {
    // Step 1: Check authentication
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Not authenticated. Please sign in to your application first.');
      console.log('💡 Go to your app, sign in as a mentor, then run this test again.');
      return;
    }
    
    console.log('✅ Authenticated as:', user.email);
    
    // Step 2: Get a course to test with
    console.log('\n2. Getting a course to test with...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, instructor_id')
      .eq('instructor_id', user.id)
      .limit(1);
    
    if (coursesError || !courses || courses.length === 0) {
      console.log('❌ No courses found for this user');
      console.log('💡 Create a course first, then test material upload');
      return;
    }
    
    const testCourse = courses[0];
    console.log('✅ Found course:', testCourse.title);
    
    // Step 3: Test material upload with proper data
    console.log('\n3. Testing material upload...');
    const testMaterial = {
      course_id: testCourse.id,
      lesson_id: null, // Use null instead of a number
      title: `Test Material ${Date.now()}`,
      description: 'This is a test material',
      file_name: 'test-material.pdf',
      file_path: 'test/test-material.pdf',
      file_size: 1024,
      file_type: 'application/pdf',
      file_extension: 'pdf',
      category: 'general',
      uploaded_by: user.id
    };
    
    console.log('Uploading material with data:', testMaterial);
    
    const { data: materialData, error: materialError } = await supabase
      .from('course_materials')
      .insert([testMaterial])
      .select(`
        *,
        course:courses(*),
        uploadedBy:profiles(*)
      `)
      .single();
    
    if (materialError) {
      console.log('❌ Material upload failed:', materialError.message);
      
      if (materialError.message.includes('invalid input syntax for type uuid')) {
        console.log('💡 UUID format error');
        console.log('   Check that course_id and uploaded_by are valid UUIDs');
        console.log('   Course ID:', testCourse.id);
        console.log('   User ID:', user.id);
      } else if (materialError.message.includes('foreign key constraint')) {
        console.log('💡 Foreign key constraint error');
        console.log('   The course_id or uploaded_by references may be invalid');
      } else {
        console.log('💡 Different error - check your table structure');
      }
      return;
    }
    
    console.log('✅ Material upload successful!');
    console.log('   Material ID:', materialData.id);
    console.log('   Title:', materialData.title);
    console.log('   Course:', materialData.course?.title);
    
    // Step 4: Clean up test material
    console.log('\n4. Cleaning up test material...');
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', materialData.id);
    
    if (deleteError) {
      console.log('⚠️ Failed to clean up test material:', deleteError.message);
    } else {
      console.log('✅ Test material cleaned up');
    }
    
    // Final result
    console.log('\n🎉 SUCCESS! Course materials upload is working!');
    console.log('✅ The UUID error is resolved');
    console.log('✅ Course materials uploads should work in your application');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCourseMaterialsUpload();
