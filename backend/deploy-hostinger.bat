@echo off
REM Hostinger Deployment Script for YouTube Extraction Backend (Windows)
REM This script helps deploy the backend to Hostinger hosting

echo 🚀 Starting Hostinger deployment for YouTube Extraction Backend...

REM Check if we're in the backend directory
if not exist "package.json" (
    echo [ERROR] Please run this script from the backend directory
    exit /b 1
)

echo [INFO] Installing Node.js dependencies...
call npm install --production

if %errorlevel% equ 0 (
    echo [SUCCESS] Node.js dependencies installed successfully
) else (
    echo [ERROR] Failed to install Node.js dependencies
    exit /b 1
)

REM Check if Python is available
echo [INFO] Checking Python availability...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Python is available
    
    REM Check if pip is available
    pip --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo [INFO] Installing yt-dlp...
        pip install yt-dlp --user
        
        if %errorlevel% equ 0 (
            echo [SUCCESS] yt-dlp installed successfully
        ) else (
            echo [WARNING] Failed to install yt-dlp. Video extraction may not work.
        )
    ) else (
        echo [WARNING] pip not found. Cannot install yt-dlp automatically.
    )
) else (
    echo [WARNING] Python not found. Video extraction will use fallback methods.
)

REM Create production environment file if it doesn't exist
if not exist ".env" (
    echo [INFO] Creating production environment file...
    copy env.production.template .env
    echo [WARNING] Please update .env file with your production settings
    echo [WARNING] Especially update CORS_ORIGIN with your domain
)

REM Test the server
echo [INFO] Testing server startup...
start /b node server.js
timeout /t 3 /nobreak >nul
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] Server started successfully
    taskkill /f /im node.exe >nul 2>&1
) else (
    echo [ERROR] Server failed to start
    exit /b 1
)

echo [SUCCESS] Deployment preparation completed!
echo [INFO] Next steps:
echo 1. Upload the backend folder to your Hostinger hosting
echo 2. Update .env file with your production domain
echo 3. Start the Node.js application in Hostinger control panel
echo 4. Test the health endpoint: https://yourdomain.com/api/health
echo 5. Test video extraction with a YouTube URL

echo [INFO] Files to upload to Hostinger:
echo - server.js
echo - package.json
echo - package-lock.json
echo - node_modules/ (or run npm install on Hostinger)
echo - .env (with your production settings)

echo [SUCCESS] Deployment script completed! 🎉
pause
