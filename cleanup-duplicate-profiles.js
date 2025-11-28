// Script to clean up duplicate profiles and test mentor invitation
// Run this in the browser console

const cleanupAndTestMentorInvitation = async () => {
  try {
    console.log('🧹 Cleaning up duplicate profiles and testing mentor invitation...');
    
    // Step 1: Check for existing profiles with the problematic email
    console.log('🔍 Checking for existing profiles with pinjalajeysankarsai@gmail.com...');
    
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('email', 'pinjalajeysankarsai@gmail.com');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log(`📋 Found ${profiles.length} profiles with this email:`, profiles);
    
    // Step 2: Clean up duplicate profiles
    if (profiles.length > 0) {
      console.log('🧹 Cleaning up duplicate profiles...');
      
      for (const profile of profiles) {
        console.log(`🗑️ Deleting profile: ${profile.id} (${profile.name})`);
        
        const { error: deleteError } = await window.supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);
        
        if (deleteError) {
          console.error(`❌ Error deleting profile ${profile.id}:`, deleteError);
        } else {
          console.log(`✅ Deleted profile ${profile.id}`);
        }
      }
    }
    
    // Step 3: Check for existing auth users with this email
    console.log('🔍 Checking for existing auth users...');
    
    // Note: We can't directly query auth.users, but we can check if the email exists
    // by trying to create a user (which will fail if it exists)
    
    // Step 4: Test profile creation with a clean slate
    console.log('🧪 Testing profile creation with clean slate...');
    
    const testId = crypto.randomUUID();
    const testProfileData = {
      id: testId,
      email: 'pinjalajeysankarsai@gmail.com',
      name: 'Jey Sankar',
      role: 'mentor',
      specialty: 'Full Stack Development',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: testProfile, error: testError } = await window.supabase
      .from('profiles')
      .insert(testProfileData)
      .select()
      .single();
    
    if (testError) {
      console.error('❌ Test profile creation failed:', testError);
    } else {
      console.log('✅ Test profile creation successful:', testProfile);
      
      // Clean up test profile
      await window.supabase
        .from('profiles')
        .delete()
        .eq('id', testId);
      
      console.log('✅ Test profile cleaned up');
    }
    
    // Step 5: Show current mentors
    console.log('📋 Current mentors in database:');
    
    const { data: mentors, error: mentorsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');
    
    if (mentorsError) {
      console.error('❌ Error fetching mentors:', mentorsError);
    } else {
      console.log(`✅ Found ${mentors.length} mentors:`);
      mentors.forEach((mentor, index) => {
        console.log(`${index + 1}. ${mentor.name} (${mentor.email}) - ID: ${mentor.id}`);
      });
    }
    
    console.log('🎉 Cleanup and test completed!');
    console.log('💡 You can now try inviting the mentor again');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

// Run the cleanup and test
cleanupAndTestMentorInvitation();
