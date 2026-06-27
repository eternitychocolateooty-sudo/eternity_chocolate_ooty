import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Authenticating — ETERNITY" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: "/account" });
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            navigate({ to: "/account" });
          }
        });
        
        // Timeout redirect fallback
        const timer = setTimeout(() => {
          subscription.unsubscribe();
          navigate({ to: "/account" });
        }, 5000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-accent animate-pulse">
          Authenticating
        </p>
        <h2 className="mt-3 font-display text-3xl">Connecting to your profile...</h2>
        <p className="mt-2 text-sm text-muted-foreground">You will be redirected shortly.</p>
      </div>
    </div>
  );
}
