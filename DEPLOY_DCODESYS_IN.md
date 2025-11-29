# Deployment Guide for dcodesys.in

This guide will help you deploy the DCode Learning Platform to **dcodesys.in**.

## Prerequisites

- Domain `dcodesys.in` pointing to your server
- Node.js 18+ installed on your server
- Web server (Nginx or Apache)
- SSL certificate (Let's Encrypt recommended)

## Quick Deployment Steps

### 1. Prepare Environment Variables

```bash
# Copy the production template
cp env.production.template .env.production

# The template already has dcodesys.in configured
# Verify the settings:
# VITE_APP_URL=https://dcodesys.in
# VITE_SUPABASE_URL=https://supabase.dcodesys.in
```

### 2. Build for Production

```bash
# Install dependencies (if not already done)
npm install

# Build the application
npm run build:prod

# The build output will be in the `dist/` directory
```

### 3. Upload Files to Server

Upload the entire contents of the `dist/` directory to your web server's root directory.

**For Apache:**
- Upload to: `/var/www/html/` or your Apache document root
- Copy `.htaccess` file to the same directory

**For Nginx:**
- Upload to: `/var/www/dcodesys.in/dist/` (or your preferred location)
- Use the provided `nginx.dcodesys.in.conf` configuration

### 4. Configure Web Server

#### Option A: Apache (.htaccess)

The `.htaccess` file is already configured and ready to use. Just ensure:
- It's uploaded to your document root
- Apache has `mod_rewrite` enabled
- Apache has `mod_headers` enabled (for security headers)

#### Option B: Nginx

1. Copy the nginx configuration:
   ```bash
   sudo cp nginx.dcodesys.in.conf /etc/nginx/sites-available/dcodesys.in
   ```

2. Update the paths in the config file:
   - Update `root /var/www/dcodesys.in/dist;` to your actual path
   - Update SSL certificate paths if using custom certificates

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/dcodesys.in /etc/nginx/sites-enabled/
   ```

4. Test and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 5. Set Up SSL Certificate

#### Using Let's Encrypt (Certbot):

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx  # For Nginx
# OR
sudo apt-get install certbot python3-certbot-apache  # For Apache

# Get certificate
sudo certbot --nginx -d dcodesys.in -d www.dcodesys.in  # For Nginx
# OR
sudo certbot --apache -d dcodesys.in -d www.dcodesys.in  # For Apache

# Auto-renewal is set up automatically
```

### 6. Configure DNS

Ensure your DNS records are set up:

- **A Record**: `dcodesys.in` → Your server IP address
- **A Record** (optional): `www.dcodesys.in` → Your server IP address
- **CNAME Record** (alternative): `www.dcodesys.in` → `dcodesys.in`

### 7. Verify Deployment

1. Visit `https://dcodesys.in` in your browser
2. Check that the site loads correctly
3. Test authentication
4. Verify all routes work (try refreshing on different pages)
5. Check browser console for any errors

## Post-Deployment Checklist

- [ ] Site loads at `https://dcodesys.in`
- [ ] SSL certificate is valid (green padlock)
- [ ] All pages load correctly
- [ ] Client-side routing works (no 404s on refresh)
- [ ] Authentication works
- [ ] Static assets are cached (check Network tab)
- [ ] Security headers are present (check Response Headers)
- [ ] Mobile responsiveness works
- [ ] All features tested (courses, assessments, etc.)

## Troubleshooting

### 404 Errors on Page Refresh

**Apache:** Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

**Nginx:** Ensure the `try_files` directive is in your location block

### SSL Certificate Issues

- Verify DNS is pointing to your server
- Check certificate paths in nginx config
- Ensure port 443 is open in firewall

### Static Assets Not Loading

- Check file permissions: `sudo chown -R www-data:www-data /var/www/dcodesys.in`
- Verify paths in web server configuration
- Check browser console for 404 errors

### Environment Variables Not Working

- Ensure `.env.production` is in the project root before building
- Rebuild after changing environment variables: `npm run build:prod`
- Check that variables start with `VITE_` prefix

## Maintenance

### Updating the Site

1. Make your changes locally
2. Test with `npm run dev`
3. Build: `npm run build:prod`
4. Upload new `dist/` contents to server
5. Clear browser cache if needed

### Monitoring

- Check server logs regularly
- Monitor SSL certificate expiration (auto-renewal should handle this)
- Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

## Support

For issues or questions:
- Check `DEPLOYMENT.md` for detailed deployment info
- Check `LOCAL_DEVELOPMENT.md` for development setup
- Check `SUPABASE_SETUP.md` for database configuration

---

**Your site should now be live at https://dcodesys.in! 🎉**

