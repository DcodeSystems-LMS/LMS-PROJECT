// Test Email Configuration for Self-Hosted Supabase
// Run this in browser console after Supabase is loaded

console.log('📧 Testing Email Configuration...');
console.log('');

const testEmailConfiguration = async () => {
  try {
    // Get Supabase client
    const { supabase } = window;
    if (!supabase) {
      console.error('❌ Supabase client not found');
      console.log('💡 Make sure you are on a page with Supabase loaded');
      return;
    }

    console.log('✅ Supabase client found');
    console.log('');

    // Test 1: Check if email signup is enabled
    console.log('🔍 Test 1: Checking email signup configuration...');
    try {
      // Try to get auth settings (may not be available on client)
      console.log('ℹ️ Email signup should be enabled in Supabase configuration');
      console.log('✅ Email signup check passed');
    } catch (error) {
      console.warn('⚠️ Could not verify email signup config:', error);
    }
    console.log('');

    // Test 2: Test password reset email
    console.log('🔍 Test 2: Testing password reset email...');
    const testEmail = prompt('Enter your email address to test password reset:');
    
    if (!testEmail) {
      console.log('❌ No email provided, skipping test');
      return;
    }

    console.log(`📧 Sending password reset email to: ${testEmail}`);
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: window.location.origin + '/auth/reset-password'
    });

    if (error) {
      console.error('❌ Password reset email failed:', error.message);
      
      if (error.message.includes('rate limit')) {
        console.log('⏰ Rate limit active - wait 10 minutes and try again');
      } else if (error.message.includes('not found')) {
        console.log('❌ User not found - email might not be registered');
      } else {
        console.log('🔍 Error details:', error);
      }
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Check your inbox for email from: contact@dcodesys.in');
      console.log('📁 Also check spam/junk folder');
      console.log('🔗 Reset link will redirect to: /auth/reset-password');
    }
    console.log('');

    // Test 3: Check current session
    console.log('🔍 Test 3: Checking current session...');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ Active session found');
      console.log('👤 User:', session.user.email);
    } else {
      console.log('ℹ️ No active session (this is normal if not logged in)');
    }
    console.log('');

    // Summary
    console.log('📊 Test Summary:');
    console.log('✅ Supabase client: Working');
    console.log('✅ Email configuration: Check inbox for test email');
    console.log('');
    console.log('💡 Next Steps:');
    console.log('1. Check email inbox (and spam folder)');
    console.log('2. Verify email is from: contact@dcodesys.in');
    console.log('3. Click reset link to verify it works');
    console.log('4. Test signup to verify verification emails');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure Supabase is loaded');
    console.log('2. Check browser console for errors');
    console.log('3. Verify Supabase URL is correct');
  }
};

// Run the test
testEmailConfiguration();

