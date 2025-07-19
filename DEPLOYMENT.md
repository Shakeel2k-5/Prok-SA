# 🚀 Complete Deployment Guide for Prok Professional Networking Platform

This comprehensive guide will walk you through deploying your Prok application to production using Render.com.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Step 1: Database Setup](#step-1-database-setup)
4. [Step 2: Backend Deployment](#step-2-backend-deployment)
5. [Step 3: Frontend Deployment](#step-3-frontend-deployment)
6. [Step 4: Environment Configuration](#step-4-environment-configuration)
7. [Step 5: Testing & Verification](#step-5-testing--verification)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)

## ✅ Prerequisites

Before starting deployment, ensure you have:

- ✅ **GitHub Account** with your Prok repository
- ✅ **Render.com Account** (free tier available)
- ✅ **Domain Name** (optional, for custom URLs)
- ✅ **Git installed** on your local machine
- ✅ **Node.js 18+** for local testing

## 🔍 Pre-Deployment Checklist

### Code Preparation
- [ ] All features are working locally
- [ ] No console errors in browser
- [ ] API endpoints are tested
- [ ] Environment variables are configured
- [ ] Database migrations are ready
- [ ] Build commands work locally

### Repository Setup
- [ ] Code is pushed to GitHub
- [ ] Repository is public (for Render free tier)
- [ ] No sensitive data in code
- [ ] .env files are in .gitignore

## 🗄️ Step 1: Database Setup

### 1.1 Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign in to your account

2. **Create New PostgreSQL Database**
   - Click **"New +"** button
   - Select **"PostgreSQL"**

3. **Configure Database**
   ```
   Name: prok-database
   Database: prok_db
   User: prok_user
   Region: Choose closest to your users
   PostgreSQL Version: 15 (latest stable)
   ```

4. **Create and Save Credentials**
   - Click **"Create Database"**
   - **IMPORTANT**: Copy the connection string
   - Save it securely - you'll need it for the backend

### 1.2 Database Connection String Format
```
postgresql://username:password@host:port/database
```

## ⚙️ Step 2: Backend Deployment

### 2.1 Create Web Service

1. **Start New Web Service**
   - In Render dashboard, click **"New +"**
   - Select **"Web Service"**

2. **Connect Repository**
   - Connect your GitHub account
   - Select your Prok repository: `Shakeel2k-5/Prok-SA`

3. **Configure Service Settings**
   ```
   Name: prok-backend
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free (or paid for better performance)
   ```

### 2.2 Environment Variables

Add these environment variables in the Render dashboard:

```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://your-frontend-url.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2.3 Deploy Backend

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 2-5 minutes)
3. **Note the URL** (e.g., `https://prok-backend.onrender.com`)

## 🎨 Step 3: Frontend Deployment

### 3.1 Create Static Site

1. **Start New Static Site**
   - In Render dashboard, click **"New +"**
   - Select **"Static Site"**

2. **Connect Repository**
   - Select the same GitHub repository
   - Repository: `Shakeel2k-5/Prok-SA`

3. **Configure Site Settings**
   ```
   Name: prok-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

### 3.2 Environment Variables

Add this environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### 3.3 Deploy Frontend

1. **Click "Create Static Site"**
2. **Wait for deployment** (usually 1-3 minutes)
3. **Note the URL** (e.g., `https://prok-frontend.onrender.com`)

## 🔧 Step 4: Environment Configuration

### 4.1 Update Backend CORS

1. **Go to Backend Service**
   - Navigate to your backend service in Render
   - Click **"Environment"** tab

2. **Update CORS Origin**
   ```
   CORS_ORIGIN=https://prok-frontend.onrender.com
   ```
   (Replace with your actual frontend URL)

3. **Save Changes**
   - Click **"Save Changes"**
   - Backend will automatically redeploy

### 4.2 Verify Environment Variables

**Backend Variables:**
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Strong secret key
- [ ] `NODE_ENV` - Set to "production"
- [ ] `CORS_ORIGIN` - Frontend URL
- [ ] `PORT` - Set to 10000

**Frontend Variables:**
- [ ] `VITE_API_URL` - Backend URL

## 🧪 Step 5: Testing & Verification

### 5.1 Health Check

1. **Test Backend Health**
   ```
   GET https://your-backend-url.onrender.com/api/health
   ```
   Expected: `{"status":"OK","message":"Prok API is running"}`

2. **Test Frontend**
   - Visit your frontend URL
   - Should load without errors

### 5.2 Feature Testing

Test these features in order:

1. **User Registration**
   - Go to `/register`
   - Create a new account
   - Should redirect to feed

2. **User Login**
   - Go to `/login`
   - Login with created account
   - Should show feed

3. **Create Post**
   - Type a post in the textarea
   - Click "Post"
   - Should appear in feed

4. **View Profile**
   - Click "My Profile"
   - Should show user information

5. **Logout**
   - Click "Logout"
   - Should redirect to login

### 5.3 API Testing

Test these endpoints:

```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Register user
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Get posts
curl https://your-backend-url.onrender.com/api/posts
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Failed
**Symptoms:** Backend logs show "Database connection failed"
**Solution:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running
- Ensure SSL settings are correct for production

#### 2. CORS Errors
**Symptoms:** Browser console shows CORS errors
**Solution:**
- Update `CORS_ORIGIN` in backend environment variables
- Ensure frontend URL is exactly correct
- Restart backend service after changes

#### 3. Build Failures
**Symptoms:** Frontend or backend deployment fails
**Solution:**
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs for specific errors

#### 4. Authentication Issues
**Symptoms:** Users can't login or stay logged in
**Solution:**
- Verify `JWT_SECRET` is set correctly
- Check token expiration settings
- Ensure frontend is using correct API URL

#### 5. 404 Errors
**Symptoms:** Pages not found or API endpoints return 404
**Solution:**
- Check if routes are properly configured
- Verify API base URL in frontend
- Check if server is running on correct port

### Debug Commands

```bash
# Check backend logs
# Go to backend service → Logs tab

# Check frontend build logs
# Go to frontend service → Logs tab

# Test API locally
curl http://localhost:5000/api/health

# Check environment variables
# Go to service → Environment tab
```

### Useful Render Dashboard Features

1. **Logs Tab** - View real-time application logs
2. **Environment Tab** - Manage environment variables
3. **Manual Deploy** - Trigger new deployments
4. **Metrics Tab** - Monitor performance (paid plans)

## 🔒 Security Checklist

### Essential Security Measures

- [ ] **JWT Secret**: Changed from default to strong secret
- [ ] **HTTPS**: All traffic uses HTTPS (automatic on Render)
- [ ] **CORS**: Properly configured for production domains
- [ ] **Rate Limiting**: Enabled to prevent abuse
- [ ] **Environment Variables**: Secrets stored in environment, not code
- [ ] **Database**: PostgreSQL with SSL enabled
- [ ] **Helmet**: Security headers enabled
- [ ] **Input Validation**: All user inputs validated

### Additional Security Recommendations

- [ ] **Custom Domain**: Set up custom domain with SSL
- [ ] **Monitoring**: Set up error monitoring (Sentry, etc.)
- [ ] **Backup**: Regular database backups
- [ ] **Updates**: Keep dependencies updated
- [ ] **Logging**: Monitor application logs for issues

## 📊 Performance Optimization

### Backend Optimization
- [ ] Database connection pooling
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Static file serving optimized

### Frontend Optimization
- [ ] Build optimized for production
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Caching headers set

## 🔄 Maintenance

### Regular Tasks
1. **Monitor Logs** - Check for errors weekly
2. **Update Dependencies** - Monthly security updates
3. **Database Backups** - Weekly backups
4. **Performance Monitoring** - Monitor response times

### Scaling Considerations
- **Free Tier Limits**: 750 hours/month on Render
- **Database Limits**: 1GB storage on free PostgreSQL
- **Upgrade Path**: Consider paid plans for production use

## 📞 Support Resources

### Documentation
- [Render Documentation](https://render.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

### Community
- [Render Community](https://community.render.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/render)

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] Users can register and login
- [ ] Posts can be created and viewed
- [ ] Profile page works
- [ ] All features function as expected
- [ ] No console errors in browser
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## 🚀 Your App is Live!

Congratulations! Your Prok Professional Networking Platform is now deployed and accessible to users worldwide.

**Frontend URL**: `https://your-frontend-url.onrender.com`  
**Backend URL**: `https://your-backend-url.onrender.com`

### Next Steps
1. **Share your app** with users
2. **Monitor performance** and user feedback
3. **Add new features** based on user needs
4. **Scale up** as your user base grows

---

**Need Help?** Check the troubleshooting section above or reach out to the community for support.

**Repository**: https://github.com/Shakeel2k-5/Prok-SA 