import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - these would typically come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};