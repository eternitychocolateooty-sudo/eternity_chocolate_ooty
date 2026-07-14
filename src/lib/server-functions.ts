import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "./supabase";
import { getPlatformEnv } from "./env.server";
import { z } from "zod";

// Zod schemas for input validation
const customerInfoSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long").regex(/^\+?[\d\s-]+$/, "Invalid phone format"),
  userId: z.string().uuid("Invalid user ID format").optional(),
});

const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  address: z.string().min(5, "Address must be at least 5 characters").max(250),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  state: z.string().min(2, "State must be at least 2 characters").max(100),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
});

const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100, "Quantity exceeds limit"),
  selectedVariant: z.string().max(100).optional(),
});

const createCheckoutOrderSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty"),
  customerInfo: customerInfoSchema,
  shippingAddress: shippingAddressSchema,
});

const verifyCheckoutPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID format").optional(),
  cashfreeOrderId: z.string().min(5).max(100).regex(/^CF-ORD-[\w-]+$/, "Invalid Cashfree Order ID format"),
  cashfreePaymentId: z.string().min(5).max(100).regex(/^[\w-]+$/, "Invalid Cashfree Payment ID format").optional(),
  isMock: z.boolean().optional(),
});

const submitFeedbackSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format"),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(1, "Message is required").max(1000),
});


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

function parseWeightToGrams(weightStr: string): number {
  if (!weightStr) return 0;
  const clean = weightStr.toLowerCase().replace(/\s+/g, "");
  const match = clean.match(/^([\d.]+)(kg|g)?$/);
  if (!match) {
    const numMatch = clean.match(/^([\d.]+)/);
    return numMatch ? parseFloat(numMatch[1]) : 0;
  }
  const val = parseFloat(match[1]);
  const unit = match[2] || "g";
  if (unit === "kg") {
    return val * 1000;
  }
  return val;
}

