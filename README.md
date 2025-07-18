# Prok - Professional Networking Platform

A modern professional networking platform built with React, Node.js, and PostgreSQL.

## Features

- 🔐 User authentication (JWT)
- 👤 User profiles with bio and avatar
- 📝 Create and view posts
- 🔄 Real-time feed updates
- 📱 Responsive design
- 🚀 Production ready

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Bcrypt for password hashing
- CORS enabled

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shakeel2k-5/Prok-SA.git
cd Prok-SA
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API URL
```

4. Set up the database:
```bash
cd backend
npm run db:setup
```

5. Start the development servers:
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (protected)

## License

MIT 