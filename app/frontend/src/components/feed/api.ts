const API_URL = import.meta.env.VITE_API_URL || 'https://prok-professional-networking-qkyq.onrender.com/api';

export const feedApi = {
  getFeed: async () => {
    const response = await fetch(`${API_URL}/feed`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getFeedByUser: async (userId: number) => {
    const response = await fetch(`${API_URL}/feed/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
}; 