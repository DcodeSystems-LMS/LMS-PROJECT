// Test script to verify audio functionality in custom video player
// Run this in the browser console when testing your video player

console.log('🎵 Audio Player Test Script');
console.log('========================');

// Test function to check audio state
function testAudioPlayer() {
  console.log('\n🔍 Testing Audio Player State...');
  
  // Check if debug function is available
  if (typeof window.debugVideoPlayer === 'function') {
    console.log('✅ Debug function available');
    window.debugVideoPlayer();
  } else {
    console.log('❌ Debug function not available');
  }
  
  // Check for video elements
  const videoElements = document.querySelectorAll('video');
  const audioElements = document.querySelectorAll('audio');
  
  console.log(`\n📺 Found ${videoElements.length} video element(s)`);
  console.log(`🔊 Found ${audioElements.length} audio element(s)`);
  
  videoElements.forEach((video, index) => {
    console.log(`\nVideo ${index + 1}:`, {
      src: video.src,
      currentTime: video.currentTime,
      duration: video.duration,
      volume: video.volume,
      muted: video.muted,
      paused: video.paused,
      readyState: video.readyState,
      networkState: video.networkState,
      audioTracks: video.audioTracks ? video.audioTracks.length : 'N/A'
    });
  });
  
  audioElements.forEach((audio, index) => {
    console.log(`\nAudio ${index + 1}:`, {
      src: audio.src,
      currentTime: audio.currentTime,
      duration: audio.duration,
      volume: audio.volume,
      muted: audio.muted,
      paused: audio.paused,
      readyState: audio.readyState,
      networkState: audio.networkState
    });
  });
  
  // Check for audio-related errors in console
  console.log('\n🔍 Check the console above for any audio-related errors or warnings');
}

// Test function to simulate audio issues
function simulateAudioTest() {
  console.log('\n🧪 Simulating Audio Tests...');
  
  const video = document.querySelector('video');
  const audio = document.querySelector('audio');
  
  if (video) {
    console.log('Testing video audio...');
    
    // Test volume changes
    const originalVolume = video.volume;
    video.volume = 0.5;
    console.log(`Volume changed from ${originalVolume} to ${video.volume}`);
    
    // Test mute/unmute
    video.muted = true;
    console.log('Video muted:', video.muted);
    video.muted = false;
    console.log('Video unmuted:', video.muted);
    
    // Restore original volume
    video.volume = originalVolume;
  }
  
  if (audio) {
    console.log('Testing separate audio...');
    
    // Test volume changes
    const originalVolume = audio.volume;
    audio.volume = 0.5;
    console.log(`Audio volume changed from ${originalVolume} to ${audio.volume}`);
    
    // Test mute/unmute
    audio.muted = true;
    console.log('Audio muted:', audio.muted);
    audio.muted = false;
    console.log('Audio unmuted:', audio.muted);
    
    // Restore original volume
    audio.volume = originalVolume;
  }
}

// Auto-run test when script loads
testAudioPlayer();

// Export functions for manual testing
window.testAudioPlayer = testAudioPlayer;
window.simulateAudioTest = simulateAudioTest;

console.log('\n📋 Available test functions:');
console.log('- testAudioPlayer(): Check current audio state');
console.log('- simulateAudioTest(): Test audio controls');
console.log('- debugVideoPlayer(): Detailed debug info (if available)');
console.log('\n💡 Run any of these functions in the console to test audio functionality');
