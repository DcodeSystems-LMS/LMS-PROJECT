// Immediate Password Reset Test
// Run this in your browser console to test password reset

console.log('🚀 Testing Password Reset Email Functionality...');

const testPasswordResetImmediate = async () => {
  try {
    // Check if Supabase is available
    if (!window.supabase) {
      console.error('❌ Supabase not available. Make sure you are on your app page.');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Test with your actual email address
    const testEmail = prompt('Enter your email address to test password reset:');
    if (!testEmail) {
      console.log('❌ No email provided');
      return;
    }
    
    console.log(`📧 Testing password reset for: ${testEmail}`);
    
    const { data, error } = await window.supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: window.location.origin + '/auth/reset-password'
    });
    
    if (error) {
      console.error('❌ Password reset failed:', error.message);
      
      if (error.message.includes('rate limit')) {
        console.log('⏰ Rate limit active - wait 10 minutes and try again');
      } else if (error.message.includes('User not found')) {
        console.log('❌ User not found - make sure this email is registered');
      } else if (error.message.includes('email')) {
        console.log('📧 Email configuration issue - check SMTP settings in Supabase Dashboard');
        console.log('💡 Go to Authentication → Settings → SMTP and configure email provider');
      } else {
        console.log('🔍 Unknown error - check Supabase configuration');
      }
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Check your email inbox and spam folder');
      console.log('🔗 Reset link will redirect to: /auth/reset-password');
      console.log('⏰ Email may take a few minutes to arrive');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testPasswordResetImmediate();
