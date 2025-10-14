#!/bin/bash

# Hostinger Deployment Script for YouTube Extraction Backend
# This script helps deploy the backend to Hostinger hosting

echo "🚀 Starting Hostinger deployment for YouTube Extraction Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

print_status "Installing Node.js dependencies..."
npm install --production

if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed successfully"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Check if Python is available
print_status "Checking Python availability..."
if command -v python3 &> /dev/null; then
    print_success "Python3 is available"
    
    # Check if pip is available
    if command -v pip3 &> /dev/null; then
        print_status "Installing yt-dlp..."
        pip3 install yt-dlp --user
        
        if [ $? -eq 0 ]; then
            print_success "yt-dlp installed successfully"
        else
            print_warning "Failed to install yt-dlp. Video extraction may not work."
        fi
    else
        print_warning "pip3 not found. Cannot install yt-dlp automatically."
    fi
else
    print_warning "Python3 not found. Video extraction will use fallback methods."
fi

# Create production environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating production environment file..."
    cp env.production.template .env
    print_warning "Please update .env file with your production settings"
    print_warning "Especially update CORS_ORIGIN with your domain"
fi

# Test the server
print_status "Testing server startup..."
timeout 10s node server.js &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server started successfully"
    kill $SERVER_PID
else
    print_error "Server failed to start"
    exit 1
fi

print_success "Deployment preparation completed!"
print_status "Next steps:"
echo "1. Upload the backend folder to your Hostinger hosting"
echo "2. Update .env file with your production domain"
echo "3. Start the Node.js application in Hostinger control panel"
echo "4. Test the health endpoint: https://yourdomain.com/api/health"
echo "5. Test video extraction with a YouTube URL"

print_status "Files to upload to Hostinger:"
echo "- server.js"
echo "- package.json"
echo "- package-lock.json"
echo "- node_modules/ (or run npm install on Hostinger)"
echo "- .env (with your production settings)"

print_success "Deployment script completed! 🎉"
