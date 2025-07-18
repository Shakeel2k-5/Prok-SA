import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import Feed from '../components/feed/Feed';
import PostCreate from '../components/posts/PostCreate';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
      <Route path="/create-post" element={<PrivateRoute><PostCreate /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfileView /></PrivateRoute>} />
      <Route path="/profile/edit" element={<PrivateRoute><ProfileEdit /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/feed" />} />
    </Routes>
  );
};

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default AppRouter; 