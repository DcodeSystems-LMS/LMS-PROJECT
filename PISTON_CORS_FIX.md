# Piston CORS Fix Guide

## 🔴 Problem

```
Access to fetch at 'http://49.204.168.41:2000/api/v2/piston/execute' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## ✅ Solutions

### Solution 1: Configure CORS on Piston Server (Recommended)

If you have access to the Piston server, configure CORS:

#### Option A: Using Nginx Reverse Proxy

Create/update Nginx configuration:

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

#### Option B: Using CORS Middleware (if Piston supports it)

Check Piston documentation for CORS configuration options.

#### Option C: Run Piston with CORS enabled

Some Piston deployments support environment variables for CORS:

```bash
docker run -d -p 2000:2000 \
  -e CORS_ORIGIN="*" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```

---

### Solution 2: Backend Proxy (If you can't modify Piston server)

Create a proxy endpoint in your backend to forward requests to Piston.

#### Example: Node.js/Express Proxy

```javascript
// backend/proxy.js or similar
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

app.use('/api/piston', createProxyMiddleware({
  target: 'http://49.204.168.41:2000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/piston': '/api/v2/piston'
  }
}));

app.listen(3001);
```

Then update frontend to use: `http://localhost:3001/api/piston`

---

### Solution 3: Vite Proxy (Development Only)

Add to `vite.config.js`:

```javascript
export default {
  server: {
    proxy: {
      '/api/piston': {
        target: 'http://49.204.168.41:2000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/piston/, '/api/v2/piston')
      }
    }
  }
}
```

Then update `pistonService.js` to use: `/api/piston` instead of full URL.

---

## 🚀 Quick Fix: Update Piston Service to Handle CORS

If you can't modify the server, we can add a workaround in the frontend (though this won't work for all browsers):

```javascript
// This is a workaround - server-side fix is better
const response = await fetch(`${this.baseUrl}/execute`, {
  method: 'POST',
  mode: 'cors', // or 'no-cors' for limited functionality
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});
```

---

## 📝 Recommended Approach

**Best**: Configure CORS on the Piston server (Solution 1)
**Quick**: Use Vite proxy for development (Solution 3)
**Production**: Use backend proxy (Solution 2)

---

## 🔧 Testing CORS

After fixing, test with:

```bash
curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

You should see `Access-Control-Allow-Origin` in the response headers.

