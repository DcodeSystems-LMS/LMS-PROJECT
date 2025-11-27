// Debug why 32767 appears when scanf reads empty stdin
const baseUrl = 'http://49.204.168.41:2000/api/v2';

async function test32767Issue() {
  console.log('🔍 Testing why 32767 appears...\n');
  
  // Test 1: Simple scanf with uninitialized variable
  const code1 = `#include <stdio.h>
int main() {
    int n;  // Uninitialized
    printf("Enter how many numbers you want to add: ");
    scanf("%d", &n);
    printf("Enter %d numbers:\\n", n);
    return 0;
}`;

  // Test 2: Check what value n has when scanf fails
  const code2 = `#include <stdio.h>
#include <limits.h>
int main() {
    int n = 0;  // Initialize to 0
    printf("Enter how many numbers you want to add: ");
    int result = scanf("%d", &n);
    printf("scanf returned: %d\\n", result);
    printf("n = %d\\n", n);
    printf("SHRT_MAX = %d\\n", SHRT_MAX);
    if (n == SHRT_MAX) {
        printf("⚠️ n equals SHRT_MAX (32767)!\\n");
    }
    printf("Enter %d numbers:\\n", n);
    return 0;
}`;

  // Test 3: The actual program the user might be running
  const code3 = `#include <stdio.h>
int main() {
    int n, i, num, sum = 0;
    printf("Enter how many numbers you want to add: ");
    scanf("%d", &n);
    printf("Enter %d numbers:\\n", n);
    for (i = 1; i <= n; i++) {
        printf("Number %d: ", i);
        scanf("%d", &num);
        sum += num;
    }
    printf("\\nTotal Sum = %d\\n", sum);
    return 0;
}`;

  console.log('Test 1: Uninitialized variable');
  console.log('='.repeat(60));
  try {
    const r1 = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [{ content: code1 }],
        stdin: '',
        args: []
      })
    });
    const d1 = await r1.json();
    console.log('Output:', d1.run?.stdout || '(empty)');
    if (d1.run?.stdout?.includes('32767')) {
      console.log('⚠️ Found 32767 in output!');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\nTest 2: Check scanf return value');
  console.log('='.repeat(60));
  try {
    const r2 = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [{ content: code2 }],
        stdin: '',
        args: []
      })
    });
    const d2 = await r2.json();
    console.log('Output:', d2.run?.stdout || '(empty)');
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('\nTest 3: Full program (what user might be running)');
  console.log('='.repeat(60));
  try {
    const r3 = await fetch(`${baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '10.2.0',
        files: [{ content: code3 }],
        stdin: '',
        args: []
      })
    });
    const d3 = await r3.json();
    console.log('Output (first 500 chars):', (d3.run?.stdout || '').substring(0, 500));
    console.log('\nOutput length:', (d3.run?.stdout || '').length);
    if (d3.run?.stdout?.includes('32767')) {
      console.log('⚠️ Found 32767 in output!');
      const match = d3.run.stdout.match(/Enter (\d+) numbers:/);
      if (match) {
        console.log(`\n🔍 The program read: ${match[1]} as the number of inputs`);
        console.log(`   This is why it's printing ${match[1]} prompts!`);
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

test32767Issue();


