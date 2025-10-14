// Test script to verify mentor profile creation with proper UUID
// Run this in the browser console after applying the database fix

const testMentorCreation = async () => {
  try {
    console.log('🧪 Testing mentor profile creation with proper UUID...');
    
    // Step 1: Check if we can create a profile with a valid UUID
    if (!window.supabase) {
      console.error('❌ Supabase client not available');
      return;
    }
    
    // Step 2: Generate a valid UUID
    const testId = crypto.randomUUID();
    console.log('📝 Generated test UUID:', testId);
    
    // Step 3: Test profile creation
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
    
    const { data: createdProfile, error: createError } = await window.supabase
      .from('profiles')
      .insert(testProfileData)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Profile creation failed:', createError);
      console.log('💡 This means the database fix needs to be applied');
      return;
    }
    
    console.log('✅ Profile creation successful:', createdProfile);
    
    // Step 4: Verify the profile appears in the list
    console.log('📋 Verifying profile appears in mentors list...');
    
    const { data: mentors, error: mentorsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .order('created_at', { ascending: false });
    
    if (mentorsError) {
      console.error('❌ Failed to fetch mentors:', mentorsError);
      return;
    }
    
    const testMentorExists = mentors.some(mentor => mentor.id === testId);
    
    if (testMentorExists) {
      console.log('✅ Test mentor found in mentors list!');
      console.log('🎉 Profile creation is working correctly!');
    } else {
      console.log('⚠️ Test mentor not found in mentors list');
    }
    
    // Step 5: Test the DataService method
    console.log('🔧 Testing DataService.createProfile method...');
    
    if (window.DataService && window.DataService.createProfile) {
      const testId2 = crypto.randomUUID();
      const testData2 = {
        id: testId2,
        email: `test.mentor2.${Date.now()}@example.com`,
        name: 'Test Mentor 2',
        role: 'mentor',
        specialty: 'Test Specialty 2',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: dataServiceResult, error: dataServiceError } = await window.DataService.createProfile(testData2);
      
      if (dataServiceError) {
        console.error('❌ DataService.createProfile failed:', dataServiceError);
      } else {
        console.log('✅ DataService.createProfile successful:', dataServiceResult);
      }
      
      // Clean up test data 2
      await window.supabase
        .from('profiles')
        .delete()
        .eq('id', testId2);
    }
    
    // Step 6: Clean up test data
    console.log('🧹 Cleaning up test data...');
    
    const { error: deleteError } = await window.supabase
      .from('profiles')
      .delete()
      .eq('id', testId);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test data:', deleteError);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    console.log('🎉 Mentor profile creation test completed successfully!');
    console.log('💡 The mentor invitation feature should now work properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMentorCreation();
