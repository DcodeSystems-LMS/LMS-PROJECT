// Test Add Student Functionality
console.log('🧪 Testing Add Student Functionality...');

const testAddStudent = async () => {
  try {
    console.log('📝 Step 1: Testing Database Insert...');
    
    // Generate test student data
    const testStudent = {
      name: `Test Student ${Date.now()}`,
      email: `teststudent${Date.now()}@example.com`,
      phone: '+1 (555) 123-4567',
      address: '123 Test Street, Test City, TC 12345',
      course: 'Full Stack Development',
      emergencyContact: 'Emergency Contact: +1 (555) 987-6543'
    };

    console.log('📋 Test student data:', testStudent);

    // Generate UUID for the student
    const studentId = crypto.randomUUID();
    console.log('🆔 Generated student ID:', studentId);

    // Test database insert directly
    const { data, error } = await window.supabase
      .from('profiles')
      .insert({
        id: studentId,
        name: testStudent.name,
        email: testStudent.email,
        phone: testStudent.phone,
        address: testStudent.address,
        role: 'student',
        student_status: 'active',
        progress: 0,
        course_id: null,
        join_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    console.log('📊 Insert result:', { data, error });

    if (error) {
      console.error('❌ Insert failed:', error);
      console.log('💡 Possible issues:');
      console.log('   - RLS policies blocking insert');
      console.log('   - Missing required fields');
      console.log('   - Database schema issues');
      return;
    }

    console.log('✅ Student inserted successfully:', data);

    // Step 2: Verify the student was created
    console.log('🔍 Step 2: Verifying student creation...');
    
    const { data: verifyData, error: verifyError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('✅ Student verification successful:', verifyData);

    // Step 3: Test if student appears in the list
    console.log('📋 Step 3: Checking if student appears in profiles list...');
    
    const { data: allProfiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Failed to fetch profiles:', profilesError);
      return;
    }

    const studentExists = allProfiles.some(profile => profile.id === studentId);
    
    if (studentExists) {
      console.log('✅ Student found in profiles list!');
      console.log('🎉 Add Student functionality is working correctly!');
      console.log('💡 The new student should appear in the UI automatically via real-time updates');
    } else {
      console.log('⚠️ Student not found in profiles list');
      console.log('💡 This might indicate a real-time sync issue');
    }

    // Step 4: Clean up test data (optional)
    console.log('🧹 Step 4: Cleaning up test data...');
    
    const { error: deleteError } = await window.supabase
      .from('profiles')
      .delete()
      .eq('id', studentId);

    if (deleteError) {
      console.warn('⚠️ Could not clean up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testAddStudent();
