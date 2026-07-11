import { getEvent } from "vinxi/http";

export function getPlatformEnv(name: string): string | undefined {
  // 1. Check process.env (works locally in Node/Vite dev and via build-time injection)
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name];
  }

  // 2. Check native Cloudflare runtime environment bindings in the active event context
  try {
    const event = getEvent();
    const env = event?.nativeEvent?.context?.cloudflare?.env;
    if (env && env[name]) {
      return env[name];
    }
  } catch (error) {
    // Dynamic event context might not be initialized outside request scopes
  }

  return undefined;
}
