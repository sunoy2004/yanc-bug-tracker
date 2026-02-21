// Lazy supabase initializer to avoid build-time import errors when the package
// is not installed or env vars are missing. Use getSupabase() to obtain the
// client (or null if unavailable). Logs connection status to the console.

declare global {
  interface Window {
    __SUPABASE_CLIENT__?: any;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export async function getSupabase() {
  if (window.__SUPABASE_CLIENT__) return window.__SUPABASE_CLIENT__;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.info('Supabase: no VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY configured. Running in offline mode.');
    return null;
  }

  try {
    // Dynamically import the Supabase package at runtime using an indirect import
    // to avoid Vite's static analysis / pre-bundling when the package isn't installed.
    const pkg = ['@supabase', '/supabase-js'].join('');
    // Use Function to perform import(p) at runtime without bundler detection.
    // @ts-ignore
    const mod = await (new Function('p', 'return import(p)'))(pkg);
    const { createClient } = mod as any;
    const client = createClient(supabaseUrl!, supabaseAnonKey!);
    window.__SUPABASE_CLIENT__ = client;
    console.info('Supabase: connected');
    return client;
  } catch (err) {
    console.warn('Supabase: failed to initialize client (package may be missing). Running in offline mode.', err);
    return null;
  }
}

