// Quick test to verify DataService.createProfile is working
// Run this in the browser console

const testDataServiceCreateProfile = async () => {
  try {
    console.log('🧪 Testing DataService.createProfile method...');
    
    // Check if DataService is available
    if (!window.DataService) {
      console.error('❌ DataService not available globally');
      return;
    }
    
    if (!window.DataService.createProfile) {
      console.error('❌ DataService.createProfile method not available');
      return;
    }
    
    console.log('✅ DataService.createProfile method is available');
    
    // Generate test data
    const testId = crypto.randomUUID();
    const testProfileData = {
      id: testId,
      email: `test.mentor.${Date.now()}@example.com`,
      name: 'Test Mentor',
      role: 'mentor',
      specialty: 'Test Specialty',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Test profile data:', testProfileData);
    
    // Test the method
    const result = await window.DataService.createProfile(testProfileData);
    
    console.log('📊 DataService result:', result);
    
    if (result.error) {
      console.error('❌ DataService.createProfile failed:', result.error);
      console.log('💡 This explains why mentor invitation is failing');
    } else {
      console.log('✅ DataService.createProfile successful:', result.data);
      
      // Clean up test data
      await window.supabase
        .from('profiles')
        .delete()
        .eq('id', testId);
      
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testDataServiceCreateProfile();
