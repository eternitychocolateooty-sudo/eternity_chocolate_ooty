import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { useCart, parseVariant } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { formatMoney } from "@/data/shop";
import { resolveProductImage } from "@/lib/utils";
import { createCheckoutOrder, verifyCheckoutPayment, testResendEmail } from "@/lib/server-functions";
import { supabase } from "@/lib/supabase";

interface CheckoutSearch {
  order_id?: string;
  error?: string;
}

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => {
    return {
      order_id: search.order_id as string | undefined,
      error: search.error as string | undefined,
    };
  },
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("popularity", { ascending: false });
      if (!error && data) {
        return (data || []).map((p: any) => ({
          ...p,
          sale_price: p.sale_price !== null ? Number(p.sale_price) : undefined,
          price: Number(p.price),
          rating: Number(p.rating),
        }));
      }
    } catch {
      // Ignore fallback
    }
    return [];
  },
  head: () => ({
    meta: [
      { title: "Checkout — ETERNITY" },
      { name: "description", content: "Secure checkout for ETERNITY handmade chocolates." },
    ],
  }),
  component: Checkout,
});

function Input({ label, className = "", ...props }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-accent">
        {label}
      </span>
      <input
        className="w-full border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-accent"
        {...props}
      />
    </label>
  );
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