function calculateShippingFee(subtotal: number, state: string, totalWeightKg: number): number {
  if (subtotal >= 3000 || subtotal === 0) {
    return 0;
  }

  const cleanState = (state || "").toLowerCase().replace(/\s+/g, "");
  const isTamilNadu = cleanState === "tamilnadu";

  if (isTamilNadu) {
    if (totalWeightKg <= 0.1) return 70;
    if (totalWeightKg <= 0.5) return 100;
    if (totalWeightKg <= 1.0) return 130;
    if (totalWeightKg <= 2.0) return 180;
    if (totalWeightKg <= 5.0) return 290;
    const extraKg = Math.ceil(totalWeightKg - 5);
    return 290 + (extraKg * 40);
  } else {
    if (totalWeightKg <= 0.1) return 110;
    if (totalWeightKg <= 0.5) return 150;
    if (totalWeightKg <= 1.0) return 185;
    if (totalWeightKg <= 2.0) return 250;
    if (totalWeightKg <= 5.0) return 400;
    const extraKg = Math.ceil(totalWeightKg - 5);
    return 400 + (extraKg * 55);
  }
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

  const emailToUse = order.guest_email || "";
  const nameToUse = order.guest_name || "Valued Customer";
  const phoneToUse = order.guest_phone || "";

  // A. Trigger order confirmation and alert emails via Resend HTTP API
  try {
    const resendApiKey = getPlatformEnv("RESEND_API_KEY");
    const ownerEmail = getPlatformEnv("ADMIN_EMAIL") || "eternitychocolateooty@gmail.com";

    if (resendApiKey) {
      
      // Build order items summary table
      const itemsSummaryHtml = orderItems
        ? orderItems
            .map((item: any) => {
              const variantSuffix = item.selected_variant ? ` (${item.selected_variant})` : "";
              return `<tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #EFEBE9; color: #5D4037; text-align: left;">
                  <strong>${item.products?.name || "Artisan Chocolate"}</strong>${variantSuffix}
                </td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #EFEBE9; text-align: center; color: #5D4037;">${item.quantity}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #EFEBE9; text-align: right; color: #5D4037;">₹${item.price}</td>
              </tr>`;
            })
            .join("")
        : "";

      // Parse shipping address
      const addr = (typeof order.shipping_address === "string"
        ? JSON.parse(order.shipping_address)
        : order.shipping_address);

      const shippingAddressHtml = addr
        ? `<div style="background-color: #FAF6F0; border: 1px solid #EFEBE9; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <h4 style="color: #6D4C41; margin-top: 0; margin-bottom: 8px; font-family: serif; font-size: 1.1em;">Delivery Address</h4>
            <p style="margin: 0; font-size: 0.95em; line-height: 1.5; color: #5D4037;">
              <strong>${addr.firstName} ${addr.lastName}</strong><br/>
              ${addr.address}<br/>
              ${addr.city}, ${addr.state} - ${addr.pincode}
            </p>
          </div>`
        : "";

      // 1. Dispatch confirmation email to customer
      if (emailToUse) {
        const customerRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: "ETERNITY Boutique <orders@eternitychocolateooty.in>",
            to: emailToUse,
            subject: `Your ETERNITY Chocolate Order #${orderId.slice(0, 8).toUpperCase()} is Confirmed!`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #EFEBE9; border-radius: 16px; background-color: #FFFFFF;">
                <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #EFEBE9; padding-bottom: 16px;">
                  <h1 style="color: #4E342E; font-family: 'Playfair Display', Georgia, serif; margin: 0; font-size: 2.2em; letter-spacing: 0.05em; font-weight: normal;">ETERNITY</h1>
                  <p style="color: #8D6E63; margin: 4px 0 0 0; font-size: 0.85em; letter-spacing: 0.2em; text-transform: uppercase;">Artisan Chocolatier</p>
                </div>
                
                <h2 style="color: #4E342E; font-family: serif; font-size: 1.4em; font-weight: normal; margin-top: 0; margin-bottom: 12px;">Order Confirmed</h2>
                <p style="color: #5D4037; line-height: 1.6; font-size: 0.95em;">Dear ${nameToUse},</p>
                <p style="color: #5D4037; line-height: 1.6; font-size: 0.95em;">Thank you for placing your order with ETERNITY. We are preparing your box of handcrafted chocolates from the misty hills of Ooty. Your payment has been verified, and we will update you as soon as your package ships.</p>
                
                <div style="margin-top: 24px;">
                  <h3 style="color: #6D4C41; font-family: serif; border-bottom: 1px solid #EFEBE9; padding-bottom: 8px; margin-bottom: 12px; font-size: 1.1em; font-weight: bold;">Order Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                    <thead>
                      <tr style="background-color: #FAF6F0; border-bottom: 1px solid #EFEBE9;">
                        <th style="padding: 10px 8px; text-align: left; color: #4E342E; font-size: 0.9em;">Item</th>
                        <th style="padding: 10px 8px; text-align: center; color: #4E342E; font-size: 0.9em; width: 60px;">Qty</th>
                        <th style="padding: 10px 8px; text-align: right; color: #4E342E; font-size: 0.9em; width: 80px;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsSummaryHtml}
                    </tbody>
                  </table>
                </div>

                <div style="margin-top: 16px; text-align: right; line-height: 1.8; color: #5D4037; font-size: 0.95em; border-bottom: 1px solid #EFEBE9; padding-bottom: 16px;">
                  Subtotal: <span style="font-weight: 500;">₹${order.subtotal}</span><br/>
                  Shipping: <span style="font-weight: 500;">${order.shipping_fee === 0 ? "Free" : `₹${order.shipping_fee}`}</span><br/>
                  <span style="font-size: 1.25em; font-weight: bold; color: #4E342E; display: inline-block; margin-top: 8px;">Total Paid: ₹${order.total}</span>
                </div>

                ${shippingAddressHtml}

                <div style="margin-top: 32px; font-size: 0.8em; color: #8D6E63; text-align: center; border-top: 1px solid #EFEBE9; padding-top: 20px; line-height: 1.6;">
                  <strong>ETERNITY Artisan Chocolate Boutique</strong><br/>
                  no 7,8, bharathiyar complex, charring. cross, Ooty, Tamil Nadu 643001<br/>
                  Need help? Reply to this email or contact support.
                </div>
              </div>
            `
          })
        });
        const customerData = await customerRes.json();
      }

      // Wait 1.2 seconds to avoid Resend rate limit (429) on free/test accounts
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. Dispatch notification email to store owner
      if (ownerEmail) {
        const ownerRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: "ETERNITY Boutique <orders@eternitychocolateooty.in>",
            to: ownerEmail,
            subject: `NEW ORDER: Order #${orderId.slice(0, 8).toUpperCase()} - ₹${order.total}`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #EFEBE9; border-radius: 16px; background-color: #FAF6F0;">
                <h2 style="color: #4E342E; font-family: serif; font-size: 1.5em; border-bottom: 2px solid #8D6E63; padding-bottom: 10px; margin-top: 0;">New Paid Order Received!</h2>
                <p style="color: #5D4037; font-size: 0.95em;">A new order has been paid and is ready for fulfillment.</p>
                
                <div style="background-color: #FFFFFF; border: 1px solid #EFEBE9; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                  <h4 style="color: #6D4C41; margin-top: 0; margin-bottom: 8px; font-family: serif; font-size: 1.1em;">Customer Details</h4>
                  <p style="margin: 0; font-size: 0.95em; line-height: 1.5; color: #5D4037;">
                    <strong>Name:</strong> ${nameToUse}<br/>
                    <strong>Email:</strong> ${emailToUse || "N/A"}<br/>
                    <strong>Phone:</strong> ${order.guest_phone || "N/A"}<br/>
                    <strong>Order ID:</strong> ${orderId}
                  </p>
                </div>

                ${shippingAddressHtml ? shippingAddressHtml.replace(/#FAF6F0/g, "#FFFFFF") : ""}

                <h3 style="color: #6D4C41; font-family: serif; margin-top: 24px; margin-bottom: 8px;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse; background-color: #FFFFFF; border: 1px solid #EFEBE9; border-radius: 8px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #EFEBE9; border-bottom: 1px solid #EFEBE9;">
                      <th style="padding: 10px 8px; text-align: left; color: #4E342E; font-size: 0.9em;">Item</th>
                      <th style="padding: 10px 8px; text-align: center; color: #4E342E; font-size: 0.9em; width: 60px;">Qty</th>
                      <th style="padding: 10px 8px; text-align: right; color: #4E342E; font-size: 0.9em; width: 80px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsSummaryHtml}
                  </tbody>
                </table>

                <div style="margin-top: 15px; text-align: right; line-height: 1.8; color: #4E342E; font-size: 1em; font-weight: bold;">
                  Subtotal: ₹${order.subtotal}<br/>
                  Shipping: ${order.shipping_fee === 0 ? "Free" : `₹${order.shipping_fee}`}<br/>
                  <span style="font-size: 1.25em;">Total Paid: ₹${order.total}</span>
                </div>
              </div>
            `
          })
        });
        const ownerData = await ownerRes.json();
      }
    } else {
      console.warn("Server: RESEND_API_KEY is not defined in the environment. Skipping emails.");
    }
  } catch (resendErr) {
    console.error("Server: Failed to dispatch confirmation emails via Resend API:", resendErr);
  }


}

// 1. ORDER INITIALIZATION
export const createCheckoutOrder = createServerFn({ method: "POST" })
  .handler(async ({ data: payload, request }) => {
    // Validate request body
    const validation = createCheckoutOrderSchema.safeParse(payload);
    if (!validation.success) {
      throw new Error(`Validation error: ${validation.error.errors.map((e) => e.message).join(", ")}`);
    }

    const { items, customerInfo, shippingAddress } = validation.data;

    // Fetch actual prices from Supabase
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts, error: fetchErr } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", productIds);

    if (fetchErr || !dbProducts) {
      throw new Error(`Failed to retrieve product data: ${fetchErr?.message || "Unknown error"}`);
    }


    // Securely calculate checkout subtotal and total weight
    let subtotal = 0;
    let totalGrams = 0;
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
          (v: string) => parseVariant(v, price).name === item.selectedVariant
        );
        if (matchingVariantStr) {
          price = parseVariant(matchingVariantStr, price).price;
        }
      }
      subtotal += price * item.quantity;

      // Parse weight for shipping fee
      let itemWeightStr = prod.weight;
      if (item.selectedVariant) {
        const weightGrams = parseWeightToGrams(item.selectedVariant);
        if (weightGrams > 0) {
          totalGrams += weightGrams * item.quantity;
          continue;
        }
      }
      totalGrams += parseWeightToGrams(itemWeightStr) * item.quantity;
    }

    const totalWeightKg = totalGrams / 1000;
    const shippingFee = calculateShippingFee(subtotal, shippingAddress.state, totalWeightKg);
    const tax = 0;
    const total = subtotal + shippingFee;

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
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: customerInfo.userId || null,
        guest_email: customerInfo.email || null,
        guest_name: customerInfo.name || null,
        guest_phone: customerInfo.phone || null,
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

    if (orderErr || !order) {
      const diag = {
        hasServiceKey: !!getPlatformEnv("SUPABASE_SERVICE_ROLE_KEY"),
        serviceKeyLength: getPlatformEnv("SUPABASE_SERVICE_ROLE_KEY")?.length || 0,
        hasAnonKey: !!getPlatformEnv("VITE_SUPABASE_ANON_KEY"),
        hasResendKey: !!getPlatformEnv("RESEND_API_KEY"),
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
      hasAppId: !!appId,
      hasSecretKey: !!secretKey,
      cashfreeEnv,
    };
  });

// 2. PAYMENT STATUS VERIFICATION (Used for both live API checking and local simulation sandbox)
export const verifyCheckoutPayment = createServerFn({ method: "POST" })
  .handler(async ({ data: payload }) => {
    // Validate request body
    const validation = verifyCheckoutPaymentSchema.safeParse(payload);
    if (!validation.success) {
      throw new Error(`Validation error: ${validation.error.errors.map((e) => e.message).join(", ")}`);
    }

    const { orderId, cashfreeOrderId, cashfreePaymentId, isMock } = validation.data;

    if (isMock) {
      if (!orderId) throw new Error("Mock verification requires local orderId reference.");
      await completeOrder(orderId, cashfreePaymentId || `pay_mock_${Math.random().toString(36).substring(2, 10)}`);
      return { success: true };
    }


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
    // Validate request body
    const validation = submitFeedbackSchema.safeParse(payload);
    if (!validation.success) {
      throw new Error(`Validation error: ${validation.error.errors.map((e) => e.message).join(", ")}`);
    }

    const { name, email, rating, message } = validation.data;

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
