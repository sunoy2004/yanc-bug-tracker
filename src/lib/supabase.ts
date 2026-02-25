// Lazy supabase initializer to avoid build-time import errors when the package
// is not installed or env vars are missing. Use getSupabase() to obtain the
// client (or null if unavailable). Logs connection status to the console.

declare global {
  interface Window {
    __SUPABASE_CLIENT__?: any;
  }
}

// Build-time envs injected by Vite (preferred)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Runtime fallback: hosting platforms that can't provide Vite build-time vars
// can inject these onto window (see deployment notes below).
const runtimeSupabaseUrl = (typeof window !== 'undefined' && (window as any).__RUNTIME_SUPABASE_URL) as string | undefined;
const runtimeSupabaseAnonKey = (typeof window !== 'undefined' && (window as any).__RUNTIME_SUPABASE_ANON_KEY) as string | undefined;

const effectiveSupabaseUrl = supabaseUrl || runtimeSupabaseUrl;
const effectiveSupabaseAnonKey = supabaseAnonKey || runtimeSupabaseAnonKey;

export async function getSupabase() {
  if (window.__SUPABASE_CLIENT__) return window.__SUPABASE_CLIENT__;
  if (!effectiveSupabaseUrl || !effectiveSupabaseAnonKey) {
    console.info('Supabase: no VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY configured (checked build-time and runtime). Running in offline mode.');
    return null;
  }

  try {
    // Prefer a CDN ESM import when running in the browser to avoid "bare specifier"
    // errors on hosts that don't remap node-style imports. If CDN fails, fall back
    // to attempting a local package import (useful for dev/bundled environments).
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      try {
        const cdn = 'https://esm.sh/@supabase/supabase-js';
        // @ts-ignore
        const mod = await import(cdn);
        const { createClient } = mod as any;
        const client = createClient(effectiveSupabaseUrl!, effectiveSupabaseAnonKey!);
        window.__SUPABASE_CLIENT__ = client;
        console.info('Supabase: connected (cdn esm.sh)');
        return client;
      } catch (cdnErr) {
        console.warn('Supabase: CDN import failed, attempting local package...', cdnErr);
        // fallthrough to local attempt
      }
    }
    // Attempt indirect import of local package (works when bundler/node_modules are available)
    const pkg = ['@supabase', '/supabase-js'].join('');
    // @ts-ignore
    try {
      const mod = await (new Function('p', 'return import(p)'))(pkg);
      const { createClient } = mod as any;
      const client = createClient(effectiveSupabaseUrl!, effectiveSupabaseAnonKey!);
      window.__SUPABASE_CLIENT__ = client;
      console.info('Supabase: connected (local package)');
      return client;
    } catch (localErr) {
      console.warn('Supabase: local package import failed. Running in offline mode.', localErr);
      return null;
    }
  } catch (err) {
    console.warn('Supabase: failed to initialize client (unexpected). Running in offline mode.', err);
    return null;
  }
}

