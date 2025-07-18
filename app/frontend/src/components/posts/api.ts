const API_URL = import.meta.env.VITE_API_URL || 'https://prok-professional-networking-qkyq.onrender.com/api';

export const postsApi = {
  createPost: async (postData: any) => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  },

  getPosts: async () => {
    const response = await fetch(`${API_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
};