// Authentication Test Script
// Run this in your browser console on https://app.dcodesys.in

const testAuthentication = async () => {
  console.log('🔐 Testing Supabase Authentication...');
  
  try {
    // Test 1: Check if Supabase client is loaded
    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase client not found');
      return;
    }
    console.log('✅ Supabase client loaded');
    
    // Test 2: Check current user
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    if (userError) {
      console.error('❌ User check error:', userError);
    } else {
      console.log('👤 Current user:', user ? user.email : 'Not logged in');
    }
    
    // Test 3: Check session
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Session check error:', sessionError);
    } else {
      console.log('🔑 Session:', session ? 'Active' : 'No session');
    }
    
    // Test 4: Test profiles access
    const { data: profiles, error: profilesError } = await window.supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles access error:', profilesError);
      console.log('Error details:', {
        code: profilesError.code,
        message: profilesError.message,
        details: profilesError.details,
        hint: profilesError.hint
      });
    } else {
      console.log('✅ Profiles access successful');
    }
    
    // Test 5: Try to sign up a test user (if not logged in)
    if (!user) {
      console.log('🧪 Testing sign up...');
      const { data: signUpData, error: signUpError } = await window.supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            name: 'Test User',
            role: 'student'
          }
        }
      });
      
      if (signUpError) {
        console.error('❌ Sign up error:', signUpError);
      } else {
        console.log('✅ Sign up successful:', signUpData);
      }
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
};

// Run the test
testAuthentication();
