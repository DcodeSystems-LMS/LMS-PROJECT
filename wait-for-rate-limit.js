// Wait and Retry Password Reset
console.log('⏰ Rate limit detected - waiting before retry...');

const waitAndRetryPasswordReset = async () => {
  try {
    // Wait 5 minutes (300 seconds) before retrying
    console.log('🕐 Waiting 5 minutes for rate limit to reset...');
    console.log('⏳ Please wait and try again in a few minutes');
    
    // Show countdown
    let seconds = 300;
    const countdown = setInterval(() => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      console.log(`⏰ Time remaining: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
      seconds--;
      
      if (seconds < 0) {
        clearInterval(countdown);
        console.log('✅ Rate limit should be reset now!');
        console.log('🔄 You can now try the password reset again');
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the wait function
waitAndRetryPasswordReset();






