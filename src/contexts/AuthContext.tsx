
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Define the shape of our authentication context
interface AuthContextType {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = 'https://api.example.com'; // Replace with your actual API URL

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // In a real app, use AsyncStorage for React Native
        const storedToken = localStorage.getItem('auth_token');
        const storedUserId = localStorage.getItem('user_id');
        
        if (storedToken) {
          // Set axios default headers for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          setToken(storedToken);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to load auth from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      const { token, userId } = response.data;
      
      // Save to storage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', userId);
      
      // Set for current session
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setToken(token);
      setUserId(userId);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUserId(null);
  };

  const value = {
    token,
    userId,
    isAuthenticated: !!token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
