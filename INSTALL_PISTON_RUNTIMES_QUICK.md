# Quick Guide: Install Piston Runtimes

## 🔴 Current Issue
- ✅ Piston server running
- ❌ **NO runtimes installed** (0 languages)
- ❌ Execute fails: "runtime is unknown"

## ✅ Quick Fix

### Step 1: Access Piston Container

```bash
# Find container name
docker ps | grep piston

# Access container (replace <container-name> with actual name)
docker exec -it <container-name> /bin/sh
```

### Step 2: Install Runtimes

Inside the container:

```bash
# Navigate to CLI directory
cd /app/cli

# Install C runtime
./ppman install c

# Install other languages
./ppman install python
./ppman install javascript
./ppman install java
./ppman install cpp
./ppman install go
```

### Step 3: Verify

```bash
# List installed runtimes
./ppman list

# Exit container
exit
```

### Step 4: Test from Browser

```bash
# Check runtimes API
curl http://49.204.168.41:2000/api/v2/runtimes

# Should now return array of languages!
```

---

## 🔍 If ppman Not Found

If `ppman` is not in `/app/cli`:

```bash
# Search for ppman
find / -name ppman 2>/dev/null

# Check common locations
ls -la /usr/local/bin/
ls -la /app/
ls -la /opt/

# Check Piston documentation
cat /app/README.md
```

---

## 📋 Alternative: Install via API (if supported)

```bash
# Try package installation endpoint
curl -X POST http://49.204.168.41:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language": "c"}'
```

---

## ✅ After Installation

1. **Verify runtimes**:
   ```bash
   curl http://49.204.168.41:2000/api/v2/runtimes
   ```

2. **Should return**:
   ```json
   [
     {"language": "c", "version": "11.2.0", "aliases": ["c"]},
     {"language": "python", "version": "3.10.0", "aliases": ["py"]},
     ...
   ]
   ```

3. **Test execute** in your playground - should work now! 🎉

---

**Copy-paste these commands to install runtimes on your Piston server!**

