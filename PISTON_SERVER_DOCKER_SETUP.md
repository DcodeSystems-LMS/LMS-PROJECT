# Piston Server Docker Configuration Guide

## 🐳 Current Setup

- **Server IP**: `49.204.168.41`
- **Port**: `2000`
- **Endpoint**: `http://49.204.168.41:2000/api/v2/piston`
- **Status**: Self-hosted in Docker

---

## ✅ Step 1: Verify Piston is Running

### Check if container is running:
```bash
docker ps | grep piston
```

### Check Piston health:
```bash
curl http://49.204.168.41:2000/
# Should return: {"message":"Piston v3.1.1"}
```

### Check available runtimes:
```bash
curl http://49.204.168.41:2000/api/v2/piston/runtimes
```

---

## 🔧 Step 2: Fix CORS Issue

### Option A: Run Piston with CORS Environment Variables

Stop current container and restart with CORS enabled:

```bash
# Stop current container
docker stop <piston-container-name>
docker rm <piston-container-name>

# Run with CORS enabled (if supported)
docker run -d \
  --name piston \
  -p 2000:2000 \
  -e CORS_ORIGIN="*" \
  -e CORS_ENABLED="true" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest
```

### Option B: Use Nginx Reverse Proxy (Recommended)

Create Nginx configuration file:

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/piston
```

Add this configuration:

```nginx
server {
    listen 2000;
    server_name 49.204.168.41;

    location / {
        proxy_pass http://localhost:2001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

Then:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/piston /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Run Piston on internal port 2001
docker run -d \
  --name piston \
  -p 2001:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest
```

### Option C: Docker Compose with Nginx

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  piston:
    image: ghcr.io/engineer-man/piston:latest
    container_name: piston
    ports:
      - "2001:2000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped
    networks:
      - piston-network

  nginx:
    image: nginx:alpine
    container_name: piston-nginx
    ports:
      - "2000:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - piston
    restart: unless-stopped
    networks:
      - piston-network

networks:
  piston-network:
    driver: bridge
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://piston:2000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

Run:
```bash
docker-compose up -d
```

---

## 🧪 Step 3: Test CORS Configuration

### Test from browser console:
```javascript
fetch('http://49.204.168.41:2000/api/v2/piston/runtimes', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ CORS working!', data))
.catch(err => console.error('❌ CORS error:', err));
```

### Test with curl:
```bash
curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Look for `Access-Control-Allow-Origin: *` in response headers.

---

## 🔍 Step 4: Check Piston Logs

```bash
# View logs
docker logs piston

# Follow logs
docker logs -f piston

# Check last 100 lines
docker logs --tail 100 piston
```

---

## 🛠️ Step 5: Common Issues & Fixes

### Issue 1: Container not starting
```bash
# Check container status
docker ps -a | grep piston

# View error logs
docker logs <container-id>

# Restart container
docker restart piston
```

### Issue 2: Port already in use
```bash
# Find process using port 2000
sudo lsof -i :2000
# or
sudo netstat -tulpn | grep 2000

# Kill process or change port
docker run -d -p 2002:2000 ...  # Use different port
```

### Issue 3: Permission denied (Docker socket)
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in

# Or run with sudo (not recommended)
sudo docker run ...
```

### Issue 4: CORS still not working
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📋 Step 6: Update Piston Container

```bash
# Stop and remove old container
docker stop piston
docker rm piston

# Pull latest image
docker pull ghcr.io/engineer-man/piston:latest

# Run new container
docker run -d \
  --name piston \
  -p 2000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest
```

---

## 🔐 Step 7: Security Considerations

### For Production:

1. **Restrict CORS origins** (don't use `*`):
```nginx
add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
```

2. **Add authentication** (if needed):
```nginx
# Add basic auth or API key validation
```

3. **Rate limiting**:
```nginx
# Add rate limiting in Nginx
limit_req_zone $binary_remote_addr zone=piston_limit:10m rate=10r/s;
limit_req zone=piston_limit burst=20;
```

4. **Firewall rules**:
```bash
# Allow only specific IPs
sudo ufw allow from <your-ip> to any port 2000
```

---

## ✅ Verification Checklist

- [ ] Piston container is running
- [ ] Health check returns `{"message":"Piston v3.1.1"}`
- [ ] `/api/v2/piston/runtimes` returns list of languages
- [ ] CORS headers are present in response
- [ ] OPTIONS preflight request returns 204
- [ ] Frontend can make requests without CORS errors
- [ ] Code execution works from frontend

---

## 🚀 Quick Start Commands

```bash
# 1. Check if running
docker ps | grep piston

# 2. View logs
docker logs piston

# 3. Restart if needed
docker restart piston

# 4. Test API
curl http://49.204.168.41:2000/api/v2/piston/runtimes

# 5. Test CORS
curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

## 📞 Troubleshooting

If issues persist:

1. **Check Docker logs**: `docker logs piston`
2. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Test direct connection**: `curl http://49.204.168.41:2000/`
4. **Check firewall**: `sudo ufw status`
5. **Verify port binding**: `sudo netstat -tulpn | grep 2000`

---

## 📝 Notes

- Piston API endpoint: `/api/v2/piston/execute`
- Default port: `2000`
- Requires Docker socket access: `/var/run/docker.sock`
- CORS must be configured for browser access
- Nginx reverse proxy recommended for production

---

**After configuring CORS, restart your frontend dev server and test!**

