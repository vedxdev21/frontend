'use client';
import { createContext, useContext, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { loginSuccess, logout as logoutAction, setUser, fetchUser } from '@/lib/redux/slices/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const login = useCallback((accessToken, refreshToken, userData) => {
    dispatch(loginSuccess({ accessToken, refreshToken, user: userData }));
  }, [dispatch]);

  const logoutFn = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const updateUser = useCallback((partial) => {
    dispatch(setUser(partial));
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    return dispatch(fetchUser());
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout: logoutFn, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
