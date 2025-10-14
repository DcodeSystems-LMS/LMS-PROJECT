#!/bin/bash

# Python and yt-dlp Installation Script for Hostinger
# This script helps install Python dependencies on Hostinger hosting

echo "🐍 Installing Python and yt-dlp for Hostinger..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Method 1: Check if Python is already available
print_status "Checking for existing Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    print_success "Python3 found: $PYTHON_VERSION"
    
    # Check if pip is available
    if command -v pip3 &> /dev/null; then
        print_success "pip3 is available"
        
        # Install yt-dlp
        print_status "Installing yt-dlp..."
        pip3 install yt-dlp --user
        
        if [ $? -eq 0 ]; then
            print_success "yt-dlp installed successfully"
            
            # Test yt-dlp
            print_status "Testing yt-dlp installation..."
            if yt-dlp --version &> /dev/null; then
                YT_DLP_VERSION=$(yt-dlp --version)
                print_success "yt-dlp is working: $YT_DLP_VERSION"
            else
                print_warning "yt-dlp installed but not accessible in PATH"
                print_status "Trying to run with python3 -m yt_dlp..."
                if python3 -m yt_dlp --version &> /dev/null; then
                    print_success "yt-dlp accessible via python3 -m yt_dlp"
                else
                    print_error "yt-dlp is not working properly"
                fi
            fi
        else
            print_error "Failed to install yt-dlp"
        fi
    else
        print_warning "pip3 not found. Trying to install pip..."
        
        # Try to install pip
        if command -v curl &> /dev/null; then
            print_status "Installing pip using get-pip.py..."
            curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
            python3 get-pip.py --user
            rm get-pip.py
            
            if [ $? -eq 0 ]; then
                print_success "pip installed successfully"
                # Now try to install yt-dlp
                pip3 install yt-dlp --user
            else
                print_error "Failed to install pip"
            fi
        else
            print_error "Cannot install pip without curl"
        fi
    fi
else
    print_warning "Python3 not found on the system"
    print_status "Hostinger shared hosting typically doesn't include Python"
    print_status "You have the following options:"
    echo ""
    echo "1. Contact Hostinger support to enable Python"
    echo "2. Upgrade to VPS hosting which includes Python"
    echo "3. Use the fallback extraction method (no Python required)"
    echo ""
    print_status "The backend will automatically detect if yt-dlp is not available"
    print_status "and will use fallback methods for video extraction"
fi

# Method 2: Try alternative installation methods
print_status "Checking for alternative Python installations..."

# Check for python (without 3)
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    print_success "Python found: $PYTHON_VERSION"
    
    # Check if it's Python 3
    if python -c "import sys; print(sys.version_info[0])" 2>/dev/null | grep -q "3"; then
        print_success "Python is version 3"
        
        # Try to install yt-dlp with python
        print_status "Installing yt-dlp with python..."
        python -m pip install yt-dlp --user
        
        if [ $? -eq 0 ]; then
            print_success "yt-dlp installed with python"
        fi
    fi
fi

# Method 3: Check for conda/miniconda
if command -v conda &> /dev/null; then
    print_success "Conda found"
    print_status "Installing yt-dlp with conda..."
    conda install -c conda-forge yt-dlp -y
    
    if [ $? -eq 0 ]; then
        print_success "yt-dlp installed with conda"
    fi
fi

# Final test
print_status "Final test of yt-dlp availability..."
if command -v yt-dlp &> /dev/null; then
    print_success "✅ yt-dlp is available and working!"
    yt-dlp --version
elif python3 -m yt_dlp --version &> /dev/null; then
    print_success "✅ yt-dlp is available via python3 -m yt_dlp!"
    python3 -m yt_dlp --version
elif python -m yt_dlp --version &> /dev/null; then
    print_success "✅ yt-dlp is available via python -m yt_dlp!"
    python -m yt_dlp --version
else
    print_warning "❌ yt-dlp is not available"
    print_status "The backend will use fallback methods for video extraction"
    print_status "This means videos will still work, but via YouTube embed instead of direct extraction"
fi

print_success "Python installation script completed!"
print_status "If yt-dlp is not available, the backend will automatically:"
echo "1. Detect the missing dependency"
echo "2. Return appropriate error messages"
echo "3. Allow the frontend to fall back to YouTube embed"
echo "4. Ensure videos still play for users"
