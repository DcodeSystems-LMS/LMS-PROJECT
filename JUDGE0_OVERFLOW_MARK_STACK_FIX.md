# Judge0 JVM Memory & Resource Errors - Complete Fix Guide

## Error 1: Overflow Mark Stack
```
Failed to reserve memory for new overflow mark stack with 4096 chunks and size 33554432B
Error occurred during initialization of VM
Failed to allocate initial concurrent mark overflow mark stack
Status: Runtime Error (NZEC)
```

## Error 2: Unable to Create Native Thread (NEW)
```
Failed to start thread - pthread_create failed (EAGAIN)
Error occurred during initialization of VM
java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached
Status: Runtime Error (NZEC)
```

This error occurs when the system cannot create new threads due to:
- System resource limits (ulimit)
- Too many threads being created
- Insufficient memory for thread stacks
- Process/thread limits reached

## Quick Solutions

### Solution 1: Switch to Serial GC (For Overflow Mark Stack Error)

The G1 garbage collector (default in Java 9+) requires extra memory for concurrent marking. **Switch to Serial GC** which uses much less memory.

### Solution 2: Fix Thread Creation Error (For Native Thread Error)

Reduce thread stack size and limit thread creation:

```bash
# Add these JVM options:
-XX:ThreadStackSize=256k    # Reduce stack size (default is 1MB)
-Xss256k                     # Alternative way to set stack size
-XX:CICompilerCount=1        # Limit compiler threads
-XX:ConcGCThreads=1          # Limit concurrent GC threads
```

### Complete Fix for Judge0 Server (49.204.168.41:2358)

If you have SSH access:

```bash
# SSH into server
ssh user@49.204.168.41

# Stop Judge0
docker stop judge0-ce
docker rm judge0-ce

# Restart with optimized settings for low-memory systems
docker run -d \
  --name judge0-ce \
  -p 2358:2358 \
  -e JAVA_OPTS="-XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -Xmx256m -Xms128m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1" \
  judge0/judge0-ce:latest
```

**Key optimizations:**
- ✅ Serial GC (no concurrent threads)
- ✅ Reduced heap (256m)
- ✅ Reduced metaspace (128m)
- ✅ **Small thread stack (256k)** - critical for thread creation
- ✅ **Single compiler thread** - reduces thread overhead

### Key Changes
- ✅ **Use Serial GC**: `-XX:+UseSerialGC` (instead of G1)
- ✅ **Reduce heap**: `-Xmx256m` (from 512m)
- ✅ **Reduce metaspace**: `-XX:MaxMetaspaceSize=128m` (from 256m)
- ✅ **Single GC thread**: `-XX:ParallelGCThreads=1`

## Why Serial GC?

| Feature | G1 GC | Serial GC |
|---------|-------|-----------|
| Memory overhead | High (needs overflow stacks) | Low (simple algorithm) |
| Concurrent marking | Yes (needs extra memory) | No (stop-the-world) |
| Best for | Large heaps (>1GB) | Small heaps (<512MB) |
| Thread overhead | Multiple threads | Single thread |

**For Judge0 with limited memory, Serial GC is the better choice.**

## Additional System-Level Fixes (For Thread Creation Error)

If the thread creation error persists, check system limits:

### Check Current Limits
```bash
# Check thread limits
ulimit -u          # Max user processes
ulimit -s          # Stack size
ulimit -v          # Virtual memory

# Check system-wide limits
cat /proc/sys/kernel/threads-max
cat /proc/sys/vm/max_map_count
```

### Increase Limits (if possible)
```bash
# Increase user process limit
ulimit -u 4096

# Increase virtual memory
ulimit -v unlimited

# For systemd services, edit /etc/security/limits.conf:
# * soft nproc 4096
# * hard nproc 8192
```

### For Docker Containers
```bash
# Add ulimit settings to docker run
docker run -d \
  --name judge0-ce \
  -p 2358:2358 \
  --ulimit nproc=4096 \
  --ulimit nofile=8192 \
  -e JAVA_OPTS="..." \
  judge0/judge0-ce:latest
```

## Alternative: Reduce G1 Threads

If you must use G1 GC (not recommended for low-memory):

```bash
JAVA_OPTS="-Xmx512m -Xms256m -XX:MaxMetaspaceSize=256m -XX:MetaspaceSize=128m -XX:+UseG1GC -XX:ConcGCThreads=1 -XX:ParallelGCThreads=2 -XX:ThreadStackSize=256k"
```

But Serial GC is still recommended for systems with < 2GB RAM.

## Complete JVM Options for Low-Memory Systems

Here's the complete set of JVM options that should work for most low-memory systems:

```bash
JAVA_OPTS="-XX:MaxMetaspaceSize=128m \
           -XX:MetaspaceSize=64m \
           -Xmx256m \
           -Xms128m \
           -XX:+UseSerialGC \
           -XX:ParallelGCThreads=1 \
           -XX:ThreadStackSize=256k \
           -XX:CICompilerCount=1 \
           -XX:ReservedCodeCacheSize=32m \
           -XX:InitialCodeCacheSize=16m"
```

**Explanation:**
- `MaxMetaspaceSize=128m` - Limit class metadata
- `Xmx256m` - Maximum heap size
- `UseSerialGC` - Single-threaded GC (no concurrent threads)
- `ThreadStackSize=256k` - **Critical**: Reduces memory per thread
- `CICompilerCount=1` - Single compiler thread
- `ReservedCodeCacheSize=32m` - Limit JIT code cache

## Verification

After applying the fix, test with:

```bash
curl http://49.204.168.41:2358/about
```

Then try running your Java code again - it should work!

## Troubleshooting

If errors persist:

1. **Check available memory**: `free -h` (Linux) or `wmic OS get TotalVisibleMemorySize,FreePhysicalMemory` (Windows)
2. **Check running processes**: `ps aux | grep java` - kill unnecessary Java processes
3. **Check Docker memory**: `docker stats judge0-ce` - ensure container has enough memory
4. **Reduce further**: Try `-Xmx128m` and `-XX:MaxMetaspaceSize=64m` if still failing

