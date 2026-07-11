// Forced redeployment to apply new Cloudflare environment variables
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "./supabase";

// Types
export interface CheckoutItem {
  productId: string;
  quantity: number;
  selectedVariant?: string;
}

function parseVariant(variantStr: string, basePrice: number) {
  const parts = variantStr.split(":");
  if (parts.length >= 2) {
    const name = parts[0].trim();
    const price = parseFloat(parts[1].trim());
    return { name, price: isNaN(price) ? basePrice : price };
  }
  return { name: variantStr.trim(), price: basePrice };
}

export interface CustomerInfo {
  email: string;
  name: string;
  phone: string;
  userId?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// SHARED HELPER FUNCTION TO COMPLETE AND PROMPT ORDER FULFILLMENT
export async function completeOrder(orderId: string, cashfreePaymentId: string) {
  // 1. Mark order as paid
  const { data: order, error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      cashfree_payment_id: cashfreePaymentId,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (updateErr || !order) {
    throw new Error(`Failed to update order payment status: ${updateErr?.message || "Order not found"}`);
  }

  // 2. Fetch order items to deplete stock levels
  const { data: orderItems, error: itemsErr } = await supabaseAdmin
    .from("order_items")
    .select("*, products(*)")
    .eq("order_id", orderId);

  if (itemsErr || !orderItems) {
    console.error(`Failed to fetch order items for stock updates: ${itemsErr?.message}`);
  } else {
    // Deplete inventory levels
    for (const item of orderItems) {
      const prod = item.products;
      if (!prod) continue;

      const newStock = Math.max(0, prod.stock_quantity - item.quantity);
      let newStatus = "available";
      if (newStock === 0) {
        newStatus = "sold-out";
      } else if (newStock < 10) {
        newStatus = "low-stock";
      }

      const { error: stockErr } = await supabaseAdmin
        .from("products")
        .update({
          stock_quantity: newStock,
          status: newStatus,
        })
        .eq("id", prod.id);

      if (stockErr) {
        console.error(`Failed to update inventory level for product ${prod.id}: ${stockErr.message}`);
      }
    }
  }

  const customerEmail = order.guest_email || "";
  const customerName = order.guest_name || "Valued Customer";
  const customerPhone = order.guest_phone || "";

  // Load customer email details if logged in
  let emailToUse = customerEmail;
  let nameToUse = customerName;
  if (order.user_id) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, phone")
      .eq("id", order.user_id)
      .single();
    
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    
    if (userData?.user?.email) {
      emailToUse = userData.user.email;
    }
    if (profile?.full_name) {
      nameToUse = profile.full_name;
    }
  }

  // A. Order confirmation emails are managed asynchronously via Supabase Database Webhook & Edge Function.


}

// 1. ORDER INITIALIZATION
export const createCheckoutOrder = createServerFn({ method: "POST" })
  .handler(async ({ data: payload, request }) => {
    const { items, customerInfo, shippingAddress } = payload;

    // Fetch actual prices from Supabase
    const productIds = items.map((i) => i.productId);
    console.log("Server: Fetching products from Supabase", productIds);
    const { data: dbProducts, error: fetchErr } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", productIds);

    console.log("Server: Supabase products fetched", { count: dbProducts?.length, error: fetchErr });

    if (fetchErr || !dbProducts) {
      throw new Error(`Failed to retrieve product data: ${fetchErr?.message || "Unknown error"}`);
    }

    // Securely calculate checkout subtotal
    let subtotal = 0;
    for (const item of items) {
      const prod = dbProducts.find((p) => p.id === item.productId);
      if (!prod) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (prod.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${prod.name}. Available: ${prod.stock_quantity}`);
      }
      let price = prod.sale_price !== null && prod.sale_price !== undefined ? Number(prod.sale_price) : Number(prod.price);
      if (item.selectedVariant) {
        const matchingVariantStr = prod.variants?.find(
          (v: string) => v.startsWith(item.selectedVariant! + ":") || v === item.selectedVariant
        );
        if (matchingVariantStr) {
          price = parseVariant(matchingVariantStr, price).price;
        }
      }
      subtotal += price * item.quantity;
    }

    const shippingFee = subtotal > 1500 || subtotal === 0 ? 0 : 120;
    const tax = 0;
    const total = subtotal + shippingFee;

    const { getPlatformEnv } = await import("./env.server");
    const appId = getPlatformEnv("VITE_CASHFREE_APP_ID");
    const secretKey = getPlatformEnv("CASHFREE_SECRET_KEY");
    const cashfreeEnv = getPlatformEnv("VITE_CASHFREE_ENV") || "TEST";

    let cashfreeOrderId = `CF-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let paymentSessionId = "";
    let isMock = false;

    console.log("Server: createCheckoutOrder env check:", { hasAppId: !!appId, hasSecretKey: !!secretKey, cashfreeEnv });

    if (!appId || !secretKey || appId === "your-cashfree-app-id" || secretKey === "your-cashfree-secret-key") {
      console.warn("Cashfree API credentials missing or placeholder. Initiating MOCK payment order.");
      paymentSessionId = `mock_session_${Math.random().toString(36).substring(2, 15)}`;
      isMock = true;
    } else {
      try {
        const host = cashfreeEnv === "PROD" ? "api.cashfree.com" : "sandbox.cashfree.com";
        const requestUrl = request ? new URL(request.url) : null;
        const hostOrigin = requestUrl ? requestUrl.origin : "https://eternitychocolateooty.in";
        const returnUrl = `${hostOrigin}/checkout?order_id={order_id}`;

        const response = await fetch(`https://${host}/pg/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
            "x-client-id": appId,
            "x-client-secret": secretKey,
          },
          body: JSON.stringify({
            order_id: cashfreeOrderId,
            order_amount: Number(total.toFixed(2)),
            order_currency: "INR",
            customer_details: {
              customer_id: customerInfo.userId || `guest_${Date.now()}`,
              customer_name: customerInfo.name,
              customer_email: customerInfo.email,
              customer_phone: customerInfo.phone,
            },
            order_meta: {
              return_url: returnUrl,
            },
          }),
        });

        const resData: any = await response.json();
        if (!response.ok || !resData.payment_session_id) {
          throw new Error(resData?.message || "Failed to create Cashfree order");
        }

        paymentSessionId = resData.payment_session_id;
      } catch (err: any) {
        console.error("Cashfree order creation failed:", err);
        throw new Error(`Cashfree initialization failed: ${err.message}`);
      }
    }

    // Write pending order details to database
    console.log("Server: Inserting pending order into Supabase...");
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: customerInfo.userId || null,
        guest_email: customerInfo.userId ? null : customerInfo.email,
        guest_name: customerInfo.userId ? null : customerInfo.name,
        guest_phone: customerInfo.userId ? null : customerInfo.phone,
        shipping_address: shippingAddress,
        subtotal,
        shipping_fee: shippingFee,
        tax,
        total,
        payment_status: "pending",
        cashfree_order_id: cashfreeOrderId,
        fulfillment_status: "pending",
      })
      .select()
      .single();

    console.log("Server: Pending order insert result", { orderId: order?.id, error: orderErr });

    if (orderErr || !order) {
      const diag = {
        hasServiceKey: !!getEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
        serviceKeyLength: getEnvVar("SUPABASE_SERVICE_ROLE_KEY")?.length || 0,
        hasAnonKey: !!getEnvVar("VITE_SUPABASE_ANON_KEY"),
        hasResendKey: !!getEnvVar("RESEND_API_KEY"),
      };
      throw new Error(`Failed to record order: ${orderErr?.message || "Unknown error"} (Diag: ${JSON.stringify(diag)})`);
    }

    // Write order items
    const orderItemsToInsert = items.map((item) => {
      const prod = dbProducts.find((p) => p.id === item.productId);
      let price = prod ? (prod.sale_price !== null && prod.sale_price !== undefined ? Number(prod.sale_price) : Number(prod.price)) : 0;
      if (prod && item.selectedVariant) {
        const matchingVariantStr = prod.variants?.find(
          (v: string) => v.startsWith(item.selectedVariant! + ":") || v === item.selectedVariant
        );
        if (matchingVariantStr) {
          price = parseVariant(matchingVariantStr, price).price;
        }
      }
      return {
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price,
        selected_variant: item.selectedVariant || null,
      };
    });

    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(orderItemsToInsert);
    if (itemsErr) {
      throw new Error(`Failed to record order items: ${itemsErr.message}`);
    }

    return {
      success: true,
      orderId: order.id,
      cashfreeOrderId,
      paymentSessionId,
      amount: total.toFixed(2),
      isMock,
    };
  });

// 2. PAYMENT STATUS VERIFICATION (Used for both live API checking and local simulation sandbox)
export const verifyCheckoutPayment = createServerFn({ method: "POST" })
  .handler(async ({ data: payload }) => {
    const { orderId, cashfreeOrderId, cashfreePaymentId, isMock } = payload;

    if (isMock) {
      if (!orderId) throw new Error("Mock verification requires local orderId reference.");
      await completeOrder(orderId, cashfreePaymentId || `pay_mock_${Math.random().toString(36).substring(2, 10)}`);
      return { success: true };
    }

    const { getPlatformEnv } = await import("./env.server");
    const appId = getPlatformEnv("VITE_CASHFREE_APP_ID");
    const secretKey = getPlatformEnv("CASHFREE_SECRET_KEY");
    const cashfreeEnv = getPlatformEnv("VITE_CASHFREE_ENV") || "TEST";

    if (!appId || !secretKey) {
      throw new Error("Cashfree API key configuration is missing on the server.");
    }

    try {
      const host = cashfreeEnv === "PROD" ? "api.cashfree.com" : "sandbox.cashfree.com";
      
      // Fetch order status from Cashfree
      const response = await fetch(`https://${host}/pg/orders/${cashfreeOrderId}`, {
        method: "GET",
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": appId,
          "x-client-secret": secretKey,
        },
      });

      const resData: any = await response.json();
      if (!response.ok) {
        throw new Error(resData?.message || "Failed to retrieve Cashfree order details");
      }

      if (resData.order_status !== "PAID") {
        throw new Error(`Transaction payment is not verified. Status: ${resData.order_status}`);
      }

      // Find the corresponding database record
      const { data: dbOrder, error: orderErr } = await supabaseAdmin
        .from("orders")
        .select("id, payment_status")
        .eq("cashfree_order_id", cashfreeOrderId)
        .single();

      if (orderErr || !dbOrder) {
        throw new Error(`Failed to resolve order matching Cashfree ID: ${cashfreeOrderId}`);
      }

      // Check if it is not paid yet, then complete it
      if (dbOrder.payment_status !== "paid") {
        // Complete the order
        await completeOrder(dbOrder.id, resData.cf_order_id || cashfreeOrderId);
      }

      return { success: true };
    } catch (err: any) {
      console.error("Cashfree verification error:", err);
      throw new Error(err.message);
    }
  });

// 3. SUBMIT FEEDBACK
export const submitFeedback = createServerFn({ method: "POST" })
  .handler(async ({ data: payload }) => {
    const { name, email, rating, message } = payload;

    // Record feedback in database
    const { data: fb, error: insertErr } = await supabaseAdmin
      .from("feedbacks")
      .insert({ name, email, rating, message })
      .select()
      .single();

    if (insertErr || !fb) {
      throw new Error(`Failed to save feedback: ${insertErr?.message || "Unknown error"}`);
    }

    // Feedback recorded, email notifications removed.
    return { success: true };
  });
