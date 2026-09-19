import dark from "@/assets/dark.webp";
import gift from "@/assets/gift.webp";
import homemade from "@/assets/homemade.webp";
import milk from "@/assets/milk.webp";
import nuts from "@/assets/nuts.webp";
import seasonal from "@/assets/seasonal.webp";

export type ProductCategory = "Chocolate" | "Spices" | "Tea" | "Coffee";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  featured: boolean;
  images: string[];
  ingredients: string[];
  weight: string;
  rating: number;
  reviews: number;
  popularity: number;
  createdAt: string;
  status: "available" | "low-stock" | "sold-out";
  variants: string[];
};

// Products are managed live in Supabase.
export const products: Product[] = [];

export const categories = [
  "All",
  "Chocolate",
  "Spices",
  "Tea",
  "Coffee",
] as const;

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const findProduct = (slug: string) => products.find((product) => product.slug === slug);

export const relatedProducts = (product: Product) =>
  products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .concat(products.filter((item) => item.id !== product.id && item.category !== product.category))
    .slice(0, 3);
