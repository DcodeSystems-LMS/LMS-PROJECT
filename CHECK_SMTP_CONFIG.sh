#!/bin/bash

# SMTP Configuration Diagnostic Script
# Run this on your Supabase server to diagnose email issues

echo "🔍 Checking SMTP Configuration..."
echo ""

# Check if .env file exists
echo "1️⃣ Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file found"
    echo ""
    echo "SMTP configuration in .env:"
    grep -i smtp .env || echo "❌ No SMTP variables found in .env"
else
    echo "❌ .env file not found!"
    echo "💡 Create .env file in Supabase directory"
fi
echo ""

# Check if containers are running
echo "2️⃣ Checking container status..."
if command -v docker-compose &> /dev/null; then
    docker-compose ps
    echo ""
else
    echo "❌ docker-compose not found"
fi

# Check environment variables in auth container
echo "3️⃣ Checking SMTP environment variables in auth container..."
if docker-compose ps | grep -q auth; then
    echo "SMTP variables in container:"
    docker-compose exec -T auth env | grep -i smtp || echo "❌ No SMTP variables found in container"
else
    echo "❌ Auth container not running"
fi
echo ""

# Check recent logs
echo "4️⃣ Checking recent auth logs for errors..."
if docker-compose ps | grep -q auth; then
    echo "Last 20 lines of auth logs:"
    docker-compose logs auth --tail=20
    echo ""
    echo "SMTP/Email errors:"
    docker-compose logs auth 2>&1 | grep -i "smtp\|email\|mail\|error" | tail -10 || echo "No specific errors found"
else
    echo "❌ Auth container not running"
fi
echo ""

# Test SMTP server connectivity
echo "5️⃣ Testing SMTP server connectivity..."
if command -v telnet &> /dev/null; then
    echo "Testing smtp.hostinger.com:465..."
    timeout 5 telnet smtp.hostinger.com 465 2>&1 | head -3 || echo "❌ Connection failed or timeout"
else
    echo "⚠️ telnet not available, skipping connectivity test"
fi
echo ""

# Summary
echo "📊 Summary:"
echo "- Check .env file has SMTP configuration"
echo "- Check containers are running"
echo "- Check SMTP variables are loaded in container"
echo "- Check logs for specific errors"
echo ""
echo "💡 Next steps:"
echo "1. If .env missing: Create with SMTP settings"
echo "2. If variables not loaded: Restart containers"
echo "3. If errors in logs: Fix specific error"
echo "4. If connection fails: Check firewall/network"

