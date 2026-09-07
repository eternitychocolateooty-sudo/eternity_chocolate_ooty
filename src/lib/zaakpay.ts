import crypto from "crypto";
import { getPlatformEnv } from "./env.server";

export interface ZaakpayTransactParams {
  merchantIdentifier: string;
  orderId: string;
  amount: string; // Amount in Paisa (e.g., "10000" for Rs 100.00)
  currency: string; // "INR"
  returnUrl: string;
  buyerEmail?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  buyerPhoneNumber?: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerState?: string;
  buyerPincode?: string;
  buyerCountry?: string;
  [key: string]: string | undefined;
}

/**
 * Calculates HMAC-SHA256 checksum for Zaakpay parameters.
 * Sorts keys alphabetically, concatenates key=val&, and signs using secretKey.
 */
export function calculateZaakpayChecksum(
  params: Record<string, string | undefined>,
  secretKey: string
): string {
  const sortedKeys = Object.keys(params)
    .filter((k) => k !== "checksum" && params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();

  const checksumString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + "&";

  return crypto
    .createHmac("sha256", secretKey)
    .update(checksumString)
    .digest("hex");
}

/**
 * Verifies Zaakpay return checksum from postback parameters.
 */
export function verifyZaakpayChecksum(
  params: Record<string, string | undefined>,
  receivedChecksum: string,
  secretKey: string
): boolean {
  const calculated = calculateZaakpayChecksum(params, secretKey);
  return calculated.toLowerCase() === receivedChecksum.toLowerCase();
}

/**
 * Returns Zaakpay API base URL depending on environment mode.
 */
export function getZaakpayBaseUrl(): string {
  const mode = (getPlatformEnv("VITE_ZAAKPAY_MODE") || getPlatformEnv("ZAAKPAY_MODE") || "TEST").toUpperCase();
  return mode === "PROD" || mode === "PRODUCTION" || mode === "LIVE"
    ? "https://api.zaakpay.com"
    : "https://zaakstaging.zaakpay.com";
}

/**
 * Transact API endpoint URL for standard checkout form post.
 */
export function getZaakpayTransactUrl(): string {
  return `${getZaakpayBaseUrl()}/api/paymentTransact/V13`;
}
