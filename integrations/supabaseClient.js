import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.EXPO_PUBLIC_SUPABASE_KEY;

function notConfiguredError() {
  return new Error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure env vars in your hosting provider.');
}

// Minimal shim to avoid crashing the app in production when env vars are missing
const supabaseShim = {
  auth: {
    async getUser() {
      return { data: { user: null }, error: notConfiguredError() };
    },
    async getSession() {
      return { data: { session: null }, error: notConfiguredError() };
    },
    onAuthStateChange(_cb) {
      return { data: { subscription: { unsubscribe() {} } }, error: null };
    },
    async signInWithPassword() {
      return { data: { user: null, session: null }, error: notConfiguredError() };
    },
    async signUp() {
      return { data: { user: null, session: null }, error: notConfiguredError() };
    },
    async signOut() {
      return { error: notConfiguredError() };
    },
  },
  from() {
    const err = notConfiguredError();
    const chain = {
      select: async () => { throw err; },
      insert: async () => { throw err; },
      update: async () => { throw err; },
      delete: async () => { throw err; },
      order: () => chain,
      eq: () => chain,
      limit: () => chain,
      single: () => chain,
    };
    return chain;
  },
  storage: {
    from() {
      const err = notConfiguredError();
      return {
        upload: async () => { throw err; },
        remove: async () => { throw err; },
        list: async () => { throw err; },
        getPublicUrl: () => ({ data: { publicUrl: '' }, error: err }),
      };
    },
  },
};

let client;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using no-op client to keep the app running.');
  client = supabaseShim;
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
export default client;
