// Rate Limit Timer - Wait for reset
console.log('⏰ Rate limit active - waiting for reset...');

const rateLimitTimer = () => {
  let minutes = 15; // Wait 15 minutes
  let seconds = minutes * 60;
  
  console.log(`🕐 Rate limit will reset in ${minutes} minutes`);
  console.log('⏳ Please wait before trying email operations again...');
  console.log('💡 Or use Supabase Dashboard to bypass rate limits');
  
  const timer = setInterval(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (seconds > 0) {
      console.log(`⏰ Time remaining: ${mins}:${secs.toString().padStart(2, '0')}`);
      seconds--;
    } else {
      clearInterval(timer);
      console.log('✅ Rate limit should be reset now!');
      console.log('🔄 You can now try email operations again');
    }
  }, 1000);
};

// Start the timer
rateLimitTimer();






