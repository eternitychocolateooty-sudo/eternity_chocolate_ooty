import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://laogqehacxfntoldwhln.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxhb2dxZWhhY3hmbnRvbGR3aGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NDM2MDAsImV4cCI6MjA5ODExOTYwMH0.LpE_oYvEXKWlHUPXH1RrJxIMts_ZcWkxjg-fObrbmus";

// Vite and SSR-compatible environment variable resolution
const supabaseUrl = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  (globalThis as any).__CLOUDFLARE_ENV__?.VITE_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (globalThis as any).__CLOUDFLARE_ENV__?.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

// Public client for user-authenticated operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  },
});

// Admin client proxy to dynamically resolve service key at runtime
export const supabaseAdmin = new Proxy({}, {
  get(target, prop, receiver) {
    const serviceKey = 
      (globalThis as any).__CLOUDFLARE_ENV__?.SUPABASE_SERVICE_ROLE_KEY ||
      (typeof process !== "undefined" && process["env"]?.["SUPABASE_SERVICE_ROLE_KEY"]) || 
      "";
    const client = serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })
      : supabase;
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  }
}) as ReturnType<typeof createClient>;
