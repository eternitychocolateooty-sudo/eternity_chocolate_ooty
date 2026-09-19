import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env
const envFile = fs.readFileSync(".env", "utf8");
const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateSitemap() {
  console.log("Fetching live products from Supabase...");
  const { data: products, error } = await supabase
    .from("products")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products:", error);
    process.exit(1);
  }

  const today = new Date().toISOString().split("T")[0];
  const baseUrl = "https://eternitychocolateooty.in";

  const staticRoutes = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/collections", priority: "0.9", changefreq: "weekly" },
    { url: "/story", priority: "0.7", changefreq: "monthly" },
    { url: "/visit", priority: "0.8", changefreq: "monthly" },
    { url: "/gallery", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy", priority: "0.3", changefreq: "yearly" },
    { url: "/refund", priority: "0.3", changefreq: "yearly" },
    { url: "/shipping", priority: "0.3", changefreq: "yearly" },
    { url: "/terms", priority: "0.3", changefreq: "yearly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  for (const route of staticRoutes) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Real Supabase products (filter out temporary test product like 'testing')
  const validProducts = (products || []).filter((p) => p.slug && p.slug !== "testing");

  for (const product of validProducts) {
    const lastMod = product.created_at
      ? product.created_at.split("T")[0]
      : today;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/products/${product.slug}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const sitemapPath = path.resolve("public", "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`Successfully generated sitemap with ${staticRoutes.length} static pages and ${validProducts.length} real products!`);
}

generateSitemap();
