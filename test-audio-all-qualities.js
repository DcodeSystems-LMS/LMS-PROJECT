// Test script to verify audio works for all video qualities
// Copy and paste this into your browser console on the video player page

console.log('🔊 Testing Audio for All Video Qualities');
console.log('======================================');

// Function to test audio for current quality
function testCurrentAudio() {
    console.log('\n🎵 Testing Current Audio Setup...');
    
    const video = document.querySelector('video');
    const audio = document.querySelector('audio');
    
    if (video) {
        console.log('✅ Video element found');
        console.log('Video details:', {
            src: video.src.substring(0, 100) + '...',
            muted: video.muted,
            volume: video.volume,
            paused: video.paused,
            currentTime: video.currentTime,
            duration: video.duration
        });
    } else {
        console.log('❌ Video element not found');
        return;
    }
    
    if (audio) {
        console.log('✅ Audio element found');
        console.log('Audio details:', {
            src: audio.src.substring(0, 100) + '...',
            muted: audio.muted,
            volume: audio.volume,
            paused: audio.paused,
            currentTime: audio.currentTime,
            duration: audio.duration
        });
    } else {
        console.log('❌ Audio element not found (using combined stream)');
    }
    
    // Check for debug functions
    if (typeof window.debugVideoPlayer === 'function') {
        console.log('\n🔍 Running video player debug...');
        window.debugVideoPlayer();
    }
    
    if (typeof window.debugQualityButton === 'function') {
        console.log('\n🎯 Running quality button debug...');
        window.debugQualityButton();
    }
}

// Function to test quality change with audio
function testQualityChangeWithAudio() {
    console.log('\n🔄 Testing Quality Change with Audio...');
    
    const qualityButton = document.querySelector('.quality-button');
    const qualityMenu = document.querySelector('.quality-menu');
    
    if (!qualityButton) {
        console.log('❌ Quality button not found');
        return;
    }
    
    console.log('✅ Quality button found');
    console.log('Quality button text:', qualityButton.textContent.trim());
    
    // Click quality button to open menu
    qualityButton.click();
    console.log('🖱️ Quality button clicked');
    
    setTimeout(() => {
        if (qualityMenu && qualityMenu.offsetParent !== null) {
            console.log('✅ Quality menu opened');
            
            const qualityOptions = qualityMenu.querySelectorAll('button');
            console.log(`📋 Found ${qualityOptions.length} quality options`);
            
            // Test each quality option
            qualityOptions.forEach((option, index) => {
                const quality = option.textContent.trim();
                console.log(`  ${index + 1}. ${quality}`);
            });
            
            // Find a different quality to test
            let testQuality = null;
            for (let option of qualityOptions) {
                if (!option.textContent.includes('✓') && !option.disabled) {
                    testQuality = option.textContent.trim();
                    break;
                }
            }
            
            if (testQuality) {
                console.log(`\n🎯 Testing quality change to: ${testQuality}`);
                
                // Get current audio state before change
                const video = document.querySelector('video');
                const audio = document.querySelector('audio');
                const beforeState = {
                    videoMuted: video ? video.muted : null,
                    videoVolume: video ? video.volume : null,
                    audioExists: !!audio,
                    audioMuted: audio ? audio.muted : null,
                    audioVolume: audio ? audio.volume : null
                };
                
                console.log('Before quality change:', beforeState);
                
                // Click the test quality
                for (let option of qualityOptions) {
                    if (option.textContent.trim() === testQuality) {
                        option.click();
                        console.log(`🖱️ Clicked quality: ${testQuality}`);
                        break;
                    }
                }
                
                // Check state after quality change
                setTimeout(() => {
                    const videoAfter = document.querySelector('video');
                    const audioAfter = document.querySelector('audio');
                    const afterState = {
                        videoMuted: videoAfter ? videoAfter.muted : null,
                        videoVolume: videoAfter ? videoAfter.volume : null,
                        audioExists: !!audioAfter,
                        audioMuted: audioAfter ? audioAfter.muted : null,
                        audioVolume: audioAfter ? audioAfter.volume : null
                    };
                    
                    console.log('After quality change:', afterState);
                    
                    // Analyze the change
                    if (beforeState.audioExists !== afterState.audioExists) {
                        console.log(`🔄 Audio element ${afterState.audioExists ? 'created' : 'removed'}`);
                    }
                    
                    if (beforeState.videoMuted !== afterState.videoMuted) {
                        console.log(`🔄 Video muted state changed: ${beforeState.videoMuted} → ${afterState.videoMuted}`);
                    }
                    
                    // Test audio playback
                    if (videoAfter && !videoAfter.paused) {
                        console.log('🎵 Video is playing, testing audio...');
                        
                        if (audioAfter) {
                            console.log('🔊 Separate audio stream detected');
                            if (audioAfter.paused) {
                                console.log('⚠️ Audio is paused while video is playing - this might be an issue');
                            } else {
                                console.log('✅ Audio is playing with video');
                            }
                        } else {
                            console.log('🔊 Combined audio stream detected');
                        }
                    }
                    
                }, 2000);
                
            } else {
                console.log('❌ No other quality options available for testing');
            }
            
        } else {
            console.log('❌ Quality menu did not open');
        }
    }, 500);
}

