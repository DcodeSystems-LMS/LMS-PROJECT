// Authentication Troubleshooting Script
console.log('🔐 Testing Authentication System...');

const testAuthentication = async () => {
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
    
    // Step 2: Check authentication configuration
    console.log('🔧 Step 2: Checking Authentication Configuration...');
    
    // Get current session
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (session) {
      console.log('✅ Current session found:', session.user.email);
    } else {
      console.log('ℹ️ No current session - user not logged in');
    }
    
    // Step 3: Test with known credentials
    console.log('🧪 Step 3: Testing Authentication with Sample Credentials...');
    
    // Try to sign in with a test account
    const testEmail = 'admin@example.com';
    const testPassword = 'admin123';
    
    console.log(`📧 Attempting to sign in with: ${testEmail}`);
    
    const { data: authData, error: authError } = await window.supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError);
      console.log('💡 Possible issues:');
      console.log('   - User does not exist in auth.users table');
      console.log('   - Password is incorrect');
      console.log('   - Email confirmation required');
      console.log('   - Authentication settings misconfigured');
      
      // Step 4: Check if user exists in profiles
      console.log('🔍 Step 4: Checking if user exists in profiles table...');
      
      const { data: profileData, error: profileError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('email', testEmail);
      
      if (profileError) {
        console.error('❌ Error checking profiles:', profileError);
      } else if (profileData && profileData.length > 0) {
        console.log('✅ User found in profiles table:', profileData[0]);
        console.log('💡 User exists in profiles but not in auth.users - this is the issue!');
      } else {
        console.log('❌ User not found in profiles table');
        console.log('💡 User needs to be created in both auth.users and profiles tables');
      }
      
    } else {
      console.log('✅ Authentication successful:', authData.user.email);
    }
    
    // Step 5: Check authentication settings
    console.log('⚙️ Step 5: Checking Authentication Settings...');
    
    // This would require admin access to check auth settings
    console.log('💡 To fix authentication issues:');
    console.log('   1. Go to Supabase Dashboard → Authentication → Users');
    console.log('   2. Check if the user exists in the auth.users table');
    console.log('   3. If not, create the user manually');
    console.log('   4. Or use the signup functionality to create new users');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
};

// Run the test
testAuthentication();






