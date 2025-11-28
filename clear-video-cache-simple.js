// Simple script to clear video cache
// Run this in browser console

// Clear all video-related cache
const keys = Object.keys(localStorage);
const videoKeys = keys.filter(key => 
  key.includes('ultra_fast_streams_') || 
  key.includes('video-player-preference-')
);

console.log('Found video cache keys:', videoKeys);

videoKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('Cleared:', key);
});

console.log('✅ All video cache cleared!');
console.log('🔄 Refresh the page to see the changes');
