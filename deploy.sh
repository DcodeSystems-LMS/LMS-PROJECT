#!/bin/bash

echo "========================================"
echo "DCode Learning Platform - Deployment"
echo "========================================"
echo

echo "Building production files..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "Build failed! Please check the errors above."
    exit 1
fi

echo
echo "Build successful! Production files are in the 'dist' directory."
echo
echo "Next steps:"
echo "1. Upload the contents of 'dist' folder to your web server"
echo "2. Copy the '.htaccess' file to your web root"
echo "3. Configure your domain app.dcodesys.in to point to the directory"
echo "4. Set up SSL certificate"
echo "5. Update your Supabase environment variables"
echo
echo "For detailed instructions, see:"
echo "- PRODUCTION_READY.md"
echo "- DEPLOYMENT.md"
echo "- LOCAL_DEVELOPMENT.md"
echo
