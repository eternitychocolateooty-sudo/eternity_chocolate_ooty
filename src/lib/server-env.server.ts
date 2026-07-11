export function getCloudflareEnv() {
  try {
    const event = (globalThis as any).__unctx__?.h3?.use();
    if (!event) return { _error: "No H3 event found in context" };
    
    return {
      _contextKeys: event.context ? Object.keys(event.context) : [],
      _cloudflareKeys: event.context?.cloudflare ? Object.keys(event.context.cloudflare) : null,
      _cloudflareEnvKeys: event.context?.cloudflare?.env ? Object.keys(event.context.cloudflare.env) : null,
      _hasEnv: !!event.context?.cloudflare?.env,
      // If we find the env object directly, return it, otherwise return this diagnostic metadata
      ...(event.context?.cloudflare?.env || {})
    };
  } catch (e: any) {
    return { _error: e.message || "Exception inside getCloudflareEnv" };
  }
}
