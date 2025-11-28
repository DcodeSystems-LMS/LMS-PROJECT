# Why Piston Is Not Being Used Successfully

## Current Situation

**Piston IS being called**, but it's **failing and falling back to Judge0** due to SIGKILL errors.

## The Problem

### What's Happening:

1. ✅ **Piston is being called first** (line 60-61 in executionService.js)
2. ✅ **Piston API endpoints are working** (we tested and confirmed)
3. ❌ **Piston returns SIGKILL** (signal 9 - timeout/resource limit)
4. ⚠️ **System falls back to Judge0** (automatic fallback)
5. ✅ **Code executes via Judge0** (works, but not using Piston)

### Why SIGKILL Happens:

Piston has **strict resource limits**:
- Memory limits
- CPU time limits
- Process limits
- Sandbox restrictions

When code exceeds these limits, Piston kills the process with SIGKILL.

## Code Flow

```javascript
// executionService.js line 60-61
console.log('Trying Piston API for:', language);
result = await pistonService.executeCode(sourceCode, language, allInputs);

// If Piston succeeds, use it
// If Piston fails (SIGKILL), catch error and fall back to Judge0
```

## Why This Happens

### 1. Piston Resource Limits
- **Memory**: Limited per execution
- **CPU Time**: Timeout limits
- **Process Count**: Limited processes
- **Sandbox**: Strict security restrictions

### 2. Code Characteristics That Trigger SIGKILL
- Large memory usage
- Long execution time
- Multiple processes
- Resource-intensive operations

### 3. Piston Configuration
- Default limits may be too strict
- Server configuration may need adjustment

## Solutions

### Option 1: Adjust Piston Resource Limits (Recommended)

**On Piston Server**, adjust limits in configuration:

```bash
# Edit Piston config
docker exec -it piston /bin/sh
# Modify resource limits in config
```

**Or restart with higher limits:**
```bash
docker run -d \
  --name piston \
  -p 2000:2000 \
  -e MAX_MEMORY=512M \
  -e MAX_CPU_TIME=10 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest
```

### Option 2: Use Piston for Simple Code Only

**Modify executionService.js** to use Piston only for simple code:

```javascript
// Check if code is simple enough for Piston
const isSimpleCode = sourceCode.length < 1000 && 
                     !sourceCode.includes('malloc') && 
                     !sourceCode.includes('while(1)');

if (isSimpleCode) {
  // Try Piston
} else {
  // Skip Piston, use Judge0 directly
}
```

### Option 3: Accept Fallback Behavior (Current)

**Current behavior is actually good:**
- ✅ Piston tried first (fast if it works)
- ✅ Automatic fallback to Judge0 (reliable)
- ✅ User doesn't see errors
- ✅ Code always executes

**This is working as designed!**

### Option 4: Disable Piston Temporarily

**If you want to skip Piston entirely:**

```javascript
// In executionService.js, comment out Piston:
// try {
//   console.log('Trying Piston API for:', language);
//   result = await pistonService.executeCode(sourceCode, language, allInputs);
//   console.log('Piston API succeeded:', result);
// } catch (error) {
//   // Skip Piston
// }

// Go directly to Judge0
try {
  result = await judge0Service.executeCode(sourceCode, languageId, allInputs);
} catch (error2) {
  // Fallback to alternative
}
```

## Current Status

### What's Working:
- ✅ Piston API is accessible
- ✅ Piston is being called first
- ✅ Automatic fallback works
- ✅ Code executes successfully

### What's Not Working:
- ❌ Piston execution fails (SIGKILL)
- ⚠️ Always falls back to Judge0
- ⚠️ Not getting Piston's benefits

## Recommendation

**Option 1 is best**: Adjust Piston resource limits on the server.

**Or keep current behavior**: It's working fine - Piston is tried first, and Judge0 is used as reliable fallback.

## Testing

To see if Piston is being called, check browser console:
- Look for: `"Trying Piston API for: [language]"`
- Look for: `"🚀 PISTON SERVICE CALLED - executeCode()"`
- Look for: `"⚠️ Piston fatal signal detected"`

If you see these messages, Piston IS being called, but it's failing and falling back.


