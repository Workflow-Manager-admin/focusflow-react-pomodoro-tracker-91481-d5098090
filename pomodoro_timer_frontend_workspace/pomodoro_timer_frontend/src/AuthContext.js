import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import supabase from "./supabaseClient";

// PUBLIC_INTERFACE
/**
 * AuthContext provides user authentication state and actions.
 * Usage:
 *   const { user, signOut, signIn, signUp, loading, error } = useAuth();
 */
const AuthContext = createContext();

/**
 * AuthProvider wraps your app and provides auth state.
 * Use in index.js: <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user at mount and listen for auth changes
  useEffect(() => {
    let ignore = false;
    async function getUser() {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!ignore) {
        setUser(session?.user || null);
        setLoading(false);
      }
      if (sessionError && !ignore) setError(sessionError);
    }
    getUser();

    // Subscribe to auth changes (sign-in/out from anywhere)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setError(null);
    });

    return () => {
      ignore = true;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Sign in with email + password
   * @param {string} email 
   * @param {string} password 
   */
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error);
    setUser(data?.user || null);
    setLoading(false);
    return { user: data?.user, error };
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Register (sign up) with email + password
   * @param {string} email 
   * @param {string} password 
   */
  const signUp = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error);
    setUser(data?.user || null);
    setLoading(false);
    return { user: data?.user, error };
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Sign out the user
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error);
    setUser(null);
    setLoading(false);
    return !error;
  }, []);

  const value = { user, signIn, signOut, signUp, loading, error };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth returns { user, signIn, signUp, signOut, loading, error }
 */
export function useAuth() {
  return useContext(AuthContext);
}
