#!/usr/bin/env node

/**
 * Hostinger Deployment Testing Script
 * Tests the YouTube extraction backend after deployment
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const config = {
  // Update these with your actual Hostinger domain
  baseUrl: process.env.BACKEND_URL || 'https://api.yourdomain.com',
  testVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll for testing
  timeout: 30000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hostinger-Test-Script/1.0',
        ...options.headers
      },
      timeout: config.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testHealthEndpoint() {
  log('\n🔍 Testing Health Endpoint...', 'blue');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health`);
    
    if (response.statusCode === 200) {
      log('✅ Health endpoint is working', 'green');
      log(`   Status: ${response.data.status}`, 'cyan');
      log(`   Environment: ${response.data.environment}`, 'cyan');
      log(`   yt-dlp Available: ${response.data.ytDlpAvailable}`, 'cyan');
      log(`   Uptime: ${response.data.uptime}s`, 'cyan');
      return true;
    } else {
      log(`❌ Health endpoint failed with status: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Health endpoint error: ${error.message}`, 'red');
    return false;
  }
}

async function testStatusEndpoint() {
  log('\n🔍 Testing Status Endpoint...', 'blue');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/status`);
    
    if (response.statusCode === 200) {
      log('✅ Status endpoint is working', 'green');
      log(`   Node Version: ${response.data.system.nodeVersion}`, 'cyan');
      log(`   Platform: ${response.data.system.platform}`, 'cyan');
      log(`   Memory Usage: ${response.data.system.memory.heapUsed}`, 'cyan');
      log(`   yt-dlp Available: ${response.data.services.ytDlpAvailable}`, 'cyan');
      return true;
    } else {
      log(`❌ Status endpoint failed with status: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Status endpoint error: ${error.message}`, 'red');
    return false;
  }
}

async function testVideoExtraction() {
  log('\n🔍 Testing Video Extraction...', 'blue');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/extract-video`, {
      method: 'POST',
      body: {
        url: config.testVideoUrl
      }
    });
    
    if (response.statusCode === 200) {
      log('✅ Video extraction is working', 'green');
      log(`   Video Title: ${response.data.title}`, 'cyan');
      log(`   Video ID: ${response.data.id}`, 'cyan');
      log(`   Duration: ${response.data.duration}s`, 'cyan');
      log(`   Available Qualities: ${response.data.availableQualities.join(', ')}`, 'cyan');
      log(`   Streams Found: ${response.data.streams.length}`, 'cyan');
      return true;
    } else if (response.statusCode === 503) {
      log('⚠️  Video extraction service unavailable (yt-dlp not installed)', 'yellow');
      log(`   Error: ${response.data.error}`, 'yellow');
      log(`   Fallback: ${response.data.fallback}`, 'yellow');
      return false;
    } else {
      log(`❌ Video extraction failed with status: ${response.statusCode}`, 'red');
      log(`   Error: ${response.data.error || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Video extraction error: ${error.message}`, 'red');
    return false;
  }
}

async function testCORS() {
  log('\n🔍 Testing CORS Configuration...', 'blue');
  
  try {
    const response = await makeRequest(`${config.baseUrl}/api/health`, {
      headers: {
        'Origin': 'https://yourdomain.com'
      }
    });
    
    if (response.statusCode === 200) {
      const corsHeaders = response.headers['access-control-allow-origin'];
      if (corsHeaders) {
        log('✅ CORS is configured', 'green');
        log(`   Allowed Origin: ${corsHeaders}`, 'cyan');
        return true;
      } else {
        log('⚠️  CORS headers not found', 'yellow');
        return false;
      }
    } else {
      log(`❌ CORS test failed with status: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ CORS test error: ${error.message}`, 'red');
    return false;
  }
}

async function testRateLimit() {
  log('\n🔍 Testing Rate Limiting...', 'blue');
  
  try {
    // Make multiple requests quickly to test rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(makeRequest(`${config.baseUrl}/api/health`));
    }
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.statusCode === 200).length;
    
    if (successCount === 5) {
      log('✅ Rate limiting allows normal usage', 'green');
      return true;
    } else {
      log(`⚠️  Some requests were rate limited: ${successCount}/5 succeeded`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Rate limit test error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Hostinger Deployment Tests', 'bright');
  log(`   Backend URL: ${config.baseUrl}`, 'cyan');
  log(`   Test Video: ${config.testVideoUrl}`, 'cyan');
  
  const results = {
    health: await testHealthEndpoint(),
    status: await testStatusEndpoint(),
    videoExtraction: await testVideoExtraction(),
    cors: await testCORS(),
    rateLimit: await testRateLimit()
  };
  
  log('\n📊 Test Results Summary:', 'bright');
  log(`   Health Endpoint: ${results.health ? '✅ PASS' : '❌ FAIL'}`, results.health ? 'green' : 'red');
  log(`   Status Endpoint: ${results.status ? '✅ PASS' : '❌ FAIL'}`, results.status ? 'green' : 'red');
  log(`   Video Extraction: ${results.videoExtraction ? '✅ PASS' : '❌ FAIL'}`, results.videoExtraction ? 'green' : 'red');
  log(`   CORS Configuration: ${results.cors ? '✅ PASS' : '❌ FAIL'}`, results.cors ? 'green' : 'red');
  log(`   Rate Limiting: ${results.rateLimit ? '✅ PASS' : '❌ FAIL'}`, results.rateLimit ? 'green' : 'red');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Your Hostinger deployment is working perfectly!', 'green');
  } else if (results.health && results.status) {
    log('\n⚠️  Basic functionality is working, but some features may need attention.', 'yellow');
    if (!results.videoExtraction) {
      log('   - Video extraction is not working (yt-dlp may not be installed)', 'yellow');
      log('   - Videos will still work via YouTube embed fallback', 'yellow');
    }
  } else {
    log('\n❌ Critical issues found. Please check your deployment.', 'red');
  }
  
  log('\n📝 Next Steps:', 'bright');
  if (!results.videoExtraction) {
    log('   1. Install Python and yt-dlp on Hostinger', 'cyan');
    log('   2. Run: pip3 install yt-dlp --user', 'cyan');
    log('   3. Test video extraction again', 'cyan');
  }
  log('   4. Update your frontend to use the production backend URL', 'cyan');
  log('   5. Test the complete video playback flow', 'cyan');
}

// Handle command line arguments
if (process.argv.length > 2) {
  config.baseUrl = process.argv[2];
}

// Run the tests
runAllTests().catch(error => {
  log(`\n💥 Test script error: ${error.message}`, 'red');
  process.exit(1);
});
