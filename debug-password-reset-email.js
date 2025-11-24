// Debug Password Reset Email Issue
console.log('🔍 Debugging Password Reset Email Issue...');

const debugPasswordReset = async () => {
  try {
    console.log('📧 Step 1: Testing Supabase connection...');
    
    // Check if Supabase is available
    if (typeof window === 'undefined' || !window.supabase) {
      console.error('❌ Supabase client not available in browser');
      console.log('💡 Make sure you are running this in the browser console');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Test basic connection
    const { data: { session }, error: sessionError } = await window.supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else {
      console.log('✅ Authentication system accessible');
      console.log('Current session:', session ? 'User logged in' : 'No session');
    }
    
    console.log('📧 Step 2: Testing password reset email...');
    
    // Test with a sample email
    const testEmail = 'test@example.com';
    console.log(`Testing password reset for: ${testEmail}`);
    
    const { data, error } = await window.supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: window.location.origin + '/auth/reset-password'
    });
    
    if (error) {
      console.error('❌ Password reset failed:', error);
      console.log('🔍 Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText
      });
      
      // Check for specific error types
      if (error.message.includes('rate limit')) {
        console.log('⏰ Rate limit detected - this is normal for testing');
        console.log('💡 Solutions:');
        console.log('   1. Wait 10 minutes and try again');
        console.log('   2. Use Supabase Dashboard → Authentication → Users');
        console.log('   3. Find the user and click "Send password reset email"');
      } else if (error.message.includes('User not found')) {
        console.log('❌ User not found in database');
        console.log('💡 Solutions:');
        console.log('   1. Check if the email is correct');
        console.log('   2. User might need to sign up first');
        console.log('   3. Check Supabase Dashboard → Authentication → Users');
      } else if (error.message.includes('email')) {
        console.log('📧 Email configuration issue detected');
        console.log('💡 Solutions:');
        console.log('   1. Check SMTP configuration in Supabase Dashboard');
        console.log('   2. Go to Authentication → Settings → SMTP');
        console.log('   3. Configure your email provider (Gmail, SendGrid, etc.)');
      } else {
        console.log('🔍 Unknown error - checking configuration...');
        console.log('💡 Possible issues:');
        console.log('   1. Supabase project not properly configured');
        console.log('   2. Email service not set up');
        console.log('   3. Authentication settings incorrect');
      }
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Check your email inbox and spam folder');
      console.log('🔗 Reset link will redirect to: /auth/reset-password');
      console.log('⏰ The email may take a few minutes to arrive');
    }
    
    console.log('🔧 Step 3: Checking Supabase configuration...');
    
    // Check current URL and configuration
    console.log('Current URL:', window.location.origin);
    console.log('Redirect URL:', window.location.origin + '/auth/reset-password');
    
    // Check if we're using the correct Supabase instance
    const supabaseUrl = window.supabase.supabaseUrl;
    console.log('Supabase URL:', supabaseUrl);
    
    if (supabaseUrl.includes('supabase.dcodesys.in')) {
      console.log('✅ Using self-hosted Supabase instance');
    } else if (supabaseUrl.includes('supabase.co')) {
      console.log('✅ Using Supabase cloud instance');
    } else {
      console.log('⚠️ Using custom Supabase instance');
    }
    
    console.log('📋 Step 4: Troubleshooting checklist...');
    console.log('1. ✅ Supabase client is working');
    console.log('2. ✅ Authentication system is accessible');
    console.log('3. ❓ Email configuration needs to be checked');
    console.log('4. ❓ SMTP settings need to be verified');
    
    console.log('💡 Next steps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Authentication → Settings');
    console.log('3. Check SMTP configuration');
    console.log('4. If not configured, set up email provider');
    console.log('5. Test with a real email address');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  }
};

// Run the debug script
debugPasswordReset();
