import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartContext";
import { categories, formatMoney } from "@/data/shop";
import { resolveProductImage } from "@/lib/utils";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Shop Collection - ETERNITY Ooty" },
      {
        name: "description",
        content:
          "Shop premium handmade chocolates, spices, tea, and coffee from ETERNITY, Ooty.",
      },
      { property: "og:title", content: "Shop ETERNITY Collection" },
      {
        property: "og:description",
        content: "Premium artisan chocolates, aromatic spices, tea, and coffee from the hills of Ooty.",
      },
    ],
  }),
  component: Collections,
});

type SortKey = "newest" | "price-low" | "price-high" | "popular";

function getProductPrice(product: any) {
  return product.sale_price !== undefined ? product.sale_price : product.price;
}

function Collections() {
  const cart = useCart();
  const products = cart.products;
  const isLoading = cart.isLoadingProducts;
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState(6000);
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    return products
      .filter((product) => active === "All" || product.category === active)
      .filter((product) => getProductPrice(product) <= price)
      .filter((product) => {
        const target = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        return target.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        if (sort === "price-low") return getProductPrice(a) - getProductPrice(b);
        if (sort === "price-high") return getProductPrice(b) - getProductPrice(a);
        if (sort === "newest") return Date.parse(b.created_at || b.createdAt) - Date.parse(a.created_at || a.createdAt);
        return b.popularity - a.popularity;
      });
  }, [products, active, price, query, sort]);

  return (
    <div className="pb-24">
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">Online Shop</p>
          <h1 className="font-display text-5xl md:text-7xl text-balance">
            Choose your chocolate, wrapped in Ooty mist.
          </h1>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <div className="mb-8 grid gap-4 rounded-3xl bg-card p-4 shadow-soft lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chocolates, gift boxes, ingredients"
              className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-background px-4 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            <span>Under {formatMoney(price)}</span>
            <input
              type="range"
              min={300}
              max={6000}
              step={100}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
            />
          </label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
          </select>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={`rounded-full px-5 py-2 text-sm transition-all ${
                active === category
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "border border-border text-muted-foreground hover:border-accent hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col bg-card rounded-3xl h-[420px] overflow-hidden shadow-soft">
                <div className="bg-secondary aspect-[4/5] w-full" />
                <div className="p-6 flex-1 flex flex-col gap-3">
                  <div className="h-6 bg-secondary rounded w-2/3" />
                  <div className="h-4 bg-secondary rounded w-full" />
                  <div className="mt-auto flex items-center justify-between">
                    <div className="h-6 bg-secondary rounded w-1/4" />
                    <div className="h-10 w-20 bg-secondary rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            filtered.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-3xl bg-card shadow-soft hover-lift"
              >
                <Link to="/products/$slug" params={{ slug: product.slug }} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={resolveProductImage(product.images[0])}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    />
                    <span className="absolute left-4 top-4 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                      {product.category}
                    </span>
                    <button
                      aria-label={`Save ${product.name} to wishlist`}
                      className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
                <div className="p-6">
                  <Link to="/products/$slug" params={{ slug: product.slug }}>
                    <h3 className="font-display text-2xl">{product.name}</h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="divider-gold my-5" />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-2xl">{formatMoney(getProductPrice(product))}</span>
                        {product.weight && (
                          <span className="text-xs text-muted-foreground">· {product.weight}</span>
                        )}
                      </div>
                      {product.sale_price && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatMoney(product.price)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => cart.addItem(product as any)}
                      disabled={product.status === "sold-out"}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {product.status === "sold-out" ? "Sold Out" : "Add"}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-3xl bg-card p-10 text-center shadow-soft">
            <p className="font-display text-3xl">No chocolates match that search.</p>
            <button
              onClick={() => {
                setQuery("");
                setActive("All");
                setPrice(6000);
              }}
              className="mt-5 rounded-full bg-primary px-6 py-3 text-primary-foreground"
            >
              Reset filters
            </button>
          </div>
        )}

      </section>
    </div>
  );
}
