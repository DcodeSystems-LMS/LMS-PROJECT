# Judge0 JVM Errors - Complete Fix Summary

## All Errors Encountered

1. ✅ **Metaspace Allocation Error** - Fixed by reducing metaspace size
2. ✅ **Overflow Mark Stack Error** - Fixed by switching to Serial GC
3. ✅ **Native Thread Creation Error** - Fixed by reducing thread stack size

## Complete Solution (Apply All Fixes)

### For Judge0 Server (49.204.168.41:2358)

```bash
# SSH into server
ssh user@49.204.168.41

# Stop and remove current container
docker stop judge0-ce
docker rm judge0-ce

# Start with ALL optimizations
docker run -d \
  --name judge0-ce \
  -p 2358:2358 \
  -e JAVA_OPTS="-XX:MaxMetaspaceSize=128m \
               -XX:MetaspaceSize=64m \
               -Xmx256m \
               -Xms128m \
               -XX:+UseSerialGC \
               -XX:ParallelGCThreads=1 \
               -XX:ThreadStackSize=256k \
               -XX:CICompilerCount=1 \
               -XX:ReservedCodeCacheSize=32m \
               -XX:InitialCodeCacheSize=16m" \
  judge0/judge0-ce:latest
```

## What Each Setting Does

| Setting | Purpose | Default | Our Value |
|---------|---------|---------|-----------|
| `MaxMetaspaceSize=128m` | Limits class metadata storage | ~1GB | 128MB |
| `Xmx256m` | Maximum heap size | Auto | 256MB |
| `UseSerialGC` | Single-threaded GC (low memory) | G1 GC | Serial |
| `ThreadStackSize=256k` | **Critical**: Reduces memory per thread | 1MB | 256KB |
| `CICompilerCount=1` | Limits JIT compiler threads | Auto | 1 thread |
| `ReservedCodeCacheSize=32m` | Limits JIT code cache | 240MB | 32MB |

## Why These Settings Work

### 1. Reduced Metaspace (128m)
- Stores class metadata
- 128MB is sufficient for most applications
- Prevents metaspace allocation errors

### 2. Serial GC Instead of G1
- **G1 GC**: Needs extra memory for concurrent marking (causes overflow stack errors)
- **Serial GC**: Simple, single-threaded, uses minimal memory
- Perfect for small heaps (<512MB)

### 3. Reduced Thread Stack (256k)
- **Default**: 1MB per thread = can only create ~256 threads with 256MB
- **256KB**: Can create ~1024 threads with same memory
- **Critical fix** for "unable to create native thread" errors

### 4. Limited Compiler Threads
- JIT compiler creates threads for optimization
- Single thread reduces memory overhead
- Still compiles code, just slower (acceptable trade-off)

## Memory Breakdown

With our settings on a 256MB heap:
- **Heap**: 256MB (for objects)
- **Metaspace**: 128MB (for classes)
- **Code Cache**: 32MB (for JIT)
- **Thread Stacks**: ~10-20MB (40 threads × 256KB)
- **Total**: ~426MB

This fits comfortably in a 512MB-1GB system.

## Verification Steps

1. **Check container is running**:
   ```bash
   docker ps | grep judge0
   ```

2. **Check logs**:
   ```bash
   docker logs judge0-ce | tail -20
   ```

3. **Test API**:
   ```bash
   curl http://49.204.168.41:2358/about
   ```

4. **Test Java execution**:
   - Run a simple Java program in the playground
   - Should compile and execute successfully

## If Errors Persist

### Further Reductions (Last Resort)

If still getting errors, reduce even more:

```bash
JAVA_OPTS="-XX:MaxMetaspaceSize=64m \
           -XX:MetaspaceSize=32m \
           -Xmx128m \
           -Xms64m \
           -XX:+UseSerialGC \
           -XX:ParallelGCThreads=1 \
           -XX:ThreadStackSize=128k \
           -XX:CICompilerCount=1 \
           -XX:ReservedCodeCacheSize=16m"
```

### Check System Resources

```bash
# Check available memory
free -h

# Check process limits
ulimit -a

# Check running Java processes
ps aux | grep java

# Check Docker container memory
docker stats judge0-ce
```

## Quick Reference

**One-liner for Docker:**
```bash
docker run -d --name judge0-ce -p 2358:2358 \
  -e JAVA_OPTS="-XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -Xmx256m -Xms128m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1" \
  judge0/judge0-ce:latest
```

## Related Documents

- `JUDGE0_METASPACE_ERROR_FIX.md` - Detailed guide for all errors
- `JUDGE0_OVERFLOW_MARK_STACK_FIX.md` - Quick reference
- `JAVA_CLASS_NAME_FIX.md` - Java class name compilation fix

---

**Status**: ✅ All known JVM errors addressed  
**Last Updated**: After thread creation error fix

