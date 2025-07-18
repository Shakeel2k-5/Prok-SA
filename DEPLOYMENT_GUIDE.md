# Prok Professional Networking - Deployment Guide

## 🎯 Overview

This guide provides step-by-step instructions for deploying the Prok Professional Networking application to production. Based on previous successful deployments, we'll use **Render.com** for both frontend and backend services.

## 🏗️ Architecture

- **Frontend**: React + TypeScript (Static Site on Render)
- **Backend**: Flask + Python (Web Service on Render)
- **Database**: PostgreSQL (Render Database)
- **Authentication**: JWT-based
- **Features**: User authentication, profile management, feed, post creation

## 📋 Prerequisites

1. **GitHub Repository**: Code pushed to GitHub
2. **Render.com Account**: Free tier available
3. **Domain Name** (Optional): For custom domain setup

## 🚀 Deployment Steps

### Step 1: Prepare Your Code

#### 1.1 Update Frontend API Configuration

Update all API files to use environment variables:

```typescript
// In all API files (auth/api.ts, profile/api.ts, feed/api.ts, posts/api.ts)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

#### 1.2 Update Backend CORS Configuration

Update `app/backend/main.py`:

```python
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# CORS Configuration for Production
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')

CORS(app,
     origins=ALLOWED_ORIGINS,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=True,
     max_age=3600)

# Initialize extensions
jwt = JWTManager(app)

# Initialize database
from models import db
db.init_app(app)

# Register blueprints
from api.auth import auth_bp
from api.posts import posts_bp
from api.feed import feed_bp
from api.profile import profile_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(posts_bp, url_prefix='/api')
app.register_blueprint(feed_bp, url_prefix='/api')
app.register_blueprint(profile_bp, url_prefix='/api')

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Run the app
    app.run(debug=True)
```

#### 1.3 Update Database Configuration

Update `app/backend/config.py`:

```python
import os
from datetime import timedelta

class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')
    
    # Database - Support both MySQL (local) and PostgreSQL (production)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'mysql://prok_user:ProkApp2024!%40%23@localhost/prok_app'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # CORS
    CORS_HEADERS = 'Content-Type'
```

#### 1.4 Create Production Requirements

Ensure `app/backend/requirements.txt` includes:

```txt
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-JWT-Extended==4.5.2
Flask-CORS==4.0.0
python-dotenv==1.0.0
gunicorn==21.2.0
psycopg2-binary==2.9.7
mysqlclient==2.2.0
```

### Step 2: Database Setup (Render PostgreSQL)

#### 2.1 Create PostgreSQL Database

1. Go to [Render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `prok-database`
   - **Database**: `prok_db`
   - **User**: `prok_user`
   - **Region**: Choose closest to you
4. Click **"Create Database"**
5. **Copy the External Database URL** (you'll need this for the backend)

### Step 3: Backend Deployment (Render Web Service)

#### 3.1 Deploy Backend Service

1. Click **"New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. **Choose branch**: `main` (or your deployment branch)
4. **Configure the service**:

**Basic Settings:**
- **Name**: `prok-backend`
- **Root Directory**: `app/backend`
- **Runtime**: `Python 3`
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  gunicorn main:app
  ```

**Environment Variables:**
- `FLASK_ENV`: `production`
- `PYTHON_VERSION`: `3.10.12`
- `DATABASE_URL`: [Your PostgreSQL URL from Step 2]
- `SECRET_KEY`: [Generate a secure random string]
- `JWT_SECRET_KEY`: [Generate a secure random string]
- `ALLOWED_ORIGINS`: [Your frontend URL, e.g., https://your-app.onrender.com]

#### 3.2 Click "Create Web Service"

Wait for deployment to complete and note the service URL.

### Step 4: Frontend Deployment (Render Static Site)

#### 4.1 Deploy Frontend Service

1. Click **"New +"** → **"Static Site"**
2. **Connect your GitHub repository**
3. **Choose branch**: `main` (or your deployment branch)

**Configure the service:**
- **Name**: `prok-frontend`
- **Root Directory**: `app/frontend`
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Publish Directory**: `dist`

**Environment Variables:**
- `VITE_API_URL`: [Your backend URL from Step 3]

#### 4.2 Click "Create Static Site"

Wait for deployment to complete.

### Step 5: Update CORS Configuration

#### 5.1 Update Backend CORS

1. Go to your backend service on Render
2. Go to **Environment** tab
3. Update `ALLOWED_ORIGINS` to include your frontend URL:
   ```
   https://your-frontend-url.onrender.com
   ```
4. **Redeploy** the backend service

### Step 6: Database Migration

#### 6.1 Migrate Data (if needed)

If you have existing data in MySQL, you'll need to migrate it to PostgreSQL:

1. **Export from MySQL**:
   ```bash
   mysqldump -u prok_user -p prok_app > backup.sql
   ```

2. **Import to PostgreSQL** (using pgAdmin or psql):
   ```bash
   psql -h your-postgres-host -U your-user -d prok_db -f backup.sql
   ```

### Step 7: Testing

#### 7.1 Test Your Deployment

1. **Test Backend**: Visit `https://your-backend-url.onrender.com/api/auth/test`
2. **Test Frontend**: Visit your frontend URL
3. **Test Features**:
   - User registration/login
   - Profile creation/editing
   - Post creation
   - Feed functionality

#### 7.2 Common Issues & Solutions

**CORS Errors:**
- Ensure `ALLOWED_ORIGINS` includes your frontend URL
- Check that the backend is redeployed after CORS changes

**Database Connection Errors:**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL service is running
- Check database credentials

**Build Errors:**
- Check build logs in Render dashboard
- Verify all dependencies are in `requirements.txt`
- Ensure correct Python version

## 🔧 Production Optimizations

### Security
- ✅ JWT token expiration
- ✅ CORS configuration
- ✅ Environment variables
- ✅ Input validation

### Performance
- ✅ Gunicorn WSGI server
- ✅ Static asset optimization
- ✅ Database indexing
- ✅ CDN for static files

### Monitoring
- ✅ Render built-in monitoring
- ✅ Error logging
- ✅ Performance metrics

## 📊 Environment Variables Reference

### Backend Environment Variables
```bash
FLASK_ENV=production
PYTHON_VERSION=3.10.12
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

### Frontend Environment Variables
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

## 🚀 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend API URLs updated to use environment variables
- [ ] Backend CORS configured for production
- [ ] Database configuration updated for PostgreSQL
- [ ] Requirements.txt includes all dependencies
- [ ] PostgreSQL database created on Render
- [ ] Backend service deployed on Render
- [ ] Frontend service deployed on Render
- [ ] Environment variables configured
- [ ] CORS origins updated
- [ ] All features tested in production
- [ ] Database migration completed (if needed)

## 🎯 Next Steps

1. **Custom Domain**: Set up custom domain for professional appearance
2. **SSL Certificate**: Automatically provided by Render
3. **Monitoring**: Set up additional monitoring tools
4. **Backup Strategy**: Configure automated database backups
5. **Scaling**: Plan for application scaling as user base grows

## 📞 Support

If you encounter issues during deployment:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints individually
4. Check CORS configuration
5. Verify database connectivity

---

**Happy Deploying! 🚀** 