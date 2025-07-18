from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post, Comment, Like
from models.user import User
from models import db
from datetime import datetime

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    try:
        # Temporarily use user_id = 1 for testing
        user_id = 1
        data = request.get_json()
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        post = Post(
            user_id=user_id,
            content=data['content'],
            media_url=data.get('media_url')
        )
        db.session.add(post)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Post created successfully',
            'post': post.to_dict(),
            'id': post.id
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        posts = Post.query.filter_by(status='active').order_by(Post.created_at.desc()).paginate(
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

@posts_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        post = Post.query.get_or_404(post_id)
        return jsonify({'post': post.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        if post.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        data = request.get_json()
        if 'content' in data:
            post.content = data['content']
        if 'media_url' in data:
            post.media_url = data['media_url']
        post.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Post updated successfully', 'post': post.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        if post.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        db.session.delete(post)
        db.session.commit()
        return jsonify({'message': 'Post deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        data = request.get_json()
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        comment = Comment(
            post_id=post_id,
            user_id=user_id,
            content=data['content']
        )
        db.session.add(comment)
        db.session.commit()
        return jsonify({'message': 'Comment added successfully', 'comment': comment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@posts_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    try:
        user_id = get_jwt_identity()
        post = Post.query.get_or_404(post_id)
        existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
        if existing_like:
            db.session.delete(existing_like)
            message = 'Post unliked successfully'
        else:
            like = Like(user_id=user_id, post_id=post_id)
            db.session.add(like)
            message = 'Post liked successfully'
        db.session.commit()
        return jsonify({'message': message, 'liked': existing_like is None}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 