# Piston Self-Hosting Setup (Unlimited API)

## 🎯 Why Self-Host?

- ✅ **Unlimited requests** (no rate limits)
- ✅ **Full control** over the service
- ✅ **Better performance** (no network latency to public endpoint)
- ✅ **Custom language versions**
- ✅ **No external dependencies**

---

## 🐳 Docker Setup (Recommended)

### Step 1: Install Docker
Make sure Docker is installed on your server:
```bash
# Check if Docker is installed
docker --version
```

### Step 2: Run Piston
```bash
docker run -d -p 2000:2000 \
  --name piston \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```

### Step 3: Verify It's Running
```bash
# Check if container is running
docker ps

# Test the API
curl http://localhost:2000/api/v2/piston/runtimes
```

---

## ⚙️ Update Your Application

### Option 1: Environment Variable (Recommended)

Create `.env` file in your project root:
```env
VITE_PISTON_API_URL=http://localhost:2000/api/v2/piston
```

Or for production:
```env
VITE_PISTON_API_URL=http://your-server-ip:2000/api/v2/piston
```

### Option 2: Direct Code Change

Edit `src/services/pistonService.js`:
```javascript
this.baseUrl = 'http://localhost:2000/api/v2/piston'; // Self-hosted
// Or for production:
// this.baseUrl = 'http://your-server-ip:2000/api/v2/piston';
```

---

## 🌐 Production Deployment

### Using Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  piston:
    image: ghcr.io/engineer-man/piston:latest
    container_name: piston
    ports:
      - "2000:2000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped
```

Run it:
```bash
docker-compose up -d
```

### Using Nginx Reverse Proxy (Optional)

For production with HTTPS:
```nginx
server {
    listen 443 ssl;
    server_name piston.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:2000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 Configuration

### Custom Port
```bash
docker run -d -p 3000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```
Then use: `http://localhost:3000/api/v2/piston`

### Resource Limits
```bash
docker run -d -p 2000:2000 \
  --name piston \
  --memory="2g" \
  --cpus="2" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```

---

## ✅ Verification

### Test the API
```bash
# Check available runtimes
curl http://localhost:2000/api/v2/piston/runtimes

# Test code execution
curl -X POST http://localhost:2000/api/v2/piston/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "*",
    "files": [{"content": "print(\"Hello, World!\")"}],
    "stdin": ""
  }'
```

### Check Logs
```bash
docker logs piston
```

---

## 📊 Rate Limits Comparison

| Setup | Rate Limit | Cost |
|-------|------------|------|
| **Public Endpoint** | 5 req/sec | Free |
| **Self-Hosted** | Unlimited | Server cost only |

---

## 🚀 Benefits of Self-Hosting

1. **No Rate Limits**: Unlimited requests
2. **Better Performance**: Lower latency
3. **Full Control**: Custom configurations
4. **Privacy**: Code stays on your server
5. **Reliability**: No dependency on public service

---

## 📝 Summary

**Current**: Using public endpoint (5 req/sec limit)
**To get unlimited**: Self-host Piston on your server

**Quick Start**:
```bash
# 1. Run Piston
docker run -d -p 2000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston

# 2. Update .env
echo "VITE_PISTON_API_URL=http://localhost:2000/api/v2/piston" >> .env

# 3. Restart your app
```

That's it! Now you have unlimited Piston API access! 🎉

