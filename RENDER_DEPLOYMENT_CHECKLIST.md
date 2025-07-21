# ✅ Render Deployment Checklist

## 🗄️ Step 1: Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Copy database connection string
- [ ] Note database URL for backend configuration

## ⚙️ Step 2: Backend Deployment
- [ ] Create Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Set Build Command to `npm install`
- [ ] Set Start Command to `npm start`
- [ ] Add environment variables:
  - [ ] `PORT=10000`
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=postgresql://...`
  - [ ] `JWT_SECRET=your-secret-key`
  - [ ] `JWT_EXPIRES_IN=7d`
  - [ ] `CORS_ORIGIN=https://your-frontend-url.onrender.com`
  - [ ] `RATE_LIMIT_WINDOW_MS=900000`
  - [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] Deploy and get backend URL

## 🎨 Step 3: Frontend Deployment
- [ ] Create Static Site on Render
- [ ] Connect same GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Set Build Command to `npm install && npm run build`
- [ ] Set Publish Directory to `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=https://your-backend-url.onrender.com`
- [ ] Deploy and get frontend URL

## 🔧 Step 4: Configuration
- [ ] Update backend CORS_ORIGIN to frontend URL
- [ ] Save changes (auto-redeploys backend)

## 🧪 Step 5: Testing
- [ ] Test backend health: `GET /api/health`
- [ ] Test frontend loads without errors
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating posts
- [ ] Test viewing feed

## 📝 Important Notes
- Backend URL format: `https://prok-backend.onrender.com`
- Frontend URL format: `https://prok-frontend.onrender.com`
- Database URL format: `postgresql://username:password@host:port/database`
- CORS must be updated after both services are deployed 