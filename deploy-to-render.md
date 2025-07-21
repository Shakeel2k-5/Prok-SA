# 🚀 Quick Render Deployment Guide

## 📋 Prerequisites
- ✅ Code pushed to GitHub
- ✅ Render.com account
- ✅ PostgreSQL database created

## 🗄️ Step 1: Database (Already Done)
- Database URL: `postgresql://username:password@host:port/database`
- Copy this connection string for backend

## ⚙️ Step 2: Backend Deployment

### Create Web Service
- **Name**: `prok-backend`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables
```env
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=prok-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🎨 Step 3: Frontend Deployment

### Create Static Site
- **Name**: `prok-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Environment Variable
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

## 🔧 Step 4: Update CORS
1. Go to backend service → Environment
2. Update `CORS_ORIGIN` to your frontend URL
3. Save changes

## 🧪 Step 5: Test
1. Backend health: `https://your-backend-url.onrender.com/api/health`
2. Frontend: `https://your-frontend-url.onrender.com`

## 📝 URLs to Replace
- `your-backend-url.onrender.com` → Your actual backend URL
- `your-frontend-url.onrender.com` → Your actual frontend URL
- `postgresql://username:password@host:port/database` → Your actual database connection string 