from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import models
from models.user import User
from models.post import Post, Comment, Like
from models.profile import UserProfile

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# CORS Configuration for Production
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,https://prok-frontend.onrender.com').split(',')

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

# Test endpoint for deployment verification
@app.route('/api/test')
def test():
    return jsonify({'message': 'Prok Backend API is running successfully!', 'status': 'ok'})

# Database initialization endpoint
@app.route('/api/init-db')
def init_database():
    try:
        with app.app_context():
            db.create_all()
        return jsonify({'message': 'Database initialized successfully!', 'status': 'ok'})
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/')
def home():
    return jsonify({'message': 'Prok Professional Networking API', 'status': 'running'})

def setup_database():
    """Setup database tables"""
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables created successfully!")
        except Exception as e:
            print(f"⚠️ Database setup warning: {e}")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    # Setup database tables on app creation
    setup_database()
    return app

if __name__ == '__main__':
    # Run the app
    app.run(debug=True) 