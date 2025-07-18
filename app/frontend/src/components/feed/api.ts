const API_URL = import.meta.env.VITE_API_URL || 'https://prok-professional-networking-qkyq.onrender.com/api';

export const feedApi = {
  getFeed: async (page: number = 1, perPage: number = 10) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/feed?page=${page}&per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get feed');
    }
    
    return response.json();
  },

  getMyPosts: async (page: number = 1, perPage: number = 10) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/feed/my-posts?page=${page}&per_page=${perPage}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get my posts');
    }
    
    return response.json();
  },

  getUserPosts: async (userId: number, page: number = 1, perPage: number = 10) => {
    const response = await fetch(`${API_URL}/feed/user/${userId}/posts?page=${page}&per_page=${perPage}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user posts');
    }
    
    return response.json();
  },

  searchPosts: async (query: string, page: number = 1, perPage: number = 10) => {
    const response = await fetch(`${API_URL}/feed/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search posts');
    }
    
    return response.json();
  },
}; 