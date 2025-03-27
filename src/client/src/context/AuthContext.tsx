"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gql, useMutation } from '@apollo/client';
import { User, AuthData, LoginData, SignupData } from '@/types';

// GraphQL mutations
const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

const SIGNUP_USER = gql`
  mutation AddUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoggedIn: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  loading: false,
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation<LoginData>(LOGIN_USER, {
    onCompleted: (data) => {
      handleAuthSuccess(data.login);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Signup mutation
  const [signupMutation, { loading: signupLoading }] = useMutation<SignupData>(SIGNUP_USER, {
    onCompleted: (data) => {
      handleAuthSuccess(data.addUser);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Check for token on initial load
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading auth data from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = (authData: AuthData) => {
    setUser(authData.user);
    setToken(authData.token);
    setError(null);
    
    // Save to localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
  };

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      await loginMutation({
        variables: { email, password },
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Signup function
  const signup = async (username: string, email: string, password: string) => {
    setError(null);
    try {
      await signupMutation({
        variables: { username, email, password },
      });
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Context value
  const value = {
    user,
    token,
    isLoggedIn: !!token,
    login,
    signup,
    logout,
    loading: loading || loginLoading || signupLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};