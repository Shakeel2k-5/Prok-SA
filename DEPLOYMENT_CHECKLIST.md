# 🚀 Quick Deployment Checklist

Use this checklist during your deployment process to ensure nothing is missed.

## 📋 Pre-Deployment

- [ ] **Code is working locally**
- [ ] **All features tested**
- [ ] **No console errors**
- [ ] **Code pushed to GitHub**
- [ ] **Repository is public** (for Render free tier)
- [ ] **No sensitive data in code**
- [ ] **.env files in .gitignore**

## 🗄️ Step 1: Database Setup

- [ ] **Create PostgreSQL database on Render**
  - [ ] Name: `prok-database`
  - [ ] Database: `prok_db`
  - [ ] User: `prok_user`
  - [ ] **Copy connection string**

## ⚙️ Step 2: Backend Deployment

- [ ] **Create Web Service on Render**
  - [ ] Name: `prok-backend`
  - [ ] Root Directory: `backend`
  - [ ] Runtime: `Node`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`

- [ ] **Set Environment Variables**
  - [ ] `PORT=10000`
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=postgresql://...`
  - [ ] `JWT_SECRET=your-secret-key`
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `CORS_ORIGIN=https://your-frontend-url.onrender.com`
  - [ ] `RATE_LIMIT_WINDOW_MS=900000`
  - [ ] `RATE_LIMIT_MAX_REQUESTS=100`

- [ ] **Deploy and get backend URL**

## 🎨 Step 3: Frontend Deployment

- [ ] **Create Static Site on Render**
  - [ ] Name: `prok-frontend`
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Publish Directory: `dist`

- [ ] **Set Environment Variable**
  - [ ] `VITE_API_URL=https://your-backend-url.onrender.com`

- [ ] **Deploy and get frontend URL**

## 🔧 Step 4: Configuration

- [ ] **Update Backend CORS**
  - [ ] Go to backend service → Environment
  - [ ] Update `CORS_ORIGIN` to frontend URL
  - [ ] Save changes (auto-redeploys)

## 🧪 Step 5: Testing

- [ ] **Health Check**
  - [ ] Backend: `GET /api/health` returns OK
  - [ ] Frontend loads without errors

- [ ] **Feature Testing**
  - [ ] User registration works
  - [ ] User login works
  - [ ] Create post works
  - [ ] View profile works
  - [ ] Logout works

- [ ] **API Testing**
  - [ ] All endpoints respond correctly
  - [ ] Authentication works
  - [ ] No CORS errors

## 🔒 Security Verification

- [ ] **HTTPS enabled** (automatic on Render)
- [ ] **JWT secret changed** from default
- [ ] **CORS properly configured**
- [ ] **Rate limiting enabled**
- [ ] **Environment variables set**
- [ ] **No secrets in code**

## 📊 Performance Check

- [ ] **Page load times acceptable**
- [ ] **API response times good**
- [ ] **Mobile responsive**
- [ ] **No console errors**
- [ ] **All features functional**

## 🎉 Success!

- [ ] **Frontend URL**: `https://your-frontend-url.onrender.com`
- [ ] **Backend URL**: `https://your-backend-url.onrender.com`
- [ ] **Database**: Connected and working
- [ ] **All features**: Working as expected

---

## 🚨 Common Issues

If you encounter problems:

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify PostgreSQL service is running

2. **CORS Errors**
   - Update `CORS_ORIGIN` in backend
   - Ensure URLs match exactly

3. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies

4. **Authentication Issues**
   - Check `JWT_SECRET` is set
   - Verify API URL in frontend

## 📞 Need Help?

- Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review Render dashboard logs
- Test locally first
- Check troubleshooting section

---

**Your Prok app should now be live! 🚀** 