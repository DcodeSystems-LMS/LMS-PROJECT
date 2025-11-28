// Test script to check backend audio extraction for all qualities
// Run this in Node.js or browser console

console.log('🔍 Backend Audio Extraction Test');
console.log('================================');

// Test function to check backend video extraction
async function testBackendAudioExtraction() {
  console.log('\n🎬 Testing Backend Video Extraction...');
  
  // Test with a known 4K video (Rick Roll - has 4K quality)
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  try {
    console.log('📡 Sending request to backend...');
    const response = await fetch('http://localhost:5173/api/extract-video', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ url: testUrl })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend extraction successful');
      console.log('📊 Video Info:', {
        title: data.title,
        duration: data.duration,
        totalStreams: data.streams.length,
        availableQualities: data.availableQualities
      });
      
      // Analyze each stream for audio
      console.log('\n🔊 Audio Analysis by Quality:');
      console.log('=============================');
      
      data.streams.forEach((stream, index) => {
        const hasAudio = stream.acodec && stream.acodec !== 'none';
        const hasSeparateAudio = stream.audioUrl;
        const audioStatus = hasAudio ? 
          (hasSeparateAudio ? '🔊 Separate Audio' : '🔊 Combined Audio') : 
          '🔇 No Audio';
        
        console.log(`${index + 1}. ${stream.quality}:`);
        console.log(`   Type: ${stream.type}`);
        console.log(`   Audio: ${audioStatus}`);
        console.log(`   Video Codec: ${stream.vcodec || 'N/A'}`);
        console.log(`   Audio Codec: ${stream.acodec || 'N/A'}`);
        console.log(`   Format: ${stream.format || 'N/A'}`);
        if (hasSeparateAudio) {
          console.log(`   Audio URL: ${stream.audioUrl.substring(0, 50)}...`);
        }
        console.log('');
      });
      
      // Check for 4K quality specifically
      const fourKStream = data.streams.find(s => s.quality === '2160p');
      if (fourKStream) {
        console.log('🎯 4K (2160p) Stream Analysis:');
        console.log('==============================');
        console.log('Quality:', fourKStream.quality);
        console.log('Type:', fourKStream.type);
        console.log('Has Audio:', fourKStream.acodec && fourKStream.acodec !== 'none');
        console.log('Audio Codec:', fourKStream.acodec);
        console.log('Has Separate Audio URL:', !!fourKStream.audioUrl);
        if (fourKStream.audioUrl) {
          console.log('Audio URL:', fourKStream.audioUrl.substring(0, 100) + '...');
        }
      } else {
        console.log('❌ No 4K (2160p) stream found');
      }
      
      // Summary
      const streamsWithAudio = data.streams.filter(s => s.acodec && s.acodec !== 'none');
      const streamsWithSeparateAudio = data.streams.filter(s => s.audioUrl);
      
      console.log('\n📈 Summary:');
      console.log('===========');
      console.log(`Total streams: ${data.streams.length}`);
      console.log(`Streams with audio: ${streamsWithAudio.length}`);
      console.log(`Streams with separate audio: ${streamsWithSeparateAudio.length}`);
      console.log(`Audio coverage: ${Math.round((streamsWithAudio.length / data.streams.length) * 100)}%`);
      
      return data;
    } else {
      const error = await response.json();
      console.log('❌ Backend extraction failed:', error);
      return null;
    }
  } catch (err) {
    console.log('❌ Backend connection failed:', err.message);
    console.log('💡 Make sure your backend server is running on http://localhost:5173');
    return null;
  }
}

// Test function to check yt-dlp directly
async function testYtDlpDirect() {
  console.log('\n🔧 Testing yt-dlp Direct Command...');
  
  const { exec } = require('child_process');
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  
  // Test the exact command used by backend
  const command = `yt-dlp --dump-json --no-warnings --no-check-certificate --format "best[height<=2160]/best[height<=1440]/best[height<=1080]/best[height<=720]/best[height<=480]/best[height<=360]/best" --prefer-free-formats --extract-flat false "${testUrl}"`;
  
  console.log('Command:', command);
  
  return new Promise((resolve) => {
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ yt-dlp error:', error.message);
        resolve(null);
        return;
      }
      
      try {
        const videoInfo = JSON.parse(stdout);
        console.log('✅ yt-dlp extraction successful');
        console.log('📊 Raw yt-dlp data:', {
          title: videoInfo.title,
          formatsCount: videoInfo.formats ? videoInfo.formats.length : 0
        });
        
        // Analyze formats
        if (videoInfo.formats) {
          console.log('\n🔍 Format Analysis:');
          const videoFormats = videoInfo.formats.filter(f => f.vcodec !== 'none');
          const audioFormats = videoInfo.formats.filter(f => f.acodec !== 'none');
          const combinedFormats = videoInfo.formats.filter(f => f.vcodec !== 'none' && f.acodec !== 'none');
          
          console.log(`Video-only formats: ${videoFormats.length}`);
          console.log(`Audio-only formats: ${audioFormats.length}`);
          console.log(`Combined formats: ${combinedFormats.length}`);
          
          // Show highest quality formats
          const sortedVideo = videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0));
          console.log('\n🎥 Top Video Formats:');
          sortedVideo.slice(0, 5).forEach(f => {
            console.log(`  ${f.height}p - ${f.vcodec} - ${f.acodec === 'none' ? 'No Audio' : 'Has Audio'}`);
          });
          
          const sortedAudio = audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));
          console.log('\n🔊 Top Audio Formats:');
          sortedAudio.slice(0, 3).forEach(f => {
            console.log(`  ${f.abr}kbps - ${f.acodec} - ${f.ext}`);
          });
        }
        
        resolve(videoInfo);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError.message);
        resolve(null);
      }
    });
  });
}

// Test function to check if backend is running
async function testBackendHealth() {
  console.log('\n🏥 Testing Backend Health...');
  
  try {
    const response = await fetch('http://localhost:5173/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running');
      console.log('📊 Health data:', data);
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (err) {
    console.log('❌ Backend not accessible:', err.message);
    console.log('💡 Make sure to start the backend server first');
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting comprehensive audio extraction tests...\n');
  
  // Test 1: Backend health
  const backendHealthy = await testBackendHealth();
  if (!backendHealthy) {
    console.log('\n❌ Backend is not running. Please start it first.');
    return;
  }
  
  // Test 2: Backend audio extraction
  const extractionResult = await testBackendAudioExtraction();
  
  // Test 3: Direct yt-dlp test (if running in Node.js)
  if (typeof require !== 'undefined') {
    await testYtDlpDirect();
  }
  
  console.log('\n✅ All tests completed!');
  console.log('\n💡 If audio is still not working:');
  console.log('1. Check browser console for audio errors');
  console.log('2. Verify video player is using the correct stream');
  console.log('3. Test with different video URLs');
  console.log('4. Check if browser supports the audio codec');
}

// Export functions for manual testing
if (typeof window !== 'undefined') {
  // Browser environment
  window.testBackendAudioExtraction = testBackendAudioExtraction;
  window.testBackendHealth = testBackendHealth;
  window.runAllTests = runAllTests;
  
  console.log('\n📋 Available test functions:');
  console.log('- testBackendHealth(): Check if backend is running');
  console.log('- testBackendAudioExtraction(): Test audio extraction');
  console.log('- runAllTests(): Run all tests');
} else {
  // Node.js environment
  module.exports = {
    testBackendAudioExtraction,
    testBackendHealth,
    testYtDlpDirect,
    runAllTests
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests();
}
