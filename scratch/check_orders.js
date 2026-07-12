import { createClient } from "@supabase/supabase-js";
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

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log("Fetching recent orders...");
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, payment_status, total, guest_name, guest_email")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Supabase error:", error);
    } else {
      console.log("Recent orders:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
