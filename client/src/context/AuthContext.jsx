import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  getLocalSession,
  setLocalSession,
  signInWithGoogle as apiSignInWithGoogle,
  signInWithEmail as apiSignInWithEmail,
  signUpWithEmail as apiSignUpWithEmail,
  signOut as apiSignOut,
  resetPasswordForEmail as apiResetPasswordForEmail
} from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth modal management
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin', 'signup', or 'forgot'
  const [pendingCallback, setPendingCallback] = useState(null);

  useEffect(() => {
    // 1. Initial check from Supabase or Local Storage
    const initAuth = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user) {
            setSession(currentSession);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: currentSession.user.user_metadata?.name || currentSession.user.email.split('@')[0],
              phone: currentSession.user.user_metadata?.phone || '',
              avatar_url: currentSession.user.user_metadata?.avatar_url || null,
              provider: currentSession.user.app_metadata?.provider || 'email'
            });
          } else {
            const local = getLocalSession();
            if (local?.user) {
              setSession(local);
              setUser(local.user);
            }
          }
        } else {
          const local = getLocalSession();
          if (local?.user) {
            setSession(local);
            setUser(local.user);
          }
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Supabase auth state listener
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (newSession?.user) {
            setSession(newSession);
            setUser({
              id: newSession.user.id,
              email: newSession.user.email,
              name: newSession.user.user_metadata?.name || newSession.user.email.split('@')[0],
              phone: newSession.user.user_metadata?.phone || '',
              avatar_url: newSession.user.user_metadata?.avatar_url || null,
              provider: newSession.user.app_metadata?.provider || 'email'
            });
          } else {
            setSession(null);
            setUser(null);
          }
        }
      );
      authListener = subscription;
    }

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const openAuthModal = (mode = 'signin', onSuccess = null) => {
    setAuthModalMode(mode);
    setPendingCallback(() => onSuccess);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = (authenticatedUser) => {
    closeAuthModal();
    if (pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      setTimeout(() => cb(authenticatedUser), 100);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await apiSignInWithGoogle();
      if (result?.user) {
        setUser(result.user);
        setSession(result.session);
        handleAuthSuccess(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const result = await apiSignInWithEmail(email, password);
      if (result?.user) {
        setUser(result.user);
        setSession(result.session);
        handleAuthSuccess(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email, password, meta = {}) => {
    setLoading(true);
    try {
      const result = await apiSignUpWithEmail(email, password, meta);
      if (result?.user) {
        setUser(result.user);
        setSession(result.session);
        handleAuthSuccess(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    setLoading(true);
    try {
      return await apiResetPasswordForEmail(email);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiSignOut();
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
