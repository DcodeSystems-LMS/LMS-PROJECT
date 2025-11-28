// Test script to verify mentor edit functionality
// Run this in the browser console

const testMentorEdit = async () => {
  try {
    console.log('🧪 Testing mentor edit functionality...');
    
    // Step 1: Check if we have mentors to edit
    const { data: mentors, error: mentorsError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor');
    
    if (mentorsError) {
      console.error('❌ Error fetching mentors:', mentorsError);
      return;
    }
    
    if (mentors.length === 0) {
      console.log('ℹ️ No mentors found. Create a mentor first.');
      return;
    }
    
    console.log(`📋 Found ${mentors.length} mentors`);
    
    // Step 2: Test updating the first mentor
    const testMentor = mentors[0];
    console.log('📝 Testing with mentor:', testMentor.name, `(${testMentor.email})`);
    
    // Step 3: Test DataService.updateProfile method
    if (window.DataService && window.DataService.updateProfile) {
      console.log('🔧 Testing DataService.updateProfile method...');
      
      const updateData = {
        name: testMentor.name + ' (Updated)',
        specialty: testMentor.specialty || 'Test Specialty',
        status: 'active',
        updated_at: new Date().toISOString()
      };
      
      console.log('📝 Update data:', updateData);
      
      const { data: updateResult, error: updateError } = await window.DataService.updateProfile(testMentor.id, updateData);
      
      if (updateError) {
        console.error('❌ DataService.updateProfile failed:', updateError);
        console.log('💡 This explains why mentor editing is not working');
      } else {
        console.log('✅ DataService.updateProfile successful:', updateResult);
        
        // Step 4: Verify the update
        console.log('🔍 Verifying update...');
        
        const { data: verifyData, error: verifyError } = await window.supabase
          .from('profiles')
          .select('*')
          .eq('id', testMentor.id)
          .single();
        
        if (verifyError) {
          console.error('❌ Verification failed:', verifyError);
        } else {
          console.log('✅ Update verified:', verifyData);
          
          // Check if the name was updated
          if (verifyData.name.includes('(Updated)')) {
            console.log('🎉 Mentor edit functionality is working correctly!');
            
            // Revert the test change
            console.log('🔄 Reverting test change...');
            const { error: revertError } = await window.DataService.updateProfile(testMentor.id, {
              name: testMentor.name,
              specialty: testMentor.specialty,
              status: testMentor.status,
              updated_at: new Date().toISOString()
            });
            
            if (revertError) {
              console.warn('⚠️ Could not revert test change:', revertError);
            } else {
              console.log('✅ Test change reverted successfully');
            }
          } else {
            console.log('⚠️ Update did not persist correctly');
          }
        }
      }
    } else {
      console.log('⚠️ DataService.updateProfile method not available');
    }
    
    console.log('🎉 Mentor edit test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMentorEdit();






