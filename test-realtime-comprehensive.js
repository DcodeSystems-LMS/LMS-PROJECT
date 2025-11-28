// Comprehensive Real-time Synchronization Test
console.log('🔄 Testing Real-time Synchronization...');

const testRealtimeSync = async () => {
  try {
    console.log('📡 Step 1: Testing Supabase Connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await window.supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Step 2: Test real-time subscription
    console.log('📡 Step 2: Testing Real-time Subscription...');
    
    let realtimeReceived = false;
    const testChannel = window.supabase
      .channel('test-realtime-sync')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('📡 Real-time event received:', payload);
          realtimeReceived = true;
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active');
          
          // Step 3: Trigger an update
          console.log('📡 Step 3: Triggering Database Update...');
          triggerUpdate();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
          console.log('💡 This usually means:');
          console.log('   - Real-time replication is not enabled');
          console.log('   - RLS policies are blocking the subscription');
          console.log('   - Network connectivity issues');
        }
      });
    
    // Step 3: Trigger an update
    const triggerUpdate = async () => {
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

        // Update the profile
        const timestamp = Date.now();
        const updateData = {
          name: `Realtime Test ${timestamp}`,
          updated_at: new Date().toISOString()
        };

        console.log('📝 Update data:', updateData);

        const { data: updateResult, error: updateError } = await window.supabase
          .from('profiles')
          .update(updateData)
          .eq('id', testProfile.id)
          .select();

        if (updateError) {
          console.error('❌ Update failed:', updateError);
          return;
        }

        console.log('✅ Update successful:', updateResult);

        // Wait for real-time event
        console.log('⏳ Waiting for real-time event...');
        setTimeout(() => {
          if (realtimeReceived) {
            console.log('🎉 Real-time synchronization is working!');
            console.log('✅ The UI should update automatically');
          } else {
            console.log('⚠️ Real-time event not received');
            console.log('💡 Possible issues:');
            console.log('   - Real-time replication not enabled');
            console.log('   - RLS policies blocking updates');
            console.log('   - Network/firewall issues');
          }
          
          // Cleanup
          window.supabase.removeChannel(testChannel);
          console.log('🧹 Test channel cleaned up');
        }, 3000);

      } catch (error) {
        console.error('❌ Update test failed:', error);
      }
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testRealtimeSync();
