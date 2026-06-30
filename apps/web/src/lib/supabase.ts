import { createClient } from '@supabase/supabase-js';
// import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cliente público estándar (Datos y Sesión actual)
export const supabase = createClient<any>(
  supabaseUrl || 'dummy-url',
  supabaseAnonKey || 'dummy-key'
);

// Cliente administrador (Usado EXCLUSIVAMENTE para crear usuarios en el frontend sin perder la sesión)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
export const adminAuthClient = createClient<any>(
  supabaseUrl || 'dummy-url',
  supabaseServiceKey || 'dummy-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
