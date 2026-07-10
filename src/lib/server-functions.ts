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

  // A. Send confirmation email using Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.ADMIN_EMAIL || "eternitychocolateooty@gmail.com";

  if (resendApiKey) {
    try {
      const { Resend } = await import("resend");
      const resendClient = new Resend(resendApiKey);

      const itemsSummaryHtml = orderItems
        ? orderItems
            .map((item) => {
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
        : order.shipping_address) as ShippingAddress;

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

      // Send to customer
      if (emailToUse) {
        await resendClient.emails.send({
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
                No 7,8, Bharathiyar Complex, Charring Cross, Upper Bazar, Ooty, Tamil Nadu 643001<br/>
                Need help? Reply to this email or contact support.
              </div>
            </div>
          `,
        });
      }

      // Send alert to Store Owner
      if (ownerEmail) {
        await resendClient.emails.send({
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
                  <strong>Phone:</strong> ${customerPhone || "N/A"}<br/>
                  <strong>Order ID:</strong> ${orderId}<br/>
                  <strong>Cashfree Payment ID:</strong> ${cashfreePaymentId}
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
                <span style="font-size: 1.2em;">Total Paid: ₹${order.total}</span>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error("Resend email delivery failed:", emailErr);
    }
  }

  // B. Meta WhatsApp Cloud API Alerts (direct HTTP fetch calls)
  const waToken = process.env.META_WHATSAPP_TOKEN;
  const waPhoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const ownerPhone = process.env.OWNER_WHATSAPP_NUMBER;

  if (waToken && waPhoneId) {
    const baseWhatsAppUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
    
    // Alert Owner
    if (ownerPhone) {
      try {
        const response = await fetch(baseWhatsAppUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${waToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: ownerPhone,
            type: "template",
            template: {
              name: "order_alert_owner", // template name
              language: { code: "en_US" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: orderId.slice(0, 8).toUpperCase() },
                    { type: "text", text: String(order.total) },
                    { type: "text", text: nameToUse },
                  ],
                },
              ],
            },
          }),
        });
        const resData = await response.json();
        console.log("Server: WhatsApp owner alert response status:", response.status, resData);
      } catch (waErr) {
        console.error("WhatsApp owner notification failed:", waErr);
      }
    }

    // Alert Customer
    if (customerPhone) {
      try {
        const response = await fetch(baseWhatsAppUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${waToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: customerPhone,
            type: "template",
            template: {
              name: "order_confirmation_customer", // template name
              language: { code: "en_US" },
              components: [
                {
                  type: "body",
                  parameters: [
                    { type: "text", text: nameToUse },
                    { type: "text", text: orderId.slice(0, 8).toUpperCase() },
                    { type: "text", text: String(order.total) },
                  ],
                },
              ],
            },
          }),
        });
        const resData = await response.json();
        console.log("Server: WhatsApp customer alert response status:", response.status, resData);
      } catch (waErr) {
        console.error("WhatsApp customer notification failed:", waErr);
      }
    }
  }
}

// 1. ORDER INITIALIZATION
export const createCheckoutOrder = createServerFn({ method: "POST" })
  .handler(async ({ data: payload }) => {
    const { items, customerInfo, shippingAddress } = payload;
    console.log("Server: createCheckoutOrder payload received", { itemsCount: items?.length, customerInfo });

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

    const appId = process.env.VITE_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const cashfreeEnv = process.env.VITE_CASHFREE_ENV || "TEST";

    let cashfreeOrderId = `CF-ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let paymentSessionId = "";
    let isMock = false;

    if (!appId || !secretKey || appId === "your-cashfree-app-id" || secretKey === "your-cashfree-secret-key") {
      console.warn("Cashfree API credentials missing or placeholder. Initiating MOCK payment order.");
      paymentSessionId = `mock_session_${Math.random().toString(36).substring(2, 15)}`;
      isMock = true;
    } else {
      try {
        const host = cashfreeEnv === "PROD" ? "api.cashfree.com" : "sandbox.cashfree.com";
        const returnUrl = `${process.env.VITE_SITE_URL || "https://eternitychocolateooty.in"}/checkout?order_id={order_id}`;

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
      throw new Error(`Failed to record order: ${orderErr?.message || "Unknown error"}`);
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

    const appId = process.env.VITE_CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const cashfreeEnv = process.env.VITE_CASHFREE_ENV || "TEST";

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

    // Trigger Resend email notification to owner
    const resendApiKey = process.env.RESEND_API_KEY;
    const ownerEmail = process.env.ADMIN_EMAIL || "eternitychocolateooty@gmail.com"; // Owner email

    if (resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resendClient = new Resend(resendApiKey);

        await resendClient.emails.send({
          from: "ETERNITY Feedback System <feedback@eternitychocolateooty.in>",
          to: ownerEmail,
          subject: `New Customer Feedback: ${rating} Stars from ${name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #FFFDE7;">
              <h2 style="color: #F57F17; font-family: serif; border-bottom: 2px solid #FBC02D; padding-bottom: 10px;">New Feedback Received</h2>
              <p><strong>Customer Name:</strong> ${name}</p>
              <p><strong>Customer Email:</strong> ${email}</p>
              <p><strong>Rating:</strong> ${rating} / 5 Stars</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background-color: #FFF9C4; padding: 15px; border-left: 5px solid #FBC02D; border-radius: 4px; font-style: italic;">
                "${message}"
              </blockquote>
              <p style="margin-top: 25px; font-size: 0.8em; color: #757575;">
                Submitted at: ${new Date(fb.created_at).toLocaleString()}
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("Resend feedback notification email delivery failed:", emailErr);
      }
    }

    return { success: true };
  });
