// Test Profile Creation Fix
// Run this in your browser console after deploying the updated files

console.log('🔧 Testing Profile Creation Fix...');

const testProfileCreation = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }

    if (!user) {
      console.log('❌ No user found. Please sign in first.');
      return;
    }

    console.log('👤 Current user:', user.email);

    // Try to get existing profile
    const { data: existingProfile, error: profileError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log('📝 Profile not found, attempting to create...');
      
      // Try to create profile
      const { data: newProfile, error: createError } = await window.supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'student',
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Profile creation failed:', createError);
        console.log('💡 This might be due to RLS policies. Run the SQL fix in Supabase dashboard.');
        return;
      }

      console.log('✅ Profile created successfully:', newProfile);
    } else if (profileError) {
      console.error('❌ Error checking profile:', profileError);
      return;
    } else {
      console.log('✅ Profile already exists:', existingProfile);
    }

    // Test profile access
    const { data: testProfile, error: testError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (testError) {
      console.error('❌ Profile access test failed:', testError);
    } else {
      console.log('✅ Profile access test successful:', testProfile);
    }

    // Test all profiles access (for admin)
    const { data: allProfiles, error: allProfilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (allProfilesError) {
      console.error('❌ All profiles access failed:', allProfilesError);
    } else {
      console.log('✅ All profiles access successful:', allProfiles.length, 'profiles found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testProfileCreation();
