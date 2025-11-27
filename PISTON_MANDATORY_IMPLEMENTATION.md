# Piston Mandatory Implementation

## Overview

Piston is now the **mandatory and only** execution service. All fallback logic to Judge0 has been removed.

## Changes Made

### 1. ExecutionService (`src/services/executionService.js`)

**Removed**:
- All fallback logic to Judge0
- All fallback logic to AlternativeExecutionService
- Error handling that triggers fallback

**Changed**:
- Piston is now the only execution service
- Errors from Piston are returned directly (no fallback)
- Clear error messages when Piston fails

**Code Flow**:
```javascript
// Before (with fallback):
try {
  result = await pistonService.executeCode(...);
} catch (error) {
  // Fall back to Judge0
  result = await judge0Service.executeCode(...);
}

// After (Piston only):
try {
  result = await pistonService.executeCode(...);
  // Handle Piston errors directly
} catch (error) {
  throw new Error(`Piston execution failed: ${error.message}`);
}
```

### 2. PistonService (`src/services/pistonService.js`)

**Changed**:
- Fatal signal errors now **return error results** instead of throwing
- No longer throws errors to trigger fallback
- All errors are returned as structured error objects

**Before**:
```javascript
if (hasFatalSignal) {
  throw new Error(`Piston fatal signal error: ${signalName}. Automatically falling back to Judge0...`);
}
```

**After**:
```javascript
if (hasFatalSignal) {
  return {
    success: false,
    output: '',
    error: `Piston fatal signal error: ${signalName}. This may be due to resource limits, timeout, or program crash.`,
    time: '0',
    memory: '0',
    status: 'Fatal Signal',
    needsInput: false
  };
}
```

## Benefits

1. ✅ **Consistent Execution**: Always uses Piston (no service switching)
2. ✅ **Faster**: No fallback delays
3. ✅ **Simpler**: Less code, easier to maintain
4. ✅ **Clear Errors**: Direct error messages from Piston

## Error Handling

When Piston fails, errors are returned directly:

### Fatal Signals (SIGKILL, SIGABRT, etc.):
```
Piston fatal signal error: SIGKILL (Process killed - timeout or resource limit). 
This may be due to resource limits, timeout, or program crash.
```

### Sandbox Errors:
```
Piston sandbox error: [error details]
```

### General Errors:
```
Piston execution failed: [error message]
```

## Pre-Execution Validation

To prevent Piston timeouts, pre-execution validation detects:
- `scanf()` without input (C/C++)
- Programs that will cause infinite loops
- Returns error **before** calling Piston

This prevents unnecessary Piston calls for code that will definitely fail.

## Status

✅ **Piston is now mandatory** - No fallback to Judge0!

- All code execution goes through Piston
- Errors are handled directly
- Pre-execution validation prevents timeouts
- Cleaner, simpler codebase


