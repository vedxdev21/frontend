'use client';

import { createContext, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GoogleAuthContext = createContext({ clientId: '' });

export const useGoogleClientId = () => useContext(GoogleAuthContext).clientId;

export default function GoogleAuthProvider({ children, clientId }) {
  if (!clientId) {
    return (
      <GoogleAuthContext.Provider value={{ clientId: '' }}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }

  return (
    <GoogleAuthContext.Provider value={{ clientId }}>
      <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
}
