#!/bin/bash

echo "🚀 Railway Deployment Script for Prok Professional Networking"
echo "=========================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI is installed"

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

echo ""
echo "📋 Next Steps:"
echo "1. Go to https://railway.app"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose your repository: $(basename $(pwd))"
echo "5. Railway will automatically detect and deploy your app"
echo ""
echo "🔧 Environment Variables to set in Railway:"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo "   JWT_SECRET=your_secret_key_here"
echo "   CORS_ORIGIN=https://your-frontend-domain.railway.app"
echo ""
echo "📊 For frontend service:"
echo "   VITE_API_URL=https://your-backend-domain.railway.app"
echo ""
echo "🎉 Your app will be deployed in 5-10 minutes!"
echo ""
echo "💡 Tip: Railway will automatically create a PostgreSQL database for you" 