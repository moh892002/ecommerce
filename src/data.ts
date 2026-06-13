import type { Product, CartItem, SortOption, CheckoutStep } from "./types";

// ---- State ----
export let products: Product[] = [];
export let cart: CartItem[] = [];
export let wishlist: number[] = [];
export let recentlyViewed: number[] = [];
export let currentCategory = "all";
export let searchQuery = "";
export let sortBy: SortOption = "default";
export let priceMin: number | null = null;
export let priceMax: number | null = null;
export let checkoutStep: CheckoutStep = 1;
export let modalQty = 1;
export let activeModalProductId: number | null = null;
export let searchDebounceTimer: number | undefined;
export let suggestionDebounceTimer: number | undefined;

// Auth
export let currentUserId: string | null = null;
export let currentUserEmail: string | null = null;

// Coupon
export let activeCoupon: { code: string; discountPercent: number } | null = null;

export function setProducts(p: Product[]) { products = p; }
export function setCart(c: CartItem[]) { cart = c; }
export function setWishlist(w: number[]) { wishlist = w; }
export function setUserId(id: string | null) { currentUserId = id; }
export function setUserEmail(email: string | null) { currentUserEmail = email; }
export function setCurrentCategory(c: string) { currentCategory = c; }
export function setSearchQuery(q: string) { searchQuery = q; }
export function setPriceMin(v: number | null) { priceMin = v; }
export function setPriceMax(v: number | null) { priceMax = v; }
export function setSortBy(s: SortOption) { sortBy = s; }
export function setCheckoutStep(s: CheckoutStep) { checkoutStep = s; }
export function setModalQty(q: number) { modalQty = q; }
export function setActiveModalProductId(id: number | null) { activeModalProductId = id; }
export function setSearchDebounceTimer(t: number | undefined) { searchDebounceTimer = t; }
export function setSuggestionDebounceTimer(t: number | undefined) { suggestionDebounceTimer = t; }
export function setRecentlyViewed(rv: number[]) { recentlyViewed = rv; }
export function setActiveCoupon(c: { code: string; discountPercent: number } | null) { activeCoupon = c; }

// ---- DOM Refs ----
export const $ = (id: string): HTMLElement | null => document.getElementById(id);

export const productGrid = $("productGrid");
export const cartItems = $("cartItems");
export const cartBadge = $("cartBadge");
export const cartTotal = $("cartTotal");
export const cartFooter = $("cartFooter");
export const searchInput = $("searchInput") as HTMLInputElement | null;
export const searchForm = $("searchForm") as HTMLFormElement | null;
export const searchSuggestions = $("searchSuggestions");
export const skeletonGrid = $("skeletonGrid");
export const noProducts = $("noProducts");
export const recentlySection = $("recentlySection");
export const recentlyGrid = $("recentlyGrid");
export const wishlistBody = $("wishlistBody");
export const wishlistBadge = $("wishlistBadge");
export const shippingProgressWrap = $("shippingProgressWrap");
export const shippingMsg = $("shippingMsg");
export const shippingBar = $("shippingBar");
export const shippingPercent = $("shippingPercent");
export const darkModeToggle = $("darkModeToggle");
export const checkoutContent = $("checkoutContent");
export const checkoutNext = $("checkoutNext") as HTMLButtonElement | null;
export const checkoutPrev = $("checkoutPrev") as HTMLButtonElement | null;
export const checkoutSteps = $("checkoutSteps");
export const modalImage = $("modalImage") as HTMLImageElement | null;
export const modalName = $("modalName");
export const modalCategory = $("modalCategory");
export const modalPrice = $("modalPrice");
export const modalDesc = $("modalDesc");
export const modalRating = $("modalRating");
export const modalQtyEl = $("modalQty");
export const modalAddCart = $("modalAddCart");
export const modalWishlist = $("modalWishlist");
export const chatToggle = $("chatToggle");
export const chatBox = $("chatBox");
export const chatBody = $("chatBody");
export const chatInput = $("chatInput") as HTMLInputElement | null;
export const chatSend = $("chatSend");
export const newsletterForm = $("newsletterForm") as HTMLFormElement | null;
export const newsletterMsg = $("newsletterMsg");
export const mainToast = $("mainToast");
export const toastMessage = $("toastMessage");

if (modalPrice) modalPrice.style.whiteSpace = "nowrap";

// ---- Toast Queue ----
const toastQueue: { msg: string; type: string }[] = [];
let toastShowing = false;

export function showToast(msg: string, type: "success" | "danger" | "info" = "success") {
  toastQueue.push({ msg, type });
  processToastQueue();
}

function processToastQueue() {
  if (toastShowing || toastQueue.length === 0) return;
  toastShowing = true;
  const { msg, type } = toastQueue.shift()!;
  const bg: Record<string, string> = { success: "text-bg-success", danger: "text-bg-danger", info: "text-bg-info" };
  if (mainToast) {
    mainToast.className = "toast align-items-center border-0 " + (bg[type] || bg.success);
  }
  if (toastMessage) toastMessage.textContent = msg;
  if (mainToast) {
    const t = (bootstrap as any).Toast.getOrCreateInstance(mainToast);
    t.show();
    mainToast.addEventListener("hidden.bs.toast", () => {
      toastShowing = false;
      processToastQueue();
    }, { once: true });
  }
}

// ---- Dark Mode ----
export function applyTheme(theme: string) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  const icon = darkModeToggle?.querySelector("i");
  if (icon) icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-fill";
  try { localStorage.setItem("shopwave_darkMode", theme); } catch {}
}

export function toggleDarkMode() {
  const current = document.documentElement.getAttribute("data-bs-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}
