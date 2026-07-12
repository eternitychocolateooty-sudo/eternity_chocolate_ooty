import { Link, Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useCart, parseVariant } from "@/components/CartContext";
import { formatMoney } from "@/data/shop";
import logoImg from "@/assets/logo.png";
import { resolveProductImage } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/story", label: "Our Story" },
  { to: "/gallery", label: "Gallery" },
  { to: "/visit", label: "Visit Us" },
  { to: "/account", label: "Account" },
] as const;

function useScrolled(threshold = 30) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useDarkMode() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);
  return { dark: true, toggle: () => {} };
}

function FloatingNav() {
  const scrolled = useScrolled(40);
  const { pathname } = useLocation();
  const { dark, toggle } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav
          className={`mx-auto flex items-center justify-between rounded-full px-5 md:px-7 py-3 transition-all duration-500 ${
            scrolled ? "glass shadow-soft max-w-5xl" : "max-w-6xl"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoImg} alt="ETERNITY Logo" className="h-9 w-auto object-contain theme-logo" />
            <span className="font-display text-lg md:text-xl tracking-wide">
              ETERNITY
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-7">
            {navItems.map((i) => {
              const active = pathname === i.to;
              return (
                <li key={i.to}>
                  <Link
                    to={i.to}
                    className={`relative text-sm tracking-wide transition-colors ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {i.label}
                    <span
                      className={`absolute -bottom-1 left-0 h-px bg-gradient-gold transition-all duration-500 ${
                        active ? "w-full" : "w-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-border/60 hover:border-accent transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              {cart.count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {cart.count}
                </span>
              )}
            </button>
            <Link
              to="/visit"
              className="hidden md:inline-flex items-center rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:opacity-90 transition-opacity shadow-soft"
            >
              Visit Store
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden grid h-9 w-9 place-items-center rounded-full border border-border/60"
              aria-label="Menu"
            >
              <span className="sr-only">menu</span>
              <div className="space-y-1">
                <span className="block h-px w-4 bg-foreground" />
                <span className="block h-px w-4 bg-foreground" />
              </div>
            </button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden mt-3 mx-auto max-w-5xl glass rounded-3xl p-4 shadow-soft">
            <ul className="flex flex-col gap-1">
              {navItems.map((i) => (
                <li key={i.to}>
                  <Link
                    to={i.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-foreground hover:bg-secondary transition-colors"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useCart();
  const cartProducts = cart.items
    .map((item) => ({
      item,
      product: cart.products.find((p) => p.id === item.productId),
    }))
    .filter(
      (entry): entry is { item: (typeof cart.items)[number]; product: (typeof cart.products)[number] } =>
        Boolean(entry.product),
    );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-[oklch(0.12_0.02_45/0.45)] backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-background p-6 shadow-luxe overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">Shopping Cart</p>
            <h2 className="font-display text-3xl">Your chocolate box</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full border border-border"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {cartProducts.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-card p-8 text-center shadow-soft">
            <ShoppingBag className="mx-auto mb-4 h-8 w-8 text-accent" />
            <p className="font-display text-2xl">Your cart is empty.</p>
            <Link
              to="/collections"
              onClick={onClose}
              className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-primary-foreground"
            >
              Shop collections
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {cartProducts.map(({ item, product }) => {
                const itemPrice = (() => {
                  let base = product.sale_price !== undefined ? product.sale_price : product.price;
                  if (item.selectedVariant) {
                    const matchingVariantStr = product.variants?.find(
                      (v) => v.startsWith(item.selectedVariant! + ":") || v === item.selectedVariant
                    );
                    if (matchingVariantStr) {
                      base = parseVariant(matchingVariantStr, base).price;
                    }
                  }
                  return base;
                })();

                return (
                  <div
                    key={`${product.id}-${item.selectedVariant || ""}`}
                    className="grid grid-cols-[76px_1fr] gap-4 rounded-2xl bg-card p-3 shadow-soft"
                  >
                    <img
                      src={resolveProductImage(product.images[0])}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="font-display text-lg">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedVariant ? `Variant: ${item.selectedVariant}` : product.weight}
                          </p>
                        </div>
                        <button
                          aria-label={`Remove ${product.name}`}
                          onClick={() => cart.removeItem(product.id, item.selectedVariant)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => cart.updateQuantity(product.id, item.quantity - 1, item.selectedVariant)}
                            className="grid h-8 w-8 place-items-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => cart.updateQuantity(product.id, item.quantity + 1, item.selectedVariant)}
                            className="grid h-8 w-8 place-items-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium">
                          {formatMoney(itemPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 rounded-3xl bg-card p-5 shadow-soft">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cart.shipping === 0 ? "Free" : formatMoney(cart.shipping)}</span>
                </div>
              </div>
              <div className="divider-gold my-4" />
              <div className="flex justify-between font-display text-2xl">
                <span>Total</span>
                <span>{formatMoney(cart.total)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={onClose}
                className="mt-5 inline-flex w-full justify-center rounded-full bg-gradient-gold px-6 py-3 font-medium text-[oklch(0.22_0.035_50)] shadow-gold"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function StickySocials() {
  return (
    <div className="hidden lg:flex flex-col gap-3 fixed right-5 top-1/2 -translate-y-1/2 z-40">
      {[
        { Icon: Instagram, href: "https://www.instagram.com/_eternity_chocolates_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", label: "Instagram" },
        { Icon: Facebook, href: "#", label: "Facebook" },
        { Icon: MessageCircle, href: "https://wa.me/918489462100", label: "WhatsApp" },
      ].map(({ Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target={href === "#" ? undefined : "_blank"}
          rel={href === "#" ? undefined : "noreferrer noopener"}
          aria-label={label}
          className="grid h-10 w-10 place-items-center rounded-full glass shadow-soft hover:bg-accent hover:text-accent-foreground transition-all hover:-translate-y-0.5"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-32 bg-gradient-cocoa text-[oklch(0.94_0.02_80)]">
      <div className="container mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="ETERNITY Logo" className="h-10 w-auto object-contain theme-logo" />
            <span className="font-display text-2xl">ETERNITY</span>
          </Link>
          <p className="mt-5 max-w-md text-[oklch(0.94_0.02_80/0.7)] leading-relaxed">
            Handcrafted chocolates from the misty hills of Ooty. Made with patience, tradition, and
            a deep love for cocoa.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.instagram.com/_eternity_chocolates_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-[oklch(0.94_0.02_80/0.2)] hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-[oklch(0.94_0.02_80/0.2)] hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/918489462100"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-full border border-[oklch(0.94_0.02_80/0.2)] hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-[oklch(0.94_0.02_80/0.7)]">
            {navItems.map((i) => (
              <li key={i.to}>
                <Link to={i.to} className="hover:text-accent transition-colors">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4">Visit</h4>
          <ul className="space-y-3 text-sm text-[oklch(0.94_0.02_80/0.7)]">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" /> no 7,8, bharathiyar complex, charring. cross, Ooty, Tamil Nadu 643001
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 text-accent shrink-0 mt-0.5" /> 084894 62100
            </li>
            <li className="text-xs">Open · 9 am Closes 10:30 pm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[oklch(0.94_0.02_80/0.12)] py-6">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[oklch(0.94_0.02_80/0.5)]">
          <p>© {new Date().getFullYear()} ETERNITY · Crafted with love in the Nilgiris.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <Link to="/terms" className="hover:text-accent transition-colors">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/refund" className="hover:text-accent transition-colors">Refund & Cancellation</Link>
            <Link to="/shipping" className="hover:text-accent transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout() {
  const router = useRouter();
  // scroll to top on route change
  useEffect(() => {
    return router.subscribe("onResolved", () => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <FloatingNav />
      <StickySocials />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
