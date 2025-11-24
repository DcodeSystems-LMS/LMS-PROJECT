# Piston Server CORS Configuration

## 🔴 Current Issue

CORS error when accessing `http://49.204.168.41:2000/api/v2/piston` from browser.

## ✅ Solution: Configure CORS on Piston Server

Since you're running Piston in Docker, you need to configure CORS on the server side.

### Option 1: Use Nginx Reverse Proxy (Recommended)

Create Nginx configuration to add CORS headers:

```nginx
server {
    listen 2000;
    server_name 49.204.168.41;

    location / {
        proxy_pass http://localhost:2000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### Option 2: Run Piston with CORS Environment Variable

Some Piston versions support CORS configuration:

```bash
docker run -d -p 2000:2000 \
  -e CORS_ORIGIN="*" \
  -e CORS_ENABLED="true" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```

### Option 3: Use Vite Proxy (Development Only)

The Vite proxy is already configured in `vite.config.ts`. To use it:

1. Set environment variable: `VITE_USE_PISTON_PROXY=true`
2. Or modify `pistonService.js` to use `/api/piston` in development

---

## 🚀 Quick Fix: Update Piston Docker Container

If you can access the server where Piston is running:

### Step 1: Stop current container
```bash
docker stop <piston-container-name>
```

### Step 2: Run with Nginx proxy
```bash
# Run Piston on internal port
docker run -d -p 2001:2000 \
  --name piston-internal \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston

# Run Nginx with CORS on port 2000
docker run -d -p 2000:80 \
  --name piston-nginx \
  -v /path/to/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx
```

---

## 📝 Current Configuration

- **Piston URL**: `http://49.204.168.41:2000/api/v2/piston`
- **Status**: CORS not configured (causing errors)
- **Fix Needed**: Configure CORS on server or use proxy

---

## ✅ After CORS is Configured

Once CORS is configured on the Piston server, the direct URL will work:
- No proxy needed
- Direct connection
- Better performance

---

## 🔧 Testing CORS

Test if CORS is working:

```bash
curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Look for `Access-Control-Allow-Origin: *` in response headers.

