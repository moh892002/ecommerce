/* =============================================
   ShopWave — Data, State & Utilities
   ============================================= */

// ---- Product Data ----
let products = [
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
  { id: 12, name: "Backpack", category: "accessories", price: 49.99, originalPrice: 64.99, sale: true, rating: 4.6, reviews: 310, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center", description: "Durable 25L backpack with padded laptop compartment and water-resistant fabric." }
];

const adminProducts = loadStorage("products", null);
if (adminProducts) products = adminProducts;

// ---- State ----
let cart = loadStorage("cart", []);
let wishlist = loadStorage("wishlist", []).filter(id => products.some(p => p.id === id));
let recentlyViewed = loadStorage("recentlyViewed", []).filter(id => products.some(p => p.id === id));
let currentCategory = "all";
let searchQuery = "";
let sortBy = "default";
let checkoutStep = 1;
let modalQty = 1;
let activeModalProductId = null;
let searchDebounceTimer;
let suggestionDebounceTimer;

// ---- DOM Refs ----
const $ = id => document.getElementById(id);
const productGrid = $("productGrid");
const cartItems = $("cartItems");
const cartBadge = $("cartBadge");
const cartTotal = $("cartTotal");
const cartFooter = $("cartFooter");
const searchInput = $("searchInput");
const searchForm = $("searchForm");
const searchSuggestions = $("searchSuggestions");
const skeletonGrid = $("skeletonGrid");
const noProducts = $("noProducts");
const recentlySection = $("recentlySection");
const recentlyGrid = $("recentlyGrid");
const wishlistBody = $("wishlistBody");
const wishlistBadge = $("wishlistBadge");
const shippingProgressWrap = $("shippingProgressWrap");
const shippingMsg = $("shippingMsg");
const shippingBar = $("shippingBar");
const shippingPercent = $("shippingPercent");
const darkModeToggle = $("darkModeToggle");
const checkoutContent = $("checkoutContent");
const checkoutNext = $("checkoutNext");
const checkoutPrev = $("checkoutPrev");
const checkoutSteps = $("checkoutSteps");
const modalImage = $("modalImage");
const modalName = $("modalName");
const modalCategory = $("modalCategory");
const modalPrice = $("modalPrice");
modalPrice && (modalPrice.style.whiteSpace = "nowrap");
const modalDesc = $("modalDesc");
const modalRating = $("modalRating");
const modalQtyEl = $("modalQty");
const modalAddCart = $("modalAddCart");
const modalWishlist = $("modalWishlist");
const chatToggle = $("chatToggle");
const chatBox = $("chatBox");
const chatBody = $("chatBody");
const chatInput = $("chatInput");
const chatSend = $("chatSend");
const newsletterForm = $("newsletterForm");
const newsletterMsg = $("newsletterMsg");
const mainToast = $("mainToast");
const toastMessage = $("toastMessage");

// ---- Constants ----
const FREE_SHIPPING_THRESHOLD = 50;
const FALLBACK_IMG = "https://placehold.co/400x400?text=Unavailable";

// ---- localStorage ----
function loadStorage(key, fallback) {
  try {
    const val = localStorage.getItem("shopwave_" + key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveStorage(key, data) {
  localStorage.setItem("shopwave_" + key, JSON.stringify(data));
}

function safeSave(key, data) {
  try {
    saveStorage(key, data);
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      showToast("Storage is full. Try clearing some data.", "danger");
    } else {
      showToast("Could not save data. " + e.message, "danger");
    }
  }
}

// ---- Toast Queue ----
const toastQueue = [];
let toastShowing = false;

function showToast(msg, type = "success") {
  toastQueue.push({ msg, type });
  processToastQueue();
}

function processToastQueue() {
  if (toastShowing || toastQueue.length === 0) return;
  toastShowing = true;
  const { msg, type } = toastQueue.shift();
  const bg = { success: "text-bg-success", danger: "text-bg-danger", info: "text-bg-info" };
  mainToast.className = "toast align-items-center border-0 " + (bg[type] || bg.success);
  toastMessage.textContent = msg;
  const t = bootstrap.Toast.getOrCreateInstance(mainToast);
  t.show();
  mainToast.addEventListener("hidden.bs.toast", () => {
    toastShowing = false;
    processToastQueue();
  }, { once: true });
}
