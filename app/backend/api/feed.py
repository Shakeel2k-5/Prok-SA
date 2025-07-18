from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post, Like
from models.user import User
from models import db

feed_bp = Blueprint('feed', __name__)

@feed_bp.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get all posts with user info, ordered by creation date
        posts = Post.query.order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get user's liked posts for this page
        user_likes = Like.query.filter_by(user_id=user_id).all()
        liked_post_ids = {like.post_id for like in user_likes}
        
        # Prepare posts with like status
        posts_data = []
        for post in posts.items:
            post_dict = post.to_dict()
            post_dict['is_liked'] = post.id in liked_post_ids
            posts_data.append(post_dict)
        
        return jsonify({
            'posts': posts_data,
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/feed/my-posts', methods=['GET'])
@jwt_required()
def get_my_posts():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get user's posts
        posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get user's liked posts for this page
        user_likes = Like.query.filter_by(user_id=user_id).all()
        liked_post_ids = {like.post_id for like in user_likes}
        
        # Prepare posts with like status
        posts_data = []
        for post in posts.items:
            post_dict = post.to_dict()
            post_dict['is_liked'] = post.id in liked_post_ids
            posts_data.append(post_dict)
        
        return jsonify({
            'posts': posts_data,
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/feed/user/<int:user_id>/posts', methods=['GET'])
def get_user_posts(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Get user's posts
        posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts_data = [post.to_dict() for post in posts.items]
        
        return jsonify({
            'posts': posts_data,
            'user': user.to_dict(),
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@feed_bp.route('/feed/search', methods=['GET'])
def search_posts():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Search posts by content
        posts = Post.query.filter(Post.content.ilike(f'%{query}%')).order_by(Post.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        posts_data = [post.to_dict() for post in posts.items]
        
        return jsonify({
            'posts': posts_data,
            'query': query,
            'total': posts.total,
            'pages': posts.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 