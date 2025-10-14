// Test script to verify mentor profile creation
// Run this in the browser console after creating a mentor

const testMentorProfileCreation = async () => {
  try {
    console.log('🧪 Testing mentor profile creation...');
    
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
    
    // Step 4: Get list of mentors
    console.log('📋 Fetching mentors...');
    
    const { data: mentors, error: mentorsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .order('created_at', { ascending: false });
    
    if (mentorsError) {
      console.error('❌ Failed to fetch mentors:', mentorsError);
      return;
    }
    
    console.log(`✅ Found ${mentors.length} mentors`);
    
    if (mentors.length === 0) {
      console.log('ℹ️ No mentors found. Try creating a mentor first.');
      return;
    }
    
    // Step 5: Show mentors for verification
    console.log('📝 Current mentors:');
    mentors.forEach((mentor, index) => {
      console.log(`${index + 1}. ${mentor.name} (${mentor.email}) - ID: ${mentor.id}`);
      console.log(`   Role: ${mentor.role}, Specialty: ${mentor.specialty || 'Not set'}, Status: ${mentor.status || 'Not set'}`);
    });
    
    // Step 6: Test profile creation manually
    console.log('🧪 Testing manual profile creation...');
    
    if (window.DataService && window.DataService.createProfile) {
      console.log('✅ DataService.createProfile method is available');
      
      // Test data for a new mentor
      const testMentorData = {
        id: `test-${Date.now()}`,
        email: `test.mentor.${Date.now()}@example.com`,
        name: 'Test Mentor',
        role: 'mentor',
        specialty: 'Test Specialty',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Test mentor data:', testMentorData);
      
      // Test creating a mentor profile
      const { data, error } = await window.DataService.createProfile(testMentorData);
      
      if (error) {
        console.error('❌ Error creating test mentor:', error);
        console.log('💡 This suggests there are still database issues');
        return;
      }
      
      console.log('✅ Test mentor created successfully:', data);
      
      // Step 7: Verify the mentor appears in the list
      console.log('📋 Verifying mentor appears in profiles list...');
      
      const { data: updatedMentors, error: updatedMentorsError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .order('created_at', { ascending: false });
      
      if (updatedMentorsError) {
        console.error('❌ Failed to fetch updated mentors:', updatedMentorsError);
        return;
      }
      
      const testMentorExists = updatedMentors.some(mentor => mentor.email === testMentorData.email);
      
      if (testMentorExists) {
        console.log('✅ Test mentor found in mentors list!');
        console.log('🎉 Profile creation is working correctly!');
      } else {
        console.log('⚠️ Test mentor not found in mentors list');
        console.log('💡 This suggests the profile creation is not working');
      }
      
      // Step 8: Clean up test data
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
    
    console.log('🎉 Mentor profile creation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMentorProfileCreation();
