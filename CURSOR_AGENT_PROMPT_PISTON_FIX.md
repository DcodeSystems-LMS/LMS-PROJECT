# Cursor Agent Prompt: Fix Piston Server CORS

## 🎯 Copy this prompt to Cursor Agent:

```
I have a self-hosted Piston API server running in Docker at http://49.204.168.41:2000/api/v2/piston

The server is working but has CORS issues when accessed from browser (http://localhost:3000).

Current setup:
- Docker container running Piston
- Port 2000 exposed
- Server responds to direct curl requests
- CORS headers missing in browser requests

Task:
1. Check if Piston container is running: docker ps | grep piston
2. Check current Piston logs: docker logs piston --tail 50
3. Configure CORS on the Piston server using one of these methods:

   Option A: If Piston supports CORS env vars:
   - Stop current container
   - Restart with CORS environment variables
   - Test CORS headers

   Option B: Use Nginx reverse proxy (recommended):
   - Install Nginx if not installed
   - Create Nginx config at /etc/nginx/sites-available/piston
   - Configure proxy_pass to Piston (port 2001 internal)
   - Add CORS headers in Nginx config
   - Enable site and reload Nginx
   - Run Piston on port 2001 (internal)
   - Nginx listens on port 2000 (external) with CORS

4. Test CORS configuration:
   - curl -X OPTIONS http://49.204.168.41:2000/api/v2/piston/execute -H "Origin: http://localhost:3000" -v
   - Should see Access-Control-Allow-Origin header

5. Verify:
   - Piston health: curl http://49.204.168.41:2000/
   - Runtimes: curl http://49.204.168.41:2000/api/v2/piston/runtimes
   - CORS headers present in OPTIONS response

Provide step-by-step commands to fix CORS on the Piston server.
```

---

## 📋 Alternative Simple Prompt:

```
Fix CORS on Piston Docker server at 49.204.168.41:2000. 
Browser requests from localhost:3000 are blocked.
Use Nginx reverse proxy to add CORS headers.
Show exact commands to run.
```

---

## 🔧 What Cursor Agent Should Do:

1. **Check current status**
   ```bash
   docker ps | grep piston
   docker logs piston
   ```

2. **Set up Nginx reverse proxy** (best solution)
   - Install Nginx
   - Create config with CORS headers
   - Proxy to Piston on internal port
   - Test and verify

3. **Or configure Piston directly** (if supported)
   - Check if Piston supports CORS env vars
   - Restart with CORS enabled

4. **Test CORS**
   - Verify OPTIONS request returns CORS headers
   - Test from browser console

---

## ✅ Expected Result:

After fix:
- ✅ `curl -X OPTIONS ...` shows CORS headers
- ✅ Browser can make requests without CORS errors
- ✅ Frontend playground works with Piston API

---

**Copy the prompt above and give it to Cursor Agent to fix your Piston server!**

