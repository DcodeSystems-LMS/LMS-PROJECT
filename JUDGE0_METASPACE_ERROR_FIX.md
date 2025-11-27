# Judge0 Metaspace Allocation Error Fix

## Error Descriptions

### Error 1: Metaspace Allocation Failure
```
Error occurred during initialization of VM
Could not allocate metaspace: 1073741824 bytes
Status: Compilation Error
```

This error occurs when the Java Virtual Machine (JVM) cannot allocate 1GB (1073741824 bytes) for the metaspace, which stores class metadata.

### Error 2: Overflow Mark Stack Allocation Failure
```
Failed to reserve memory for new overflow mark stack with 4096 chunks and size 33554432B
Error occurred during initialization of VM
Failed to allocate initial concurrent mark overflow mark stack
Status: Runtime Error (NZEC)
```

This error occurs when the JVM's garbage collector (GC) cannot allocate memory for the concurrent mark stack, which is part of the G1 garbage collector's marking phase.

### Error 3: Unable to Create Native Thread
```
Failed to start thread - pthread_create failed (EAGAIN)
Error occurred during initialization of VM
java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached
Status: Runtime Error (NZEC)
```

This error occurs when the system cannot create new threads due to:
- System resource limits (ulimit on Linux)
- Too many threads being created
- Insufficient memory for thread stacks (each thread needs stack space)
- Process/thread limits reached

## Root Causes

### For Metaspace Error:
- The system doesn't have enough available memory
- JVM metaspace settings are too high
- Multiple Java processes competing for memory

### For Overflow Mark Stack Error:
- Insufficient memory for G1 garbage collector's concurrent marking
- G1 GC requires additional memory for its internal structures
- Heap size too small for the GC algorithm being used
- Too many GC threads competing for memory

### For Native Thread Creation Error:
- System resource limits (ulimit) too restrictive
- Thread stack size too large (default 1MB per thread)
- Too many threads being created by JVM
- Process/thread limits reached at OS level
- Insufficient memory for thread stacks

## Solutions

### Solution 1: Reduce Metaspace Size (Recommended)

If you're running Judge0 locally or have access to the server configuration:

#### For Docker-based Judge0:
```bash
# Stop the current Judge0 container
docker stop judge0-ce
docker rm judge0-ce

# Start with reduced memory settings and Serial GC (more memory-efficient)
# Includes thread stack size reduction to prevent thread creation errors
docker run -d \
  --name judge0-ce \
  -p 2358:2358 \
  -e MAX_METASPACE_SIZE=128m \
  -e JAVA_OPTS="-XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -Xmx256m -Xms128m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1" \
  judge0/judge0-ce:latest
```

**Key changes:**
- Reduced metaspace to 128m (from 256m)
- Reduced heap to 256m (from 512m)
- **Use Serial GC** (`-XX:+UseSerialGC`) - simpler, uses less memory than G1
- Limit GC threads to 1 (`-XX:ParallelGCThreads=1`)

#### For Direct Java Execution:
Set these JVM options before starting Judge0:
```bash
# For systems with limited memory, use Serial GC with reduced thread stack
export JAVA_OPTS="-XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -Xmx256m -Xms128m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1"

# Alternative: If you have more memory, use G1 with reduced settings
# export JAVA_OPTS="-XX:MaxMetaspaceSize=256m -XX:MetaspaceSize=128m -Xmx512m -Xms256m -XX:+UseG1GC -XX:ConcGCThreads=1 -XX:ParallelGCThreads=2 -XX:ThreadStackSize=256k"

# Then start Judge0
```

#### For docker-compose.yml:
```yaml
version: '3'
services:
  judge0:
    image: judge0/judge0-ce:latest
    ports:
      - "2358:2358"
    environment:
      # Use Serial GC for low-memory systems with reduced thread stack
      - JAVA_OPTS=-XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -Xmx256m -Xms128m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1
      - MAX_METASPACE_SIZE=128m
    # Optional: Limit container memory
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Solution 2: Increase Available System Memory

1. **Close unnecessary applications** to free up RAM
2. **Check available memory**:
   ```bash
   # Windows
   wmic OS get TotalVisibleMemorySize,FreePhysicalMemory
   
   # Linux
   free -h
   ```
3. **If using a VM**, increase allocated RAM

### Solution 3: Switch to Serial Garbage Collector

The G1 GC (default in newer Java versions) requires more memory for concurrent marking. Switch to Serial GC which is more memory-efficient:

```bash
# Serial GC (recommended for low-memory systems)
# Includes thread stack reduction to prevent thread creation errors
JAVA_OPTS="-Xmx256m -Xms128m -XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1"

