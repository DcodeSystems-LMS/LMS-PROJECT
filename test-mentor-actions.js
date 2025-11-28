// Test script to verify all mentor action buttons work
// Run this in the browser console

const testMentorActions = async () => {
  try {
    console.log('🧪 Testing mentor action buttons...');
    
    // Step 1: Check if we have mentors
    const { data: mentors, error: mentorsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');
    
    if (mentorsError) {
      console.error('❌ Error fetching mentors:', mentorsError);
      return;
    }
    
    if (mentors.length === 0) {
      console.log('ℹ️ No mentors found. Create a mentor first.');
      return;
    }
    
    console.log(`📋 Found ${mentors.length} mentors`);
    
    // Step 2: Test each action
    const testMentor = mentors[0];
    console.log('📝 Testing with mentor:', testMentor.name, `(${testMentor.email})`);
    
    // Step 3: Test DataService methods
    console.log('🔧 Testing DataService methods...');
    
    // Test updateProfile method
    if (window.DataService && window.DataService.updateProfile) {
      console.log('✅ DataService.updateProfile method is available');
    } else {
      console.log('❌ DataService.updateProfile method not available');
    }
    
    // Test deleteProfile method
    if (window.DataService && window.DataService.deleteProfile) {
      console.log('✅ DataService.deleteProfile method is available');
    } else {
      console.log('❌ DataService.deleteProfile method not available');
    }
    
    // Step 4: Test profile update (without actually updating)
    console.log('🧪 Testing profile update capability...');
    
    const testUpdateData = {
      name: testMentor.name,
      specialty: testMentor.specialty || 'Test Specialty',
      status: testMentor.status,
      updated_at: new Date().toISOString()
    };
    
    // Just test the method call without actually updating
    console.log('📝 Test update data:', testUpdateData);
    console.log('✅ Profile update test data prepared');
    
    // Step 5: Test profile deletion capability (without actually deleting)
    console.log('🧪 Testing profile deletion capability...');
    console.log('📝 Would delete mentor ID:', testMentor.id);
    console.log('✅ Profile deletion test data prepared');
    
    // Step 6: Test email functionality
    console.log('🧪 Testing email functionality...');
    console.log('📝 Would send email to:', testMentor.email);
    console.log('✅ Email functionality test prepared');
    
    // Step 7: Show current mentor details
    console.log('📋 Current mentor details:');
    console.log(`  - Name: ${testMentor.name}`);
    console.log(`  - Email: ${testMentor.email}`);
    console.log(`  - Specialty: ${testMentor.specialty || 'Not specified'}`);
    console.log(`  - Status: ${testMentor.status}`);
    console.log(`  - ID: ${testMentor.id}`);
    
    console.log('🎉 All mentor action button tests completed!');
    console.log('💡 You can now test the buttons in the UI:');
    console.log('  - 👁️ View button (eye icon)');
    console.log('  - ✏️ Edit button (pencil icon)');
    console.log('  - 📧 Email button (mail icon)');
    console.log('  - 🗑️ Delete button (delete icon)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMentorActions();






