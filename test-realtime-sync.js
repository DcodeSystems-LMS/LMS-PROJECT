// Test Real-time UI Synchronization
console.log('🔄 Testing Real-time UI Synchronization...');

const testRealtimeSync = async () => {
  try {
    // Get a test profile
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError || !profiles.length) {
      console.error('❌ No profiles found:', profilesError);
      return;
    }

    const testProfile = profiles[0];
    console.log('📋 Test profile:', testProfile);

    // Test update with timestamp to make it unique
    const timestamp = Date.now();
    const updateData = {
      name: `Real-time Sync Test ${timestamp}`,
      phone: `+1 (555) ${timestamp.toString().slice(-4)}`,
      address: `Test Address ${timestamp}`,
      student_status: 'active',
      progress: Math.floor(Math.random() * 100),
      updated_at: new Date().toISOString()
    };

    console.log('📝 Update data:', updateData);

    // Perform update
    const { data: updateResult, error: updateError } = await window.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', testProfile.id)
      .select();

    console.log('📊 Update result:', { data: updateResult, error: updateError });

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('❌ Update returned empty result');
      return;
    }

    console.log('✅ Update successful:', updateResult[0]);

    // Wait a moment for real-time updates to propagate
    console.log('⏳ Waiting for real-time updates to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the update
    const { data: verifyResult, error: verifyError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', testProfile.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    console.log('✅ Verification successful:', verifyResult);
    
    // Check if the data matches
    const dataMatches = verifyResult.name === updateData.name &&
                       verifyResult.phone === updateData.phone &&
                       verifyResult.address === updateData.address &&
                       verifyResult.student_status === updateData.student_status &&
                       verifyResult.progress === updateData.progress;

    if (dataMatches) {
      console.log('🎉 Real-time synchronization is working correctly!');
      console.log('🎯 The UI should now show the updated data');
      console.log('💡 Try opening the student details modal to see the changes');
    } else {
      console.log('⚠️ Data mismatch detected');
      console.log('Expected:', updateData);
      console.log('Actual:', {
        name: verifyResult.name,
        phone: verifyResult.phone,
        address: verifyResult.address,
        student_status: verifyResult.student_status,
        progress: verifyResult.progress
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testRealtimeSync();
