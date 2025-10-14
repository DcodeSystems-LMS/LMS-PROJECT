// Test Database Schema Extension
// Run this in your browser console after running the SQL script

console.log('🔧 Testing Database Schema Extension...');

const testSchemaExtension = async () => {
  try {
    // Test 1: Check if new columns exist by trying to select them
    const { data: testData, error: testError } = await window.supabase
      .from('profiles')
      .select('id, name, email, phone, address, student_status, progress')
      .limit(1);

    if (testError) {
      console.error('❌ Schema test failed:', testError);
      console.log('💡 The database schema has not been updated yet.');
      console.log('💡 Please run the SQL script in Supabase Dashboard first.');
      return;
    }

    console.log('✅ Schema test successful:', testData);
    console.log('✅ New columns exist in the database');

    // Test 2: Try updating a profile with new fields
    if (testData && testData.length > 0) {
      const profileId = testData[0].id;
      
      const { data: updateData, error: updateError } = await window.supabase
        .from('profiles')
        .update({
          phone: '+1 (555) 123-4567',
          address: 'Test Address',
          student_status: 'active',
          progress: 50,
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId)
        .select();

      if (updateError) {
        console.error('❌ Update test failed:', updateError);
        return;
      }

      console.log('✅ Update test successful:', updateData);
      console.log('🎉 All new fields can be updated successfully!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testSchemaExtension();
