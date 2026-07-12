import { Resend } from "resend";
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

const resendApiKey = envConfig.RESEND_API_KEY;
console.log("Resend API Key length:", resendApiKey?.length);

async function runTest() {
  if (!resendApiKey) {
    console.log("No Resend API key found.");
    return;
  }
  console.log("Sending email test via Resend...");
  try {
    const start = Date.now();
    const resendClient = new Resend(resendApiKey);
    const result = await resendClient.emails.send({
      from: "onboarding@resend.dev",
      to: "muzammil041204@gmail.com",
      subject: "Test email",
      html: "<p>Test</p>"
    });
    console.log(`Resend completed in ${Date.now() - start}ms`);
    console.log("Result:", result);
  } catch (err) {
    console.error("Exception thrown during Resend call:", err);
  }
}

runTest();
