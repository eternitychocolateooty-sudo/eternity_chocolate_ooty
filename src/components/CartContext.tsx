import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  featured: boolean;
  images: string[];
  ingredients: string[];
  weight: string;
  rating: number;
  reviews: number;
  popularity: number;
  status: "available" | "low-stock" | "sold-out";
  variants: string[];
}

export type CartItem = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  count: number;
  products: Product[];
  isLoadingProducts: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const cartStorageKey = "cocoa-cloud-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: loadingAuth } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasSynced, setHasSynced] = useState(false);

  // Fetch live products from database using React Query
  const { data: dbProducts = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("popularity", { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        sale_price: p.sale_price !== null ? Number(p.sale_price) : undefined,
        price: Number(p.price),
        rating: Number(p.rating),
      })) as Product[];
    },
  });

  // Handle Cart loading and User-Session Sync
  useEffect(() => {
    if (loadingAuth) return;

    const loadAndSync = async () => {
      if (user) {
        try {
          // 1. Fetch DB items
          const { data: dbCart, error } = await supabase
            .from("cart_items")
            .select("product_id, quantity")
            .eq("user_id", user.id);

          if (error) throw error;

          const dbItems: CartItem[] = (dbCart || []).map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
          }));

          // 2. Fetch local storage guest items to merge
          const local = window.localStorage.getItem(cartStorageKey);
          const localItems: CartItem[] = local ? JSON.parse(local) : [];

          if (localItems.length > 0) {
            const mergedMap = new Map<string, number>();

            // Load DB items into map
            dbItems.forEach((item) => mergedMap.set(item.productId, item.quantity));

            // Merge local items
            localItems.forEach((localItem) => {
              const currentQty = mergedMap.get(localItem.productId) || 0;
              const prod = dbProducts.find((p) => p.id === localItem.productId);
              const maxStock = prod ? prod.stock_quantity : 99;
              mergedMap.set(localItem.productId, Math.min(currentQty + localItem.quantity, maxStock));
            });

            const mergedList: CartItem[] = Array.from(mergedMap.entries()).map(([productId, quantity]) => ({
              productId,
              quantity,
            }));

            // Upsert merged cart items to Supabase
            const upserts = mergedList.map((item) => ({
              user_id: user.id,
              product_id: item.productId,
              quantity: item.quantity,
            }));

            const { error: upsertErr } = await supabase
              .from("cart_items")
              .upsert(upserts, { onConflict: "user_id,product_id" });

            if (upsertErr) throw upsertErr;

            // Clear guest local cart
            window.localStorage.removeItem(cartStorageKey);
            setItems(mergedList);
          } else {
            setItems(dbItems);
          }
        } catch (err) {
          console.error("Cart sync failed:", err);
        } finally {
          setHasSynced(true);
        }
      } else {
        // Guest user: Load local cart items
        const stored = window.localStorage.getItem(cartStorageKey);
        if (stored) {
          setItems(JSON.parse(stored) as CartItem[]);
        } else {
          setItems([]);
        }
        setHasSynced(false);
      }
    };

    loadAndSync();
  }, [user, loadingAuth, dbProducts.length]);

  // Persist guest cart locally
  useEffect(() => {
    if (!user && hasSynced === false) {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
    }
  }, [items, user, hasSynced]);

  const addItem = async (product: Product, quantity = 1) => {
    if (product.status === "sold-out") return;

    const currentItem = items.find((item) => item.productId === product.id);
    const currentQty = currentItem ? currentItem.quantity : 0;
    const nextQty = Math.min(currentQty + quantity, product.stock_quantity);

    if (nextQty <= 0) return;

    const updatedItems = currentItem
      ? items.map((item) => (item.productId === product.id ? { ...item, quantity: nextQty } : item))
      : [...items, { productId: product.id, quantity: nextQty }];

    setItems(updatedItems);

    if (user) {
      try {
        await supabase.from("cart_items").upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: nextQty,
        }, { onConflict: "user_id,product_id" });
      } catch (err) {
        console.error("Failed to add cart item to database:", err);
      }
    }
  };

  const removeItem = async (productId: string) => {
    const updatedItems = items.filter((item) => item.productId !== productId);
    setItems(updatedItems);

    if (user) {
      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } catch (err) {
        console.error("Failed to remove cart item from database:", err);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    const prod = dbProducts.find((p) => p.id === productId);
    if (!prod) return;

    const nextQty = Math.max(1, Math.min(quantity, prod.stock_quantity));

    const updatedItems = items.map((item) =>
      item.productId === productId ? { ...item, quantity: nextQty } : item
    );
    setItems(updatedItems);

    if (user) {
      try {
        await supabase
          .from("cart_items")
          .update({ quantity: nextQty })
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } catch (err) {
        console.error("Failed to update cart quantity in database:", err);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    window.localStorage.removeItem(cartStorageKey);

    if (user) {
      try {
        await supabase.from("cart_items").delete().eq("user_id", user.id);
      } catch (err) {
        console.error("Failed to clear database cart items:", err);
      }
    }
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) return sum;
      const price = product.sale_price !== undefined ? product.sale_price : product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [items, dbProducts]);

  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 120;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        shipping,
        tax,
        total,
        count,
        products: dbProducts,
        isLoadingProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
