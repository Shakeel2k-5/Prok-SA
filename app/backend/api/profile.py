from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models import db
from models.post import Post
from models.profile import UserConnection
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_my_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        posts_count = Post.query.filter_by(user_id=user_id, status='active').count()
        followers_count = UserConnection.query.filter_by(following_id=user_id, status='accepted').count()
        following_count = UserConnection.query.filter_by(follower_id=user_id, status='accepted').count()
        profile_data = user.to_dict()
        profile_data.update({
            'posts_count': posts_count,
            'followers_count': followers_count,
            'following_count': following_count
        })
        return jsonify({'profile': profile_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_my_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        if 'username' in data:
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Username already exists'}), 400
            user.username = data['username']
        if 'email' in data:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        if 'bio' in data:
            user.bio = data['bio']
        if 'skills' in data:
            user.skills = data['skills']
        if 'profile_picture' in data:
            user.profile_picture = data['profile_picture']
        user.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'profile': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/profile/posts', methods=['GET'])
@jwt_required()
def get_my_posts():
    try:
        user_id = int(get_jwt_identity())
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        posts = Post.query.filter_by(user_id=user_id, status='active').order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return jsonify({
            'posts': [post.to_dict() for post in posts.items],
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/profile/connections', methods=['GET'])
@jwt_required()
def get_my_connections():
    try:
        user_id = int(get_jwt_identity())
        followers = UserConnection.query.filter_by(following_id=user_id, status='accepted').all()
        following = UserConnection.query.filter_by(follower_id=user_id, status='accepted').all()
        return jsonify({
            'followers': [User.query.get(conn.follower_id).to_dict() for conn in followers],
            'following': [User.query.get(conn.following_id).to_dict() for conn in following]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 