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
  productDescription?: string;
  txnDate?: string;
  [key: string]: string | undefined;
}

/**
 * Official Zaakpay request parameters sequence from Checksum.php
 */
export const ZAAKPAY_REQUEST_CHECKSUM_SEQUENCE = [
  "amount",
  "bankid",
  "buyerAddress",
  "buyerCity",
  "buyerCountry",
  "buyerEmail",
  "buyerFirstName",
  "buyerLastName",
  "buyerPhoneNumber",
  "buyerPincode",
  "buyerState",
  "currency",
  "debitorcredit",
  "merchantIdentifier",
  "merchantIpAddress",
  "mode",
  "orderId",
  "product1Description",
  "product2Description",
  "product3Description",
  "product4Description",
  "productDescription",
  "productInfo",
  "purpose",
  "returnUrl",
  "shipToAddress",
  "shipToCity",
  "shipToCountry",
  "shipToFirstname",
  "shipToLastname",
  "shipToPhoneNumber",
  "shipToPincode",
  "shipToState",
  "showMobile",
  "txnDate",
  "txnType",
  "zpPayOption",
] as const;

/**
 * Official Zaakpay response parameters sequence from Checksum.php
 */
export const ZAAKPAY_RESPONSE_CHECKSUM_SEQUENCE = [
  "amount",
  "bank",
  "bankid",
  "cardId",
  "cardScheme",
  "cardToken",
  "cardhashid",
  "doRedirect",
  "orderId",
  "paymentMethod",
  "paymentMode",
  "responseCode",
  "responseDescription",
  "productDescription",
  "product1Description",
  "product2Description",
  "product3Description",
  "product4Description",
  "pgTransId",
  "pgTransTime",
] as const;

/**
 * Builds the exact parameters string according to Zaakpay Checksum::getAllParams()
 */
export function buildZaakpayRequestChecksumString(params: Record<string, string | undefined>): string {
  let all = "";
  for (const seqvalue of ZAAKPAY_REQUEST_CHECKSUM_SEQUENCE) {
    if (Object.prototype.hasOwnProperty.call(params, seqvalue)) {
      const val = params[seqvalue];
      if (val !== undefined && val !== null && String(val) !== "") {
        all += `${seqvalue}=${String(val)}&`;
      }
    }
  }
  return all;
}

/**
 * Builds the exact response checksum string according to Zaakpay Checksum::getAllResponseParams()
 */
export function buildZaakpayResponseChecksumString(params: Record<string, string | undefined>): string {
  let all = "";
  for (const seqvalue of ZAAKPAY_RESPONSE_CHECKSUM_SEQUENCE) {
    if (Object.prototype.hasOwnProperty.call(params, seqvalue)) {
      const val = params[seqvalue];
      if (val !== undefined && val !== null && String(val) !== "") {
        all += `${seqvalue}=${String(val)}&`;
      }
    }
  }
  return all;
}

/**
 * Calculates HMAC-SHA256 checksum for Zaakpay request parameters using the official sequence.
 */
export function calculateZaakpayChecksum(
  params: Record<string, string | undefined>,
  secretKey: string
): string {
  const cleanKey = (secretKey || "").trim();
  const all = buildZaakpayRequestChecksumString(params);
  return crypto.createHmac("sha256", cleanKey).update(all).digest("hex");
}

/**
 * Verifies Zaakpay return checksum from postback response parameters using the official sequence.
 */
export function verifyZaakpayChecksum(
  params: Record<string, string | undefined>,
  receivedChecksum: string,
  secretKey: string
): boolean {
  const cleanKey = (secretKey || "").trim();
  const all = buildZaakpayResponseChecksumString(params);
  const calculated = crypto.createHmac("sha256", cleanKey).update(all).digest("hex");
  return calculated.toLowerCase() === (receivedChecksum || "").trim().toLowerCase();
}

/**
 * Sanitizes input parameters according to Zaakpay specifications
 * (removes disallowed characters that may cause checksum mismatches).
 */
export function sanitizeZaakpayParam(val: string): string {
  if (!val) return "";
  return val.replace(/[,#(){}<>`!$%^=+|\':;"~[\]*&\\]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Returns Zaakpay API base URL depending on environment mode.
 */
export function getZaakpayBaseUrl(): string {
  const mode = (getPlatformEnv("VITE_ZAAKPAY_MODE") || getPlatformEnv("ZAAKPAY_MODE") || "PROD").toUpperCase();
  return mode === "TEST" || mode === "STAGING"
    ? "https://zaakstaging.zaakpay.com"
    : "https://api.zaakpay.com";
}

/**
 * Transact API endpoint URL for standard checkout form post (V8 from official integration kit).
 */
export function getZaakpayTransactUrl(): string {
  return `${getZaakpayBaseUrl()}/api/paymentTransact/V8`;
}
