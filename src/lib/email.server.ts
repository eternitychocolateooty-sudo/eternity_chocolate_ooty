import { getEvent } from "vinxi/http";
import { Resend } from "resend";

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export async function sendOrderEmails(order: any, orderItems: any[]) {
  let resendApiKey = process.env.RESEND_API_KEY;
  let ownerEmail = process.env.ADMIN_EMAIL || "eternitychocolateooty@gmail.com";

  // Resolve Cloudflare bindings from Vinxi HTTP context at runtime
  try {
    const event = getEvent();
    const cf = event?.nativeEvent?.context?.cloudflare;
    if (cf?.env) {
      if (cf.env.RESEND_API_KEY) {
        resendApiKey = cf.env.RESEND_API_KEY;
      }
      if (cf.env.ADMIN_EMAIL) {
        ownerEmail = cf.env.ADMIN_EMAIL;
      }
    }
  } catch (e) {
    console.warn("Could not retrieve Cloudflare native context inside sendOrderEmails:", e);
  }

  if (!resendApiKey) {
    console.error("Resend delivery skipped: RESEND_API_KEY is not defined in any environment scope.");
    return;
  }

  try {
    const resendClient = new Resend(resendApiKey);
    const orderId = order.id;
    const customerEmail = order.guest_email || "";
    const customerName = order.guest_name || "Valued Customer";

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

    // Send to Customer
    if (customerEmail) {
      await resendClient.emails.send({
        from: "ETERNITY Boutique <orders@eternitychocolateooty.in>",
        to: customerEmail,
        subject: `Your ETERNITY Chocolate Order #${orderId.slice(0, 8).toUpperCase()} is Confirmed!`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #EFEBE9; border-radius: 16px; background-color: #FFFFFF;">
            <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #EFEBE9; padding-bottom: 16px;">
              <h1 style="color: #4E342E; font-family: 'Playfair Display', Georgia, serif; margin: 0; font-size: 2.2em; letter-spacing: 0.05em; font-weight: normal;">ETERNITY</h1>
              <p style="color: #8D6E63; margin: 4px 0 0 0; font-size: 0.85em; letter-spacing: 0.2em; text-transform: uppercase;">Artisan Chocolatier</p>
            </div>
            
            <h2 style="color: #4E342E; font-family: serif; font-size: 1.4em; font-weight: normal; margin-top: 0; margin-bottom: 12px;">Order Confirmed</h2>
            <p style="color: #5D4037; line-height: 1.6; font-size: 0.95em;">Dear ${customerName},</p>
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
      console.log(`Resend: Confirmation email dispatched to customer: ${customerEmail}`);
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
                <strong>Name:</strong> ${customerName}<br/>
                <strong>Email:</strong> ${customerEmail || "N/A"}<br/>
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
        `,
      });
      console.log(`Resend: Alert email dispatched to owner: ${ownerEmail}`);
    }
  } catch (err) {
    console.error("Resend email delivery execution failed:", err);
  }
}
