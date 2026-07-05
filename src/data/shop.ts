import dark from "@/assets/dark.jpg";
import gift from "@/assets/gift.jpg";
import homemade from "@/assets/homemade.jpg";
import milk from "@/assets/milk.jpg";
import nuts from "@/assets/nuts.jpg";
import seasonal from "@/assets/seasonal.jpg";

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

export const products: Product[] = [
  {
    id: "cc-dark-70",
    name: "Single-Origin 70%",
    slug: "single-origin-70",
    description:
      "Slow-roasted Idukki cocoa with a clean snap, deep fruit notes, and a long finish.",
    category: "Chocolate",
    price: 420,
    stockQuantity: 24,
    featured: true,
    images: [dark, nuts, gift],
    ingredients: ["Cocoa mass", "Cocoa butter", "Raw cane sugar", "Cocoa nibs"],
    weight: "100 g",
    rating: 4.9,
    reviews: 86,
    popularity: 98,
    createdAt: "2026-05-12",
    status: "available",
    variants: ["70% bar", "75% sea salt", "Nib bark"],
  },
  {
    id: "cc-milk-velvet",
    name: "Velvet Milk",
    slug: "velvet-milk",
    description: "Creamy Nilgiri milk chocolate with caramel warmth and a soft, silken melt.",
    category: "Chocolate",
    price: 360,
    salePrice: 320,
    stockQuantity: 18,
    featured: true,
    images: [milk, homemade, gift],
    ingredients: ["Cocoa butter", "Milk powder", "Cocoa mass", "Cane sugar"],
    weight: "100 g",
    rating: 4.8,
    reviews: 64,
    popularity: 91,
    createdAt: "2026-05-10",
    status: "available",
    variants: ["Classic", "Caramel", "Hot chocolate cube"],
  },
  {
    id: "cc-almond-honey",
    name: "Almond & Honey",
    slug: "almond-honey",
    description: "Roasted almonds folded through chocolate and finished with golden hill honey.",
    category: "Chocolate",
    price: 480,
    stockQuantity: 9,
    featured: true,
    images: [nuts, dark, seasonal],
    ingredients: ["Almonds", "Cocoa mass", "Honey", "Cocoa butter", "Cane sugar"],
    weight: "120 g",
    rating: 4.9,
    reviews: 73,
    popularity: 96,
    createdAt: "2026-05-08",
    status: "low-stock",
    variants: ["Almond slab", "Hazelnut praline", "Cashew brittle"],
  },
  {
    id: "cc-walnut-fudge",
    name: "Walnut Fudge",
    slug: "walnut-fudge",
    description: "Old-recipe homemade fudge, lightly salted and wrapped fresh every morning.",
    category: "Chocolate",
    price: 300,
    stockQuantity: 30,
    featured: false,
    images: [homemade, milk, nuts],
    ingredients: ["Milk", "Cocoa", "Walnuts", "Butter", "Cane sugar"],
    weight: "150 g",
    rating: 4.7,
    reviews: 41,
    popularity: 76,
    createdAt: "2026-04-28",
    status: "available",
    variants: ["Walnut", "Coconut bark", "Classic fudge"],
  },
  {
    id: "cc-petite-box",
    name: "Petite Gift Box",
    slug: "petite-gift-box",
    description: "Twelve hand-finished chocolates in a gold-tied gift box for Ooty travellers.",
    category: "Chocolate",
    price: 950,
    stockQuantity: 14,
    featured: true,
    images: [gift, dark, seasonal],
    ingredients: ["Assorted dark, milk, nut, and seasonal chocolates"],
    weight: "12 pieces",
    rating: 5,
    reviews: 58,
    popularity: 94,
    createdAt: "2026-05-15",
    status: "available",
    variants: ["12 pieces", "24 pieces", "Custom note"],
  },
  {
    id: "cc-winter-spice",
    name: "Winter Spice",
    slug: "winter-spice",
    description: "Cinnamon-orange dark chocolate made for misty evenings and festival gifting.",
    category: "Chocolate",
    price: 520,
    stockQuantity: 0,
    featured: false,
    images: [seasonal, gift, dark],
    ingredients: ["Cocoa mass", "Orange peel", "Cinnamon", "Cocoa butter"],
    weight: "100 g",
    rating: 4.8,
    reviews: 29,
    popularity: 82,
    createdAt: "2026-03-20",
    status: "sold-out",
    variants: ["Winter spice", "Monsoon coffee"],
  },
];

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
