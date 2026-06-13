import "@supabase/supabase-js";
import * as state from "./data";
import * as shop from "./shop";
import * as api from "./api";
import { getProducts, saveOrder, saveCart } from "./api";
import type { Order } from "./types";
import { renderAuthModalBody, initAuth, updateAuthUI } from "./auth";
import { initAnalytics, captureEvent, identifyUser, resetAnalytics } from "./analytics";
import "./styles/style.css";

// ---- Chat ----
let chatOpen = false;

state.chatToggle?.addEventListener("click", () => {
  chatOpen = !chatOpen;
  state.chatBox?.classList.toggle("d-none", !chatOpen);
  state.chatToggle!.innerHTML = chatOpen ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-chat-dots-fill"></i>';
});

state.chatSend?.addEventListener("click", () => {
  const msg = state.chatInput?.value.trim();
  if (!msg) return;
  shop.appendChatMsg(msg, "sent");
  if (state.chatInput) state.chatInput.value = "";
  setTimeout(() => shop.appendChatMsg("Thanks for reaching out! Our team will get back to you shortly.", "received"), 800);
});

state.chatInput?.addEventListener("keydown", e => { if (e.key === "Enter") state.chatSend?.click(); });

// ---- Product Grid ----
state.productGrid?.addEventListener("click", e => {
  const target = e.target as HTMLElement;
  const wlBtn = target.closest(".wishlist-btn") as HTMLElement | null;
  if (wlBtn) {
    e.stopPropagation();
    shop.toggleWishlist(parseInt(wlBtn.dataset.id!), wlBtn);
    return;
  }
  const cartBtn = target.closest(".add-to-cart") as HTMLElement | null;
  if (cartBtn) {
    e.stopPropagation();
    shop.addToCart(parseInt(cartBtn.dataset.id!));
    return;
  }
  const cardImg = target.closest(".card-img-container") as HTMLElement | null;
  const cardTitle = target.closest(".card-title") as HTMLElement | null;
  if (cardImg || cardTitle) {
    const id = parseInt((cardImg || cardTitle)!.dataset.id!);
    if (id) shop.openProductModal(id);
    return;
  }
  const card = target.closest(".product-card") as HTMLElement | null;
  if (card && !target.closest("button")) {
    const id = parseInt(card.dataset.id!);
    if (id) shop.openProductModal(id);
  }
});

// ---- Recently Viewed ----
state.recentlyGrid?.addEventListener("click", e => {
  const card = (e.target as HTMLElement).closest(".product-card") as HTMLElement | null;
  if (card) {
    const id = parseInt(card.dataset.id!);
    if (id) shop.openProductModal(id);
  }
});

// ---- Cart ----
state.cartItems?.addEventListener("click", e => {
  const btn = (e.target as HTMLElement).closest("button") as HTMLElement | null;
  if (!btn) return;
  const id = parseInt(btn.dataset.id!);
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  if (btn.classList.contains("inc-qty")) item.qty++;
  else if (btn.classList.contains("dec-qty")) {
    if (--item.qty <= 0) state.setCart(state.cart.filter(i => i.id !== id));
  } else if (btn.classList.contains("remove-item")) state.setCart(state.cart.filter(i => i.id !== id));
  shop.renderCart();
});

// ---- Wishlist Body ----
state.wishlistBody?.addEventListener("click", e => {
  const btn = (e.target as HTMLElement).closest("button") as HTMLElement | null;
  if (!btn) return;
  const id = parseInt(btn.dataset.id!);
  if (btn.classList.contains("add-to-cart")) shop.addToCart(id);
  else if (btn.classList.contains("remove-wishlist")) shop.toggleWishlist(id, btn);
});

// ---- Filter & Sort ----
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.setCurrentCategory((btn as HTMLElement).dataset.category!);
    shop.renderProducts();
  });
});

document.getElementById("sortSelect")?.addEventListener("change", e => {
  state.setSortBy((e.target as HTMLSelectElement).value as any);
  shop.renderProducts();
});

// ---- Search ----
state.searchForm?.addEventListener("submit", e => {
  e.preventDefault();
  state.setSearchQuery(state.searchInput?.value.trim() || "");
  if (state.searchSuggestions) state.searchSuggestions.style.display = "none";
  shop.renderProducts();
});

state.searchInput?.addEventListener("input", e => {
  state.setSearchQuery((e.target as HTMLInputElement).value.trim());
  shop.updateSuggestions(state.searchQuery);
  if (state.searchDebounceTimer) clearTimeout(state.searchDebounceTimer);
  state.setSearchDebounceTimer(setTimeout(() => shop.renderProducts(), 150));
});

state.searchInput?.addEventListener("blur", () => {
  setTimeout(() => { if (state.searchSuggestions) state.searchSuggestions.style.display = "none"; }, 200);
});

state.searchSuggestions?.addEventListener("mousedown", e => {
  const item = (e.target as HTMLElement).closest(".suggest-item") as HTMLElement | null;
  if (item) {
    const id = parseInt(item.dataset.id!);
    shop.openProductModal(id);
    if (state.searchSuggestions) state.searchSuggestions.style.display = "none";
  }
});

// ---- Modal Qty ----
document.getElementById("modalQtyDec")?.addEventListener("click", () => {
  if (state.modalQty > 1) state.setModalQty(state.modalQty - 1);
  if (state.modalQtyEl) state.modalQtyEl.textContent = String(state.modalQty);
});
document.getElementById("modalQtyInc")?.addEventListener("click", () => {
  state.setModalQty(state.modalQty + 1);
  if (state.modalQtyEl) state.modalQtyEl.textContent = String(state.modalQty);
});

