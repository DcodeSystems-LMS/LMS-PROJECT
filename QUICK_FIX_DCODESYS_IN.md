# Quick Fix Guide for dcodesys.in on Hostinger Shared Hosting

## 🚨 If Your Site is Not Working

### Step 1: Verify Files Are Uploaded Correctly

1. **Check File Manager in Hostinger hPanel:**
   - Go to `public_html/` directory
   - You should see:
     - ✅ `index.html`
     - ✅ `.htaccess` (with the dot!)
     - ✅ `assets/` folder with files

2. **If files are missing:**
   - Upload all contents from your local `dist/` folder
   - Make sure `.htaccess` is in the root of `public_html/`

### Step 2: Check Domain Configuration

1. **In Hostinger hPanel:**
   - Go to **Domains** → **dcodesys.in**
   - Verify it points to `public_html/`
   - If you have multiple domains, set `dcodesys.in` as primary

2. **Check DNS (if domain is new):**
   - A Record: `dcodesys.in` → Your Hostinger server IP
   - Wait 24-48 hours for DNS propagation (usually faster)

### Step 3: Enable SSL

1. **In Hostinger hPanel:**
   - Go to **SSL** section
   - Find `dcodesys.in`
   - Click **Enable SSL** or **Install SSL**
   - Enable **Force HTTPS**

2. **Wait 5-10 minutes** for SSL to activate

### Step 4: Verify .htaccess File

1. **Check if `.htaccess` exists:**
   - In File Manager, enable "Show Hidden Files"
   - Look for `.htaccess` in `public_html/`

2. **If missing, create it:**
   - Upload the `.htaccess` file from your project
   - Or create a new file named `.htaccess` with this content:

```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Step 5: Check File Permissions

1. **In File Manager:**
   - Right-click `index.html` → **Change Permissions**
   - Set to **644**
   - Right-click `.htaccess` → **Change Permissions**
   - Set to **644**
   - Right-click `assets/` folder → **Change Permissions**
   - Set to **755**

### Step 6: Test in Browser

1. **Visit:** `https://dcodesys.in`
2. **Open DevTools (F12):**
   - **Console tab** - Check for errors
   - **Network tab** - Check which files are loading/failing

### Step 7: Common Error Messages

#### "404 Not Found" on all pages
- **Fix:** Upload/verify `.htaccess` file is in `public_html/`

#### "403 Forbidden"
- **Fix:** Check file permissions (should be 644 for files, 755 for folders)

#### "White screen" or blank page
- **Fix:** 
  - Check browser console for JavaScript errors
  - Verify all files from `dist/` are uploaded
  - Check if `assets/` folder exists with files

#### "Mixed Content" warnings
- **Fix:** Ensure SSL is enabled and site uses `https://`

#### Assets (CSS/JS) not loading
- **Fix:**
  - Verify `assets/` folder is uploaded
  - Check file permissions
  - Clear browser cache (Ctrl+Shift+R)

## 📋 Quick Checklist

Run through this quickly:

- [ ] All files from `dist/` uploaded to `public_html/`
- [ ] `.htaccess` file in `public_html/` root
- [ ] Domain `dcodesys.in` points to `public_html/`
- [ ] SSL certificate enabled
- [ ] File permissions: 644 for files, 755 for folders
- [ ] Site accessible at `https://dcodesys.in`
- [ ] No errors in browser console
- [ ] All assets loading (check Network tab)

## 🔧 Still Not Working?

### Option 1: Re-upload Everything

1. Delete all files in `public_html/` (backup first!)
2. Rebuild locally: `npm run build:prod`
3. Upload fresh files from `dist/`
4. Upload `.htaccess`
5. Set permissions
6. Test again

### Option 2: Contact Hostinger Support

If nothing works:
1. Contact Hostinger support via live chat
2. Tell them: "I uploaded a React app to public_html but it's not loading"
3. Ask them to:
   - Verify domain is pointing correctly
   - Check if mod_rewrite is enabled
   - Verify file permissions
   - Check server error logs

### Option 3: Check Server Logs

1. In Hostinger hPanel → **Error Logs**
2. Look for recent errors
3. Common errors:
   - Permission denied → Fix file permissions
   - mod_rewrite not enabled → Contact support
   - File not found → Verify files are uploaded

## ✅ What Success Looks Like

When everything works:
- ✅ `https://dcodesys.in` loads your app
- ✅ Green padlock (SSL active)
- ✅ All pages work (no 404 on refresh)
- ✅ No console errors
- ✅ CSS and JavaScript load correctly

---

**Need more help?** Check `HOSTINGER_SHARED_HOSTING_DEPLOYMENT.md` for detailed instructions.

