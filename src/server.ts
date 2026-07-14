import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  return brandedErrorResponse();
}

function setupRuntimeEnv(env: unknown) {
  if (env && typeof env === "object") {
    (globalThis as any).__CLOUDFLARE_ENV__ = env;
  }
}

// In-memory rate limiting map (IP-tracked)
const ipLimits = new Map<string, { count: number; lastReset: number }>();
const LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_IP = 60; // 60 requests per minute limit
let lastCleanup = Date.now();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup of the rate limiting map
  if (now - lastCleanup > 5 * 60 * 1000) {
    for (const [key, limit] of ipLimits.entries()) {
      if (now - limit.lastReset > LIMIT_WINDOW_MS) {
        ipLimits.delete(key);
      }
    }
    lastCleanup = now;
  }

  const limit = ipLimits.get(ip);
  if (!limit) {
    ipLimits.set(ip, { count: 1, lastReset: now });
    return false;
  }
  if (now - limit.lastReset > LIMIT_WINDOW_MS) {
    limit.count = 1;
    limit.lastReset = now;
    return false;
  }
  limit.count++;
  return limit.count > MAX_REQUESTS_PER_IP;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    setupRuntimeEnv(env);

    const url = new URL(request.url);

    // 1. Rate Limiting for API routes and POST requests
    const isApiOrPost = request.method !== "GET" && request.method !== "HEAD" || url.pathname.includes("/_server-fn");
    if (isApiOrPost) {
      const ip = request.headers.get("CF-Connecting-IP") ||
                 request.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
                 "unknown";
      if (isRateLimited(ip)) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": "60"
            }
          }
        );
      }
    }

    // 2. CSRF Protection for state-changing requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      const origin = request.headers.get("Origin");
      const referer = request.headers.get("Referer");
      const host = request.headers.get("Host") || url.host;

      if (origin) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host !== host) {
            return new Response("CSRF Validation Failed: Origin mismatch", { status: 403 });
          }
        } catch {
          return new Response("CSRF Validation Failed: Invalid origin", { status: 403 });
        }
      } else if (referer) {
        try {
          const refererUrl = new URL(referer);
          if (refererUrl.host !== host) {
            return new Response("CSRF Validation Failed: Referer mismatch", { status: 403 });
          }
        } catch {
          return new Response("CSRF Validation Failed: Invalid referer", { status: 403 });
        }
      }
    }

    try {
      const handler = await getServerEntry();
      let response = await handler.fetch(request, env, ctx);
      response = await normalizeCatastrophicSsrResponse(response);

      const contentType = response.headers.get("content-type") || "";
      const isHtml = contentType.includes("text/html");

      const newHeaders = new Headers(response.headers);

      // Disable XSS Protection header (modern standard prefers CSP)
      newHeaders.set("X-XSS-Protection", "0");
      // Prevent sniffing MIME types
      newHeaders.set("X-Content-Type-Options", "nosniff");
      // HSTS
      newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
      // Referrer policy
      newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
      // Clickjacking protection
      newHeaders.set("X-Frame-Options", "DENY");
      // Permissions-Policy
      newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), gyroscope=(), accelerometer=(), fullscreen=(self)");
      // Cross-origin headers
      newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
      newHeaders.set("Cross-Origin-Resource-Policy", "same-origin");
      newHeaders.set("X-DNS-Prefetch-Control", "on");
      newHeaders.set("Origin-Agent-Cluster", "?1");
      // Remove server information leak
      newHeaders.delete("X-Powered-By");
      newHeaders.delete("Server");

      // For sensitive routes, prevent search engine indexing without leaking via robots.txt
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/account")) {
        newHeaders.set("X-Robots-Tag", "noindex, nofollow");
      }


      const status = response.status;
      const isRedirect = status >= 300 && status < 400;
      const hasNoBody = status === 204 || status === 304;

      if (isHtml && !isRedirect && !hasNoBody) {
        // Generate secure cryptographically strong nonce
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        const nonce = btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, "");

        const originalBody = await response.text();
        const modifiedBody = originalBody.replace(/<script\b/g, `<script nonce="${nonce}"`);

        const csp = [
          "default-src 'self'",
          `script-src 'self' 'nonce-${nonce}' https://sdk.cashfree.com https://*.cashfree.com`,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https://laogqehacxfntoldwhln.supabase.co https://*.supabase.co",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://laogqehacxfntoldwhln.supabase.co https://*.supabase.co https://api.cashfree.com https://sandbox.cashfree.com https://*.cashfree.com",
          "frame-src 'self' https://maps.google.com https://*.google.com https://sdk.cashfree.com https://*.cashfree.com",
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests"
        ].join("; ");

        newHeaders.set("Content-Security-Policy", csp);

        return new Response(modifiedBody, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } else {
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    } catch (error) {
      return brandedErrorResponse();
    }
  },
};
