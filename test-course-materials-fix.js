// Test script to verify course materials upload fix
// Run this after applying the SQL fix

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://supabase.dcodesys.in';
const supabaseKey = 'your-anon-key-here'; // Replace with actual key

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCourseMaterialsUpload() {
  try {
    console.log('🧪 Testing Course Materials Upload Fix...\n');

    // Step 1: Check if table exists and has correct schema
    console.log('1. Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'course_materials')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
      return;
    }

    console.log('✅ Table structure:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Step 2: Test a simple insert with lesson_id as integer
    console.log('\n2. Testing insert with lesson_id as integer...');
    
    // Create a test file (simulate file upload)
    const testFile = new File(['test content'], 'test-material.pdf', { type: 'application/pdf' });
    
    // Test the upload function
    const testUpload = async () => {
      try {
        // Get a test course ID (you'll need to replace this with an actual course ID)
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id')
          .limit(1);

        if (coursesError || !courses || courses.length === 0) {
          console.log('⚠️  No courses found. Please create a course first.');
          return;
        }

        const courseId = courses[0].id;
        console.log(`   Using course ID: ${courseId}`);

        // Test the insert with lesson_id as integer (this should work now)
        const { data, error } = await supabase
          .from('course_materials')
          .insert({
            course_id: courseId,
            lesson_id: 1, // This should work now (INTEGER)
            title: 'Test Material',
            description: 'Test Description',
            file_name: 'test-material.pdf',
            file_path: 'course-materials/test/test-material.pdf',
            file_size: 1024,
            file_type: 'application/pdf',
            file_extension: 'pdf',
            category: 'general',
            is_public: true,
            uploaded_by: 'test-user-id' // You'll need to replace this with actual user ID
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Insert failed:', error);
          return;
        }

        console.log('✅ Insert successful!');
        console.log('   Material ID:', data.id);
        console.log('   Lesson ID:', data.lesson_id);
        console.log('   Title:', data.title);

        // Clean up test data
        await supabase
          .from('course_materials')
          .delete()
          .eq('id', data.id);

        console.log('✅ Test data cleaned up');

      } catch (error) {
        console.error('❌ Test failed:', error);
      }
    };

    await testUpload();

    // Step 3: Test with null lesson_id
    console.log('\n3. Testing insert with null lesson_id...');
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .limit(1);

      if (courses && courses.length > 0) {
        const { data, error } = await supabase
          .from('course_materials')
          .insert({
            course_id: courses[0].id,
            lesson_id: null, // This should also work
            title: 'Test Material (No Lesson)',
            description: 'Test Description',
            file_name: 'test-material-2.pdf',
            file_path: 'course-materials/test/test-material-2.pdf',
            file_size: 1024,
            file_type: 'application/pdf',
            file_extension: 'pdf',
            category: 'general',
            is_public: true,
            uploaded_by: 'test-user-id'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Null lesson_id insert failed:', error);
        } else {
          console.log('✅ Null lesson_id insert successful!');
          
          // Clean up
          await supabase
            .from('course_materials')
            .delete()
            .eq('id', data.id);
        }
      }
    } catch (error) {
      console.error('❌ Null lesson_id test failed:', error);
    }

    console.log('\n🎉 Course Materials Upload Fix Test Complete!');
    console.log('\nIf all tests passed, the UUID error should be resolved.');
    console.log('You can now upload course materials with lesson IDs.');

  } catch (error) {
    console.error('❌ Test script failed:', error);
  }
}

// Run the test
testCourseMaterialsUpload();
