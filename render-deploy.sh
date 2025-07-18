#!/bin/bash

# 🚀 Prok Professional Networking - Render.com Deployment Helper
# This script helps you prepare for deployment on Render.com

echo "🚀 Prok Professional Networking - Render.com Deployment Helper"
echo "=============================================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes. Please commit them before deploying."
    echo "   Run: git add . && git commit -m 'Prepare for Render deployment'"
    exit 1
fi

echo ""
echo "✅ Code is ready for deployment!"
echo ""

# Generate secure keys
echo "🔐 Generating secure keys for environment variables..."
echo ""

SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)

echo "📋 Environment Variables for Backend:"
echo "====================================="
echo "FLASK_ENV=production"
echo "PYTHON_VERSION=3.10.12"
echo "DATABASE_URL=[Your PostgreSQL URL from Render]"
echo "SECRET_KEY=$SECRET_KEY"
echo "JWT_SECRET_KEY=$JWT_SECRET_KEY"
echo "ALLOWED_ORIGINS=https://your-frontend-url.onrender.com"
echo ""

echo "📋 Environment Variables for Frontend:"
echo "======================================"
echo "VITE_API_URL=https://your-backend-url.onrender.com"
echo ""

echo "📋 Deployment Steps:"
echo "===================="
echo "1. Go to https://render.com and sign up/login"
echo "2. Create PostgreSQL Database:"
echo "   - Click 'New +' → 'PostgreSQL'"
echo "   - Name: prok-database"
echo "   - Copy the External Database URL"
echo ""
echo "3. Deploy Backend:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Root Directory: app/backend"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: gunicorn main:app"
echo "   - Add environment variables (see above)"
echo ""
echo "4. Deploy Frontend:"
echo "   - Click 'New +' → 'Static Site'"
echo "   - Connect your GitHub repository"
echo "   - Root Directory: app/frontend"
echo "   - Build Command: npm install && npm run build"
echo "   - Publish Directory: dist"
echo "   - Add VITE_API_URL environment variable"
echo ""
echo "5. Update CORS:"
echo "   - Go to backend service → Environment tab"
echo "   - Update ALLOWED_ORIGINS with your frontend URL"
echo "   - Redeploy backend"
echo ""
echo "6. Test:"
echo "   - Backend: https://your-backend-url.onrender.com/api/test"
echo "   - Frontend: https://your-frontend-url.onrender.com"
echo ""

echo "📚 For detailed instructions, see: RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Your Repository: https://github.com/Shakeel2k-5/Prok-Professional-Networking"
echo ""
echo "🎯 Ready to deploy! Follow the steps above or read the detailed guide."
echo ""
echo "Happy Deploying! 🚀" 