import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { AuthProvider } from "@/components/AuthContext";
import { CartProvider } from "@/components/CartContext";
import { CookieNotice } from "@/components/CookieNotice";
import { LoadingScreen } from "@/components/LoadingScreen";

import appCss from "../styles.css?url";
import logoImg from "@/assets/logo.png";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ETERNITY — Handcrafted Chocolates From Ooty" },
      {
        name: "description",
        content:
          "Family-owned artisan chocolate boutique in the misty hills of Ooty. Small-batch, handcrafted, unforgettable homemade chocolates.",
      },
      { name: "author", content: "ETERNITY Ooty" },
      { name: "keywords", content: "Ooty chocolate, handcrafted chocolate Ooty, homemade chocolates Ooty, artisan dark chocolate, Ooty sweets, Eternity chocolate" },
      { property: "og:title", content: "ETERNITY — Handcrafted Chocolates From Ooty" },
      {
        property: "og:description",
        content: "Family-owned artisan chocolate boutique in the misty hills of Ooty.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ETERNITY Chocolates Ooty" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ETERNITY — Handcrafted Chocolates From Ooty" },
      { name: "twitter:description", content: "Family-owned artisan chocolate boutique in the misty hills of Ooty." },
    ],
    links: [
      { rel: "icon", href: logoImg },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [showLoader, setShowLoader] = useState(true);
  const [revealContent, setRevealContent] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {showLoader && (
            <LoadingScreen
              onReveal={() => setRevealContent(true)}
              onComplete={() => setShowLoader(false)}
            />
          )}
          <div
            className={`transition-all duration-700 transform ${
              revealContent
                ? "opacity-100 translate-y-0 blur-none"
                : "opacity-0 translate-y-2 pointer-events-none blur-sm"
            }`}
            style={{ transitionTimingFunction: "var(--transition-smooth)" }}
          >
            <SiteLayout />
          </div>
          <CookieNotice />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