function SelectInput({ label, options, className = "", ...props }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-accent">
        {label}
      </span>
      <select
        className="w-full border-b border-border bg-transparent py-2 text-sm outline-none transition-colors focus:border-accent cursor-pointer text-foreground"
        {...props}
      >
        <option value="" className="bg-card text-muted-foreground">Select state</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-card text-foreground">
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-display text-2xl" : "text-sm"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Dynamic script loader for Razorpay Checkout
function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const loadedProducts = Route.useLoaderData() || [];
  const cart = useCart();
  const { user, profile } = useAuth();
  const { order_id: queryOrderId, error: queryError } = Route.useSearch();
  
  const [placed, setPlaced] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateField, setStateField] = useState("");
  const [pincode, setPincode] = useState("");

  // Check hydration and load default user details / verify payment
  useEffect(() => {
    setIsClient(true);
    
    const verifyLivePayment = async () => {
      if (queryOrderId) {
        setIsProcessing(true);
        try {
          const verifyRes = await verifyCheckoutPayment({
            data: {
              cashfreeOrderId: queryOrderId,
              isMock: false
            }
          });
          if (verifyRes.success) {
            await cart.clearCart();
            setPlaced(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        } catch (err: any) {
          alert(`Payment verification error: ${err.message}`);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    verifyLivePayment();

    if (queryError) {
      alert(`Payment failed: ${decodeURIComponent(queryError)}`);
    }
    
    if (user) {
      if (user.email) setEmail(user.email);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.full_name) {
        const parts = profile.full_name.trim().split(/\s+/);
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }

      // Fetch default address if available
      const loadDefaultAddress = async () => {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle();
          
        if (data && !error) {
          setAddress(data.street_address);
          setCity(data.city);
          setStateField(data.state);
          setPincode(data.postal_code);
          if (data.recipient_name) {
            const parts = data.recipient_name.trim().split(/\s+/);
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
          if (data.phone) {
            setPhone(data.phone);
          }
        }
      };

      loadDefaultAddress();
    }
  }, [user, profile]);

  useEffect(() => {
    if (stateField) {
      cart.setShippingState(stateField);
    }
  }, [stateField, cart.setShippingState]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    const pincodeRegex = /^\d{6}$/;

    if (!firstName.trim() || !lastName.trim()) {
      alert("Please provide both first name and last name.");
      setIsProcessing(false);
      return;
    }
    if (!emailRegex.test(email.trim())) {
      alert("Please provide a valid email address.");
      setIsProcessing(false);
      return;
    }
    if (!phoneRegex.test(phone.trim())) {
      alert("Please provide a valid phone number (10 to 15 digits).");
      setIsProcessing(false);
      return;
    }
    if (!address.trim() || !city.trim() || !stateField.trim()) {
      alert("Please complete all shipping address fields.");
      setIsProcessing(false);
      return;
    }
    if (!pincodeRegex.test(pincode.trim())) {
      alert("Please provide a valid 6-digit postal pincode.");
      setIsProcessing(false);
      return;
    }

    if (cart.items.length === 0) {
      alert("Your hamper is empty. Please add chocolates to your hamper before placing an order.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Trigger order initialization in server function
      const orderRes = await createCheckoutOrder({
        data: {
          items: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant
          })),
          customerInfo: {
            email,
            name: `${firstName} ${lastName}`,
            phone,
            userId: user?.id
          },
          shippingAddress: {
            firstName,
            lastName,
            address,
            city,
            state: stateField,
            pincode
          }
        }
      });

      const { orderId, cashfreeOrderId, paymentSessionId, amount, isMock, gateway, zaakpayPayload } = orderRes as any;

      if (gateway === "ZAAKPAY") {
        if (!zaakpayPayload) {
          throw new Error("Zaakpay payment payload was not generated. Check your Zaakpay credentials.");
        }

        // Automatically create and submit POST form to Zaakpay gateway
        const form = document.createElement("form");
        form.method = "POST";
        form.action = zaakpayPayload.postUrl;

        Object.entries(zaakpayPayload.params as Record<string, string>).forEach(([key, value]) => {
          if (value !== undefined && value !== null && String(value).trim() !== "") {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = String(value).trim();
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        HTMLFormElement.prototype.submit.call(form);
        return;
      }

      // 2. Handle Mock Checkout / Offline Sandbox Mode
      if (isMock) {
        console.warn("Processing checkout in simulation sandbox mode.");
        alert(`Offline Sandbox Mode: Payment keys are missing on the live server.\n(gateway: ${gateway})`);
        
        // Directly verify with a mock payment verification request
        const verifyRes = await verifyCheckoutPayment({
          data: {
            orderId,
            cashfreeOrderId,
            cashfreePaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
            isMock: true
          }
        });

        if (verifyRes.success) {
          await cart.clearCart();
          setPlaced(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          alert("Mock payment simulation failed. Please try again.");
        }
      } else {
        // 3. Live Cashfree Web Checkout SDK
        const sdkLoaded = await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");
        if (!sdkLoaded) {
          alert("Could not load the Cashfree checkout script. Check your internet connection.");
          setIsProcessing(false);
          return;
        }

        const cashfreeEnv = import.meta.env.VITE_CASHFREE_ENV || "TEST";
        const cashfree = new (window as any).Cashfree({
          mode: cashfreeEnv === "PROD" ? "production" : "sandbox"
        });

        cashfree.checkout({
          paymentSessionId: paymentSessionId,
          redirectTarget: "_self"
        });
      }
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // Prevent hydration mismatch
  if (!isClient) return null;

  if (placed) {
    return (
      <div className="container mx-auto px-6 py-32 text-center transition-all duration-700 opacity-100 scale-100 starting:opacity-0 starting:scale-95">
        <h1 className="mb-6 font-display text-5xl md:text-7xl gold-text">Thank You.</h1>
        <p className="mb-8 text-lg text-muted-foreground">Your order has been confirmed. A confirmation receipt has been sent to your email.</p>
        <Link
          to="/collections"
          className="inline-flex rounded-full bg-primary px-8 py-3.5 text-primary-foreground shadow-soft hover:opacity-90 transition-opacity"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="mb-4 font-display text-4xl">Your hamper is empty</h1>
        <p className="mb-8 text-muted-foreground">Let's fill it with something sweet.</p>
        <Link
          to="/collections"
          className="inline-flex rounded-full bg-primary px-8 py-3.5 text-primary-foreground shadow-soft hover:opacity-90 transition-opacity"
        >
          Explore collections
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Form */}
        <div>
          <h1 className="mb-8 font-display text-4xl">Checkout</h1>



          <form onSubmit={handleSubmit} className="space-y-10">
            <fieldset disabled={isProcessing}>
              <legend className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                Contact Details
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Mobile (For WhatsApp Alerts)"
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                  required
                />
              </div>
            </fieldset>

            <fieldset disabled={isProcessing}>
              <legend className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-foreground">
                Shipping address
              </legend>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="First name"
                    value={firstName}
                    onChange={(e: any) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last name"
                    value={lastName}
                    onChange={(e: any) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Address"
                  value={address}
                  onChange={(e: any) => setAddress(e.target.value)}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e: any) => setCity(e.target.value)}
                    required
                  />
                  <SelectInput
                    label="State"
                    value={stateField}
                    onChange={(e: any) => setStateField(e.target.value)}
                    options={INDIAN_STATES}
                    required
                  />
                  <Input
                    label="Pincode"
                    value={pincode}
                    onChange={(e: any) => setPincode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </fieldset>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <button
                type="submit"
                disabled={isProcessing || cart.items.length === 0}
                className="flex-1 rounded-full bg-primary px-8 py-4 text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing
                  ? "Processing..."
                  : cart.items.length === 0
                  ? "Hamper is empty"
                  : `Place order · ${formatMoney(cart.total)}`}
              </button>
              <Link
                to="/collections"
                className="flex-1 rounded-full border border-border px-8 py-4 text-center transition-colors hover:bg-secondary"
              >
                Continue shopping
              </Link>
            </div>
          </form>
        </div>

        {/* Right Column: Summary */}
        <aside className="self-start rounded-3xl bg-card p-6 shadow-luxe lg:sticky lg:top-28">
          <h2 className="mb-6 font-display text-2xl">Your hamper</h2>
          <div className="mb-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="font-display text-lg">Your hamper is empty</p>
                <p className="mt-1 text-xs text-muted-foreground">Add handcrafted chocolates before checkout.</p>
                <Link
                  to="/collections"
                  className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-soft"
                >
                  Browse collections
                </Link>
              </div>
            ) : (
              cart.items.map((item) => {
                const product = (cart.products.length > 0 ? cart.products : loadedProducts).find(
                  (p: any) => p.id === item.productId
                );

                const itemPrice = (() => {
                  if (product) {
                    let base = product.sale_price !== undefined ? product.sale_price : product.price;
                    if (item.selectedVariant) {
                      const matchingVariantStr = product.variants?.find(
                        (v: string) => parseVariant(v, base).name === item.selectedVariant
                      );
                      if (matchingVariantStr) {
                        base = parseVariant(matchingVariantStr, base).price;
                      }
                    }
                    return base;
                  }
                  return item.price ?? 0;
                })();

                const itemName = product?.name || item.name || "Handcrafted Chocolate";
                const itemImage = product?.images?.[0] || item.image || "";
                const itemWeight = item.selectedVariant
                  ? `Variant: ${item.selectedVariant}`
                  : (product?.weight || item.weight || "");

                return (
                  <div key={`${item.productId}-${item.selectedVariant || ""}`} className="flex gap-4">
                    {itemImage ? (
                      <img
                        src={resolveProductImage(itemImage)}
                        alt={itemName}
                        className="h-16 w-16 rounded-xl object-cover bg-card shadow-soft"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-card border border-border grid place-items-center text-[10px] font-display text-muted-foreground">
                        ETERNITY
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-display">{itemName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Qty {item.quantity}{itemWeight ? ` · ${itemWeight}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatMoney(itemPrice * item.quantity)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
          <div className="divider-gold my-5" />
          <div className="mb-5 space-y-3">
            <Row label="Subtotal" value={formatMoney(cart.subtotal)} />
            <Row
              label="Shipping"
              value={cart.shipping === 0 ? (cart.subtotal >= 3000 ? "Free" : formatMoney(0)) : formatMoney(cart.shipping)}
            />
          </div>
          <div className="divider-gold my-5" />
          <Row label="Total" value={formatMoney(cart.total)} bold />
        </aside>
      </div>
    </div>
  );
}
