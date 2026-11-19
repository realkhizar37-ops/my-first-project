import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  requestPasswordReset: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function verifyAdminRole(currentUser: User | null) {
    if (!currentUser || !supabase) {
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    setIsAdmin(!error && data?.role === 'admin');
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await verifyAdminRole(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await verifyAdminRole(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profErr || profile?.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Access denied: this account does not have administrator privileges.');
    }
    setIsAdmin(true);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setIsAdmin(false);
  }

  async function requestPasswordReset(email: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) throw new Error(error.message);
  }

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signOut, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
