// Test script to debug quality button functionality
// Run this in the browser console when testing your video player

console.log('🎯 Quality Button Test Script');
console.log('=============================');

// Test function to check quality button state
function testQualityButton() {
  console.log('\n🔍 Testing Quality Button State...');
  
  // Check if debug functions are available
  if (typeof window.debugQualityButton === 'function') {
    console.log('✅ Quality debug function available');
    window.debugQualityButton();
  } else {
    console.log('❌ Quality debug function not available');
  }
  
  // Check for quality button elements
  const qualityButtons = document.querySelectorAll('.quality-button');
  const qualityMenus = document.querySelectorAll('.quality-menu');
  
  console.log(`\n🎯 Found ${qualityButtons.length} quality button(s)`);
  console.log(`📋 Found ${qualityMenus.length} quality menu(s)`);
  
  qualityButtons.forEach((button, index) => {
    console.log(`\nQuality Button ${index + 1}:`, {
      text: button.textContent,
      disabled: button.disabled,
      visible: button.offsetParent !== null,
      clickable: !button.disabled && button.offsetParent !== null
    });
  });
  
  qualityMenus.forEach((menu, index) => {
    console.log(`\nQuality Menu ${index + 1}:`, {
      visible: menu.offsetParent !== null,
      options: menu.querySelectorAll('button').length
    });
  });
  
  // Check for video elements and their sources
  const videoElements = document.querySelectorAll('video');
  console.log(`\n📺 Found ${videoElements.length} video element(s)`);
  
  videoElements.forEach((video, index) => {
    console.log(`\nVideo ${index + 1}:`, {
      src: video.src,
      currentSrc: video.currentSrc,
      readyState: video.readyState,
      networkState: video.networkState
    });
  });
}

// Test function to simulate quality button clicks
function simulateQualityButtonTest() {
  console.log('\n🧪 Simulating Quality Button Tests...');
  
  const qualityButton = document.querySelector('.quality-button');
  const qualityMenu = document.querySelector('.quality-menu');
  
  if (qualityButton) {
    console.log('Testing quality button click...');
    
    // Test if button is clickable
    if (!qualityButton.disabled) {
      console.log('✅ Quality button is clickable');
      
      // Simulate click
      qualityButton.click();
      console.log('🖱️ Quality button clicked');
      
      // Check if menu appeared
      setTimeout(() => {
        const menuVisible = qualityMenu && qualityMenu.offsetParent !== null;
        console.log(`📋 Quality menu visible after click: ${menuVisible}`);
        
        if (menuVisible) {
          // Test clicking a quality option
          const qualityOptions = qualityMenu.querySelectorAll('button');
          if (qualityOptions.length > 0) {
            console.log(`🎯 Found ${qualityOptions.length} quality options`);
            
            // Click the first non-current quality option
            for (let option of qualityOptions) {
              if (!option.textContent.includes('✓') && !option.disabled) {
                console.log(`🖱️ Clicking quality option: ${option.textContent.trim()}`);
                option.click();
                break;
              }
            }
          }
        }
      }, 100);
    } else {
      console.log('❌ Quality button is disabled');
    }
  } else {
    console.log('❌ Quality button not found');
  }
}

// Test function to check available streams
function checkAvailableStreams() {
  console.log('\n📊 Checking Available Streams...');
  
  // Try to get stream info from the video player
  if (typeof window.debugVideoPlayer === 'function') {
    console.log('Getting video player debug info...');
    window.debugVideoPlayer();
  }
  
  // Check for any stream-related data in the page
  const scripts = document.querySelectorAll('script');
  let streamData = null;
  
  scripts.forEach(script => {
    if (script.textContent && script.textContent.includes('availableStreams')) {
      console.log('Found script with stream data');
    }
  });
}

// Test function to check console for errors
function checkConsoleErrors() {
  console.log('\n🔍 Checking for Console Errors...');
  
  // Override console.error to catch errors
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Restore after a short delay
  setTimeout(() => {
    console.error = originalError;
    
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} console errors:`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors found');
    }
  }, 2000);
}

// Main test function
function runQualityButtonTests() {
  console.log('🚀 Starting quality button tests...\n');
  
  testQualityButton();
  checkAvailableStreams();
  checkConsoleErrors();
  
  // Run simulation test after a delay
  setTimeout(() => {
    simulateQualityButtonTest();
  }, 1000);
  
  console.log('\n✅ Quality button tests completed!');
  console.log('\n💡 If quality button is still not working:');
  console.log('1. Check browser console for errors');
  console.log('2. Verify availableStreams array has data');
  console.log('3. Check if quality button is disabled');
  console.log('4. Test with different video URLs');
}

// Export functions for manual testing
window.testQualityButton = testQualityButton;
window.simulateQualityButtonTest = simulateQualityButtonTest;
window.checkAvailableStreams = checkAvailableStreams;
window.runQualityButtonTests = runQualityButtonTests;

console.log('\n📋 Available test functions:');
console.log('- testQualityButton(): Check quality button state');
console.log('- simulateQualityButtonTest(): Test quality button clicks');
console.log('- checkAvailableStreams(): Check available streams');
console.log('- runQualityButtonTests(): Run all tests');
console.log('- debugQualityButton(): Detailed quality debug (if available)');

// Auto-run tests
runQualityButtonTests();
