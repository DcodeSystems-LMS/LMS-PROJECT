// Test Piston Service
// Run with: node test-piston-service.js

const baseUrl = 'http://49.204.168.41:2000/api/v2';

async function testHealth() {
  console.log('\n🔍 Testing Piston Health...');
  try {
    const response = await fetch('http://49.204.168.41:2000/');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Health check passed:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.message.includes('fetch')) {
      console.error('   → Network error: Cannot reach Piston server');
      console.error('   → Check if server is running at http://49.204.168.41:2000');
    }
    return false;
  }
}

async function testRuntimes() {
  console.log('\n🔍 Testing Piston Runtimes...');
  try {
    const response = await fetch(`${baseUrl}/runtimes`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    const data = await response.json();
    console.log(`✅ Runtimes endpoint working. Found ${data.length} runtimes`);
    
    // Show first 5 runtimes
    console.log('\n📋 First 5 runtimes:');
    data.slice(0, 5).forEach(runtime => {
      console.log(`   - ${runtime.language} ${runtime.version || 'N/A'}`);
    });
    
    // Check for C language
    const cLang = data.find(r => r.language === 'c');
    if (cLang) {
      console.log(`\n✅ C language found: ${cLang.language} ${cLang.version}`);
      return cLang.version;
    } else {
      console.log('\n⚠️  C language not found in runtimes');
      return null;
    }
  } catch (error) {
    console.error('❌ Runtimes test failed:', error.message);
    if (error.message.includes('CORS')) {
      console.error('   → CORS error: Server may not allow cross-origin requests');
    }
    return null;
  }
}

async function testExecute(cVersion = '10.2.0') {
  console.log('\n🔍 Testing Piston Execute (C code)...');
  try {
    const requestBody = {
      language: 'c',
      version: cVersion,
      files: [{
        content: '#include <stdio.h>\n\nint main() {\n    printf("Hello from Piston!\\n");\n    return 0;\n}'
      }],
      stdin: '',
      args: []
    };

    console.log(`📤 Sending request to ${baseUrl}/execute`);
    console.log(`   Language: c, Version: ${cVersion}`);

    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`❌ Execute failed (${response.status}):`);
      console.error(responseText);
      if (response.status === 0 || responseText.includes('CORS')) {
        console.error('   → CORS error: Server blocking cross-origin requests');
        console.error('   → Solution: Configure CORS on Piston server');
      }
      return false;
    }

    const data = JSON.parse(responseText);
    console.log('✅ Execute successful!');
    console.log('\n📊 Response:');
    console.log(`   Compile: ${data.compile ? 'Success' : 'Failed'}`);
    if (data.compile && data.compile.stderr) {
      console.log(`   Compile Error: ${data.compile.stderr}`);
    }
    if (data.run) {
      console.log(`   Run Code: ${data.run.code}`);
      console.log(`   Run Signal: ${data.run.signal || 'None'}`);
      console.log(`   Stdout: ${data.run.stdout || '(empty)'}`);
      if (data.run.stderr) {
        console.log(`   Stderr: ${data.run.stderr}`);
      }
    }
    
    if (data.run && data.run.code === 0 && data.run.stdout) {
      console.log('\n✅ Code executed successfully!');
      return true;
    } else {
      console.log('\n⚠️  Code execution had issues');
      return false;
    }
  } catch (error) {
    console.error('❌ Execute test failed:', error.message);
    if (error.message.includes('fetch')) {
      console.error('   → Network error: Cannot reach Piston server');
    }
    return false;
  }
}

async function testPython() {
  console.log('\n🔍 Testing Piston Execute (Python code)...');
  try {
    // First get Python version from runtimes
    const runtimesResponse = await fetch(`${baseUrl}/runtimes`);
    const runtimes = await runtimesResponse.json();
    const pythonRuntime = runtimes.find(r => r.language === 'python');
    
    if (!pythonRuntime) {
      console.log('⚠️  Python runtime not found');
      return false;
    }
    
    const pythonVersion = pythonRuntime.version;
    console.log(`   Using Python version: ${pythonVersion}`);
    
    const requestBody = {
      language: 'python',
      version: pythonVersion,
      files: [{
        content: 'print("Hello from Piston!")'
      }],
      stdin: '',
      args: []
    };

    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`❌ Python execute failed (${response.status}):`);
      console.error(responseText);
      return false;
    }

    const data = JSON.parse(responseText);
    if (data.run && data.run.code === 0 && data.run.stdout) {
      console.log('✅ Python code executed successfully!');
      console.log(`   Output: ${data.run.stdout.trim()}`);
      return true;
    } else {
      console.log('⚠️  Python execution had issues');
      return false;
    }
  } catch (error) {
    console.error('❌ Python test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Piston Service Test');
  console.log('='.repeat(50));
  console.log(`Testing: ${baseUrl}`);
  console.log('='.repeat(50));

  // Test 1: Health
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n❌ Health check failed. Stopping tests.');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if Piston server is running: docker ps | grep piston');
    console.log('   2. Check server logs: docker logs piston');
    console.log('   3. Verify server is accessible: curl http://49.204.168.41:2000/');
    return;
  }

  // Test 2: Runtimes
  const cVersion = await testRuntimes();
  
  // Test 3: Execute C
  if (cVersion) {
    const cExecuteOk = await testExecute(cVersion);
    if (!cExecuteOk) {
      console.log('\n⚠️  C execution had issues (SIGKILL = timeout/resource limit)');
      console.log('   → This is expected for some code - Piston has resource limits');
      console.log('   → System will automatically fall back to Judge0');
    }
  } else {
    console.log('\n⚠️  Skipping C execute test (C runtime not found)');
  }

  // Test 4: Execute Python
  await testPython();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test completed!');
  console.log('='.repeat(50));
}

// Run tests
main().catch(console.error);

