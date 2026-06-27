import { createFileRoute, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { formatMoney } from "@/data/shop";
import { resolveProductImage } from "@/lib/utils";
import { createCheckoutOrder, verifyCheckoutPayment } from "@/lib/server-functions";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/checkout")({
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
  const cart = useCart();
  const { user, profile } = useAuth();
  
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

  // Check hydration and load default user details
  useEffect(() => {
    setIsClient(true);
    
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // 1. Trigger order initialization in server function
      const orderRes = await createCheckoutOrder({
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
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
      });

      const { orderId, razorpayOrderId, amount, isMock } = orderRes;

      // 2. Handle Mock Checkout / Offline Sandbox Mode
      if (isMock) {
        console.warn("Processing checkout in simulation sandbox mode.");
        
        // Directly verify with a mock payment verification request
        const verifyRes = await verifyCheckoutPayment({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
          razorpaySignature: "sig_mock",
          isMock: true
        });

        if (verifyRes.success) {
          await cart.clearCart();
          setPlaced(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          alert("Mock payment simulation failed. Please try again.");
        }
      } else {
        // 3. Live Razorpay Modal Checkout
        const sdkLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!sdkLoaded) {
          alert("Could not load the Razorpay checkout script. Check your internet connection.");
          setIsProcessing(false);
          return;
        }

        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

        const options = {
          key: keyId,
          amount,
          currency: "INR",
          name: "ETERNITY",
          description: "Artisan Chocolates Purchase",
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            try {
              setIsProcessing(true);
              const verifyRes = await verifyCheckoutPayment({
                orderId,
                razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                isMock: false
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
          },
          prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone
          },
          theme: {
            color: "#8D6E63" // Brand gold/brown cocoa color
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
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
                  <Input
                    label="State"
                    value={stateField}
                    onChange={(e: any) => setStateField(e.target.value)}
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
                disabled={isProcessing}
                className="flex-1 rounded-full bg-primary px-8 py-4 text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : `Place order · ${formatMoney(cart.total)}`}
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
            {cart.items.map((item) => {
              const product = cart.products.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={product.id} className="flex gap-4">
                  <img
                    src={resolveProductImage(product.images[0])}
                    alt={product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-display">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Qty {item.quantity} · {product.weight}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatMoney((product.sale_price !== undefined ? product.sale_price : product.price) * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="divider-gold my-5" />
          <div className="mb-5 space-y-3">
            <Row label="Subtotal" value={formatMoney(cart.subtotal)} />
            <Row label="Shipping" value={cart.shipping === 0 ? "Free" : formatMoney(cart.shipping)} />
            <Row label="GST (5%)" value={formatMoney(cart.tax)} />
          </div>
          <div className="divider-gold my-5" />
          <Row label="Total" value={formatMoney(cart.total)} bold />
        </aside>
      </div>
    </div>
  );
}
