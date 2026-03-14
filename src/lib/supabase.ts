// Lazy supabase initializer to avoid build-time import errors when the package
// is not installed or env vars are missing. Use getSupabase() to obtain the
// client (or null if unavailable). Single init promise + retries to reduce
// intermittent connection failures.

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

const INIT_RETRIES = 3;
const INIT_RETRY_DELAY_MS = 600;

/** Single init promise so concurrent getSupabase() calls don't race or re-run init. */
let initPromise: Promise<any> | null = null;

function doInit(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).__SUPABASE_CLIENT__) return Promise.resolve((window as any).__SUPABASE_CLIENT__);
  if (!effectiveSupabaseUrl || !effectiveSupabaseAnonKey) {
    console.info('Supabase: no VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY configured. Running in offline mode.');
    return Promise.resolve(null);
  }

  async function tryCreateClient(): Promise<any> {
    // 1) Prefer local package (bundled app / dev) — most reliable when installed
    const pkg = ['@supabase', '/supabase-js'].join('');
    try {
      const mod = await (new Function('p', 'return import(p)'))(pkg);
      const { createClient } = mod as any;
      return createClient(effectiveSupabaseUrl!, effectiveSupabaseAnonKey!);
    } catch {
      // 2) Fallback: CDN ESM for environments that can't resolve bare specifier
      const cdn = 'https://esm.sh/@supabase/supabase-js';
      const mod = await import(/* @vite-ignore */ cdn);
      const { createClient } = mod as any;
      return createClient(effectiveSupabaseUrl!, effectiveSupabaseAnonKey!);
    }
  }

  async function initWithRetry(attempt: number): Promise<any> {
    try {
      const client = await tryCreateClient();
      (window as any).__SUPABASE_CLIENT__ = client;
      console.info('Supabase: connected');
      return client;
    } catch (err) {
      if (attempt < INIT_RETRIES) {
        console.warn(`Supabase: init attempt ${attempt + 1}/${INIT_RETRIES} failed, retrying in ${INIT_RETRY_DELAY_MS}ms...`, err);
        await new Promise((r) => setTimeout(r, INIT_RETRY_DELAY_MS));
        return initWithRetry(attempt + 1);
      }
      console.warn('Supabase: failed to initialize after retries. Running in offline mode.', err);
      initPromise = null; // allow next getSupabase() to try again
      return null;
    }
  }

  return initWithRetry(0);
}

export async function getSupabase() {
  if (typeof window === 'undefined') return null;
  if ((window as any).__SUPABASE_CLIENT__) return (window as any).__SUPABASE_CLIENT__;
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

