import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read from process.env (Cloudflare Pages / CI) or .env file (local)
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseKey) && fs.existsSync(".env")) {
  try {
    const envFile = fs.readFileSync(".env", "utf8");
    const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
    if (urlMatch) supabaseUrl = urlMatch[1].trim().replace(/^["']|["']$/g, "");
    if (keyMatch) supabaseKey = keyMatch[1].trim().replace(/^["']|["']$/g, "");
  } catch (err) {
    console.warn("Could not read .env file:", err.message);
  }
}

async function generateSitemap() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️ Supabase credentials not found in process.env or .env. Preserving existing public/sitemap.xml.");
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Fetching live products from Supabase...");
    const { data: products, error } = await supabase
      .from("products")
      .select("slug, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Failed to fetch products from Supabase, preserving existing sitemap:", error.message);
      return;
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
  } catch (err) {
    console.warn("Error generating sitemap, preserving existing sitemap:", err.message);
  }
}

generateSitemap();
