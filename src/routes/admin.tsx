import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { Boxes, IndianRupee, MapPin, PackageCheck, ShoppingBag, User, Users, Star, Loader2, Upload, Trash2, FileText, CheckCircle2, Pencil } from "lucide-react";
import { formatMoney, categories } from "@/data/shop";
import { supabase } from "@/lib/supabase";
import { resolveProductImage } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    // Client-side authentication guard for SSR safety
    if (typeof window !== "undefined") {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw redirect({ to: "/account" });
      }
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
      if (error || profile?.role !== "admin") {
        console.warn("Unauthorized admin route access attempt.");
        throw redirect({ to: "/" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Admin Console - ETERNITY" },
      {
        name: "description",
        content: "Admin dashboard console for ETERNITY e-commerce operations.",
      },
    ],
  }),
  component: AdminConsole,
});

const compressImage = (file: File, maxW = 1600, maxH = 1600, quality = 0.90): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas conversion to Blob failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

function AdminConsole() {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  // Loading states
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  const handleStartEdit = (product: any) => {
    setEditMode(true);
    setEditProductId(product.id);
    setShowAddForm(true);

    setProdId(product.id);
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description || "");
    setCategory(product.category);
    setPrice(String(product.price));
    setSalePrice(product.sale_price ? String(product.sale_price) : "");
    setStockQuantity(String(product.stock_quantity));
    setFeatured(!!product.featured);
    setWeight(product.weight || "");
    setIngredientsText(product.ingredients ? product.ingredients.join(", ") : "");
    setVariantsText(product.variants ? product.variants.join(", ") : "");
    
    const initialImages = (product.images || []).map((imgUrl: string, idx: number) => ({
      id: `existing-${idx}-${Date.now()}`,
      url: imgUrl,
    }));
    setImagesList(initialImages);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditProductId(null);
    setShowAddForm(false);

    setProdId("");
    setName("");
    setSlug("");
    setDescription("");
    setCategory("Chocolate");
    setPrice("");
    setSalePrice("");
    setStockQuantity("");
    setFeatured(false);
    setWeight("");
    setIngredientsText("");
    setVariantsText("");
    setImagesList([]);
  };

  // New Product Fields
  const [prodId, setProdId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Chocolate");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [featured, setFeatured] = useState(false);
  const [weight, setWeight] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [variantsText, setVariantsText] = useState("");
  const [imagesList, setImagesList] = useState<{ id: string; url: string; file?: File }[]>([]);

  // Fetch Data Functions
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setProducts(data || []);
    } catch (err) {
      console.error("Products load failed:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*))")
        .order("created_at", { ascending: false });
      if (!error) setOrders(data || []);
    } catch (err) {
      console.error("Orders load failed:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // Sync slug with name when typing
  useEffect(() => {
    if (!showAddForm || editMode) return;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
    setProdId(`cc-${generatedSlug.substring(0, 15)}`);
  }, [name, showAddForm, editMode]);

  const handleFilesChange = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles: File[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" has an invalid type. Only JPG, PNG, WEBP, and GIF images are allowed.`);
        continue;
      }
      if (!allowedExtensions.includes(ext)) {
        alert(`File "${file.name}" has an invalid extension.`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`File "${file.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    const newItems = validFiles.map((file) => ({
      id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setImagesList((prev) => [...prev, ...newItems]);
  };


  const handleRemoveImage = (id: string) => {
    setImagesList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const finalUrls: string[] = [];

      // 1. Upload new images and construct list of URLs
      for (const item of imagesList) {
        if (item.file) {
          let fileToUpload: File | Blob = item.file;
          let fileExt = item.file.name.split(".").pop() || "jpg";

          if (item.file.type.startsWith("image/")) {
            try {
              fileToUpload = await compressImage(item.file, 1600, 1600, 0.90);
              fileExt = "jpg";
            } catch (err) {
              console.error("Image compression failed, using original file:", err);
            }
          }

          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const { error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(fileName, fileToUpload, {
              contentType: fileExt === "jpg" ? "image/jpeg" : item.file.type
            });

          if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          finalUrls.push(publicUrl);
        } else {
          finalUrls.push(item.url);
        }
      }

      // 2. Format inputs
      const finalPrice = Number(price);
      const finalSalePrice = salePrice ? Number(salePrice) : null;
      const finalStock = Number(stockQuantity);
      
      const ingredients = ingredientsText
        ? ingredientsText.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      
      const variants = variantsText
        ? variantsText.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      let status = "available";
      if (finalStock === 0) status = "sold-out";
      else if (finalStock < 10) status = "low-stock";

      // 3. Save or Update in database
      let newProd: any;
      if (editMode && editProductId) {
        const updateData: any = {
          name,
          slug,
          description,
          category,
          price: finalPrice,
          sale_price: finalSalePrice,
          stock_quantity: finalStock,
          featured,
          weight,
          status,
          variants,
          ingredients,
          images: finalUrls,
        };

        const { data, error: dbErr } = await supabase
          .from("products")
          .update(updateData)
          .eq("id", editProductId)
          .select()
          .single();

        if (dbErr) throw dbErr;
        newProd = data;
        setProducts((prev) => prev.map((p) => p.id === editProductId ? newProd : p));
        alert("Product updated successfully!");
      } else {
        const { data, error: dbErr } = await supabase
          .from("products")
          .insert({
            id: prodId || `cc-${Date.now()}`,
            name,
            slug,
            description,
            category,
            price: finalPrice,
            sale_price: finalSalePrice,
            stock_quantity: finalStock,
            featured,
            images: finalUrls,
            ingredients,
            weight,
            status,
            variants,
          })
          .select()
          .single();

        if (dbErr) throw dbErr;
        newProd = data;
        setProducts((prev) => [newProd, ...prev]);
        alert("Product added successfully!");
      }

      handleCancelEdit();
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkOrderFulfilled = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ fulfillment_status: "fulfilled" })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, fulfillment_status: "fulfilled" } : o))
      );
      alert("Order marked as fulfilled!");
    } catch (err: any) {
      alert(`Fulfillment update failed: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This will delete the SKU forever.")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("Product deleted successfully.");
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Metrics
  const activeSkus = products.filter((p) => p.status !== "sold-out").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);
  const paidOrdersCount = orders.filter((o) => o.payment_status === "paid").length;

  return (
    <div className="pb-24">
      {/* HEADER HERO */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Admin Console</p>
        <h1 className="mt-4 font-display text-5xl md:text-7xl text-balance">
          Operations, catalog, and orders console.
        </h1>
      </section>

      <section className="container mx-auto px-6">
        {/* Metric Cards Banner */}
        <div className="grid gap-5 md:grid-cols-3 mb-10">
          {[
            { Icon: IndianRupee, label: "Revenue", value: formatMoney(totalRevenue) },
            { Icon: PackageCheck, label: "Paid Orders", value: String(paidOrdersCount) },
            { Icon: Boxes, label: "Active SKUs", value: String(activeSkus) },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="rounded-3xl bg-card p-6 shadow-soft border border-border/50">
              <Icon className="mb-5 h-6 w-6 text-accent" />
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-3xl">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex border-b border-border mb-8 gap-6">
          {[
            { id: "catalog", label: "Product Catalog", Icon: Boxes },
            { id: "orders", label: "Orders Fulfillment", Icon: ShoppingBag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 font-display text-lg tracking-wide transition-all ${
                activeTab === tab.id
                  ? "border-b-2 border-accent text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.Icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT PANELS */}

        {/* 1. CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Products List Table */}
            <div className="rounded-3xl bg-card p-6 shadow-luxe border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">Products Inventory</h2>
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground font-medium hover:opacity-90"
                  >
                    Add new product
                  </button>
                )}
              </div>

              {loadingProducts ? (
                <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
              ) : products.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground text-sm">No products found in the catalog database.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-border p-4 last:border-b-0"
                    >
                      <img
                        src={resolveProductImage(product.images[0])}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-display text-xl">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.category} · Stock: {product.stock_quantity} · Price: {formatMoney(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${
                          product.status === "available" ? "bg-green-100 text-green-800" : product.status === "low-stock" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                        }`}>
                          {product.status}
                        </span>
                        <button
                          onClick={() => handleStartEdit(product)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary text-muted-foreground transition-all"
                          title="Edit SKU"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="grid h-8 w-8 place-items-center rounded-full hover:bg-destructive/15 text-destructive transition-all"
                          title="Delete SKU"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Form to Add Product */}
            <aside>
              {showAddForm ? (
                <div className="rounded-3xl bg-card p-6 shadow-luxe border border-border/50 space-y-4">
                  <h3 className="font-display text-2xl border-b border-border pb-3 mb-2">
                    {editMode ? "Edit Chocolate SKU" : "New Chocolate SKU"}
                  </h3>
                  
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Product ID</span>
                      <input
                        required
                        disabled={editMode}
                        value={prodId}
                        onChange={(e) => setProdId(e.target.value)}
                        placeholder="cc-hazelnut-truffle"
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none disabled:opacity-50"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Product Name</span>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Hazelnut Truffle"
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Product Slug</span>
                      <input
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="hazelnut-truffle"
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Category</span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                      >
                        {categories.filter((cat) => cat !== "All").map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Price (₹)</span>
                        <input
                          required
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="450"
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Sale Price (₹)</span>
                        <input
                          type="number"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                          placeholder="400"
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Stock Qty</span>
                        <input
                          required
                          type="number"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          placeholder="25"
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Weight</span>
                        <input
                          required
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="120 g"
                          className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Description</span>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Double stone-ground chocolate infused with roasted hazelnuts..."
                        rows={2}
                        className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none resize-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Ingredients (comma separated)</span>
                      <input
                        value={ingredientsText}
                        onChange={(e) => setIngredientsText(e.target.value)}
                        placeholder="Cocoa butter, Hazelnuts, Milk"
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent">Variants (comma separated)</span>
                      <input
                        value={variantsText}
                        onChange={(e) => setVariantsText(e.target.value)}
                        placeholder="e.g. 50 g: 150, 100 g: 280, 150 g: 400"
                        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none"
                      />
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground block mt-1">
                        Use <strong>Name: Price</strong> format (e.g. <code>50 g: 150</code>) to assign specific prices to variants.
                      </span>
                    </label>

                    {/* Image File Picker */}
                    <div className="block">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-accent block mb-2">Product Images</span>
                      <div className="grid grid-cols-3 gap-3">
                        {imagesList.map((item) => (
                          <div key={item.id} className="relative aspect-square border border-border rounded-xl overflow-hidden group bg-muted/20 flex items-center justify-center">
                            <img src={resolveProductImage(item.url)} alt="Product" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(item.id)}
                              className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow hover:bg-destructive/95 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete photo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        
                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent transition-all bg-background min-h-[80px]">
                          <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                          <span className="text-[10px] text-muted-foreground text-center px-1">Add Photos</span>
                          <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="accent-accent h-4 w-4"
                      />
                      <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">Feature on homepage</span>
                    </label>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-full bg-primary py-2.5 text-xs text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting ? "Saving..." : editMode ? "Save changes" : "Save product"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-full border border-border px-5 py-2.5 text-xs font-medium hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-3xl bg-secondary p-6 text-center border border-border/50">
                  <p className="font-display text-lg">Product Registration</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Click "Add new product" to open the creation dashboard form.</p>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* 2. ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            <h2 className="font-display text-2xl mb-6">Orders Fulfillment Console</h2>
            
            {loadingOrders ? (
              <div className="flex py-12 justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : orders.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">No orders recorded in the system.</p>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-3xl bg-card p-6 shadow-soft border border-border/50 grid gap-6 md:grid-cols-[1fr_320px]">
                    <div className="space-y-4">
                      {/* Title & Metadata */}
                      <div className="flex flex-wrap items-center gap-4 border-b border-border pb-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-accent">Order ID</p>
                          <p className="font-mono text-sm font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fulfillment Status</p>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] uppercase font-semibold mt-1 ${
                            order.fulfillment_status === "fulfilled" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.fulfillment_status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payment Status</p>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] uppercase font-semibold mt-1 ${
                            order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-800"
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                          <p className="text-sm font-semibold mt-1">{formatMoney(Number(order.total))}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Purchased Items</p>
                        <div className="space-y-2">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex gap-3 text-sm">
                              <span className="font-semibold text-accent shrink-0">{item.quantity}x</span>
                              <span className="text-foreground">{item.products?.name || "Artisan Chocolate"}{item.selected_variant ? ` (${item.selected_variant})` : ""}</span>
                              <span className="text-muted-foreground ml-auto">{formatMoney(Number(item.price) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Delivery & Actions Card */}
                    <div className="rounded-2xl bg-secondary p-5 space-y-4 border border-border/80 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3.5 w-3.5 text-accent" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</span>
                          </div>
                          <p className="text-xs text-foreground font-semibold">
                            {order.guest_name || "Authenticated User"}<br/>
                            {order.guest_email || ""}<br/>
                            {order.guest_phone || ""}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-3.5 w-3.5 text-accent" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Address</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_address?.firstName} {order.shipping_address?.lastName}<br/>
                            {order.shipping_address?.address}<br/>
                            {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}
                          </p>
                        </div>
                      </div>

                      {order.fulfillment_status === "pending" ? (
                        <button
                          onClick={() => handleMarkOrderFulfilled(order.id)}
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs text-primary-foreground font-medium hover:opacity-90"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Fulfilled
                        </button>
                      ) : (
                        <span className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-green-200 bg-green-50/50 py-2.5 text-xs text-green-700 font-semibold select-none">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Order Fulfilled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </section>
    </div>
  );
}
