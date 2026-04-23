
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface User {
  _id: string;
  id: string;
  email: string;
  mobileNo?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  interests?: string[];
  authProvider?: string;
}

export interface Session {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, mobileNo?: string) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (credential: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Normalize user object from backend to ensure `id` is always a string.
 * Backend may return `_id` (MongoDB ObjectId) — we normalize to `id`.
 */
const normalizeUser = (userData: any): User => {
  return {
    ...userData,
    _id: userData._id || userData.id,
    id: (userData.id || userData._id || '').toString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const handleSession = async () => {
      const token = localStorage.getItem('jwt_token');

      if (token) {
        try {
          const res = await api.get('/users/me');

          if (res?.data?.user) {
            const normalized = normalizeUser(res.data.user);
            setUser(normalized);
            setSession({ user: normalized, token });
          } else {
            localStorage.removeItem('jwt_token');
          }
        } catch (err) {
          console.warn('Session restore failed:', err);
          localStorage.removeItem('jwt_token');
        }
      }

      setLoading(false);
    };

    handleSession();
  }, []);

  // ✅ SIGN UP
  const signUp = async (email: string, password: string, fullName: string, mobileNo?: string) => {
    try {
      const res = await api.post('/auth/register', { email, password, fullName, mobileNo });

      console.log('Signup response:', res);

      if (res?.status === 'success' && res?.token && res?.data?.user) {
        localStorage.setItem('jwt_token', res.token);
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        setSession({ user: normalized, token: res.token });

        return { error: null, needsEmailConfirmation: false };
      }

      return {
        error: new Error(res?.message || 'Signup failed'),
        needsEmailConfirmation: false
      };

    } catch (err: any) {
      console.error('Signup error:', err?.message || err);

      return {
        error: new Error(err?.message || 'Network error'),
        needsEmailConfirmation: false
      };
    }
  };

  // ✅ SIGN IN
  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });

      console.log('Login response:', res);

      if (res?.status === 'success' && res?.token && res?.data?.user) {
        localStorage.setItem('jwt_token', res.token);
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        setSession({ user: normalized, token: res.token });

        return { error: null };
      }

      return {
        error: new Error(res?.message || 'Login failed')
      };

    } catch (err: any) {
      console.error('Login error:', err?.message || err);

      return {
        error: new Error(err?.message || 'Network error')
      };
    }
  };

  // ✅ GOOGLE SIGN IN
  const signInWithGoogle = async (credential: string) => {
    try {
      const res = await api.post('/auth/google', { credential });

      console.log('Google sign-in response:', res);

      if (res?.status === 'success' && res?.token && res?.data?.user) {
        localStorage.setItem('jwt_token', res.token);
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        setSession({ user: normalized, token: res.token });

        return { error: null };
      }

      return {
        error: new Error(res?.message || 'Google sign-in failed')
      };

    } catch (err: any) {
      console.error('Google sign-in error:', err?.message || err);

      return {
        error: new Error(err?.message || 'Network error')
      };
    }
  };

  // ✅ SIGN OUT
  const signOut = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('jwt_token');
      setUser(null);
      setSession(null);
    }
  };

  // ✅ RESET PASSWORD (placeholder)
  const resetPassword = async (email: string) => {
    console.log(`Reset password for ${email}`);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔐 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
