'use client';
import { Provider } from 'react-redux';
import { store } from './store';
import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { fetchUser, setLoading } from './slices/authSlice';
import { fetchUnreadCount } from './slices/notificationSlice';
import { setLocation } from './slices/locationSlice';

function getJwtExp(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(window.atob(base64));
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const exp = getJwtExp(token);
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

function AuthInitializer({ children }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load location from localStorage after hydration
    const savedCity = localStorage.getItem('mx_city');
    const savedArea = localStorage.getItem('mx_area');
    if (savedCity || savedArea) {
      store.dispatch(setLocation({
        city: savedCity,
        area: savedArea,
      }));
    }

    const token = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');

    if (token && !isTokenExpired(token)) {
      store.dispatch(fetchUser()).then((action) => {
        if (action.type === 'auth/fetchUser/fulfilled') {
          const profile = action.payload;
          if (profile?.city) {
            store.dispatch(setLocation({
              city: profile.city,
              area: profile.area || '',
            }));
          }
          store.dispatch(fetchUnreadCount());
        }
      });
    } else if (token || refreshToken) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      store.dispatch(setLoading(false));
    } else {
      store.dispatch(setLoading(false));
    }
  }, []);

  return children;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </Provider>
  );
}
