# Prok Professional Networking Platform

A fully functional professional networking platform built with React (Frontend) and Flask (Backend), similar to LinkedIn.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Backend Setup
```bash
cd app/backend
source myenv/bin/activate
pip install -r requirements.txt
python setup_db.py
python seed_data.py  # Optional: Add sample data
python main.py
```

### Frontend Setup
```bash
cd app/frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🎯 Features

### ✅ Authentication
- User registration and login
- JWT token-based authentication
- Profile management

### ✅ Social Feed
- Create and view posts
- Like and comment on posts
- Follow/unfollow users
- Personalized feed

### ✅ Job Board
- Post job openings (companies)
- Browse and apply for jobs
- Job search and filtering

### ✅ Messaging
- Send direct messages
- View conversations
- Real-time notifications

### ✅ User Profiles
- View and edit profiles
- See connections (followers/following)
- View user posts

## 📊 Sample Data

The application comes with sample data for testing:

### Users
- **john_doe** (john@example.com) - Software Engineer
- **jane_smith** (jane@example.com) - Product Manager  
- **tech_corp** (hr@techcorp.com) - Company Account

### Password for all accounts: `password123`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/<id>` - Update post
- `DELETE /api/posts/<id>` - Delete post
- `POST /api/posts/<id>/like` - Like/unlike post
- `POST /api/posts/<id>/comments` - Add comment

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (companies only)
- `POST /api/jobs/<id>/apply` - Apply for job
- `GET /api/applications` - Get user applications

### Users & Feed
- `GET /api/users` - Get all users
- `GET /api/users/<id>` - Get user profile
- `POST /api/users/<id>/follow` - Follow/unfollow user
- `GET /api/feed` - Get personalized feed
- `GET /api/connections` - Get user connections

### Messaging
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/messages/<partner_id>` - Get conversation
- `GET /api/notifications` - Get notifications

## 🛠 Tech Stack

### Backend
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database (can be changed to MySQL/PostgreSQL)
- **JWT** - Authentication
- **Flask-CORS** - Cross-origin requests

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
Prok-Professional-Networking/
├── app/
│   ├── backend/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── main.py        # Flask app
│   │   ├── config.py      # Configuration
│   │   └── requirements.txt
│   └── frontend/
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── context/    # React context
│       │   ├── routes/     # Routing
│       │   └── services/   # API services
│       └── package.json
└── README.md
```

## 🔄 Database Schema

The application includes the following tables:
- **users** - User accounts and profiles
- **posts** - User posts and content
- **comments** - Post comments
- **likes** - Post likes
- **jobs** - Job postings
- **job_applications** - Job applications
- **companies** - Company profiles
- **messages** - Direct messages
- **notifications** - User notifications
- **user_connections** - Follow relationships

## 🚀 Deployment

### Backend Deployment
- Use a production WSGI server (Gunicorn)
- Set up environment variables
- Configure database (MySQL/PostgreSQL for production)

### Frontend Deployment
- Build the project: `npm run build`
- Deploy to static hosting (Netlify, Vercel, etc.)

## 🐛 Troubleshooting

### Common Issues
1. **Database connection errors**: Check database configuration in `config.py`
2. **Port conflicts**: Change ports in Flask app or Vite config
3. **CORS errors**: Ensure backend CORS is properly configured

### Logs
- Backend logs are displayed in the terminal
- Frontend logs are in browser console

## 📝 License

This project is for educational purposes.

---

**🎉 Your Prok Professional Networking Platform is now fully functional!**

Access it at: http://localhost:5173
