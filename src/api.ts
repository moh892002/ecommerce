import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Product, CartItem, Order, UserProfile, Review, Coupon, ShippingInfo } from "./types";

let supabase: SupabaseClient | null = null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

function isOnline(): boolean {
  return supabase !== null;
}

// ---- localStorage helpers (fallback) ----
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem("shopwave_" + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key: string, data: unknown): void {
  try {
    localStorage.setItem("shopwave_" + key, JSON.stringify(data));
  } catch (e: unknown) {
    if (e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22)) {
      console.warn("localStorage quota exceeded");
    }
  }
}

// ====================
//  Auth  (Supabase + localStorage fallback)
// ====================

interface LocalUser {
  id: string;
  email: string;
  password: string;
}

function getLocalUsers(): LocalUser[] {
  try {
    const d = localStorage.getItem("shopwave_users");
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveLocalUsers(users: LocalUser[]) {
  try { localStorage.setItem("shopwave_users", JSON.stringify(users)); } catch {}
}

function getSession(): { id: string; email: string } | null {
  try {
    const d = localStorage.getItem("shopwave_session");
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

function setSession(user: { id: string; email: string } | null) {
  if (user) {
    localStorage.setItem("shopwave_session", JSON.stringify(user));
  } else {
    localStorage.removeItem("shopwave_session");
  }
}

// Notify auth change listeners
const authListeners: Array<(user: unknown) => void> = [];

export async function signUp(email: string, password: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }
  // localStorage fallback
  const users = getLocalUsers();
  if (users.find(u => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  const newUser: LocalUser = {
    id: "local_" + Date.now().toString(36),
    email,
    password: btoa(password), // simple encoding, not for production
  };
  users.push(newUser);
  saveLocalUsers(users);
  setSession({ id: newUser.id, email: newUser.email });
  authListeners.forEach(cb => cb({ id: newUser.id, email: newUser.email }));
  return { user: { id: newUser.id, email: newUser.email } };
}

export async function signIn(email: string, password: string) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }
  // localStorage fallback
  const users = getLocalUsers();
  const user = users.find(u => u.email === email && u.password === btoa(password));
  if (!user) {
    throw new Error("Invalid email or password.");
  }
  setSession({ id: user.id, email: user.email });
  authListeners.forEach(cb => cb({ id: user.id, email: user.email }));
  return { user: { id: user.id, email: user.email } };
}

export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  setSession(null);
  authListeners.forEach(cb => cb(null));
}

export async function getCurrentUser() {
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  }
  // localStorage fallback
  return getSession();
}

export function onAuthChange(callback: (user: unknown) => void) {
  authListeners.push(callback);
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    return data.subscription.unsubscribe;
  }
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx > -1) authListeners.splice(idx, 1);
  };
}

// ====================
//  Products
// ====================

