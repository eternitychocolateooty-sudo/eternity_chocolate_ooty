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
  console.log("Querying orders table metadata...");
  try {
    // We can run an RPC or query an arbitrary row to see keys, or inspect PostgREST OpenAPI schema
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`);
    const schema = await response.json();
    
    if (schema && schema.definitions && schema.definitions.orders) {
      const properties = schema.definitions.orders.properties;
      console.log("Columns in 'orders' table:", Object.keys(properties));
    } else {
      // Fallback: try fetching 1 row and inspecting keys
      const { data, error } = await supabase.from("orders").select("*").limit(1);
      if (error) {
        console.error("Select error:", error);
      } else if (data && data.length > 0) {
        console.log("Columns from row data:", Object.keys(data[0]));
      } else {
        console.log("No rows found in table. Schema definitions:", schema?.definitions?.orders);
      }
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
