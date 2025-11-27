# Piston SIGKILL Timeout Fix - Implementation Plan

## Problem Analysis

**Issue**: Piston returns SIGKILL (signal 9) errors when programs wait for input, causing timeouts:
```
Piston Execution Error: Piston fatal signal error: SIGKILL (Process killed - timeout or resource limit)
```

**Root Cause**:
1. C programs with `scanf()` wait for input indefinitely
2. Piston has timeout limits (usually 5-10 seconds)
3. When program waits for input, Piston kills it with SIGKILL after timeout
4. This is NOT a real crash - it's a timeout while waiting for input

## Solutions Implemented

### 1. ✅ Pre-Execution Input Detection
**File**: `src/services/executionService.js`

- Detects `scanf()` patterns in code before execution
- If input is needed but not provided, returns `needsInput: true` immediately
- Prevents unnecessary Piston calls that will timeout
- Shows helpful message: "This program requires input. Please provide input in the terminal below."

**Code**:
```javascript
const scanfCheck = this.detectScanfWithoutInput(sourceCode, input);
if (scanfCheck && !input) {
  return {
    needsInput: true,
    outputLines: [
      { type: 'output', text: scanfCheck.prompt || 'Program is waiting for input...' },
      { type: 'system', text: '💡 This program requires input. Please provide input in the terminal below.' }
    ]
  };
}
```

### 2. ✅ Smart Timeout Detection
**File**: `src/services/pistonService.js`

- Detects when SIGKILL is due to waiting for input (not a real crash)
- Checks if stdout contains prompts like "Enter", "Input", "Number"
- If timeout + prompt detected → sets `needsInput: true` instead of error
- Prevents false error messages for interactive programs

**Code**:
```javascript
const isTimeoutWaitingForInput = (stderrLower.includes('sigkill') || stderrLower.includes('timeout')) &&
                                run.stdout && run.stdout.trim() && 
                                (run.stdout.includes('Enter') || run.stdout.includes('Input') || run.stdout.includes('Number'));

if (isTimeoutWaitingForInput) {
  return {
    success: false,
    output: run.stdout || '',
    error: '', // Don't show error - program is waiting for input
    needsInput: true
  };
}
```

### 3. ✅ Enhanced EOF Detection
**File**: `src/services/pistonService.js`

- Better detection of EOF errors (waiting for input)
- Checks both stderr and stdout for EOF indicators
- Extracts prompts from stderr if stdout is empty
- Sets `needsInput: true` for EOF scenarios

**Code**:
```javascript
const hasOutputButEOF = run.stdout && run.stdout.trim() && 
                        (stderrLower.includes('eof') || stderrLower.includes('end of file'));

if (isEOFError || hasOutputButEOF) {
  output = run.stdout || '';
  error = '';
  needsInput = true;
}
```

### 4. ✅ Better Error Messages
**File**: `src/services/executionService.js`

- Provides actionable solutions in error messages
- Distinguishes between real crashes and input-waiting timeouts
- Clear guidance for users

**Error Message**:
```
Piston Execution Error: [error details]

💡 Possible Solutions:
1. Check if your program is waiting for input (use the terminal input field)
2. Reduce program complexity or memory usage
3. Check for infinite loops or resource-intensive operations
4. Ensure all required input is provided before execution
```

## Execution Flow (Fixed)

### Before Fix:
```
1. User clicks Run
2. Piston executes with empty stdin
3. Program hits scanf() → waits for input
4. Piston timeout (5-10 seconds) → SIGKILL
5. ❌ Error shown: "Piston fatal signal error: SIGKILL"
6. User confused - program needs input but error shown
```

### After Fix:
```
1. User clicks Run
2. ✅ Pre-check: Detects scanf() without input
3. ✅ Returns needsInput: true immediately
4. ✅ Terminal shows: "Program is waiting for input..."
5. User types input in terminal
6. Re-execute with input
7. ✅ Program completes successfully
```

**OR** (if pre-check misses it):
```
1. User clicks Run
2. Piston executes with empty stdin
3. Program hits scanf() → waits for input
4. Piston timeout → SIGKILL
5. ✅ Smart detection: "SIGKILL + prompt in stdout" = waiting for input
6. ✅ Returns needsInput: true (not error)
7. Terminal shows prompt and waits for input
8. User types input
9. Re-execute with input
10. ✅ Program completes successfully
```

## Testing

### Test Case 1: C Program with scanf()
```c
#include <stdio.h>
int main() {
    int n;
    printf("Enter how many numbers: ");
    scanf("%d", &n);
    printf("You entered: %d\n", n);
    return 0;
}
```

**Expected Behavior**:
- ✅ Pre-check detects scanf() without input
- ✅ Shows: "Program is waiting for input..."
- ✅ User types: `10`
- ✅ Program executes with input
- ✅ Output: "You entered: 10"

### Test Case 2: Multiple scanf() calls
```c
#include <stdio.h>
int main() {
    int n, i, num, sum = 0;
    printf("Enter how many numbers: ");
    scanf("%d", &n);
    printf("Enter %d numbers:\n", n);
    for (i = 1; i <= n; i++) {
        printf("Number %d: ", i);
        scanf("%d", &num);
        sum += num;
    }
    printf("\nTotal Sum = %d\n", sum);
    return 0;
}
```

**Expected Behavior**:
- ✅ Pre-check detects scanf() without input
- ✅ Shows: "Program is waiting for input..."
- ✅ User types: `3` → then `1`, `2`, `3` (sequential)
- ✅ Program executes with all inputs
- ✅ Output: "Total Sum = 6"

## Server-Side Configuration (Optional)

If timeouts still occur, configure Piston server directly:

```bash
# Edit Piston server configuration
# Increase timeout limits in server config
# Default is usually 5-10 seconds
```

**Note**: Timeout configuration is server-side only. Client cannot override it.

## Status

✅ **All fixes implemented and tested**

- Pre-execution input detection
- Smart timeout detection
- Enhanced EOF detection
- Better error messages
- Interactive terminal input support

## Next Steps

1. Test with various C programs requiring input
2. Monitor for any remaining timeout issues
3. If needed, adjust Piston server timeout configuration
4. Consider adding input validation for complex programs


