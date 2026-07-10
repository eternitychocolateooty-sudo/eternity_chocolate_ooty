import { createClient } from "@supabase/supabase-js";

// Vite and SSR-compatible environment variable resolution
const supabaseUrl = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "";

const supabaseAnonKey = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "";

const supabaseServiceRoleKey = 
  (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY) || 
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Warning: Supabase credentials are missing. Please configure your .env file.");
}

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
    const serviceKey = (typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY) || "";
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
