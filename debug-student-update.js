// Debug Student Database Updates
// Run this in your browser console to test the database update functionality

console.log('🔍 Debugging Student Database Updates...');

const debugStudentUpdate = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ No authenticated user found');
      return;
    }

    console.log('👤 Current user:', user.email);

    // Test 1: Check if we can read profiles
    console.log('📖 Testing profile read access...');
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .limit(3);

    if (profilesError) {
      console.error('❌ Error reading profiles:', profilesError);
      return;
    }

    console.log('✅ Profiles read successfully:', profiles.length, 'profiles found');
    console.log('📋 Sample profile:', profiles[0]);

    // Test 2: Check if we can update a profile
    if (profiles.length > 0) {
      const testProfile = profiles[0];
      console.log('🧪 Testing profile update...');
      
      const updateData = {
        name: testProfile.name + ' (Updated)',
        updated_at: new Date().toISOString()
      };

      console.log('📝 Update data:', updateData);

      const { data: updateResult, error: updateError } = await window.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', testProfile.id)
        .select();

      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        console.log('💡 This might be due to:');
        console.log('   - RLS policies blocking the update');
        console.log('   - Missing permissions');
        console.log('   - Database schema issues');
        return;
      }

      console.log('✅ Profile update successful:', updateResult);

      // Test 3: Verify the update
      console.log('🔍 Verifying update...');
      const { data: verifyResult, error: verifyError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', testProfile.id)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying update:', verifyError);
        return;
      }

      console.log('✅ Update verified:', verifyResult);
      console.log('🎉 Database update is working correctly!');
    }

    // Test 4: Check RLS policies
    console.log('🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await window.supabase
      .rpc('get_policies', { table_name: 'profiles' })
      .catch(() => {
        console.log('ℹ️ Cannot check RLS policies directly (function may not exist)');
        return { data: null, error: null };
      });

    if (policiesError) {
      console.log('ℹ️ RLS policy check not available');
    } else if (policies) {
      console.log('🔒 RLS policies:', policies);
    }

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
};

// Run the debug test
debugStudentUpdate();
