#!/bin/bash

echo "Setting up video extraction backend..."

# Install youtube-dl
echo "Installing youtube-dl..."
pip3 install youtube-dl

# Alternative: Install yt-dlp (newer, better maintained)
echo "Installing yt-dlp (recommended)..."
pip3 install yt-dlp

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "To start in development mode:"
echo "  npm run dev"
echo ""
echo "Make sure youtube-dl or yt-dlp is installed and accessible from command line"
