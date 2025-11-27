# Piston Fatal Signal Error Fix

## Problem
Piston API was returning fatal signal 6 (SIGABRT) errors:
```
Runtime Error:
Sandbox keeper received fatal signal 6
```

This indicates the Piston sandbox crashed, which can happen due to:
- Memory issues
- Invalid code operations
- Sandbox restrictions
- Runtime errors

## Solution

### 1. Enhanced Error Detection in PistonService
**File**: `src/services/pistonService.js`

**Changes**:
- Added detection for fatal signals (6, 11, 9, 15)
- Detects "Sandbox keeper received fatal signal" errors
- Throws error to trigger automatic fallback to Judge0
- Better error messages for different signal types

**Signal Types Detected**:
- Signal 6: SIGABRT (Program aborted)
- Signal 11: SIGSEGV (Segmentation fault)
- Signal 9: SIGKILL (Process killed)
- Signal 15: SIGTERM (Process terminated)

### 2. Improved Fallback Logic in ExecutionService
**File**: `src/services/executionService.js`

**Changes**:
- Checks for fatal signal errors in Piston response
- Automatically falls back to Judge0 when fatal signals detected
- Better error logging for debugging
- Multiple fallback layers (Judge0 → Alternative Judge0)

## How It Works Now

### Execution Flow with Fatal Signal Detection:

```
1. Try Piston API
   ↓
2. Check response for fatal signals
   ↓ (if fatal signal detected)
3. Throw error to trigger fallback
   ↓
4. Try Judge0 API
   ↓ (if fails)
5. Try Alternative Judge0
   ↓
6. Return result or final error
```

### Error Detection:

```javascript
// In pistonService.js formatResult()
if (run.signal) {
  // Detect fatal signals
  if (stderrText.includes('Sandbox keeper received fatal signal')) {
    throw new Error('Piston sandbox error - trigger fallback');
  }
}

// In executionService.js
if (result.error.includes('fatal signal') || 
    result.error.includes('sandbox keeper')) {
  throw new Error('Piston sandbox error - falling back');
}
```

## Benefits

1. **Automatic Fallback**: When Piston crashes, automatically uses Judge0
2. **Better Error Messages**: Clear indication of what went wrong
3. **Improved Reliability**: Multiple fallback layers ensure code execution
4. **User Experience**: Seamless transition between services

## Testing

To verify the fix works:

1. **Run C code that causes fatal signal**:
   ```c
   #include <stdio.h>
   int main() {
       int *p = NULL;
       *p = 10; // This will cause SIGSEGV
       return 0;
   }
   ```

2. **Expected Behavior**:
   - Piston detects fatal signal
   - Automatically falls back to Judge0
   - Code executes (or shows proper error from Judge0)
   - User sees result without manual intervention

## Files Modified

1. **src/services/pistonService.js**
   - Added fatal signal detection
   - Enhanced error handling
   - Throws errors for fallback

2. **src/services/executionService.js**
   - Added fatal signal check
   - Improved fallback logic
   - Better error logging

## Error Messages

### Before:
```
Runtime Error:
Sandbox keeper received fatal signal 6
```

### After:
- **If fallback succeeds**: Code executes via Judge0 (no error shown)
- **If all services fail**: Clear error message with details

## Status

✅ Fatal signal detection implemented
✅ Automatic fallback to Judge0
✅ Better error messages
✅ Multiple fallback layers

The system now automatically handles Piston sandbox crashes and falls back to Judge0 seamlessly! 🎉


