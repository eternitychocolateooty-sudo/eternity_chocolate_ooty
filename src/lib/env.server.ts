export function getPlatformEnv(name: string): string | undefined {
  // 1. Try Cloudflare global env set by server.ts fetch (takes priority at runtime)
  if (typeof globalThis !== "undefined" && (globalThis as any).__CLOUDFLARE_ENV__) {
    const val = (globalThis as any).__CLOUDFLARE_ENV__[name];
    if (val) return val;
  }

  // 2. Try Node/Vite process.env fallback (works during build and local dev)
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name];
  }

  return undefined;
}
