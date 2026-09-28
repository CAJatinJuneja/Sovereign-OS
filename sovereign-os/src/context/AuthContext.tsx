import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';
import { setCurrentUserId } from '../lib/session';
import { hydrateCloudStorage, resetCloudStorage } from '../lib/cloudStorage';

type AuthStatus = 'loading' | 'signed-out' | 'hydrating' | 'ready';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(supabaseConfigured ? 'loading' : 'signed-out');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;

    const applySession = async (next: Session | null) => {
      if (next?.user) {
        setCurrentUserId(next.user.id);
        setSession(next);
        setStatus('hydrating');
        try {
          await hydrateCloudStorage(next.user.id);
          setStatus('ready');
        } catch (e) {
          console.error('Failed to load your data:', e);
          setStatus('ready');
        }
      } else {
        setCurrentUserId(null);
        resetCloudStorage();
        setSession(null);
        setStatus('signed-out');
      }
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => { applySession(next); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ status, session, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
