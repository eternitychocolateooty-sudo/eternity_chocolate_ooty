export function getCloudflareEnv() {
  try {
    const event = (globalThis as any).__unctx__?.h3?.use();
    return event?.context?.cloudflare?.env;
  } catch (e) {
    return null;
  }
}
