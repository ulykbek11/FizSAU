import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const fallbackUrl = 'https://example.supabase.co';
const fallbackAnonKey = 'public-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.');
}

export const supabase = createClient(supabaseUrl || fallbackUrl, supabaseAnonKey || fallbackAnonKey);
