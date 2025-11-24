# Piston Server: Install Runtimes

## 🔴 Problem

Your Piston server is running but has **NO runtimes installed**:
- Health check: ✅ Working
- Runtimes: ❌ Empty array `[]`
- Execute: ❌ Fails with "runtime is unknown"

## ✅ Solution: Install Runtimes

Piston needs runtimes to be installed separately using `ppman` (Piston Package Manager).

### Option 1: Using ppman (Piston Package Manager) - **RECOMMENDED**

```bash
# SSH into your server (49.204.168.41)
ssh user@49.204.168.41

# Access the Piston container
docker exec -it <piston-container-name> /bin/sh

# Navigate to CLI directory (if exists)
cd /app/cli  # or wherever ppman is located

# Install C runtime
./ppman install c

# Install other common runtimes
./ppman install python
./ppman install javascript
./ppman install java
./ppman install cpp
./ppman install go

# List installed runtimes
./ppman list

# Update all runtimes
./ppman update
```

**Note**: If `ppman` is not in `/app/cli`, check:
```bash
# Find ppman location
which ppman
find / -name ppman 2>/dev/null
ls -la /usr/local/bin/
```

### Option 2: Using Piston API (Direct)

```bash
# Install C runtime via API
curl -X POST http://49.204.168.41:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c",
    "version": "11.2.0"
  }'
```

### Option 3: Using Docker Exec

```bash
# Access the Piston container
docker exec -it <piston-container-name> /bin/sh

# Inside container, install packages
# (Method depends on Piston version)
```

### Option 4: Check Piston Documentation

Piston v3.1.1 might have a different package installation method. Check:

```bash
# Check Piston container logs
docker logs <piston-container-name>

# Check if there's a package manager endpoint
curl http://49.204.168.41:2000/api/v2/packages
```

---

## 🔍 Verify Installation

After installing runtimes:

```bash
# Check runtimes again
curl http://49.204.168.41:2000/api/v2/runtimes

# Should return array of languages, e.g.:
# [
#   {"language": "c", "version": "11.2.0", "aliases": ["c"]},
#   {"language": "python", "version": "3.10.0", "aliases": ["py"]},
#   ...
# ]
```

---

## 📋 Quick Fix Commands

```bash
# 1. Check current container
docker ps | grep piston

# 2. Check container logs
docker logs <piston-container-name>

# 3. Access container shell
docker exec -it <piston-container-name> /bin/sh

# 4. Inside container, check for package manager
ls -la /usr/local/bin/
which piston

# 5. Try to install packages
# (Commands depend on Piston setup)
```

---

## 🚀 Alternative: Use Pre-configured Piston Image

Some Piston Docker images come with runtimes pre-installed:

```bash
# Stop current container
docker stop <piston-container-name>
docker rm <piston-container-name>

# Use image with runtimes (if available)
docker run -d \
  --name piston \
  -p 2000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest

# Or check for runtime-enabled images
docker search piston
```

---

## 📝 Notes

- **Piston v3.1.1** might require manual runtime installation
- Runtimes are language-specific Docker images
- Each runtime needs to be installed separately
- Check Piston GitHub for latest installation instructions

---

## 🔗 Resources

- Piston GitHub: https://github.com/engineer-man/piston
- Piston Docs: Check the README for runtime installation
- Piston CLI: `npm install -g @piston/cli`

---

**After installing runtimes, restart your frontend and test again!**

