// 2-minute rate limit timer for testing
console.log('⏰ 2-minute rate limit timer for testing...');

const twoMinuteTimer = () => {
  let minutes = 2; // 2 minutes
  let seconds = minutes * 60;
  
  console.log(`🕐 Rate limit will reset in ${minutes} minutes`);
  console.log('⏳ You can test again after this time');
  console.log('⚠️  Note: Actual Supabase rate limit is 15 minutes');
  console.log('💡 This timer is just for tracking - use Supabase Dashboard for immediate testing');
  
  const timer = setInterval(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (seconds > 0) {
      console.log(`⏰ Time remaining: ${mins}:${secs.toString().padStart(2, '0')}`);
      seconds--;
    } else {
      clearInterval(timer);
      console.log('✅ 2 minutes passed!');
      console.log('⚠️  But Supabase rate limit is still 15 minutes');
      console.log('💡 Use Supabase Dashboard for immediate testing');
    }
  }, 1000);
};

// Start the 2-minute timer
twoMinuteTimer();