// Function to test audio playback
function testAudioPlayback() {
    console.log('\n🎵 Testing Audio Playback...');
    
    const video = document.querySelector('video');
    const audio = document.querySelector('audio');
    
    if (!video) {
        console.log('❌ No video element found');
        return;
    }
    
    // Test video audio
    console.log('Testing video audio...');
    const originalVolume = video.volume;
    const originalMuted = video.muted;
    
    // Test volume change
    video.volume = 0.5;
    console.log(`Video volume changed to: ${video.volume}`);
    
    // Test mute/unmute
    video.muted = true;
    console.log(`Video muted: ${video.muted}`);
    video.muted = false;
    console.log(`Video unmuted: ${video.muted}`);
    
    // Restore original state
    video.volume = originalVolume;
    video.muted = originalMuted;
    
    // Test separate audio if available
    if (audio) {
        console.log('Testing separate audio...');
        const originalAudioVolume = audio.volume;
        const originalAudioMuted = audio.muted;
        
        // Test volume change
        audio.volume = 0.5;
        console.log(`Audio volume changed to: ${audio.volume}`);
        
        // Test mute/unmute
        audio.muted = true;
        console.log(`Audio muted: ${audio.muted}`);
        audio.muted = false;
        console.log(`Audio unmuted: ${audio.muted}`);
        
        // Restore original state
        audio.volume = originalAudioVolume;
        audio.muted = originalAudioMuted;
    }
}

// Main test function
function runAudioTests() {
    console.log('🚀 Starting comprehensive audio tests...\n');
    
    testCurrentAudio();
    
    setTimeout(() => {
        testQualityChangeWithAudio();
    }, 1000);
    
    setTimeout(() => {
        testAudioPlayback();
    }, 3000);
    
    console.log('\n✅ Audio tests completed!');
    console.log('\n💡 What to look for:');
    console.log('1. All qualities should have audio (either combined or separate)');
    console.log('2. Quality changes should maintain audio playback');
    console.log('3. Separate audio streams should sync with video');
    console.log('4. Volume controls should work for both video and audio');
}

// Export functions
window.testCurrentAudio = testCurrentAudio;
window.testQualityChangeWithAudio = testQualityChangeWithAudio;
window.testAudioPlayback = testAudioPlayback;
window.runAudioTests = runAudioTests;

console.log('\n📋 Available test functions:');
console.log('- testCurrentAudio(): Test current audio setup');
console.log('- testQualityChangeWithAudio(): Test quality change with audio');
console.log('- testAudioPlayback(): Test audio playback controls');
console.log('- runAudioTests(): Run all audio tests');

// Auto-run tests
runAudioTests();
