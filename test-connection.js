// Test Supabase Connection
// Run this in your browser console on https://app.dcodesys.in

// Test basic connection
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if Supabase client is loaded
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase client not found');
      return;
    }
    
    // Test 2: Try to fetch profiles
    const { data, error } = await window.supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database error:', error);
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Database connection successful');
    }
    
    // Test 3: Check authentication
    const { data: { user } } = await window.supabase.auth.getUser();
    console.log('Current user:', user ? 'Logged in' : 'Not logged in');
    
  } catch (err) {
    console.error('❌ Connection test failed:', err);
  }
};

// Run the test
testConnection();
