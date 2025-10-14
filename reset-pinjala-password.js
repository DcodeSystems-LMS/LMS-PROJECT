// Password Reset for pinjalajeysankarsair@gmail.com
console.log('📧 Resetting password for pinjalajeysankarsair@gmail.com...');

const resetPasswordForPinjala = async () => {
  try {
    console.log('🔄 Step 1: Sending password reset email...');
    console.log('📧 Email: pinjalajeysankarsair@gmail.com');
    console.log('🔗 Redirect URL:', window.location.origin + '/auth/reset-password');
    
    const { data, error } = await window.supabase.auth.resetPasswordForEmail('pinjalajeysankarsair@gmail.com', {
      redirectTo: window.location.origin + '/auth/reset-password'
    });
    
    if (error) {
      if (error.message.includes('rate limit')) {
        console.log('⏰ Rate limit active - this is normal');
        console.log('💡 Solutions:');
        console.log('   1. Wait 10 minutes and try again');
        console.log('   2. Use Supabase Dashboard → Authentication → Users');
        console.log('   3. Find pinjalajeysankarsair@gmail.com and click "Send password reset email"');
        console.log('   4. Or try with a different email address');
      } else if (error.message.includes('User not found')) {
        console.log('❌ User not found in database');
        console.log('💡 Solutions:');
        console.log('   1. Check if the email is correct');
        console.log('   2. User might need to sign up first');
        console.log('   3. Check Supabase Dashboard → Authentication → Users');
      } else {
        console.error('❌ Password reset failed:', error);
      }
    } else {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Check pinjalajeysankarsair@gmail.com inbox and spam folder');
      console.log('🔗 Reset link will redirect to: /auth/reset-password');
      console.log('⏰ The email may take a few minutes to arrive');
    }
    
    // Step 2: Check if user exists in database
    console.log('🔍 Step 2: Checking if user exists...');
    
    try {
      const { data: users, error: userError } = await window.supabase.auth.admin.listUsers();
      
      if (userError) {
        console.log('⚠️  Could not check users (admin access required)');
      } else {
        const user = users.users.find(u => u.email === 'pinjalajeysankarsair@gmail.com');
        if (user) {
          console.log('✅ User found in authentication system');
          console.log('👤 User ID:', user.id);
          console.log('📅 Created:', user.created_at);
        } else {
          console.log('❌ User not found in authentication system');
          console.log('💡 User needs to sign up first');
        }
      }
    } catch (checkError) {
      console.log('⚠️  Could not check user existence (normal for client-side)');
    }
    
    // Step 3: Instructions
    console.log('📋 Step 3: Next Steps:');
    console.log('1. Check email inbox and spam folder');
    console.log('2. Click the reset link in the email');
    console.log('3. You will be redirected to: /auth/reset-password');
    console.log('4. Enter your new password');
    console.log('5. Test signing in with the new password');
    
  } catch (error) {
    console.error('❌ Password reset test failed:', error);
  }
};

// Run the password reset
resetPasswordForPinjala();






