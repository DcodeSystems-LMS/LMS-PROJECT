// Debug script to check if Piston is actually being used
// Run with: node debug-piston-usage.js

const baseUrl = 'http://49.204.168.41:2000/api/v2';

async function testSimpleCode() {
  console.log('\n🔍 Testing Simple Code (should work with Piston)...');
  
  const requestBody = {
    language: 'c',
    version: '10.2.0',
    files: [{
      content: '#include <stdio.h>\n\nint main() {\n    printf("Hello!\\n");\n    return 0;\n}'
    }],
    stdin: '',
    args: []
  };

  try {
    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    if (result.run && result.run.code === 0 && !result.run.signal) {
      console.log('✅ Simple code works with Piston!');
      console.log(`   Output: ${result.run.stdout}`);
      return true;
    } else {
      console.log('❌ Simple code failed');
      console.log(`   Code: ${result.run?.code}`);
      console.log(`   Signal: ${result.run?.signal}`);
      console.log(`   Stderr: ${result.run?.stderr}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testComplexCode() {
  console.log('\n🔍 Testing Complex Code (might get SIGKILL)...');
  
  const requestBody = {
    language: 'c',
    version: '10.2.0',
    files: [{
      content: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 1000000;
    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        arr[i] = i;
    }
    printf("Array allocated\\n");
    free(arr);
    return 0;
}`
    }],
    stdin: '',
    args: []
  };

  try {
    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    if (result.run && result.run.code === 0 && !result.run.signal) {
      console.log('✅ Complex code works with Piston!');
      return true;
    } else {
      console.log('⚠️  Complex code got signal:', result.run?.signal);
      console.log(`   This is why Piston falls back to Judge0`);
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Debugging Piston Usage');
  console.log('='.repeat(50));
  
  const simpleWorks = await testSimpleCode();
  const complexWorks = await testComplexCode();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Results:');
  console.log(`   Simple Code: ${simpleWorks ? '✅ Works' : '❌ Fails'}`);
  console.log(`   Complex Code: ${complexWorks ? '✅ Works' : '⚠️  Gets SIGKILL'}`);
  
  if (!simpleWorks) {
    console.log('\n❌ Even simple code fails - Piston has issues');
  } else if (!complexWorks) {
    console.log('\n⚠️  Simple code works, but complex code gets SIGKILL');
    console.log('   → This is why the project falls back to Judge0');
    console.log('   → Piston resource limits are too strict');
  } else {
    console.log('\n✅ Both work - Piston should be usable!');
  }
}

main().catch(console.error);


