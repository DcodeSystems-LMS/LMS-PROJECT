# Cleaning WordPress and Deploying React App to dcodesys.in

Since you're replacing a WordPress site with a React app, here's what you need to check and clean up.

## 🧹 Step 1: Remove All WordPress Files

### Files/Folders to Delete from `public_html/`:

1. **WordPress Core Files:**
   - `wp-admin/`
   - `wp-includes/`
   - `wp-content/` (unless you need to keep uploads)
   - `wp-config.php`
   - `wp-load.php`
   - `wp-blog-header.php`
   - `xmlrpc.php`
   - `license.txt`
   - `readme.html`
   - `wp-activate.php`
   - `wp-cron.php`
   - `wp-mail.php`
   - `wp-signup.php`
   - `wp-trackback.php`

2. **WordPress Plugins/Themes:**
   - All files in `wp-content/plugins/`
   - All files in `wp-content/themes/`
   - All files in `wp-content/uploads/` (unless you need to keep media)

3. **WordPress Cache Files:**
   - `.htaccess` (WordPress version - we'll replace it)
   - Any cache folders
   - `.wp-config.php` (if exists)

### ⚠️ Important: Backup First!

Before deleting, make a backup:
- Download all files to your computer
- Or create a backup folder in Hostinger

## 🔄 Step 2: Replace .htaccess File

WordPress creates its own `.htaccess` file with WordPress-specific rules. You need to replace it with the React app's `.htaccess`.

### In Hostinger File Manager:

1. **Delete the old WordPress `.htaccess`**
2. **Upload your React app's `.htaccess`** (from your project root)
3. **Verify the content** - it should have:
   ```apache
   RewriteEngine On
   RewriteBase /

   # Handle client-side routing
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

## 📁 Step 3: Upload React App Files

1. **Upload all contents from `dist/` folder:**
   - `index.html`
   - `assets/` folder
   - All other files from `dist/`

2. **Upload `.htaccess` file** (the React version, not WordPress)

3. **File structure should be:**
   ```
   public_html/
   ├── index.html          (React app)
   ├── .htaccess           (React version)
   ├── assets/             (React assets)
   └── (other React files)
   ```

## 🔧 Step 4: Check for WordPress Database Connections

Even though you deleted WordPress files, the database might still exist. This won't affect your React app, but you can:

1. **Optional: Remove WordPress database** (if you don't need it)
   - Go to Hostinger hPanel → **Databases**
   - Delete the WordPress database if not needed
   - This is optional - won't affect React app

2. **Your React app uses Supabase**, not the WordPress database, so this is fine to leave.

## ✅ Step 5: Verify Clean Installation

### Check File Manager:

1. **In `public_html/`, you should ONLY see:**
   - ✅ `index.html` (React)
   - ✅ `.htaccess` (React version)
   - ✅ `assets/` folder
   - ✅ Other React build files

2. **You should NOT see:**
   - ❌ `wp-config.php`
   - ❌ `wp-admin/` folder
   - ❌ `wp-includes/` folder
   - ❌ `wp-content/` folder
   - ❌ Any WordPress files

### Test Your Site:

1. Visit `https://dcodesys.in`
2. Should load your React app (not WordPress)
3. Check browser console (F12) for errors
4. Test navigation - all routes should work

## 🚨 Common Issues After WordPress Removal

### Issue 1: Still Seeing WordPress Admin or 404

**Problem:** WordPress files not fully deleted

**Solution:**
- Double-check `public_html/` for any WordPress files
- Delete `wp-config.php` if it exists
- Remove any `wp-*` folders
- Clear browser cache (Ctrl+Shift+R)

### Issue 2: .htaccess Conflicts

**Problem:** Old WordPress `.htaccess` rules conflicting

**Solution:**
- Delete the old `.htaccess`
- Upload the React app's `.htaccess` file
- Verify it has the React routing rules (not WordPress rules)

### Issue 3: Domain Still Pointing to WordPress

**Problem:** Domain configuration in Hostinger

**Solution:**
1. Go to Hostinger hPanel → **Domains**
2. Find `dcodesys.in`
3. Ensure it points to `public_html/`
4. Remove any WordPress-specific subdomain configurations

### Issue 4: Cached WordPress Content

**Problem:** Browser or CDN showing old WordPress content

**Solution:**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser data (Settings → Clear browsing data)
- If using Cloudflare, purge cache
- Wait a few minutes for DNS cache to clear

### Issue 5: SSL Certificate Issues

**Problem:** SSL was configured for WordPress

**Solution:**
1. Go to Hostinger hPanel → **SSL**
2. Find `dcodesys.in`
3. Reinstall/refresh SSL certificate
4. Enable "Force HTTPS"
5. Wait 5-10 minutes

## 📋 Complete Cleanup Checklist

Use this to ensure everything is clean:

### Files to Remove:
- [ ] `wp-admin/` folder deleted
- [ ] `wp-includes/` folder deleted
- [ ] `wp-content/` folder deleted (or cleaned)
- [ ] `wp-config.php` deleted
- [ ] All `wp-*.php` files deleted
- [ ] WordPress `.htaccess` deleted
- [ ] Any WordPress cache files deleted

### Files to Upload:
- [ ] All files from `dist/` uploaded
- [ ] React `.htaccess` uploaded
- [ ] `index.html` in root of `public_html/`
- [ ] `assets/` folder uploaded

### Configuration:
- [ ] Domain points to `public_html/`
- [ ] SSL certificate enabled
- [ ] File permissions set (644 for files, 755 for folders)
- [ ] No WordPress database connections needed

### Testing:
- [ ] Site loads at `https://dcodesys.in`
- [ ] Shows React app (not WordPress)
- [ ] All routes work (no 404 on refresh)
- [ ] No console errors
- [ ] Assets load correctly

## 🎯 Quick Verification

Run these checks:

1. **File Count Check:**
   - `public_html/` should have minimal files
   - Mainly: `index.html`, `.htaccess`, `assets/` folder
   - No `wp-*` files or folders

2. **Content Check:**
   - Visit `https://dcodesys.in`
   - Should see your React app interface
   - Should NOT see WordPress login or admin

3. **Route Check:**
   - Navigate to different pages
   - Refresh page (should work, not 404)
   - All React Router routes should work

## 💡 Pro Tips

1. **Keep a Backup:**
   - Before deleting, download all WordPress files
   - You might need something later

2. **Database:**
   - WordPress database won't interfere with React
   - You can delete it later if not needed
   - React app uses Supabase, not WordPress DB

3. **Subdomains:**
   - If you had `www.dcodesys.in` or `admin.dcodesys.in` for WordPress
   - Update those in Hostinger Domains section
   - Point them correctly or remove them

4. **Email:**
   - If WordPress was handling email, you might need to reconfigure
   - Your React app likely uses Supabase for auth emails

## ✅ Success Indicators

You'll know it's working when:

- ✅ `https://dcodesys.in` loads your React app
- ✅ No WordPress files visible in File Manager
- ✅ All React routes work correctly
- ✅ No 404 errors on page refresh
- ✅ Console shows no errors
- ✅ Assets (CSS/JS) load properly

---

**Your React app should now be live! If you see any WordPress remnants, follow the cleanup steps above.**

