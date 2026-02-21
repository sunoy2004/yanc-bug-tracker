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
    // First, try to dynamically import the package using the local node_module (if installed).
    // This uses an indirect import to avoid bundler static analysis, but in some environments
    // the browser can't resolve bare specifiers — handle that below.
    const pkg = ['@supabase', '/supabase-js'].join('');
    // @ts-ignore
    try {
      // Attempt indirect import of local package
      const mod = await (new Function('p', 'return import(p)'))(pkg);
      const { createClient } = mod as any;
      const client = createClient(supabaseUrl!, supabaseAnonKey!);
      window.__SUPABASE_CLIENT__ = client;
      console.info('Supabase: connected (local package)');
      return client;
    } catch (localErr) {
      console.warn('Supabase: local package import failed, trying CDN fallback...', localErr);
      // Try CDN ESM fallback (works in browsers)
      try {
        const cdn = 'https://esm.sh/@supabase/supabase-js';
        // @ts-ignore
        const mod = await import(cdn);
        const { createClient } = mod as any;
        const client = createClient(supabaseUrl!, supabaseAnonKey!);
        window.__SUPABASE_CLIENT__ = client;
        console.info('Supabase: connected (cdn esm.sh)');
        return client;
      } catch (cdnErr) {
        console.warn('Supabase: CDN import failed. Running in offline mode.', cdnErr);
        return null;
      }
    }
  } catch (err) {
    console.warn('Supabase: failed to initialize client (unexpected). Running in offline mode.', err);
    return null;
  }
}

