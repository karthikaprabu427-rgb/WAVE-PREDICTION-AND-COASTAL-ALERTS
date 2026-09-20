import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<{ success: boolean; error?: string; user?: User; token?: string }>;
  register: (name: string, email: string, pass: string, confirmPass: string, org?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem('wave_auth_token');
    const savedUser = localStorage.getItem('wave_auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('wave_auth_token');
        localStorage.removeItem('wave_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string, role: UserRole = 'user'): Promise<{ success: boolean; error?: string; user?: User; token?: string }> => {
    try {
      const cleanEmail = email.trim();
      const endpoint = role === 'admin' ? '/api/auth/admin-login' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: res.ok ? undefined : `Server returned non-JSON response (${res.status})` };
        }
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed. Please check your credentials.' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('wave_auth_token', data.token);
      localStorage.setItem('wave_auth_user', JSON.stringify(data.user));
      return { success: true, user: data.user, token: data.token };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to reach authentication server. Please try again.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    confirmPass: string,
    org?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password: pass, confirmPassword: confirmPass, organization: org }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: res.ok ? undefined : `Server error (${res.status})` };
        }
      }

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('wave_auth_token', data.token);
      localStorage.setItem('wave_auth_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wave_auth_token');
    localStorage.removeItem('wave_auth_user');
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      localStorage.setItem('wave_auth_user', JSON.stringify(merged));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
