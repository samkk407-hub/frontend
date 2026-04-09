import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  status: string | null;
  login: (email: string, password: string) => Promise<string>;
  register: (data: { shopName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded: any = jwtDecode(storedToken);
        setStatus(decoded.status);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    const response = await fetch('http://localhost:5000/api/shop/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    const { token: newToken, status: newStatus } = data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setStatus(newStatus);

    return newStatus;
  };

  const register = async (data: { shopName: string; email: string; phone: string; password: string }) => {
    const response = await fetch('http://localhost:5000/api/shop/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    // After register, status is inactive, so no token yet
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setStatus(null);
  };

  return (
    <AuthContext.Provider value={{ token, status, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};