import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// IMPORTANT:
// You must create a `.env.local` file in the root of your project
// and add your Supabase project's URL and Anon key there.
//
// .env.local
// SUPABASE_URL="YOUR_SUPABASE_URL"
// SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

// Get Supabase credentials from environment variables using Vite's syntax
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and anonymous key are required. Please create a .env.local file and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
