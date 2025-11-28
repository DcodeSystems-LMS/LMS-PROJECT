# Fix: Make Piston Primary (Prevent Unnecessary Fallback)

## Problem

Piston was being called but falling back to Judge0 because:
1. Programs with scanf() and loops cause Piston to timeout (SIGKILL)
2. This triggers automatic fallback to Judge0
3. User wants Piston to be used when possible

## Solution

### Pre-Execution Validation

**File**: `src/services/executionService.js`

**Added**: `detectScanfWithoutInput()` method that:
- Detects scanf() usage in C/C++ code
- Checks if stdin input is provided
- Detects if code has loops that could cause timeouts
- Returns error **before** execution (prevents Piston timeout)

**Benefits**:
1. ✅ **Piston never called** for problematic code (no timeout)
2. ✅ **No fallback needed** - error shown immediately
3. ✅ **Faster response** - no waiting for timeout
4. ✅ **Clear error message** - user understands the issue

## How It Works

### Before:
```
1. Try Piston → Program loops 32767 times
2. Piston timeout (SIGKILL) → Fall back to Judge0
3. Judge0 executes → Shows output
```

### After:
```
1. Pre-execution check → Detects scanf without input
2. Return error immediately → No execution needed
3. Piston never called → No timeout, no fallback
```

## Code Flow

```javascript
// In executeCode()
if (language is C/C++) {
  const scanfIssue = detectScanfWithoutInput(sourceCode, input);
  if (scanfIssue) {
    // Return error immediately - don't call Piston
    return { success: false, error: ..., outputLines: ... };
  }
}

// Only call Piston if no issues detected
result = await pistonService.executeCode(...);
```

## Detection Logic

1. **Check for scanf()**: Detects `scanf("%d", &var)` patterns
2. **Check for loops**: Detects `for` and `while` loops
3. **Check for input**: If stdin is empty and scanf+loop exist, return error

## Status

✅ **Fixed** - Piston is now only called when it can succeed!

- Pre-execution validation prevents Piston timeouts
- No unnecessary fallbacks
- Faster error detection
- Better user experience


