# Hostinger Production Deployment Guide

This guide will help you deploy the YouTube extraction backend to Hostinger production hosting.

## 🎯 Overview

Hostinger provides shared hosting with Node.js support. This guide covers:
- Setting up the backend service on Hostinger
- Installing Python dependencies (yt-dlp)
- Configuring production environment
- Setting up proper CORS and security

## 📋 Prerequisites

- Hostinger hosting account with Node.js support
- Access to File Manager or FTP
- SSH access (if available on your plan)

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Backend Files

1. **Upload Backend Files**
   - Upload the entire `backend/` folder to your Hostinger hosting
   - Place it in your domain's root directory or a subdirectory

2. **File Structure on Hostinger**
   ```
   public_html/
   ├── backend/
   │   ├── server.js
   │   ├── package.json
   │   ├── package-lock.json
   │   └── node_modules/ (will be created)
   └── dist/ (your frontend build)
   ```

### Step 2: Install Node.js Dependencies

1. **Via Hostinger File Manager**
   - Navigate to the `backend/` directory
   - Use the built-in terminal or upload a script

2. **Via SSH (if available)**
   ```bash
   cd backend
   npm install --production
   ```

3. **Alternative: Upload node_modules**
   - Install dependencies locally: `npm install --production`
   - Upload the `node_modules/` folder to Hostinger

### Step 3: Install Python and yt-dlp

Hostinger shared hosting typically doesn't have Python pre-installed. Here are your options:

#### Option A: Use Hostinger's Python Support (if available)
```bash
# Check if Python is available
python3 --version

# Install yt-dlp
pip3 install yt-dlp --user
```

#### Option B: Use Alternative Extraction Method
If Python is not available, we'll create a fallback method using a web service.

### Step 4: Configure Production Environment

1. **Create Environment File**
   ```bash
   # Create .env file in backend directory
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Update CORS Settings**
   - The backend will automatically detect production environment
   - CORS will be configured for your production domain

### Step 5: Start the Backend Service

#### Method 1: Using Hostinger's Node.js App
1. Go to Hostinger Control Panel
2. Navigate to "Node.js" section
3. Create a new Node.js app
4. Set:
   - App Name: `video-extraction-backend`
   - App Root: `backend`
   - App URL: `yourdomain.com/api`
   - App Startup File: `server.js`

#### Method 2: Using PM2 (if SSH available)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "video-extraction-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Method 3: Using Forever (alternative)
```bash
# Install forever
npm install -g forever

# Start the application
forever start server.js
```

### Step 6: Configure Domain and SSL

1. **Set up Subdomain (Recommended)**
   - Create subdomain: `api.yourdomain.com`
   - Point it to your backend directory

2. **Enable SSL**
   - Use Hostinger's free SSL certificate
   - Ensure HTTPS is enabled for security

### Step 7: Test the Deployment

1. **Health Check**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

2. **Test Video Extraction**
   ```bash
   curl -X POST https://api.yourdomain.com/api/extract-video \
     -H "Content-Type: application/json" \
     -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
   ```

## 🔧 Production Configuration

### Updated server.js for Production

The backend includes production optimizations:
- Automatic CORS configuration
- Error handling
- Security headers
- Rate limiting (optional)

### Environment Variables

Create a `.env` file in the backend directory:
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Python/yt-dlp Not Available
**Solution**: Use the fallback extraction method
- The backend will automatically detect if yt-dlp is not available
- It will use an alternative method or return appropriate error

#### 2. CORS Errors
**Solution**: Update CORS configuration
```javascript
// In server.js, the CORS is automatically configured for production
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true
}));
```

#### 3. Port Issues
**Solution**: Use Hostinger's assigned port
- Hostinger will assign a specific port
- Update the PORT environment variable accordingly

#### 4. SSL Certificate Issues
**Solution**: Enable SSL in Hostinger Control Panel
- Go to SSL section
- Enable "Force HTTPS"
- Update your frontend to use HTTPS URLs

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## 🔒 Security Considerations

### Production Security Features

1. **Rate Limiting**
   - Implemented to prevent abuse
   - Configurable via environment variables

2. **CORS Protection**
   - Restricted to your production domain
   - Prevents unauthorized access

3. **Error Handling**
   - Sensitive information is not exposed
   - Proper error responses

4. **HTTPS Only**
   - All communication over HTTPS
   - Secure video extraction

## 📱 Frontend Integration

### Update Frontend Configuration

Update your frontend to use the production backend:

```typescript
// In your frontend configuration
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.yourdomain.com' 
  : 'http://localhost:3001';
```

### Test Frontend Integration

1. Build your frontend for production
2. Upload to Hostinger
3. Test video extraction functionality
4. Verify custom player works with extracted videos

## 🚀 Performance Optimization

### Caching Strategy

Implement caching to improve performance:
- Cache extracted video information
- Use Redis or in-memory cache
- Set appropriate cache expiration

### CDN Integration

Consider using a CDN for:
- Static assets
- Video streaming
- Global distribution

## 📊 Monitoring

### Health Monitoring

Set up monitoring for:
- Backend service status
- Video extraction success rate
- Response times
- Error rates

### Logs

Monitor logs for:
- Successful extractions
- Failed extractions
- Performance metrics
- Security events

## 🔄 Maintenance

### Regular Updates

1. **Update yt-dlp**
   ```bash
   pip3 install --upgrade yt-dlp
   ```

2. **Update Node.js Dependencies**
   ```bash
   npm update
   ```

3. **Monitor Service Status**
   - Check service health regularly
   - Monitor resource usage
   - Update as needed

## 📞 Support

### Hostinger Support

If you encounter hosting-specific issues:
1. Check Hostinger documentation
2. Contact Hostinger support
3. Verify Node.js and Python availability

### Application Support

For application-specific issues:
1. Check backend logs
2. Test with different YouTube URLs
3. Verify environment configuration
4. Test health endpoints

## 🎉 Success Indicators

You'll know the deployment is successful when:

- ✅ Backend service starts without errors
- ✅ Health check returns "OK"
- ✅ Video extraction works with production URLs
- ✅ Frontend can communicate with backend
- ✅ Custom player loads YouTube videos
- ✅ SSL certificate is working
- ✅ CORS is properly configured

## 🔄 Fallback Strategy

The system includes multiple fallback layers:
1. **Primary**: Direct video extraction via yt-dlp
2. **Secondary**: Alternative extraction methods
3. **Tertiary**: YouTube embed fallback

This ensures videos always play, even if extraction fails.

## 📋 Deployment Checklist

- [ ] Backend files uploaded to Hostinger
- [ ] Node.js dependencies installed
- [ ] Python/yt-dlp installed (or fallback configured)
- [ ] Environment variables set
- [ ] CORS configured for production domain
- [ ] SSL certificate enabled
- [ ] Backend service started
- [ ] Health check passes
- [ ] Video extraction tested
- [ ] Frontend updated with production URLs
- [ ] End-to-end testing completed

Your YouTube extraction backend is now ready for production on Hostinger!
