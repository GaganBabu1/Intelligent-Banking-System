/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;
  
  const { accessToken: _accessToken, refreshToken: _refreshToken, userId, id, ...rest } = userData;
  return {
    ...rest,
    id: id ?? userId,
  };
};


const getInitialAuth = () => {
  const storedUser = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');

  if (storedUser && accessToken) {
    try {
      const parsed = JSON.parse(storedUser);
      const normalized = normalizeUser(parsed);
      if (normalized.id !== parsed.id) {
        localStorage.setItem('user', JSON.stringify(normalized));
      }
      return { user: normalized, isAuthenticated: true };
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
  return { user: null, isAuthenticated: false };
};

export const AuthProvider = ({ children }) => {
  
  const [initialAuth] = useState(getInitialAuth);
  const [user, setUser] = useState(initialAuth.user);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuthenticated);
  const [loading] = useState(false);

  const persistSession = (responseData) => {
    const { accessToken, refreshToken, ...userData } = responseData;
    const normalized = normalizeUser(userData);

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(normalized));

    setUser(normalized);
    setIsAuthenticated(true);

    return responseData;
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      return persistSession(response.data);
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      return persistSession(response.data);
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};