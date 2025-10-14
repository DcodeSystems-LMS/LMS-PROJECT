# Deployment Configuration for app.dcodesys.in

## Production Build Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build:prod
```

### 3. Serve Locally (for testing)
```bash
npm run serve
```

## Deployment Files

The production build will be created in the `dist/` directory. This directory contains:

- `index.html` - Main HTML file
- `assets/` - Compiled JavaScript and CSS files
- All static assets

## Server Configuration

### Apache (.htaccess)
Create a `.htaccess` file in your web root with:

```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name app.dcodesys.in;
    root /path/to/your/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## Environment Variables

1. Copy `env.production.template` to `.env.production`
2. Update with your production Supabase credentials:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Deployment Steps

1. **Prepare Environment**:
   ```bash
   cp env.production.template .env.production
   # Edit .env.production with your production credentials
   ```

2. **Build Application**:
   ```bash
   npm run build:prod
   ```

3. **Upload Files**:
   - Upload the entire `dist/` directory to your web server
   - Ensure `index.html` is in the root of your domain

4. **Configure Server**:
   - Add the `.htaccess` file (for Apache) or nginx configuration
   - Ensure your domain points to the correct directory

5. **Test Deployment**:
   - Visit `https://app.dcodesys.in`
   - Test all functionality including authentication

## SSL Certificate

Ensure your domain has a valid SSL certificate. You can use:
- Let's Encrypt (free)
- Your hosting provider's SSL
- Cloudflare SSL

## Domain Configuration

Make sure your DNS is configured to point `app.dcodesys.in` to your server's IP address.
