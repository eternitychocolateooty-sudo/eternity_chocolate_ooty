import { queryOptions } from "@tanstack/react-query";
import type { Product } from "@/components/CartContext";
import { supabase } from "@/lib/supabase";

// How long a loaded product list counts as fresh before it is re-fetched in the background.
export const PRODUCTS_STALE_TIME = 1000 * 60;

export const productsQueryKey = ["products"] as const;

// The one source of the full product list, shared by the cart, route loaders and pages.
// Do not seed this query from localStorage or with a partial list: anything written to it
// counts as fresh, so loaders and pages would serve it instead of the live catalogue.
export const productsQueryOptions = queryOptions<Product[]>({
  queryKey: productsQueryKey,
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
  staleTime: PRODUCTS_STALE_TIME,
});
