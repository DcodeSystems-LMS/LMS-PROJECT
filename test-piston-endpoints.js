// Test Piston API Endpoints
// Run with: node test-piston-endpoints.js

const baseUrl = 'http://49.204.168.41:2000';
const apiUrl = `${baseUrl}/api/v2`;

async function testEndpoint(name, url, method = 'GET', body = null) {
  console.log(`\n🔍 Testing ${name}...`);
  console.log(`   URL: ${url}`);
  console.log(`   Method: ${method}`);
  
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const startTime = Date.now();
    const response = await fetch(url, options);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response Time: ${responseTime}ms`);
    
    // Check CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };
    
    if (Object.values(corsHeaders).some(v => v)) {
      console.log(`   CORS Headers:`);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) console.log(`     ${key}: ${value}`);
      });
    }
    
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      console.log(`   Content-Type: ${contentType}`);
    }
    
    let data;
    const text = await response.text();
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log(`   ⚠️  Failed to parse JSON: ${e.message}`);
        console.log(`   Response (first 200 chars): ${text.substring(0, 200)}`);
        return { success: response.ok, status: response.status, error: 'Invalid JSON' };
      }
    } else {
      data = text;
    }
    
    if (response.ok) {
      console.log(`   ✅ ${name} - SUCCESS`);
      if (typeof data === 'object' && data !== null) {
        // Show summary for large objects
        if (Array.isArray(data)) {
          console.log(`   Data: Array with ${data.length} items`);
          if (data.length > 0) {
            console.log(`   First item: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
          }
        } else {
          const keys = Object.keys(data);
          console.log(`   Data keys: ${keys.join(', ')}`);
          if (keys.length <= 5) {
            console.log(`   Data: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
          }
        }
      } else {
        console.log(`   Data: ${String(data).substring(0, 200)}`);
      }
      return { success: true, status: response.status, data, responseTime };
    } else {
      console.log(`   ❌ ${name} - FAILED`);
      console.log(`   Error: ${text.substring(0, 200)}`);
      return { success: false, status: response.status, error: text, responseTime };
    }
  } catch (error) {
    console.log(`   ❌ ${name} - ERROR`);
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('fetch')) {
      console.log(`   → Network error: Cannot reach server`);
      console.log(`   → Check if server is running at ${baseUrl}`);
    } else if (error.message.includes('CORS')) {
      console.log(`   → CORS error: Server blocking cross-origin requests`);
    }
    
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Piston API Endpoints Test');
  console.log('='.repeat(60));
  console.log(`Base URL: ${baseUrl}`);
  console.log(`API URL: ${apiUrl}`);
  console.log('='.repeat(60));

  const results = [];

  // Test 1: Health Check
  const healthResult = await testEndpoint(
    'Health Check',
    `${baseUrl}/`
  );
  results.push(healthResult);

  // Test 2: Runtimes Endpoint
  const runtimesResult = await testEndpoint(
    'Runtimes Endpoint',
    `${apiUrl}/runtimes`
  );
  results.push(runtimesResult);

  // Test 3: Execute Endpoint (if runtimes work)
  if (runtimesResult.success && runtimesResult.data) {
    const runtimes = runtimesResult.data;
    const cRuntime = runtimes.find(r => r.language === 'c');
    
    if (cRuntime) {
      const executeResult = await testEndpoint(
        'Execute Endpoint (C)',
        `${apiUrl}/execute`,
        'POST',
        {
          language: 'c',
          version: cRuntime.version,
          files: [{
            content: '#include <stdio.h>\n\nint main() {\n    printf("Hello from Piston!\\n");\n    return 0;\n}'
          }],
          stdin: '',
          args: []
        }
      );
      results.push(executeResult);
    } else {
      console.log('\n⚠️  Skipping execute test (C runtime not found)');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const time = result.responseTime ? `(${result.responseTime}ms)` : '';
    console.log(`${index + 1}. ${status} ${time}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\nTotal: ${successCount}/${totalCount} tests passed`);
  
  if (successCount === totalCount) {
    console.log('✅ All endpoints are working!');
  } else {
    console.log('⚠️  Some endpoints have issues');
  }
  
  console.log('='.repeat(60));
}

main().catch(console.error);


