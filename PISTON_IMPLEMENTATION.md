# Piston API Implementation

## ✅ Implementation Complete

Piston API has been successfully integrated into the code playground as the **primary execution service** with automatic fallback to Judge0.

---

## 📁 Files Created/Modified

### 1. **New File: `src/services/pistonService.js`**
   - Complete Piston API service implementation
   - Language mapping for 40+ languages
   - Error handling and result formatting
   - Health check and runtime detection

### 2. **Modified: `src/services/executionService.js`**
   - Added Piston as primary service
   - Automatic fallback to Judge0 if Piston fails
   - Maintains backward compatibility

---

## 🚀 How It Works

### Execution Flow:
```
1. Try Piston API (primary)
   ↓ (if fails)
2. Try Judge0 API (fallback 1)
   ↓ (if fails)
3. Try Alternative Judge0 endpoints (fallback 2)
```

### Benefits:
- ✅ **Faster execution** (Piston is optimized)
- ✅ **No rate limits** (when self-hosted)
- ✅ **Better reliability** (multiple fallbacks)
- ✅ **Open-source** (can self-host)
- ✅ **50+ languages** supported

---

## 🔧 Configuration

### Public Endpoint (Default):
```javascript
baseUrl: 'https://emkc.org/api/v2/piston'
```

### Self-Hosted Endpoint:
To use your own Piston instance, set environment variable:
```bash
REACT_APP_PISTON_API_URL=http://your-server:2000/api/v2/piston
```

Or modify in `src/services/pistonService.js`:
```javascript
this.baseUrl = 'http://your-server:2000/api/v2/piston';
```

---

## 📋 Supported Languages

Piston supports 50+ languages. Currently mapped:

- Python, JavaScript, Java, C, C++, Go
- PHP, Ruby, Rust, Swift, Kotlin
- TypeScript, Scala, Perl, Lua, Haskell
- Clojure, Erlang, Elixir, Dart, R
- Bash, PowerShell, C#, F#, VB.NET
- And many more...

**Note**: Piston automatically detects available runtimes. You can call `getAvailableRuntimes()` to see what's available on your instance.

---

## 🧪 Testing

### Test Piston Service:
```javascript
import pistonService from './services/pistonService';

// Test execution
const result = await pistonService.executeCode(
  'print("Hello, World!")',
  'Python',
  ''
);

console.log(result);
// { success: true, output: 'Hello, World!', error: '', ... }
```

### Check API Health:
```javascript
const isHealthy = await pistonService.checkApiHealth();
console.log('Piston API is', isHealthy ? 'online' : 'offline');
```

### Get Available Runtimes:
```javascript
const runtimes = await pistonService.getAvailableRuntimes();
console.log('Available languages:', runtimes);
```

---

## 🔄 Migration from Judge0

The implementation is **backward compatible**:
- Existing code continues to work
- Piston is tried first, falls back to Judge0
- No breaking changes to the API

### Before:
```
Judge0 → Alternative Judge0
```

### After:
```
Piston → Judge0 → Alternative Judge0
```

---

## 🐳 Self-Hosting Piston (Optional)

### Docker Setup:
```bash
# Run Piston in Docker
docker run -d -p 2000:2000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/engineer-man/piston
```

### Benefits of Self-Hosting:
- ✅ No rate limits
- ✅ Full control
- ✅ Better security
- ✅ Custom language versions
- ✅ No external dependencies

### Update Service:
```javascript
// In pistonService.js
this.baseUrl = 'http://localhost:2000/api/v2/piston';
```

---

## 📊 Performance Comparison

| Service | Speed | Rate Limits | Self-Host | Languages |
|---------|-------|-------------|-----------|-----------|
| **Piston** | ⚡ Fast | ✅ None (self-host) | ✅ Yes | 50+ |
| Judge0 | 🐢 Medium | ⚠️ Limited | ✅ Yes | 50+ |

---

## 🐛 Troubleshooting

### Issue: Piston API not responding
**Solution**: Check if public endpoint is accessible:
```bash
curl https://emkc.org/api/v2/piston/runtimes
```

### Issue: Language not supported
**Solution**: Check available runtimes:
```javascript
const runtimes = await pistonService.getAvailableRuntimes();
// Find your language in the list
```

### Issue: Want to use self-hosted
**Solution**: 
1. Deploy Piston (Docker recommended)
2. Update `baseUrl` in `pistonService.js`
3. Restart application

---

## 📝 API Response Format

Piston returns:
```json
{
  "run": {
    "stdout": "output text",
    "stderr": "error text",
    "code": 0,
    "signal": null,
    "output": "..."
  },
  "language": "python",
  "version": "3.10.0"
}
```

Formatted to match Judge0 format:
```javascript
{
  success: true,
  output: "output text",
  error: "",
  time: "0",
  memory: "N/A",
  status: "Accepted"
}
```

---

## ✅ Status

- ✅ Piston service created
- ✅ Integrated into execution service
- ✅ Automatic fallback implemented
- ✅ Language mapping configured
- ✅ Error handling added
- ✅ Health check available

**Ready to use!** 🎉

---

## 🔗 Resources

- **Piston GitHub**: https://github.com/engineer-man/piston
- **Piston Docs**: https://github.com/engineer-man/piston#readme
- **Public API**: https://emkc.org/api/v2/piston

---

## Summary

Piston API is now the **primary execution service** for the playground, providing:
- Faster execution
- Better reliability (with fallbacks)
- No rate limits (when self-hosted)
- Support for 50+ languages

The implementation maintains full backward compatibility and automatically falls back to Judge0 if Piston is unavailable.

