# 🚀 Deployment Guide for Prok

This guide will help you deploy the Prok Professional Networking Platform to Render.com.

## Prerequisites

- GitHub account
- Render.com account
- PostgreSQL database (will be created on Render)

## Step 1: Prepare Your Repository

1. **Fork/Clone the Repository**
   ```bash
   git clone https://github.com/Shakeel2k-5/Prok-SA.git
   cd Prok-SA
   ```

2. **Push to Your Repository**
   ```bash
   git remote set-url origin https://github.com/Shakeel2k-5/Prok-SA.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

## Step 2: Create PostgreSQL Database on Render

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New +"** → **"PostgreSQL"**
3. Configure the database:
   - **Name**: `prok-database`
   - **Database**: `prok_db`
   - **User**: `prok_user`
   - **Region**: Choose closest to you
4. Click **"Create Database"**
5. **Save the connection details** - you'll need them for the backend

## Step 3: Deploy Backend

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `Shakeel2k-5/Prok-SA`
3. Configure the service:
   - **Name**: `prok-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   PORT=10000
   ```
5. Click **"Create Web Service"**

## Step 4: Deploy Frontend

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `Shakeel2k-5/Prok-SA`
3. Configure the service:
   - **Name**: `prok-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Click **"Create Static Site"**

## Step 5: Update CORS Configuration

1. Go to your backend service on Render
2. Click **"Environment"** tab
3. Update `CORS_ORIGIN` to your frontend URL:
   ```
   CORS_ORIGIN=https://prok-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. Your backend will automatically redeploy

## Step 6: Test Your Deployment

1. **Wait for both services to deploy** (green status)
2. **Visit your frontend URL**
3. **Test the features**:
   - Register a new user
   - Login with the user
   - Create a post
   - View the feed
   - Update profile

## Environment Variables Reference

### Backend (.env)
```env
# Server Configuration
PORT=10000
NODE_ENV=production

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://your-frontend-url.onrender.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=https://your-backend-url.onrender.com
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check your `DATABASE_URL` environment variable
   - Ensure PostgreSQL service is running
   - Verify SSL settings for production

2. **CORS Errors**
   - Update `CORS_ORIGIN` in backend environment variables
   - Ensure frontend URL is correct
   - Restart backend service after changes

3. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

4. **Authentication Issues**
   - Verify `JWT_SECRET` is set correctly
   - Check token expiration settings
   - Ensure frontend is using correct API URL

### Useful Commands

```bash
# Check backend logs
# Go to your backend service → Logs tab

# Check frontend build logs
# Go to your frontend service → Logs tab

# Restart services
# Go to service → Manual Deploy → Clear build cache & deploy
```

## Monitoring

- **Health Check**: Visit `https://your-backend-url.onrender.com/api/health`
- **Logs**: Monitor logs in Render dashboard
- **Performance**: Check service metrics in Render dashboard

## Security Notes

- ✅ Change default JWT secret
- ✅ Use HTTPS in production
- ✅ Set up proper CORS origins
- ✅ Enable rate limiting
- ✅ Use environment variables for secrets

## Support

If you encounter issues:
1. Check the logs in Render dashboard
2. Verify environment variables
3. Test locally first
4. Check the troubleshooting section above

Your Prok application should now be live and accessible! 🎉 