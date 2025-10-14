# Hostinger Deployment Checklist

Use this checklist to ensure your YouTube extraction backend is properly deployed on Hostinger.

## 📋 Pre-Deployment Checklist

### 1. Local Preparation
- [ ] Backend code is ready and tested locally
- [ ] All dependencies are listed in `package.json`
- [ ] Environment configuration files are created
- [ ] Deployment scripts are ready

### 2. Hostinger Account Setup
- [ ] Hostinger hosting account is active
- [ ] Node.js support is enabled on your hosting plan
- [ ] Domain is properly configured
- [ ] SSL certificate is enabled

## 🚀 Deployment Steps

### Step 1: Upload Backend Files
- [ ] Upload `backend/` folder to your Hostinger hosting
- [ ] Place in appropriate directory (e.g., `public_html/api/` or subdomain)
- [ ] Ensure all files have correct permissions (644 for files, 755 for directories)

### Step 2: Install Dependencies
- [ ] Run `npm install --production` in the backend directory
- [ ] Verify `node_modules/` folder is created
- [ ] Check that all required packages are installed

### Step 3: Configure Environment
- [ ] Copy `env.production.template` to `.env`
- [ ] Update `CORS_ORIGIN` with your production domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure other environment variables as needed

### Step 4: Install Python Dependencies (Optional)
- [ ] Check if Python 3 is available: `python3 --version`
- [ ] Install yt-dlp: `pip3 install yt-dlp --user`
- [ ] Test yt-dlp: `yt-dlp --version`
- [ ] If Python is not available, the backend will use fallback methods

### Step 5: Start the Application
- [ ] Use Hostinger's Node.js app manager
- [ ] Set app root to your backend directory
- [ ] Set startup file to `server.js`
- [ ] Configure app URL (e.g., `api.yourdomain.com`)

### Step 6: Configure Domain and SSL
- [ ] Set up subdomain for API (recommended: `api.yourdomain.com`)
- [ ] Enable SSL certificate for the subdomain
- [ ] Test HTTPS access to your API

## 🧪 Testing Checklist

### Basic Functionality Tests
- [ ] Health endpoint: `GET https://api.yourdomain.com/api/health`
- [ ] Status endpoint: `GET https://api.yourdomain.com/api/status`
- [ ] CORS headers are present in responses
- [ ] Server responds with correct status codes

### Video Extraction Tests
- [ ] Test with a simple YouTube video
- [ ] Verify video information is extracted correctly
- [ ] Check that direct video URLs are returned
- [ ] Test with different video qualities

### Error Handling Tests
- [ ] Test with invalid YouTube URL
- [ ] Test with private/restricted video
- [ ] Verify appropriate error messages are returned
- [ ] Check fallback behavior when yt-dlp is not available

### Performance Tests
- [ ] Test response times (should be under 10 seconds)
- [ ] Test concurrent requests
- [ ] Verify rate limiting is working
- [ ] Check memory usage is reasonable

## 🔧 Configuration Verification

### Environment Variables
- [ ] `PORT` is set correctly
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` matches your domain
- [ ] `DEBUG=false` for production

### Security Settings
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Security headers are present
- [ ] HTTPS is enforced

### Service Dependencies
- [ ] Node.js is running
- [ ] yt-dlp is available (if Python is installed)
- [ ] All required npm packages are installed
- [ ] File permissions are correct

## 📱 Frontend Integration

### Update Frontend Configuration
- [ ] Update backend URL in frontend configuration
- [ ] Test API calls from frontend
- [ ] Verify CORS allows frontend domain
- [ ] Test video playback with extracted URLs

### End-to-End Testing
- [ ] Navigate to a course with YouTube video
- [ ] Verify custom player loads
- [ ] Test video playback controls
- [ ] Check fallback to YouTube embed if extraction fails

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Backend Not Starting
- [ ] Check Node.js version compatibility
- [ ] Verify all dependencies are installed
- [ ] Check file permissions
- [ ] Review server logs for errors

#### CORS Errors
- [ ] Verify `CORS_ORIGIN` is set correctly
- [ ] Check that frontend domain is included
- [ ] Test with different browsers
- [ ] Verify HTTPS is used consistently

#### Video Extraction Failing
- [ ] Check if yt-dlp is installed and accessible
- [ ] Test with different YouTube videos
- [ ] Verify network connectivity
- [ ] Check for rate limiting from YouTube

#### SSL Certificate Issues
- [ ] Ensure SSL is enabled in Hostinger control panel
- [ ] Check certificate is valid and not expired
- [ ] Verify HTTPS redirects are working
- [ ] Test with different browsers

## 📊 Monitoring and Maintenance

### Regular Checks
- [ ] Monitor server uptime
- [ ] Check error logs regularly
- [ ] Monitor response times
- [ ] Verify video extraction success rate

### Updates and Maintenance
- [ ] Keep yt-dlp updated: `pip3 install --upgrade yt-dlp`
- [ ] Update Node.js dependencies: `npm update`
- [ ] Monitor for security updates
- [ ] Backup configuration files

## ✅ Final Verification

### Production Readiness
- [ ] All tests pass
- [ ] Error handling works correctly
- [ ] Fallback mechanisms are in place
- [ ] Performance is acceptable
- [ ] Security measures are active

### Documentation
- [ ] Deployment process is documented
- [ ] Configuration is documented
- [ ] Troubleshooting guide is available
- [ ] Contact information is updated

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Backend responds to health checks
- ✅ Video extraction works (or falls back gracefully)
- ✅ Frontend can communicate with backend
- ✅ Videos play in custom player
- ✅ SSL certificate is working
- ✅ CORS is properly configured
- ✅ Rate limiting is active
- ✅ Error handling works correctly

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs for specific errors
3. Test individual components separately
4. Contact Hostinger support for hosting-specific issues
5. Verify all configuration steps were completed

## 🔄 Rollback Plan

If deployment fails:
1. Keep the previous working version
2. Document what went wrong
3. Fix issues in development environment
4. Test thoroughly before redeploying
5. Have a backup plan (YouTube embed fallback)

---

**Remember**: The system is designed with multiple fallback layers, so even if video extraction fails, videos will still play via YouTube embed. This ensures a robust user experience.
