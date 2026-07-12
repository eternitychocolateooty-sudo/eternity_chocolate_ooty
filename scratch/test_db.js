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
const supabaseAnonKey = envConfig.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key length:", supabaseAnonKey?.length);
console.log("Supabase Service Key length:", supabaseServiceKey?.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: { persistSession: false }
});

async function runTest() {
  console.log("Sending query to Supabase 'products' table...");
  try {
    const start = Date.now();
    const { data, error } = await supabase
      .from("products")
      .select("id, name")
      .limit(3);
    
    console.log(`Query completed in ${Date.now() - start}ms`);
    if (error) {
      console.error("Supabase returned an error:", error);
    } else {
      console.log("Supabase returned data:", data);
    }
  } catch (err) {
    console.error("Exception thrown during query:", err);
  }
}

runTest();
