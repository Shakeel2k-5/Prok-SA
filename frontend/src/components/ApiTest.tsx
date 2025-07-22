import React, { useState } from 'react';
import { api } from '../services/api';

const ApiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setTestResult('Testing...');
    
    try {
      console.log('=== API TEST ===');
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      
      // Test health endpoint
      const healthResponse = await api.get('/health');
      console.log('Health response:', healthResponse.data);
      
      // Test posts endpoint
      const postsResponse = await api.get('/posts');
      console.log('Posts response:', postsResponse.data);
      
      setTestResult(`✅ API Connection Successful!\nHealth: ${JSON.stringify(healthResponse.data)}\nPosts: ${postsResponse.data.posts.length} posts found`);
    } catch (error: any) {
      console.error('API Test Error:', error);
      setTestResult(`❌ API Connection Failed!\nError: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setTestResult('Testing auth...');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Current token:', token);
      
      if (!token) {
        setTestResult('❌ No token found in localStorage');
        return;
      }
      
      const response = await api.get('/auth/profile');
      console.log('Auth response:', response.data);
      
      setTestResult(`✅ Authentication Successful!\nUser: ${JSON.stringify(response.data.user)}`);
    } catch (error: any) {
      console.error('Auth Test Error:', error);
      setTestResult(`❌ Authentication Failed!\nError: ${error.message}\nStatus: ${error.response?.status}\nData: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testApiConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test API Connection
        </button>
        
        <button
          onClick={testAuth}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          Test Authentication
        </button>
      </div>
      
      <div className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap">
        {testResult || 'Click a button to test...'}
      </div>
    </div>
  );
};

export default ApiTest; 