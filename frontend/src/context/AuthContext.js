import React, { createContext, useState, useEffect } from 'react';
import userService from '../services/userService';
import authService from '../services/authService';
import settings from '../config/settings';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getCurrentUser()
      .then(res => {
        if (settings.isDev) {
          console.log('[Auth] /api/me response:', res);
        }
        if (res && res.success && res.data) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      })
      .catch(err => {
        if (settings.isDev) console.log('[Auth] /api/me error:', err);
        setUser(null);
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    if (settings.isDev) console.log('[Auth] login called with:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    let response;
    try {
      response = await authService.logout();
      if (settings.isDev) console.log('[Auth] logout response:', response);
    } catch (err) {
      if (settings.isDev) console.log('[Auth] logout error:', err);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}