# 🚀 Prok Professional Networking - Render.com Deployment Guide

## 📋 Prerequisites

- ✅ GitHub repository: `https://github.com/Shakeel2k-5/Prok-Professional-Networking`
- ✅ Render.com account (free tier available)
- ✅ All code changes committed and pushed to GitHub

## 🎯 Deployment Overview

We'll deploy:
1. **PostgreSQL Database** (Render Database)
2. **Backend API** (Render Web Service) 
3. **Frontend** (Render Static Site)

---

## 📊 Step 1: Create PostgreSQL Database

### 1.1 Go to Render.com
1. Visit [render.com](https://render.com)
2. Sign up/login with your GitHub account
3. Click **"New +"** → **"PostgreSQL"**

### 1.2 Configure Database
- **Name**: `prok-database`
- **Database**: `prok_db`
- **User**: `prok_user`
- **Region**: Choose closest to you (e.g., Oregon for US West)
- **PostgreSQL Version**: 15 (default)
- **Plan**: Free (for testing)

### 1.3 Create Database
- Click **"Create Database"**
- Wait for database to be created (2-3 minutes)
- **Copy the External Database URL** (you'll need this for Step 2)

**Example URL**: `postgres://prok_user:password@dpg-abc123-a.oregon-postgres.render.com/prok_db`

---

## 🔧 Step 2: Deploy Backend API

### 2.1 Create Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. **Select repository**: `Shakeel2k-5/Prok-Professional-Networking`

### 2.2 Configure Backend Service

**Basic Settings:**
- **Name**: `prok-backend`
- **Root Directory**: `app/backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn main:app`

**Environment Variables:**
```
FLASK_ENV=production
PYTHON_VERSION=3.10.12
DATABASE_URL=[Your PostgreSQL URL from Step 1]
SECRET_KEY=[Generate a secure random string]
JWT_SECRET_KEY=[Generate a secure random string]
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

### 2.3 Generate Secure Keys
Run these commands in your terminal to generate secure keys:
```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate JWT_SECRET_KEY  
openssl rand -hex 32
```

### 2.4 Create Backend Service
- Click **"Create Web Service"**
- Wait for deployment (3-5 minutes)
- Note the service URL (e.g., `https://prok-backend.onrender.com`)

---

## 🎨 Step 3: Deploy Frontend

### 3.1 Create Static Site
1. Click **"New +"** → **"Static Site"**
2. **Connect your GitHub repository** (same as backend)
3. **Select repository**: `Shakeel2k-5/Prok-Professional-Networking`

### 3.2 Configure Frontend Service

**Basic Settings:**
- **Name**: `prok-frontend`
- **Root Directory**: `app/frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Environment Variables:**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### 3.3 Create Frontend Service
- Click **"Create Static Site"**
- Wait for deployment (2-3 minutes)
- Note the frontend URL (e.g., `https://prok-frontend.onrender.com`)

---

## 🔄 Step 4: Update CORS Configuration

### 4.1 Update Backend CORS
1. Go to your backend service on Render
2. Click **"Environment"** tab
3. Update `ALLOWED_ORIGINS` to include your frontend URL:
   ```
   https://your-frontend-url.onrender.com
   ```
4. Click **"Save Changes"**
5. **Redeploy** the backend service

### 4.2 Verify CORS Update
- Wait for backend redeployment
- Test the API endpoint: `https://your-backend-url.onrender.com/api/test`

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
Visit: `https://your-backend-url.onrender.com/api/test`
**Expected Response:**
```json
{
  "message": "Prok Backend API is running successfully!",
  "status": "ok"
}
```

### 5.2 Test Frontend
Visit your frontend URL and test:
- ✅ User registration
- ✅ User login
- ✅ Profile creation/editing
- ✅ Post creation
- ✅ Feed functionality

### 5.3 Test API Endpoints
Test these endpoints with a tool like Postman or curl:
```bash
# Test login
curl -X POST https://your-backend-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Test profile
curl -X GET https://your-backend-url.onrender.com/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Build Failures
**Problem**: Frontend build fails
**Solution**: 
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

#### 2. Database Connection Errors
**Problem**: Backend can't connect to database
**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure database credentials are correct

#### 3. CORS Errors
**Problem**: Frontend can't call backend API
**Solution**:
- Update `ALLOWED_ORIGINS` with exact frontend URL
- Redeploy backend after CORS changes
- Check browser console for specific errors

#### 4. JWT Token Issues
**Problem**: Authentication fails
**Solution**:
- Verify `JWT_SECRET_KEY` is set
- Check token format in requests
- Ensure backend is redeployed after JWT changes

#### 5. Environment Variables Not Working
**Problem**: API calls fail with wrong URLs
**Solution**:
- Verify `VITE_API_URL` is set correctly
- Rebuild frontend after environment variable changes
- Check that environment variables are saved

---

## 📊 Environment Variables Reference

### Backend Environment Variables
```bash
FLASK_ENV=production
PYTHON_VERSION=3.10.12
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-64-character-secret-key
JWT_SECRET_KEY=your-64-character-jwt-secret
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

### Frontend Environment Variables
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## 🎯 Final Checklist

Before going live, verify:

- [ ] PostgreSQL database is running
- [ ] Backend API responds to `/api/test`
- [ ] Frontend builds successfully
- [ ] User registration works
- [ ] User login works
- [ ] Profile management works
- [ ] Post creation works
- [ ] Feed displays posts
- [ ] CORS is configured correctly
- [ ] All environment variables are set
- [ ] No console errors in browser

---

## 🚀 Going Live

Once everything is tested and working:

1. **Custom Domain** (Optional):
   - Go to your frontend service
   - Click **"Settings"** → **"Custom Domains"**
   - Add your domain name

2. **SSL Certificate**:
   - Automatically provided by Render
   - HTTPS enabled by default

3. **Monitoring**:
   - Check Render dashboard for logs
   - Monitor service health
   - Set up alerts if needed

---

## 📞 Support

If you encounter issues:

1. **Check Render Logs**: Go to your service → "Logs" tab
2. **Verify Environment Variables**: Ensure all are set correctly
3. **Test API Endpoints**: Use Postman or curl to test individually
4. **Check Browser Console**: Look for frontend errors
5. **Review Build Logs**: Check for build-time errors

---

## 🎉 Congratulations!

Your Prok Professional Networking application is now live on the internet! 

**Your URLs:**
- Frontend: `https://your-frontend-url.onrender.com`
- Backend: `https://your-backend-url.onrender.com`
- Database: Managed by Render

**Next Steps:**
- Share your application with others
- Monitor usage and performance
- Consider upgrading to paid plans for more resources
- Add custom domain for professional appearance

---

**Happy Deploying! 🚀** 