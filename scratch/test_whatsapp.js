import fs from "fs";
import path from "path";

// Manually parse .env file
const envPath = path.resolve(process.cwd(), ".env");
const envConfig = fs.readFileSync(envPath, "utf-8")
  .split("\n")
  .reduce((acc, line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      acc[key] = value.trim();
    }
    return acc;
  }, {});

const waToken = envConfig.META_WHATSAPP_TOKEN;
const waPhoneId = envConfig.META_WHATSAPP_PHONE_NUMBER_ID;
const ownerPhone = envConfig.OWNER_WHATSAPP_NUMBER;

console.log("WhatsApp Phone ID:", waPhoneId);
console.log("Owner Phone:", ownerPhone);
console.log("Token length:", waToken?.length);

const baseWhatsAppUrl = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;

async function runTest() {
  console.log("Sending POST request to Meta WhatsApp API...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const start = Date.now();
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
          name: "hello_world",
          language: { code: "en_US" }
        },
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    console.log(`API response status: ${response.status} (${response.statusText}) in ${Date.now() - start}ms`);
    
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Exception thrown during WhatsApp API call:", err);
  }
}

runTest();
