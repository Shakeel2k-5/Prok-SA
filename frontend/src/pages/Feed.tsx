import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, MoreHorizontal, User, LogOut } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const BACKEND_URL = 'http://localhost:5000';

interface Post {
  id: number;
  content: string;
  image_url?: string;
  likes_count: number;
  created_at: string;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

const Feed: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts');
      console.log('Posts response:', response.data);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post('/posts', { content: newPost });
      
      setPosts([response.data.post, ...posts]);
      setNewPost('');
      toast.success('Post created successfully!');
    } catch (error: any) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Prok Feed</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-gray-600">Share what's on your mind</p>
            </div>
          </div>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening in your professional world?"
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || !newPost.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {post.first_name?.charAt(0)}{post.last_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.first_name} {post.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{post.username} • {formatDate(post.created_at)}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="mt-3 text-gray-900">{post.content}</p>
                  
                  {post.image_url && (
                    <img
                      src={`${BACKEND_URL}${post.image_url}`}
                      alt="Post"
                      className="mt-4 rounded-lg w-full max-h-96 object-cover"
                    />
                  )}
                  
                  <div className="flex items-center space-x-6 mt-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <span>Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed; 