let hardcodedProducts: Product[] = [
  { id: 1, name: "Wireless Headphones", category: "electronics", price: 59.99, originalPrice: 79.99, sale: true, rating: 4.5, reviews: 128, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center", description: "Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and deep bass sound." },
  { id: 2, name: "Smart Watch", category: "electronics", price: 129.99, originalPrice: null, sale: false, rating: 4.3, reviews: 95, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center", description: "Fitness tracker and smartwatch with heart-rate monitor, GPS, and a vibrant AMOLED display." },
  { id: 3, name: "Bluetooth Speaker", category: "electronics", price: 39.99, originalPrice: 49.99, sale: true, rating: 4.6, reviews: 210, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center", description: "Portable waterproof speaker with 360-degree sound and 12-hour playtime." },
  { id: 4, name: "Cotton T-Shirt", category: "clothing", price: 19.99, originalPrice: null, sale: false, rating: 4.1, reviews: 340, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center", description: "Soft 100% organic cotton tee. Comfortable fit for everyday wear." },
  { id: 5, name: "Denim Jacket", category: "clothing", price: 89.99, originalPrice: 119.99, sale: true, rating: 4.4, reviews: 67, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop&crop=center", description: "Classic denim jacket with a modern slim fit. Features brass buttons and two chest pockets." },
  { id: 6, name: "Running Shoes", category: "clothing", price: 74.99, originalPrice: null, sale: false, rating: 4.7, reviews: 412, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center", description: "Lightweight mesh running shoes with responsive cushioning for maximum comfort." },
  { id: 7, name: "Desk Lamp", category: "home", price: 34.99, originalPrice: 44.99, sale: true, rating: 4.2, reviews: 89, image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop&crop=center", description: "LED desk lamp with adjustable arm, touch dimmer, and built-in USB charging port." },
  { id: 8, name: "Throw Pillow Set", category: "home", price: 24.99, originalPrice: null, sale: false, rating: 4.0, reviews: 156, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop&crop=center", description: "Set of 2 decorative throw pillows with removable linen-feel covers." },
  { id: 9, name: "Wall Clock", category: "home", price: 29.99, originalPrice: null, sale: false, rating: 4.3, reviews: 45, image: "https://images.unsplash.com/photo-1563861826100-9d868c2ad7c6?w=400&h=400&fit=crop&crop=center", description: "Minimalist 12-inch wall clock with silent quartz movement." },
  { id: 10, name: "Sunglasses", category: "accessories", price: 15.99, originalPrice: 24.99, sale: true, rating: 3.9, reviews: 230, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center", description: "UV400 polarized sunglasses in a classic aviator shape. Includes case." },
  { id: 11, name: "Leather Wallet", category: "accessories", price: 44.99, originalPrice: null, sale: false, rating: 4.5, reviews: 178, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&crop=center", description: "Genuine leather bifold wallet with RFID-blocking technology." },
  { id: 12, name: "Backpack", category: "accessories", price: 49.99, originalPrice: 64.99, sale: true, rating: 4.6, reviews: 310, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center", description: "Durable 25L backpack with padded laptop compartment and water-resistant fabric." },
];

export async function getProducts(): Promise<Product[]> {
  if (isOnline()) {
    const { data, error } = await supabase!.from("products").select("*").order("id");
    if (!error && data && data.length > 0) return data as Product[];
  }
  const stored = loadLocal<Product[]>("products", []);
  return stored.length > 0 ? stored : hardcodedProducts;
}

export async function saveProducts(products: Product[]): Promise<void> {
  saveLocal("products", products);
  if (isOnline()) {
    const { error } = await supabase!.from("products").upsert(products, { onConflict: "id" });
    if (error) console.error("Batch upsert failed:", error.message);
  }
}

export async function deleteProductFromDB(id: number): Promise<void> {
  if (isOnline()) {
    await supabase!.from("products").delete().eq("id", id);
  }
}

// ====================
//  Cart (localStorage for guest, Supabase for logged-in)
// ====================

export async function getCart(userId?: string): Promise<CartItem[]> {
  if (userId && isOnline()) {
    const { data } = await supabase!.from("carts").select("*").eq("user_id", userId).single();
    if (data?.items) return data.items as CartItem[];
  }
  return loadLocal<CartItem[]>("cart", []);
}

export async function saveCart(cart: CartItem[], userId?: string): Promise<void> {
  saveLocal("cart", cart);
  if (userId && isOnline()) {
    const existing = await supabase!.from("carts").select("id").eq("user_id", userId).single();
    if (existing.data) {
      await supabase!.from("carts").update({ items: cart }).eq("user_id", userId);
    } else {
      await supabase!.from("carts").insert({ user_id: userId, items: cart });
    }
  }
}

// ====================
//  Orders
// ====================

export async function getOrders(userId?: string): Promise<Order[]> {
  if (userId && isOnline()) {
    const { data } = await supabase!.from("orders").select("*").eq("user_id", userId).order("date", { ascending: false });
    if (data) return data as Order[];
  }
  return loadLocal<Order[]>("orders", []);
}

export async function saveOrder(order: Order, userId?: string): Promise<void> {
  const enriched = { ...order, userId: userId || order.userId || "" };
  const orders = loadLocal<Order[]>("orders", []);
  orders.unshift(enriched);
  saveLocal("orders", orders);
  if (userId && isOnline()) {
    await supabase!.from("orders").insert({ ...enriched, user_id: userId });
  } else {
    saveLocal("orders", orders);
  }
}

// ====================
//  Wishlist
// ====================

export async function getWishlist(userId?: string): Promise<number[]> {
  if (userId && isOnline()) {
    const { data } = await supabase!.from("wishlists").select("product_ids").eq("user_id", userId).single();
    if (data?.product_ids) return data.product_ids as number[];
  }
  return loadLocal<number[]>("wishlist", []);
}

export async function saveWishlist(ids: number[], userId?: string): Promise<void> {
  saveLocal("wishlist", ids);
  if (userId && isOnline()) {
    const existing = await supabase!.from("wishlists").select("id").eq("user_id", userId).single();
    if (existing.data) {
      await supabase!.from("wishlists").update({ product_ids: ids }).eq("user_id", userId);
    } else {
      await supabase!.from("wishlists").insert({ user_id: userId, product_ids: ids });
    }
  }
}

// ====================
//  Reviews
// ====================

export async function getReviews(productId: number): Promise<Review[]> {
  if (isOnline()) {
    const { data } = await supabase!.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
    if (data) return data as Review[];
  }
  return loadLocal<Review[]>(`reviews_${productId}`, []);
}

export async function addReview(review: Review): Promise<void> {
  if (isOnline()) {
    await supabase!.from("reviews").insert(review);
  } else {
    const reviews = loadLocal<Review[]>(`reviews_${review.productId}`, []);
    reviews.unshift(review);
    saveLocal(`reviews_${review.productId}`, reviews);
  }
}

// ====================
//  Categories
// ====================

export async function getCategories(): Promise<string[]> {
  if (isOnline()) {
    const { data } = await supabase!.from("categories").select("name");
    if (data && data.length > 0) return data.map(c => c.name);
  }
  return loadLocal<string[]>("categories", ["electronics", "clothing", "home", "accessories"]);
}

export async function saveCategories(categories: string[]): Promise<void> {
  saveLocal("categories", categories);
  if (isOnline()) {
    await supabase!.from("categories").delete().neq("name", "");
    await supabase!.from("categories").insert(categories.map(name => ({ name })));
  }
}

// ====================
//  Coupons
// ====================

export async function getCoupons(): Promise<Coupon[]> {
  if (isOnline()) {
    const { data } = await supabase!.from("coupons").select("*");
    if (data) return data as Coupon[];
  }
  return loadLocal<Coupon[]>("coupons", []);
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const coupons = await getCoupons();
  const coupon = coupons.find(
    c => c.code.toUpperCase() === code.toUpperCase() && c.active && new Date(c.expiresAt) > new Date()
  );
  return coupon ?? null;
}

// ====================
//  Image Upload (Supabase Storage)
// ====================

export async function uploadImage(file: File): Promise<string | null> {
  if (!isOnline()) return null;
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase!.storage
    .from("product-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) {
    console.error("Image upload failed:", error.message);
    return null;
  }
  const { data: urlData } = supabase!.storage
    .from("product-images")
    .getPublicUrl(data.path);
  return urlData?.publicUrl ?? null;
}

// ====================
//  Utility
// ====================

export function isSupabaseConfigured(): boolean {
  return isOnline();
}
