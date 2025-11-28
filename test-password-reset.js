// Test Password Reset Functionality
console.log('📧 Testing Password Reset...');

const testPasswordReset = async () => {
  try {
    console.log('🔄 Step 1: Sending password reset email...');
    
    const { data, error } = await window.supabase.auth.resetPasswordForEmail('admin@example.com', {
      redirectTo: window.location.origin + '/auth/reset-password'
    });
    
    if (error) {
      console.error('❌ Password reset failed:', error);
      console.log('💡 Possible issues:');
      console.log('   - Email configuration not set up');
      console.log('   - SMTP settings missing');
      console.log('   - Redirect URL not configured');
    } else {
      console.log('✅ Password reset email sent successfully');
      console.log('📧 Check your email inbox and spam folder');
      console.log('🔗 The reset link should redirect to: /auth/reset-password');
    }
    
    // Step 2: Check current authentication settings
    console.log('🔧 Step 2: Checking authentication configuration...');
    
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (session) {
      console.log('✅ Current session found:', session.user.email);
    } else {
      console.log('ℹ️ No current session - user not logged in');
    }
    
    // Step 3: Instructions for testing
    console.log('📋 Step 3: Testing Instructions:');
    console.log('1. Check your email for the reset link');
    console.log('2. Click the reset link');
    console.log('3. You should be redirected to: /auth/reset-password');
    console.log('4. Enter your new password');
    console.log('5. Test signing in with the new password');
    
  } catch (error) {
    console.error('❌ Password reset test failed:', error);
  }
};

// Run the test
testPasswordReset();






