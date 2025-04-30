import React, { createContext, useContext, useState } from 'react';

// --- DELETE MOCK DATA BELOW ---
// const mockUsers = [
//   { id: '1', email: 'user@example.com', password: 'password', name: 'John Doe', role: 'user' },
//   { id: '2', email: 'admin@example.com', password: 'password', name: 'Admin User', role: 'admin' }
// ];
// --- END DELETE ---

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Update API URL to use port 5002
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('parkxigo-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('parkxigo-user', JSON.stringify(data.user));
      localStorage.setItem('parkxigo-token', data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parkxigo-user');
    localStorage.removeItem('parkxigo-token');
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Register failed');
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('parkxigo-user', JSON.stringify(data.user));
      localStorage.setItem('parkxigo-token', data.token);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}