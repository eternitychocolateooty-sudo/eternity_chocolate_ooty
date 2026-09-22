/**
 * Safe storage wrapper for localStorage and sessionStorage.
 * On iOS Safari (especially in Private Browsing or WKWebView/Instagram/WhatsApp in-app browsers),
 * accessing or reading window.localStorage / window.sessionStorage can throw an unhandled
 * `SecurityError: The operation is insecure`.
 *
 * This wrapper intercepts all errors and falls back to an in-memory Map so the application
 * never crashes on iPhones or restricted browsers.
 */

const memorySessionStorage = new Map<string, string>();
const memoryLocalStorage = new Map<string, string>();

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return memorySessionStorage.get(key) ?? null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      memorySessionStorage.set(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      memorySessionStorage.delete(key);
    }
  },
};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryLocalStorage.get(key) ?? null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryLocalStorage.set(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryLocalStorage.delete(key);
    }
  },
};
