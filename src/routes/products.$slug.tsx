import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart, parseVariant } from "@/components/CartContext";
import { formatMoney } from "@/data/shop";
import { resolveProductImage } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", params.slug)
      .single();

    if (error || !product) {
      throw notFound();
    }

    const normalizedProduct = {
      ...product,
      sale_price: product.sale_price !== null ? Number(product.sale_price) : undefined,
      price: Number(product.price),
      rating: Number(product.rating),
    };

    return { product: normalizedProduct };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Chocolate"} - ETERNITY` },
      {
        name: "description",
        content: loaderData?.product.description ?? "Premium handmade chocolate from Ooty.",
      },
      {
        property: "og:title",
        content: `${loaderData?.product.name ?? "Chocolate"} - ETERNITY`,
      },
      { property: "og:description", content: loaderData?.product.description ?? "" },
    ],
  }),
  component: ProductDetails,
});

function ProductDetails() {
  const { product } = Route.useLoaderData();
  const cart = useCart();
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const related = useMemo(() => {
    if (!cart.products.length) return [];
    return cart.products
      .filter((item) => item.id !== product.id && item.category === product.category)
      .concat(cart.products.filter((item) => item.id !== product.id && item.category !== product.category))
      .slice(0, 3);
  }, [product, cart.products]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  useEffect(() => {
    setSelectedVariantIndex(0);
    setActiveImage(product.images[0]);
    setQuantity(1);
  }, [product.id, product.images]);

  const baseActivePrice = product.sale_price !== undefined ? product.sale_price : product.price;
  const parsedVariants = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return [];
    return product.variants.map((v) => parseVariant(v, baseActivePrice));
  }, [product.variants, baseActivePrice]);

  const selectedVariant = parsedVariants[selectedVariantIndex] || null;
  const price = selectedVariant ? selectedVariant.price : baseActivePrice;

  return (
    <div className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images?.map((img: string) => resolveProductImage(img)),
            "description": product.description,
            "sku": product.id,
            "brand": {
              "@type": "Brand",
              "name": "ETERNITY"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://eternitychocolateooty.com/products/${product.slug}`,
              "priceCurrency": "INR",
              "price": product.sale_price !== undefined && product.sale_price !== null ? product.sale_price : product.price,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": product.rating || 4.8,
              "reviewCount": product.reviews || 10
            }
          })
        }}
      />
      <section className="container mx-auto px-6 py-10">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="overflow-hidden rounded-3xl bg-card shadow-luxe">
              <img
                src={resolveProductImage(activeImage)}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {product.images.map((image) => (
                <button
                  key={image}
                  onClick={() => setActiveImage(image)}
                  className={`overflow-hidden rounded-2xl border ${
                    activeImage === image ? "border-accent" : "border-transparent"
                  }`}
                >
                  <img src={resolveProductImage(image)} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-sm uppercase tracking-[0.3em] text-accent">{product.category}</p>
            <h1 className="mt-4 font-display text-5xl md:text-6xl text-balance">{product.name}</h1>
            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

            {parsedVariants.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3 font-semibold">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {parsedVariants.map((v, index) => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariantIndex(index)}
                      className={`h-11 px-5 rounded-xl border text-sm font-medium transition-all ${
                        selectedVariantIndex === index
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-transparent text-foreground hover:border-accent"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-3xl bg-card p-6 shadow-soft">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Price</p>
                  <p className="font-display text-4xl">{formatMoney(price)}</p>
                  {product.sale_price && !selectedVariant && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatMoney(product.price)}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-secondary px-4 py-2 text-xs uppercase tracking-[0.2em]">
                  {product.status === "low-stock"
                    ? "Low stock"
                    : product.status === "sold-out"
                      ? "Sold out"
                      : "In stock"}
                </span>
              </div>



              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="grid h-12 w-12 place-items-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((value) => Math.min(product.stock_quantity || 1, value + 1))
                    }
                    className="grid h-12 w-12 place-items-center"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => cart.addItem(product, quantity, selectedVariant?.name)}
                  disabled={product.status === "sold-out"}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-soft disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to cart
                </button>

              </div>

              <Link
                to="/checkout"
                onClick={() => cart.addItem(product, quantity, selectedVariant?.name)}
                className="mt-4 inline-flex w-full justify-center rounded-full bg-gradient-gold px-6 py-3 font-medium text-[oklch(0.22_0.035_50)] shadow-gold"
              >
                Buy now
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { Icon: Truck, title: "Ooty dispatch", text: "Packed cold. Free shipping above ₹3000!" },
                {
                  Icon: ShieldCheck,
                  title: "Secure payment",
                  text: "Razorpay and COD-ready checkout.",
                },
              ].map(({ Icon, title, text }) => (
                <div key={title} className="rounded-2xl bg-foreground text-background p-4 shadow-luxe">
                  <Icon className="mb-3 h-5 w-5 text-accent" />
                  <p className="font-display text-xl">{title}</p>
                  <p className="text-sm text-background/80">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-3xl">Ingredients</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.ingredients.join(", ")}
            </p>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-soft">
            <h2 className="font-display text-3xl">Weight</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.weight}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accent">Related Products</p>
            <h2 className="font-display text-4xl">You may also love</h2>
          </div>
          <Link to="/collections" className="text-sm text-muted-foreground hover:text-accent">
            View all
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.id}
              to="/products/$slug"
              params={{ slug: item.slug }}
              className="overflow-hidden rounded-3xl bg-card shadow-soft hover-lift"
            >
              <img
                src={resolveProductImage(item.images[0])}
                alt={item.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-5">
                <p className="font-display text-2xl">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatMoney(item.sale_price !== undefined ? item.sale_price : item.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
