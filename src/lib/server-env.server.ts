import { getEvent } from "vinxi/http";

export function getCloudflareEnv() {
  try {
    const event = getEvent();
    return event?.context?.cloudflare?.env;
  } catch (e) {
    return null;
  }
}
