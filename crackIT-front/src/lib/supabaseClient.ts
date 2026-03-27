import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const fallbackUrl = 'https://jkbsxknojzxvnjabaniv.supabase.co';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnN4a25vanp4dm5qYWJhbml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTAwNzQsImV4cCI6MjA5MDEyNjA3NH0.JQyLGcenqvYgl7ScG88kIli86SVxUqJrGJixRLnnwLI';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using fallback Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.');
}

export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackAnonKey);
