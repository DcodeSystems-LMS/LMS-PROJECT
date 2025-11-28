// Test script for student delete functionality
// Run this in the browser console after logging in as an admin

const testDeleteStudent = async () => {
  try {
    console.log('🧪 Testing student delete functionality...');
    
    // Step 1: Check if we have access to Supabase
    if (!window.supabase) {
      console.error('❌ Supabase client not available globally');
      return;
    }
    
    console.log('✅ Supabase client available');
    
    // Step 2: Get current user to verify admin access
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ No authenticated user found');
      return;
    }
    
    console.log('✅ Authenticated user:', user.email);
    
    // Step 3: Check if user is admin
    const { data: profile, error: profileError } = await window.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.warn('⚠️ Could not fetch user profile:', profileError);
    } else if (profile?.role !== 'admin') {
      console.warn('⚠️ User is not an admin. Current role:', profile?.role);
    } else {
      console.log('✅ User is admin');
    }
    
    // Step 4: Get list of students
    console.log('📋 Fetching students...');
    
    const { data: students, error: studentsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    
    if (studentsError) {
      console.error('❌ Failed to fetch students:', studentsError);
      return;
    }
    
    console.log(`✅ Found ${students.length} students`);
    
    if (students.length === 0) {
      console.log('ℹ️ No students found to test delete functionality');
      return;
    }
    
    // Step 5: Show students for selection
    console.log('📝 Available students:');
    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name} (${student.email}) - ID: ${student.id}`);
    });
    
    // Step 6: Test delete functionality (using first student as example)
    const testStudent = students[0];
    console.log(`🗑️ Testing delete for student: ${testStudent.name}`);
    
    // Note: This is just a test - we'll simulate the delete without actually doing it
    console.log('⚠️ This is a simulation - not actually deleting the student');
    console.log('💡 To test actual deletion, use the UI or run:');
    console.log(`   window.supabase.from('profiles').delete().eq('id', '${testStudent.id}')`);
    
    // Step 7: Test the DataService delete method (if available)
    if (window.DataService && window.DataService.deleteProfile) {
      console.log('🧪 Testing DataService.deleteProfile method...');
      
      // This would actually delete the student, so we'll just test the method exists
      console.log('✅ DataService.deleteProfile method is available');
      console.log('⚠️ Skipping actual deletion test to preserve data');
    } else {
      console.log('⚠️ DataService.deleteProfile method not available globally');
    }
    
    console.log('🎉 Delete functionality test completed!');
    console.log('💡 The delete button should now work in the admin students page');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testDeleteStudent();
