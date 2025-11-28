// Fix Profile 406 Error
// This script creates the missing user profile in the database

console.log('🔧 Fixing Profile 406 Error...');

const fixProfile406 = async () => {
  try {
    // Get the current user from Supabase Auth
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

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      console.log('📝 Profile not found, creating new profile...');
      
      // Create the missing profile
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
        console.error('❌ Error creating profile:', createError);
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

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
};

// Run the fix
fixProfile406();
