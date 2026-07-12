import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Heart, History, ShieldCheck, UserCircle, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/lib/supabase";
import { formatMoney } from "@/data/shop";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account - ETERNITY" },
      {
        name: "description",
        content: "Customer account, orders, wishlist, and profile for ETERNITY.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, profile, loading: authLoading, signOut, signInWithGoogle } = useAuth();
  
  // Tab toggle for guest: "login" | "signup"
  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "signup">("login");
  
  // Dashboard active section: "orders" | "profile"
  const [activeSection, setActiveSection] = useState<"orders" | "profile">("orders");

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch Orders
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setLoadingOrders(true);

        try {
          // Fetch orders
          const { data: ordersData, error: ordersErr } = await supabase
            .from("orders")
            .select("*, order_items(*, products(*))")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!ordersErr) {
            setOrders(ordersData || []);
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);

    try {
      if (activeAuthTab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              role: "customer",
            },
          },
        });
        if (error) throw error;
        setFormSuccess("Sign up successful! Please check your email for verification link.");
      }
    } catch (err: any) {
      setFormError(err.message || "An authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* HEADER HERO */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">
          {user ? "Customer Dashboard" : "Customer Account"}
        </p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-balance">
          {user ? `Welcome back, ${profile?.full_name || "Chocolate Lover"}.` : "Sign in, save addresses, and follow every chocolate box."}
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          {user 
            ? "Manage your saved addresses, track your deliveries, and check your wishlist in one calm panel." 
            : "Register your email to earn reward points, save custom gift instructions, and make checking out swift."}
        </p>
      </section>

      {/* LOGOUT / GUEST VIEW */}
      {!user ? (
        <section className="container mx-auto max-w-lg px-6">
          <div className="rounded-3xl bg-card p-8 shadow-luxe border border-border/50">
            {/* Auth Tab Toggles */}
            <div className="mb-8 flex border-b border-border">
              <button
                onClick={() => { setActiveAuthTab("login"); setFormError(""); setFormSuccess(""); }}
                className={`flex-1 pb-4 text-center font-display text-xl transition-all ${
                  activeAuthTab === "login"
                    ? "border-b-2 border-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveAuthTab("signup"); setFormError(""); setFormSuccess(""); }}
                className={`flex-1 pb-4 text-center font-display text-xl transition-all ${
                  activeAuthTab === "signup"
                    ? "border-b-2 border-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {formError && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="rounded-xl bg-green-500/10 p-4 text-sm text-green-600 border border-green-500/20">
                  {formSuccess}
                </div>
              )}

              {activeAuthTab === "signup" && (
                <>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Full Name</span>
                    <input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Phone Number</span>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email Address</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.doe@example.com"
                  className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Password</span>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-accent"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full flex items-center justify-center rounded-full bg-primary h-12 text-primary-foreground font-medium shadow-soft hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : activeAuthTab === "login" ? "Sign In" : "Sign Up"}
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                <span className="relative bg-card px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">or</span>
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="w-full rounded-full border border-border h-12 hover:bg-secondary transition-all"
              >
                Continue with Google
              </button>
            </form>
          </div>
        </section>
      ) : (
        /* LOGGED IN USER INTERFACE */
        <section className="container mx-auto px-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Navigation Sidebar */}
          <aside className="rounded-3xl bg-card p-6 shadow-soft border border-border/50 h-fit space-y-2">
            {[
              { id: "orders", label: "Order History", Icon: History },
              { id: "profile", label: "Profile Settings", Icon: ShieldCheck },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium transition-all ${
                  activeSection === sec.id
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <sec.Icon className="h-4 w-4" />
                {sec.label}
              </button>
            ))}

            {profile?.role === "admin" && (
              <Link
                to="/admin"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium text-accent hover:bg-secondary transition-all"
              >
                <UserCircle className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}

            <div className="divider-gold my-4" />

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </aside>

          {/* Section Panel */}
          <main className="rounded-3xl bg-card p-6 md:p-8 shadow-luxe border border-border/50 min-h-[50vh]">
            
            {/* 1. ORDER HISTORY SECTION */}
            {activeSection === "orders" && (
              <div>
                <h2 className="font-display text-3xl mb-6">Order History</h2>
                {loadingOrders ? (
                  <div className="flex py-12 justify-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                    <History className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                    <p className="font-display text-xl">No orders found.</p>
                    <p className="text-sm text-muted-foreground mt-1">When you buy a chocolate hamper, it will appear here.</p>
                    <Link to="/collections" className="mt-5 inline-flex rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground">Shop catalog</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-border p-5 md:p-6 shadow-soft">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-accent">Order ID</p>
                            <p className="font-mono text-sm font-semibold text-foreground mt-1">#{order.id.slice(0, 8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Date</p>
                            <p className="text-sm text-foreground font-medium mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                            <span className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase font-semibold tracking-wider mt-1 ${
                              order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {order.payment_status}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fulfillment</p>
                            <span className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase font-semibold tracking-wider mt-1 ${
                              order.fulfillment_status === "fulfilled" ? "bg-blue-100 text-blue-800" : "bg-neutral-100 text-neutral-800"
                            }`}>
                              {order.fulfillment_status}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                              <span className="text-foreground">{item.quantity}x {item.products?.name || "Artisan Chocolate"}{item.selected_variant ? ` (${item.selected_variant})` : ""}</span>
                              <span className="font-medium">{formatMoney(Number(item.price) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="divider-gold my-4" />
                        <div className="flex justify-between font-display text-xl text-foreground">
                          <span>Total Paid</span>
                          <span>{formatMoney(Number(order.total))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE SETTINGS SECTION */}
            {activeSection === "profile" && (
              <div>
                <h2 className="font-display text-3xl mb-6">Profile Settings</h2>
                <div className="rounded-2xl border border-border p-5 md:p-6 space-y-4 max-w-lg">
                  <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-sm">
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Name</span>
                    <span className="font-semibold text-foreground">{profile?.full_name || "N/A"}</span>
                    
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Email</span>
                    <span className="font-semibold text-foreground">{user.email}</span>
                    
                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Mobile</span>
                    <span className="font-semibold text-foreground">{profile?.phone || "N/A"}</span>

                    <span className="text-muted-foreground uppercase tracking-wider text-xs">Role</span>
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="capitalize">{profile?.role}</span>
                      {profile?.role === "admin" && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] uppercase tracking-wider text-accent-foreground font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </section>
      )}
    </div>
  );
}
