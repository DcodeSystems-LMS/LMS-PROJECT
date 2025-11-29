# Hostinger Shared Hosting Deployment Guide for app.app.dcodesys.in

This guide is specifically for deploying the React frontend to **Hostinger shared hosting** (not VPS).

## 🎯 Important Notes for Shared Hosting

- **No SSH/terminal access** (or very limited)
- **No nginx configuration** - uses Apache with `.htaccess`
- **Files go to `public_html/`** directory
- **Static files only** - perfect for React builds
- **File Manager** is the primary tool

## 📋 Prerequisites

- ✅ Production build completed (`npm run build:prod`)
- ✅ `dist/` folder ready
- ✅ `.htaccess` file ready
- ✅ Hostinger account with `app.app.dcodesys.in` subdomain configured
- ✅ SSL certificate enabled (free SSL from Hostinger)

## 🚀 Step-by-Step Deployment

### Step 1: Access Hostinger File Manager

1. Log in to **Hostinger Control Panel** (hPanel)
2. Navigate to **File Manager**
3. **For subdomain `app.app.dcodesys.in`:** Open `public_html/app/` directory (or create it)
   - **Note:** If Hostinger creates subdomain automatically, it might be in `public_html/app/` or `public_html/app.app.dcodesys.in/`
   - Check your Hostinger subdomain settings to find the correct folder

### Step 2: Clear Existing Files (if any)

⚠️ **Backup first if you have existing files!**

1. In File Manager, select all files in `public_html/`
2. Delete them (or move to a backup folder)
3. This ensures a clean deployment

### Step 3: Upload Frontend Files

#### Option A: Using File Manager (Recommended)

1. **Upload the entire `dist/` folder contents:**
   - Go to your local `dist/` folder
   - Select ALL files and folders inside `dist/`
   - Upload them to `public_html/` on Hostinger
   - **Important:** Upload the CONTENTS of `dist/`, not the `dist` folder itself

2. **Upload `.htaccess` file:**
   - Upload the `.htaccess` file from your project root
   - Place it directly in `public_html/`
   - Make sure it's named exactly `.htaccess` (with the dot at the beginning)

#### Option B: Using FTP Client (FileZilla, WinSCP, etc.)

1. Connect to your Hostinger FTP:
   - Host: `ftp.app.dcodesys.in` or your server IP
   - Username: Your Hostinger FTP username
   - Password: Your Hostinger FTP password
   - Port: 21 (or 22 for SFTP)

2. Navigate to `public_html/` directory

3. Upload all files from your local `dist/` folder

4. Upload `.htaccess` file

### Step 4: Verify File Structure

Your `public_html/` should look like this:

```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-*.css
│   ├── index-*.js
│   └── (other asset files)
└── (other static files)
```

### Step 5: Set File Permissions

In Hostinger File Manager:

1. Select `index.html`
2. Right-click → **Change Permissions** (or **File Permissions**)
3. Set to: **644** (readable by all, writable by owner)
4. Repeat for `.htaccess` file
5. For folders, set to **755**

### Step 6: Configure Domain in Hostinger

1. Go to **Domains** section in hPanel
2. Find `app.dcodesys.in`
3. Ensure it's pointing to `public_html/`
4. If you have multiple domains, make sure `app.dcodesys.in` is the primary domain

### Step 7: Enable SSL Certificate

1. Go to **SSL** section in hPanel
2. Find `app.dcodesys.in`
3. Click **Enable SSL** or **Install SSL**
4. Hostinger provides free SSL certificates
5. Enable **Force HTTPS** (redirect HTTP to HTTPS)

### Step 8: Test Your Deployment

1. **Visit your site:**
   - Go to `https://app.app.dcodesys.in`
   - Check if the site loads

2. **Test routing:**
   - Navigate to different pages
   - Refresh the page (should not show 404)
   - All routes should work

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for any errors
   - Check Network tab for failed requests

## 🔧 Common Issues & Solutions

### Issue 1: 404 Error on Page Refresh

**Problem:** React Router routes show 404 when refreshing

**Solution:**
- Ensure `.htaccess` file is uploaded correctly
- Check that `.htaccess` is in `public_html/` root
- Verify Apache `mod_rewrite` is enabled (should be by default on Hostinger)
- Check file permissions (should be 644)

