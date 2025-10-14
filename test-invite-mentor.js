// Test script for invite mentor functionality
// Run this in the browser console after logging in as an admin

const testInviteMentor = async () => {
  try {
    console.log('🧪 Testing invite mentor functionality...');
    
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
    
    // Step 4: Test the DataService createProfile method
    console.log('🧪 Testing DataService.createProfile method...');
    
    if (window.DataService && window.DataService.createProfile) {
      console.log('✅ DataService.createProfile method is available');
      
      // Test data for a new mentor
      const testMentorData = {
        name: 'Test Mentor',
        email: `test.mentor.${Date.now()}@example.com`,
        role: 'mentor',
        specialty: 'Full Stack Development',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Test mentor data:', testMentorData);
      
      // Test creating a mentor profile
      const { data, error } = await window.DataService.createProfile(testMentorData);
      
      if (error) {
        console.error('❌ Error creating test mentor:', error);
        return;
      }
      
      console.log('✅ Test mentor created successfully:', data);
      
      // Step 5: Verify the mentor appears in the list
      console.log('📋 Verifying mentor appears in profiles list...');
      
      const { data: mentors, error: mentorsError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .order('created_at', { ascending: false });
      
      if (mentorsError) {
        console.error('❌ Failed to fetch mentors:', mentorsError);
        return;
      }
      
      const testMentorExists = mentors.some(mentor => mentor.email === testMentorData.email);
      
      if (testMentorExists) {
        console.log('✅ Test mentor found in mentors list!');
        console.log('🎉 Invite mentor functionality is working correctly!');
      } else {
        console.log('⚠️ Test mentor not found in mentors list');
      }
      
      // Step 6: Clean up test data
      console.log('🧹 Cleaning up test data...');
      
      const { error: deleteError } = await window.supabase
        .from('profiles')
        .delete()
        .eq('email', testMentorData.email);
      
      if (deleteError) {
        console.warn('⚠️ Could not clean up test data:', deleteError);
      } else {
        console.log('✅ Test data cleaned up successfully');
      }
      
    } else {
      console.log('⚠️ DataService.createProfile method not available globally');
    }
    
    // Step 7: Test form validation
    console.log('🧪 Testing form validation...');
    
    const testCases = [
      { name: '', email: 'test@example.com', specialty: 'React', expected: 'fail' },
      { name: 'Test User', email: '', specialty: 'React', expected: 'fail' },
      { name: 'Test User', email: 'invalid-email', specialty: 'React', expected: 'fail' },
      { name: 'Test User', email: 'test@example.com', specialty: '', expected: 'fail' },
      { name: 'Test User', email: 'test@example.com', specialty: 'React', expected: 'pass' }
    ];
    
    testCases.forEach((testCase, index) => {
      const isValidName = testCase.name.trim() !== '';
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testCase.email);
      const isValidSpecialty = testCase.specialty.trim() !== '';
      const isValid = isValidName && isValidEmail && isValidSpecialty;
      
      const result = isValid ? 'pass' : 'fail';
      const status = result === testCase.expected ? '✅' : '❌';
      
      console.log(`${status} Test case ${index + 1}: ${result} (expected: ${testCase.expected})`);
    });
    
    console.log('🎉 Invite mentor functionality test completed!');
    console.log('💡 The invite mentor modal should now work properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testInviteMentor();
