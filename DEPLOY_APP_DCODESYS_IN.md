# Deployment Guide for app.dcodesys.in (Subdomain)

This guide will help you deploy the DCode Learning Platform to **app.dcodesys.in** subdomain on Hostinger shared hosting.

## 🎯 Important: Subdomain Setup

Since you're using a **subdomain** (`app.dcodesys.in`), the file location on Hostinger will be different:

### Option 1: Hostinger Auto-Created Subdomain Folder
- Files go to: `public_html/app/` or `public_html/app.dcodesys.in/`
- Check your Hostinger subdomain settings to find the exact folder

### Option 2: Manual Subdomain Setup
- Create subdomain `app` in Hostinger hPanel
- Point it to a folder (e.g., `public_html/app/`)
- Upload files to that folder

## 📋 Prerequisites

- ✅ Production build completed (`npm run build:prod`)
- ✅ `dist/` folder ready
- ✅ `.htaccess` file ready
- ✅ Subdomain `app.dcodesys.in` created in Hostinger
- ✅ SSL certificate enabled for subdomain

## 🚀 Step-by-Step Deployment

### Step 1: Create/Find Subdomain Folder in Hostinger

1. **Log in to Hostinger hPanel**
2. **Go to Domains → Subdomains**
3. **Create subdomain `app`** (if not already created)
   - Subdomain: `app`
   - Document Root: `public_html/app` (or let Hostinger create it)
4. **Note the folder path** where files should go

### Step 2: Access File Manager

1. Go to **File Manager** in hPanel
2. Navigate to the subdomain folder:
   - Usually: `public_html/app/` or `public_html/app.dcodesys.in/`
   - Or check your subdomain settings for the exact path

### Step 3: Upload Files

1. **Upload all contents from `dist/` folder:**
   - Select all files and folders from your local `dist/` folder
   - Upload to the subdomain folder (e.g., `public_html/app/`)
   - **Important:** Upload the CONTENTS of `dist/`, not the `dist` folder itself

2. **Upload `.htaccess` file:**
   - Upload `.htaccess` from your project root
   - Place it in the subdomain folder (same level as `index.html`)

### Step 4: Set File Permissions

1. Select `index.html` → Right-click → **Change Permissions** → Set to **644**
2. Select `.htaccess` → Right-click → **Change Permissions** → Set to **644**
3. Select `assets/` folder → Right-click → **Change Permissions** → Set to **755**

### Step 5: Enable SSL for Subdomain

1. Go to **SSL** section in hPanel
2. Find `app.dcodesys.in`
3. Click **Enable SSL** or **Install SSL**
4. Enable **Force HTTPS**
5. Wait 5-10 minutes for SSL to activate

### Step 6: Test Your Deployment

1. Visit `https://app.dcodesys.in`
2. Check if the site loads
3. Test navigation (should work without 404 on refresh)
4. Check browser console (F12) for errors

## 📁 File Structure on Hostinger

Your subdomain folder should look like this:

```
public_html/app/          (or public_html/app.dcodesys.in/)
├── index.html           ✅
├── .htaccess            ✅
├── assets/              ✅
│   └── (all JS/CSS files)
└── (other files)
```

## 🔧 Common Issues

### Issue 1: Subdomain Folder Not Found

**Problem:** Don't know where to upload files

**Solution:**
1. Go to Hostinger hPanel → **Domains → Subdomains**
2. Check the **Document Root** for `app` subdomain
3. That's where you upload files

### Issue 2: 404 Error on All Pages

**Problem:** `.htaccess` not working

**Solution:**
- Ensure `.htaccess` is in the subdomain folder (not `public_html/` root)
- Check file permissions (should be 644)
- Verify Apache `mod_rewrite` is enabled

### Issue 3: SSL Not Working

**Problem:** Subdomain shows "Not Secure"

**Solution:**
1. Enable SSL specifically for `app.dcodesys.in` in hPanel
2. Wait 5-10 minutes
3. Clear browser cache

### Issue 4: Files in Wrong Location

**Problem:** Uploaded to `public_html/` instead of subdomain folder

**Solution:**
- Move files from `public_html/` to `public_html/app/`
- Or delete and re-upload to correct location

## ✅ Deployment Checklist

- [ ] Subdomain `app` created in Hostinger
- [ ] Subdomain folder identified (`public_html/app/` or similar)
- [ ] All files from `dist/` uploaded to subdomain folder
- [ ] `.htaccess` uploaded to subdomain folder
- [ ] File permissions set (644 for files, 755 for folders)
- [ ] SSL enabled for `app.dcodesys.in`
- [ ] Site loads at `https://app.dcodesys.in`
- [ ] All routes work (no 404 on refresh)
- [ ] No console errors

## 🔍 Verification

1. **Check File Location:**
   - Files should be in subdomain folder, NOT `public_html/` root
   - Example: `public_html/app/index.html` ✅
   - NOT: `public_html/index.html` ❌

2. **Test URLs:**
   - `https://app.dcodesys.in` → Should load
   - `https://app.dcodesys.in/login` → Should work (not 404)
   - `https://app.dcodesys.in/any-route` → Should work

3. **Check Browser:**
   - Open DevTools (F12)
   - Console tab → No errors
   - Network tab → All files load with 200 status

## 📝 Important Notes

1. **Base Path:** Still use `/` in vite.config.ts (not `/app/`)
   - Subdomain doesn't change the base path
   - React Router will work correctly

2. **Environment Variables:**
   - `VITE_APP_URL=https://app.dcodesys.in` ✅ (already updated)

3. **DNS:**
   - Subdomain DNS is usually auto-configured by Hostinger
   - If not working, check DNS records in Hostinger

## 🎉 Success!

Your site should now be live at **https://app.dcodesys.in**!

If you encounter any issues, check the troubleshooting section or refer to `HOSTINGER_SHARED_HOSTING_DEPLOYMENT.md` for more details.

