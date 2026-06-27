import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import dark from "@/assets/dark.jpg";
import gift from "@/assets/gift.jpg";
import homemade from "@/assets/homemade.jpg";
import milk from "@/assets/milk.jpg";
import nuts from "@/assets/nuts.jpg";
import seasonal from "@/assets/seasonal.jpg";

const localImages: Record<string, string> = {
  "dark.jpg": dark,
  "gift.jpg": gift,
  "homemade.jpg": homemade,
  "milk.jpg": milk,
  "nuts.jpg": nuts,
  "seasonal.jpg": seasonal,
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveProductImage(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("data:")) {
    return imagePath;
  }
  const filename = imagePath.split("/").pop() || "";
  return localImages[filename] || imagePath;
}
