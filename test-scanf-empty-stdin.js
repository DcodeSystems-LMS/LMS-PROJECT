// Test why scanf reads 32767 with empty stdin
const baseUrl = 'http://49.204.168.41:2000/api/v2';

async function testScanfEmptyStdin() {
  console.log('🔍 Testing scanf with empty stdin...\n');
  
  const code = `#include <stdio.h>
#include <limits.h>

int main() {
    int n;
    printf("Enter how many numbers you want to add: ");
    
    // Check what scanf returns
    int result = scanf("%d", &n);
    printf("\\nscanf return value: %d\\n", result);
    printf("Value read (n): %d\\n", n);
    printf("INT_MAX: %d\\n", INT_MAX);
    printf("SHRT_MAX: %d\\n", SHRT_MAX);
    
    if (result == 0 || result == EOF) {
        printf("\\n⚠️ scanf failed or reached EOF (no input provided)\\n");
        printf("Variable n contains uninitialized/garbage value: %d\\n", n);
    } else {
        printf("\\n✅ scanf successfully read: %d\\n", n);
    }
    
    return 0;
}`;

  try {
    const response = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [{ content: code }],
        stdin: '', // Empty stdin
        args: []
      })
    });

    const data = await response.json();
    
    console.log('📊 Results:');
    console.log('='.repeat(60));
    if (data.run) {
      console.log('Stdout:');
      console.log(data.run.stdout || '(empty)');
      console.log('\nStderr:');
      console.log(data.run.stderr || '(empty)');
      console.log('\nExit Code:', data.run.code);
      console.log('Signal:', data.run.signal || 'None');
      
      if (data.run.stdout) {
        const output = data.run.stdout;
        if (output.includes('32767')) {
          console.log('\n⚠️  Found 32767 in output!');
          console.log('   This is likely an uninitialized variable value.');
          console.log('   When scanf fails (no input), the variable contains garbage.');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testScanfEmptyStdin();


