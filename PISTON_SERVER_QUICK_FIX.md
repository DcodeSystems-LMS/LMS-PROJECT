# Piston Server Quick Fix Commands

## 🚀 Quick CORS Fix (Copy-Paste Ready)

### Option 1: Simple Docker Restart with CORS (If Supported)

```bash
# Stop current container
docker stop $(docker ps -q --filter "ancestor=ghcr.io/engineer-man/piston")

# Remove old container
docker rm $(docker ps -aq --filter "ancestor=ghcr.io/engineer-man/piston")

# Run with CORS (if environment variable is supported)
docker run -d \
  --name piston \
  -p 2000:2000 \
  -e CORS_ORIGIN="*" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest
```

### Option 2: Nginx Reverse Proxy (Recommended)

```bash
# 1. Install Nginx (if not installed)
sudo apt update && sudo apt install -y nginx

# 2. Create Nginx config
sudo tee /etc/nginx/sites-available/piston << 'EOF'
server {
    listen 2000;
    server_name _;

    location / {
        proxy_pass http://localhost:2001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        
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
EOF

# 3. Enable site
sudo ln -sf /etc/nginx/sites-available/piston /etc/nginx/sites-enabled/

# 4. Test config
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx

# 6. Stop old Piston container
docker stop $(docker ps -q --filter "ancestor=ghcr.io/engineer-man/piston")
docker rm $(docker ps -aq --filter "ancestor=ghcr.io/engineer-man/piston")

# 7. Run Piston on port 2001 (internal)
docker run -d \
  --name piston \
  -p 2001:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston:latest

# 8. Test
curl http://49.204.168.41:2000/
```

---

## ✅ Verify CORS is Working

```bash
# Test CORS headers
curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -i "access-control"
```

Should see:
```
< access-control-allow-origin: *
< access-control-allow-methods: GET, POST, OPTIONS
< access-control-allow-headers: Content-Type, Authorization
```

---

## 🔍 Check Current Status

```bash
# Check if Piston is running
docker ps | grep piston

# Check Piston logs
docker logs piston --tail 50

# Test API endpoint
curl http://49.204.168.41:2000/api/v2/piston/runtimes | head -20
```

---

## 🛠️ Common Fixes

### Fix 1: Container Not Running
```bash
docker start piston
# or
docker restart piston
```

### Fix 2: Port Conflict
```bash
# Find what's using port 2000
sudo lsof -i :2000
# Kill it or use different port
```

### Fix 3: Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in
```

### Fix 4: Nginx Not Working
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx config
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📋 One-Line Test Commands

```bash
# Test health
curl http://49.204.168.41:2000/

# Test runtimes
curl http://49.204.168.41:2000/api/v2/piston/runtimes | jq '.[] | .language' | head -10

# Test CORS
curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute -H "Origin: http://localhost:3000" -v 2>&1 | grep -i cors
```

---

## 🎯 After Fixing

1. **Restart frontend dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test in browser console**:
   ```javascript
   fetch('http://49.204.168.41:2000/api/v2/piston/runtimes')
     .then(r => r.json())
     .then(d => console.log('✅ Working!', d))
     .catch(e => console.error('❌ Error:', e));
   ```

3. **Run code in playground** - should work now!

---

**Copy-paste these commands to fix CORS on your Piston server!**