**Verify .htaccess content:**
```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Issue 2: White Screen / Blank Page

**Possible causes:**
1. **JavaScript errors** - Check browser console
2. **Missing files** - Verify all files from `dist/` are uploaded
3. **Wrong base path** - Check if assets are loading (Network tab)
4. **Environment variables** - Ensure `.env.production` was used during build

**Solution:**
- Open browser console (F12)
- Check for errors
- Check Network tab - see which files are failing to load
- Verify all files are uploaded correctly

### Issue 3: Assets Not Loading (CSS/JS files 404)

**Problem:** CSS and JavaScript files return 404

**Solution:**
- Check that `assets/` folder is uploaded
- Verify file paths in browser Network tab
- Ensure `.htaccess` allows access to these files
- Check file permissions (should be 644 for files, 755 for folders)

### Issue 4: SSL Certificate Not Working

**Problem:** Site shows "Not Secure" or SSL errors

**Solution:**
1. Go to Hostinger hPanel → SSL section
2. Enable SSL for `app.dcodesys.in`
3. Wait 5-10 minutes for certificate to activate
4. Enable "Force HTTPS" redirect
5. Clear browser cache and try again

### Issue 5: Domain Not Pointing Correctly

**Problem:** Domain shows default Hostinger page or different site

**Solution:**
1. Go to Hostinger hPanel → Domains
2. Check that `app.dcodesys.in` is set as primary domain
3. Verify it points to `public_html/`
4. Wait for DNS propagation (can take up to 48 hours, usually much faster)
5. Check DNS records:
   - A record: `app.dcodesys.in` → Your server IP
   - CNAME (optional): `www.app.dcodesys.in` → `app.dcodesys.in`

### Issue 6: Environment Variables Not Working

**Problem:** API calls failing, Supabase not connecting

**Solution:**
- Environment variables must be set **before building**
- Rebuild with correct `.env.production`:
  ```bash
  cp env.production.template .env.production
  # Edit .env.production with your values
  npm run build:prod
  ```
- Upload the new `dist/` folder

### Issue 7: File Upload Fails

**Problem:** Can't upload files via File Manager

**Solution:**
- Check file size limits (Hostinger usually allows up to 512MB per file)
- Try uploading in smaller batches
- Use FTP client instead
- Check available disk space

## ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly:

### Pre-Deployment
- [ ] Production build completed (`npm run build:prod`)
- [ ] `.env.production` file configured correctly
- [ ] `dist/` folder contains all files
- [ ] `.htaccess` file is ready

### File Upload
- [ ] All files from `dist/` uploaded to `public_html/`
- [ ] `.htaccess` file uploaded to `public_html/`
- [ ] File permissions set correctly (644 for files, 755 for folders)
- [ ] No files missing (check `assets/` folder)

### Domain & SSL
- [ ] Domain `app.dcodesys.in` configured in Hostinger
- [ ] Domain points to `public_html/`
- [ ] SSL certificate enabled
- [ ] Force HTTPS enabled
- [ ] DNS records configured correctly

### Testing
- [ ] Site loads at `https://app.app.dcodesys.in`
- [ ] No console errors
- [ ] All assets load correctly (CSS, JS, images)
- [ ] Client-side routing works (no 404 on refresh)
- [ ] Authentication works
- [ ] All pages accessible
- [ ] Mobile responsive

## 🔍 Verification Steps

### 1. Check File Structure
```
public_html/
├── index.html          ✅ Should exist
├── .htaccess          ✅ Should exist
└── assets/            ✅ Should exist with files
```

### 2. Test URLs
- `https://app.app.dcodesys.in` → Should load homepage
- `https://app.app.dcodesys.in/login` → Should load login page (not 404)
- `https://app.app.dcodesys.in/any-route` → Should load app (not 404)

### 3. Check Browser Console
- Open DevTools (F12)
- Console tab → No red errors
- Network tab → All files load with 200 status

### 4. Check SSL
- URL shows `https://` (not `http://`)
- Browser shows padlock icon
- No "Not Secure" warnings

## 📞 Getting Help

### Hostinger Support
- Contact Hostinger support for hosting-specific issues
- Check Hostinger knowledge base
- Use live chat in hPanel

### Application Issues
- Check browser console for errors
- Verify all files uploaded correctly
- Test with different browsers
- Check `.htaccess` file content

## 🔄 Updating Your Site

When you need to update the site:

1. **Make changes locally**
2. **Rebuild:**
   ```bash
   npm run build:prod
   ```
3. **Upload new files:**
   - Delete old files in `public_html/` (or backup)
   - Upload new files from `dist/`
   - Upload updated `.htaccess` if changed
4. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ Site loads at `https://app.app.dcodesys.in`
- ✅ SSL certificate is active (green padlock)
- ✅ All pages load correctly
- ✅ No 404 errors on page refresh
- ✅ All assets (CSS, JS, images) load
- ✅ Authentication works
- ✅ No console errors
- ✅ Mobile responsive

---

**Your site should now be live at https://app.app.dcodesys.in! 🚀**

If you're still having issues, check the troubleshooting section above or contact Hostinger support.

