// Rate Limit Reset Timer
console.log('⏰ Rate limit active - waiting for reset...');

const rateLimitTimer = () => {
  let minutes = 10; // Wait 10 minutes
  let seconds = minutes * 60;
  
  console.log(`🕐 Rate limit will reset in ${minutes} minutes`);
  console.log('⏳ Please wait before trying again...');
  
  const timer = setInterval(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (seconds > 0) {
      console.log(`⏰ Time remaining: ${mins}:${secs.toString().padStart(2, '0')}`);
      seconds--;
    } else {
      clearInterval(timer);
      console.log('✅ Rate limit should be reset now!');
      console.log('🔄 You can now try password reset again');
      console.log('📧 Make sure Supabase redirect URL is set to: /auth/reset-password');
    }
  }, 1000);
};

// Start the timer
rateLimitTimer();