# Or if you must use G1, reduce concurrent threads
JAVA_OPTS="-Xmx512m -Xms256m -XX:MaxMetaspaceSize=256m -XX:MetaspaceSize=128m -XX:+UseG1GC -XX:ConcGCThreads=1 -XX:ParallelGCThreads=2 -XX:ThreadStackSize=256k"
```

**Why Serial GC?**
- Uses less memory (no concurrent marking overhead)
- Simpler algorithm, fewer internal structures
- Better for small heaps (< 512MB)
- Single-threaded, no thread overhead

### Solution 4: Reduce Thread Stack Size (For Thread Creation Errors)

If you're getting "unable to create native thread" errors, reduce thread stack size:

```bash
# Reduce thread stack from default 1MB to 256KB
-XX:ThreadStackSize=256k
# or
-Xss256k

# Also limit compiler threads
-XX:CICompilerCount=1
```

**Why reduce stack size?**
- Default Java thread stack is 1MB per thread
- With 256KB, you can create ~4x more threads with same memory
- Most applications don't need 1MB stack per thread

### Solution 4: Check for Multiple Java Processes

```bash
# Windows
tasklist | findstr java

# Linux/Mac
ps aux | grep java
```

Kill unnecessary Java processes to free memory.

## Recommended JVM Settings

### For Low-Memory Systems (< 2GB RAM)
```bash
JAVA_OPTS="-Xmx256m -Xms128m -XX:MaxMetaspaceSize=128m -XX:MetaspaceSize=64m -XX:+UseSerialGC -XX:ParallelGCThreads=1 -XX:ThreadStackSize=256k -XX:CICompilerCount=1"
```

### For Medium Systems (2-4GB RAM)
```bash
JAVA_OPTS="-Xmx512m -Xms256m -XX:MaxMetaspaceSize=256m -XX:MetaspaceSize=128m -XX:+UseSerialGC -XX:ParallelGCThreads=2 -XX:ThreadStackSize=256k -XX:CICompilerCount=2"
```

### For Systems with More RAM (4GB+)
```bash
JAVA_OPTS="-Xmx1024m -Xms512m -XX:MaxMetaspaceSize=512m -XX:MetaspaceSize=256m -XX:+UseG1GC -XX:ConcGCThreads=2 -XX:ParallelGCThreads=4"
```

### Settings Reference Table

| System RAM | Heap (Xmx) | Metaspace | GC Algorithm | GC Threads | Thread Stack |
|------------|------------|-----------|--------------|------------|--------------|
| < 2GB      | 256m       | 128m      | Serial       | 1          | 256k         |
| 2-4GB      | 512m       | 256m      | Serial       | 2          | 256k         |
| 4-8GB      | 1024m      | 512m      | G1           | 2-4        | 512k         |
| 8GB+       | 2048m      | 512m      | G1           | 4+         | 1m (default) |

## For Remote Judge0 Server (49.204.168.41:2358)

If the error is on the remote server, you need to:

1. **SSH into the server**:
   ```bash
   ssh user@49.204.168.41
   ```

2. **Find Judge0 process/container**:
   ```bash
   # If using Docker
   docker ps | grep judge0
   docker logs judge0-ce
   
   # If running as service
   systemctl status judge0
   ```

3. **Apply Solution 1** based on how Judge0 is running

4. **Restart Judge0**:
   ```bash
   # Docker
   docker restart judge0-ce
   
   # Systemd
   sudo systemctl restart judge0
   ```

## Verification

After applying the fix, verify Judge0 is running:

```bash
# Test the API
curl http://49.204.168.41:2358/about

# Or from your application
curl http://localhost:2358/about
```

Expected response:
```json
{
  "version": "...",
  "status": "OK"
}
```

## Prevention

1. **Monitor memory usage** regularly
2. **Set appropriate JVM options** from the start
3. **Use Serial GC for low-memory systems** instead of G1
4. **Use resource limits** in Docker/containers
5. **Limit GC threads** to reduce memory overhead
6. **Keep system updated** and free of memory leaks
7. **Test with minimal settings first**, then increase if needed

## Understanding the Errors

### Metaspace Error
- **What**: Class metadata storage area
- **Fix**: Reduce `-XX:MaxMetaspaceSize`

### Overflow Mark Stack Error
- **What**: G1 GC's concurrent marking structure
- **Fix**: Use Serial GC (`-XX:+UseSerialGC`) or reduce G1 concurrent threads
- **Why**: G1 GC needs extra memory for concurrent operations, Serial GC doesn't

### Native Thread Creation Error
- **What**: System cannot create new threads (pthread_create failed)
- **Fix**: Reduce thread stack size (`-XX:ThreadStackSize=256k`) and limit compiler threads (`-XX:CICompilerCount=1`)
- **Why**: Default 1MB stack per thread consumes too much memory; reducing allows more threads with same memory

## Additional Resources

- [Judge0 Documentation](https://github.com/judge0/judge0)
- [JVM Memory Tuning Guide](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/)

