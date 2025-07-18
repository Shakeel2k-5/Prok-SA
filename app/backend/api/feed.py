from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post, Comment, Like
from models import db
from models.user import User
from models.profile import UserConnection
from datetime import datetime

feed_bp = Blueprint('feed', __name__)

@feed_bp.route('/feed', methods=['GET'])
def get_feed():
    try:
        # Temporarily use user_id = 1 for testing
        user_id = 1
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get all posts for now
        feed_posts = Post.query.filter_by(status='active').order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in feed_posts.items],
            'total': feed_posts.total,
            'pages': feed_posts.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/users', methods=['GET'])
def get_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        query = User.query
        if search:
            query = query.filter(
                (User.username.contains(search)) | (User.bio.contains(search))
            )
        users = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        user = User.query.get_or_404(user_id)
        posts = Post.query.filter_by(user_id=user_id, status='active').order_by(
            Post.created_at.desc()
        ).limit(10)
        return jsonify({
            'user': user.to_dict(),
            'posts': [post.to_dict() for post in posts]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/users/<int:user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    try:
        follower_id = get_jwt_identity()
        if follower_id == user_id:
            return jsonify({'error': 'Cannot follow yourself'}), 400
        existing_connection = UserConnection.query.filter_by(
            follower_id=follower_id, following_id=user_id
        ).first()
        if existing_connection:
            db.session.delete(existing_connection)
            message = 'User unfollowed successfully'
        else:
            connection = UserConnection(
                follower_id=follower_id,
                following_id=user_id,
                status='accepted'  # Auto-accept for simplicity
            )
            db.session.add(connection)
            message = 'User followed successfully'
        db.session.commit()
        return jsonify({
            'message': message,
            'following': existing_connection is None
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/connections', methods=['GET'])
@jwt_required()
def get_connections():
    try:
        user_id = get_jwt_identity()
        followers = UserConnection.query.filter_by(following_id=user_id, status='accepted').all()
        following = UserConnection.query.filter_by(follower_id=user_id, status='accepted').all()
        return jsonify({
            'followers': [User.query.get(conn.follower_id).to_dict() for conn in followers],
            'following': [User.query.get(conn.following_id).to_dict() for conn in following]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 