// ---- Modal Add to Cart ----
state.modalAddCart?.addEventListener("click", () => {
  if (state.activeModalProductId) {
    shop.addToCart(state.activeModalProductId, state.modalQty);
    const modalEl = document.getElementById("productModal");
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  }
});

// ---- Modal Wishlist ----
state.modalWishlist?.addEventListener("click", () => {
  if (state.activeModalProductId) {
    shop.toggleWishlist(state.activeModalProductId);
    const inWl = state.wishlist.includes(state.activeModalProductId);
    if (state.modalWishlist) {
      state.modalWishlist.innerHTML = `<i class="bi ${inWl ? "bi-heart-fill" : "bi-heart"}"></i>`;
      state.modalWishlist.classList.toggle("btn-danger", inWl);
      state.modalWishlist.classList.toggle("btn-outline-danger", !inWl);
    }
  }
});

// ---- Checkout ----
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
  state.setCheckoutStep(1);
  shop.renderCheckoutStep(state.checkoutStep);
});

state.checkoutNext?.addEventListener("click", async () => {
  if (state.checkoutStep === 2 && !shop.validateShippingInputs()) return;
  if (state.checkoutStep === 4) {
    if (state.checkoutNext) state.checkoutNext.disabled = true;
    const spinner = document.getElementById("placeOrderSpinner");
    if (spinner) spinner.classList.remove("d-none");
    const rawTotal = shop.calcCartSubtotal(state.cart);
    const discount = shop.calcDiscount(rawTotal);
    const order: Order = {
      id: "SW-" + Date.now().toString(36).toUpperCase(),
      items: shop.calcCartItemCount(state.cart),
      total: Math.round((rawTotal - discount) * 100) / 100,
      date: new Date().toISOString(),
      status: "pending",
      userId: state.currentUserId ?? undefined,
    };
    try {
      await saveOrder(order, state.currentUserId ?? undefined);
      captureEvent("order_placed", { orderId: order.id, total: order.total, items: order.items });
      shop.renderCart();
      await saveCart(state.cart, state.currentUserId ?? undefined);
      const modalEl = document.getElementById("checkoutModal");
      if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
      state.showToast("Order placed! Thank you for shopping.");
    } catch {
      state.showToast("Something went wrong placing your order. Please try again.", "danger");
      if (state.checkoutNext) state.checkoutNext.disabled = false;
      if (spinner) spinner.classList.add("d-none");
    }
    return;
  }
  state.setCheckoutStep((state.checkoutStep + 1) as any);
  shop.renderCheckoutStep(state.checkoutStep);
});

state.checkoutPrev?.addEventListener("click", () => {
  if (state.checkoutStep > 1) state.setCheckoutStep((state.checkoutStep - 1) as any);
  shop.renderCheckoutStep(state.checkoutStep);
});

// ---- Dark Mode ----
state.darkModeToggle?.addEventListener("click", state.toggleDarkMode);

// ---- Newsletter ----
state.newsletterForm?.addEventListener("submit", e => {
  e.preventDefault();
  const input = state.newsletterForm!.querySelector("input");
  if (!input?.value.trim()) return;
  if (state.newsletterMsg) state.newsletterMsg.textContent = "Thanks for subscribing! Check your inbox.";
  input.value = "";
});

// ---- Price Range ----
const priceMinInput = document.getElementById("priceMin") as HTMLInputElement | null;
const priceMaxInput = document.getElementById("priceMax") as HTMLInputElement | null;

priceMinInput?.addEventListener("input", () => {
  state.setPriceMin(priceMinInput.value ? parseFloat(priceMinInput.value) : null);
  shop.renderProducts();
});

priceMaxInput?.addEventListener("input", () => {
  state.setPriceMax(priceMaxInput.value ? parseFloat(priceMaxInput.value) : null);
  shop.renderProducts();
});

// ---- Wishlist Button ----
document.getElementById("wishlistBtn")?.addEventListener("click", () => {
  const offcanvasEl = document.getElementById("wishlistOffcanvas");
  if (offcanvasEl) {
    const offcanvas = new bootstrap.Offcanvas(offcanvasEl);
    offcanvas.show();
  }
});

// ---- Auth Modal ----
const authModal = document.getElementById("authModal");
if (authModal) {
  authModal.addEventListener("show.bs.modal", () => {
    const body = document.getElementById("authModalBody");
    if (body && !body.hasChildNodes()) {
      body.innerHTML = renderAuthModalBody();
      initAuth();
    }
  });
}

// ---- PWA (service worker) ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

// ---- Init ----
async function init() {
  const saved = loadLocal("darkMode", "light");
  state.applyTheme(saved);
  initAnalytics();

  state.setProducts(await getProducts());

  let rv: number[] = loadLocalArray("recentlyViewed", []);
  rv = rv.filter(id => state.products.some(p => p.id === id));
  state.setRecentlyViewed(rv);

  updateAuthUI();

  if (api.isSupabaseConfigured()) {
    const user = await api.getCurrentUser();
    if (user) {
      state.setUserId(user.id);
      state.setUserEmail(user.email ?? null);
    }
    updateAuthUI();
    api.onAuthChange((u: any) => {
      if (u) {
        state.setUserId(u.id);
        state.setUserEmail(u.email ?? null);
        identifyUser(u.id, { email: u.email });
      } else {
        state.setUserId(null);
        state.setUserEmail(null);
        resetAnalytics();
      }
      updateAuthUI();
    });
  }

  setTimeout(() => shop.renderProducts(), 600);
  shop.renderCart();
  shop.renderWishlist();
}

function loadLocal(key: string, fallback: string): string {
  try { return localStorage.getItem("shopwave_" + key) || fallback; } catch { return fallback; }
}

function loadLocalArray<T>(key: string, fallback: T[]): T[] {
  try { const val = localStorage.getItem("shopwave_" + key); return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

init();
