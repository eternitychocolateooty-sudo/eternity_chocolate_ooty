export function getPlatformEnv(name: string): string | undefined {
  const isCloudflareEnvDefined = typeof globalThis !== "undefined" && !!(globalThis as any).__CLOUDFLARE_ENV__;
  const cfVal = isCloudflareEnvDefined ? (globalThis as any).__CLOUDFLARE_ENV__[name] : undefined;
  
  const processVal = typeof process !== "undefined" && process.env ? process.env[name] : undefined;

  if (cfVal) return cfVal;
  if (processVal) return processVal;
  return undefined;
}

