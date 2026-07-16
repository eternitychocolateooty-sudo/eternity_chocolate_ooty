import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "eternity-cookie-notice-dismissed";

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Delay showing the notice slightly for a better Entry transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 max-w-md bg-card/95 backdrop-blur-md text-card-foreground border border-border/80 p-5 rounded-2xl shadow-luxe z-50 transform transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="p-2 rounded-xl bg-primary/10 text-accent shrink-0">
          <Cookie className="h-6 w-6 animate-pulse" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-semibold tracking-tight text-foreground text-sm">
              Cookie Settings
            </h4>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              We use only essential cookies to enable core website functionalities like checkout, authentication, and user preferences. No analytics, tracking, or marketing cookies are used. Read our{" "}
              <Link
                to="/privacy"
                className="underline underline-offset-2 hover:text-accent font-medium transition-colors"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              onClick={handleDismiss}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs px-5 py-1.5 h-8 rounded-lg shadow-sm transition-all"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
