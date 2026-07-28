import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import dark from "@/assets/dark.webp";
import gift from "@/assets/gift.webp";
import homemade from "@/assets/homemade.webp";
import milk from "@/assets/milk.webp";
import nuts from "@/assets/nuts.webp";
import seasonal from "@/assets/seasonal.webp";

const localImages: Record<string, string> = {
  "dark.webp": dark,
  "dark.jpg": dark,
  "gift.webp": gift,
  "gift.jpg": gift,
  "homemade.webp": homemade,
  "homemade.jpg": homemade,
  "milk.webp": milk,
  "milk.jpg": milk,
  "nuts.webp": nuts,
  "nuts.jpg": nuts,
  "seasonal.webp": seasonal,
  "seasonal.jpg": seasonal,
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveProductImage(imagePath: string): string {
  if (!imagePath) return localImages["dark.webp"] || "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
    return imagePath;
  }
  const filename = imagePath.split("/").pop() || "";
  return localImages[filename] || localImages[filename.replace(/\.jpg$/, ".webp")] || imagePath;
}

export function safeJsonStringify(val: any): string {
  return JSON.stringify(val)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
