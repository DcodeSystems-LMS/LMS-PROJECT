# Hostinger Deployment Instructions

## Files to Upload to Hostinger:

1. **Backend Files** (Upload to public_html/api/ or subdomain):
   - server.js
   - package.json
   - package-lock.json
   - .env (update CORS_ORIGIN with your domain)
   - node_modules/ (after running npm install)

## Steps to Deploy:

### 1. Prepare Files Locally
```bash
cd backend
npm install --production
```

### 2. Upload to Hostinger
- Upload entire backend folder to your hosting
- Recommended location: public_html/api/ or create a subdomain

### 3. Configure Environment
- Edit .env file on Hostinger
- Update CORS_ORIGIN=https://yourdomain.com
- Update PORT if Hostinger assigns a different port

### 4. Install Dependencies on Hostinger
```bash
cd backend
npm install --production
```

### 5. Install Python/yt-dlp (Optional)
```bash
# Check if Python is available
python3 --version

# Install yt-dlp if Python is available
pip3 install yt-dlp --user
```

### 6. Configure Node.js App in Hostinger
- Go to Hostinger Control Panel
- Find "Node.js" or "Applications" section
- Create new Node.js application
- Set app root to your backend directory
- Set startup file to server.js
- Configure domain/subdomain

### 7. Test Deployment
- Visit your API URL: https://api.yourdomain.com/api/extract-video
- Test with a YouTube URL

## Important Notes:
- Hostinger shared hosting may not have Python/yt-dlp
- The backend will use fallback methods if yt-dlp is not available
- Make sure your hosting plan supports Node.js
- SSL certificate should be enabled for HTTPS

## Troubleshooting:
- Check Hostinger error logs if the app doesn't start
- Verify all dependencies are installed
- Test locally first before deploying
