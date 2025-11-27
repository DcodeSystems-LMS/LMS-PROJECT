# Piston SIGKILL Fallback Fix

## Problem
Piston was returning SIGKILL (signal 9) errors but not automatically falling back to Judge0:
```
Fatal Error: SIGKILL (Process killed - timeout or resource limit)
Program crashed unexpectedly
```

SIGKILL indicates the process was killed, often due to:
- Timeout limits
- Resource limits (memory, CPU)
- Sandbox restrictions

## Solution

### Enhanced Fatal Signal Detection
**File**: `src/services/pistonService.js`

**Changes**:
- **ALL fatal signals now throw errors** to trigger automatic fallback
- Previously only "Sandbox keeper" errors triggered fallback
- Now SIGKILL, SIGABRT, SIGSEGV, etc. all trigger fallback
- Better error messages for each signal type

**Signal Types That Trigger Fallback**:
- Signal 6: SIGABRT (Program aborted)
- Signal 9: SIGKILL (Process killed - timeout/resource limit) ✅ **Now triggers fallback**
- Signal 11: SIGSEGV (Segmentation fault)
- Signal 15: SIGTERM (Process terminated)
- Signal 8: SIGFPE (Floating point exception)
- Signal 4: SIGILL (Illegal instruction)
- Signal 7: SIGBUS (Bus error)

## How It Works Now

### Execution Flow:

```
1. Try Piston API
   ↓
2. Piston returns SIGKILL (signal 9)
   ↓
3. PistonService detects fatal signal
   ↓
4. Throws error: "Piston fatal signal error: SIGKILL..."
   ↓
5. ExecutionService catches error
   ↓
6. Automatically falls back to Judge0
   ↓
7. Code executes via Judge0 (or shows better error)
```

### Before:
- SIGKILL returned as error result
- No automatic fallback
- User sees fatal error

### After:
- SIGKILL throws error
- Automatic fallback to Judge0
- Code may execute successfully via Judge0
- Better user experience

## Benefits

1. **Automatic Recovery**: SIGKILL errors now trigger fallback
2. **Better Success Rate**: Judge0 may handle code that Piston kills
3. **Improved UX**: Seamless transition between services
4. **Comprehensive Coverage**: All fatal signals trigger fallback

## Testing

To verify the fix:

1. **Run code that causes SIGKILL** (timeout/resource limit):
   ```c
   #include <stdio.h>
   int main() {
       // Infinite loop that might timeout
       while(1) {
           printf("Running...\n");
       }
       return 0;
   }
   ```

2. **Expected Behavior**:
   - Piston detects SIGKILL
   - Automatically falls back to Judge0
   - Code executes (or shows proper timeout error from Judge0)
   - User sees result without manual intervention

## Files Modified

1. **src/services/pistonService.js**
   - Changed fatal signal handling to ALWAYS throw errors
   - Removed conditional check - all fatal signals trigger fallback
   - Better error messages

## Error Messages

### Before:
```
Fatal Error: SIGKILL (Process killed - timeout or resource limit)
Program crashed unexpectedly
```
(No fallback - user stuck with error)

### After:
```
Piston fatal signal error: SIGKILL... Automatically falling back to Judge0...
```
(Fallback triggered - code may execute via Judge0)

## Status

✅ All fatal signals now trigger fallback
✅ SIGKILL specifically handled
✅ Automatic fallback to Judge0
✅ Better error messages
✅ Improved success rate

The system now automatically handles ALL fatal signals (including SIGKILL) and falls back to Judge0 seamlessly! 🎉


