#!/bin/bash

# Email Edge Functions Deployment Script
# This script helps deploy email-related Edge Functions to Supabase

echo "🚀 Deploying Email Edge Functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Deploy simple email function (simulation mode)
echo "📧 Deploying simple email function (simulation mode)..."
if supabase functions deploy send-email-simple; then
    echo "✅ Simple email function deployed successfully"
else
    echo "❌ Failed to deploy simple email function"
fi

# Deploy Resend email function
echo "📧 Deploying Resend email function..."
if supabase functions deploy send-email-resend; then
    echo "✅ Resend email function deployed successfully"
else
    echo "❌ Failed to deploy Resend email function"
fi

# Deploy original email function
echo "📧 Deploying original email function..."
if supabase functions deploy send-email; then
    echo "✅ Original email function deployed successfully"
else
    echo "❌ Failed to deploy original email function"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Available email functions:"
echo "  - send-email-simple: Simulation mode (no API key needed)"
echo "  - send-email-resend: Uses Resend API (requires RESEND_API_KEY)"
echo "  - send-email: Original function (uses Supabase SMTP)"
echo ""
echo "🔧 To use Resend email function:"
echo "  1. Get API key from https://resend.com"
echo "  2. Add RESEND_API_KEY to your Supabase project secrets"
echo "  3. Update your frontend to use send-email-resend endpoint"
echo ""
echo "🧪 To test:"
echo "  curl -X POST https://your-project.supabase.co/functions/v1/send-email-simple \\"
echo "    -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"to\":\"test@example.com\",\"subject\":\"Test\",\"message\":\"Hello World\"}'"
