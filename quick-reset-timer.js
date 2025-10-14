// Quick rate limit reset timer for testing
console.log('⏰ Rate limit reset timer for testing...');

const quickResetTimer = () => {
  let minutes = 15; // 15 minutes
  let seconds = minutes * 60;
  
  console.log(`🕐 Rate limit will reset in ${minutes} minutes`);
  console.log('⏳ You can test again after this time');
  
  const timer = setInterval(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (seconds > 0) {
      console.log(`⏰ Time remaining: ${mins}:${secs.toString().padStart(2, '0')}`);
      seconds--;
    } else {
      clearInterval(timer);
      console.log('✅ Rate limit reset! You can now test again');
    }
  }, 1000);
};

// Start the timer
quickResetTimer();






