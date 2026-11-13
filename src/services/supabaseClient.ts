/**
 * RouteLess Supabase Client Configuration
 * 
 * Configures the Supabase client using Vite environment variables:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY / VITE_SUPABASE_PUBLISHABLE_KEY
 * 
 * Never exposes service_role key, database passwords, or master secrets in frontend code.
 * If credentials are not present, exposes a safe null client and configuration status flag.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both standard naming conventions and sanitize trailing /rest/v1 or slashes
const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim() !== '' &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseAnonKey.includes('your-anon')
);

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.warn('[RouteLess] Supabase initialization failed:', error);
    clientInstance = null;
  }
}

export const supabase = clientInstance;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    throw new Error('Supabase client is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.');
  }
  return clientInstance;
}
