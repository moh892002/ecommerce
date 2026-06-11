/* ==================================================
   ShopWave — Full E-Commerce Frontend
   ================================================== */

// ---- Product Data (enriched) ----
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

// Override products with admin edits if they exist
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

const FREE_SHIPPING_THRESHOLD = 50;
const FALLBACK_IMG = "https://placehold.co/400x400?text=Unavailable";

// ---- localStorage helpers ----
function loadStorage(key, fallback) {
  try {
    const val = localStorage.getItem("shopwave_" + key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveStorage(key, data) {
  localStorage.setItem("shopwave_" + key, JSON.stringify(data));
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

// ---- Render Stars ----
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = "";
  for (let i = 0; i < full; i++) s += '<i class="bi bi-star-fill"></i>';
  if (half) s += '<i class="bi bi-star-half"></i>';
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) s += '<i class="bi bi-star"></i>';
  return s;
}

// ---- Render Products ----
function renderProducts() {
  let filtered = products.filter(p => {
    const cat = currentCategory === "all" || p.category === currentCategory;
    const q = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return cat && q;
  });

  // Sort
  switch (sortBy) {
    case "price-asc": filtered.sort((a, b) => a.price - b.price); break;
    case "price-desc": filtered.sort((a, b) => b.price - a.price); break;
    case "name": filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
  }

  productGrid.classList.remove("d-none");
  skeletonGrid.classList.add("d-none");

  if (filtered.length === 0) {
    productGrid.innerHTML = "";
    noProducts.classList.remove("d-none");
    return;
  }
  noProducts.classList.add("d-none");

  productGrid.innerHTML = filtered.map((p, i) => `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3" style="animation-delay:${Math.min(i * 0.05, 0.5)}s">
      <div class="card product-card h-100 position-relative" data-id="${p.id}">
        ${p.sale ? '<span class="sale-badge badge bg-danger">Sale</span>' : ""}
        <button class="wishlist-btn ${wishlist.includes(p.id) ? "in-wishlist" : ""}" data-id="${p.id}" title="Toggle wishlist">
          <i class="bi ${wishlist.includes(p.id) ? "bi-heart-fill" : "bi-heart"}"></i>
        </button>
        <div class="card-img-container" data-id="${p.id}">
          <img src="${p.image}" alt="${p.name}" loading="lazy" data-id="${p.id}" onerror="this.src='${FALLBACK_IMG}'">
        </div>
        <div class="card-body d-flex flex-column pb-3">
          <h6 class="card-title" data-id="${p.id}">${p.name}</h6>
          <div class="star-rating mb-1">${renderStars(p.rating)} <small class="text-muted">(${p.reviews})</small></div>
          <p class="card-text mb-3 mt-1">
            ${p.sale ? '<span class="old-price text-decoration-line-through text-muted me-2">$' + p.originalPrice.toFixed(2) + '</span>' : ""}
            <span class="current-price ${p.sale ? "text-danger" : "text-primary"}">$${p.price.toFixed(2)}</span>
          </p>
          <button class="btn btn-outline-primary btn-sm mt-auto w-100 add-to-cart" data-id="${p.id}">
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join("");
  // Trigger staggered entrance
  productGrid.classList.remove("product-grid-animate");
  requestAnimationFrame(() => productGrid.classList.add("product-grid-animate"));
  updateRecentlyViewedSection();
}

// ---- Render Cart ----
function renderCart() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartBadge.textContent = totalQty;
  $("cartBtn")?.setAttribute("aria-label", `Shopping cart (${totalQty} items)`);
  cartBadge.classList.remove("bump");
  void cartBadge.offsetWidth;
  if (totalQty > 0) cartBadge.classList.add("bump");

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-muted text-center">Your cart is empty.</p>';
    cartFooter.classList.add("d-none");
    shippingProgressWrap.classList.add("d-none");
    return;
  }

  // Shipping progress
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (subtotal < FREE_SHIPPING_THRESHOLD) {
    const needed = FREE_SHIPPING_THRESHOLD - subtotal;
    const pct = Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    shippingMsg.textContent = `Add $${needed.toFixed(2)} more for free shipping`;
    shippingBar.style.width = Math.min(pct, 100) + "%";
    shippingPercent.textContent = Math.min(pct, 100) + "%";
    shippingProgressWrap.classList.remove("d-none");
  } else {
    shippingMsg.textContent = "You qualify for free shipping!";
    shippingBar.style.width = "100%";
    shippingPercent.textContent = "100%";
    shippingProgressWrap.classList.remove("d-none");
  }

  cartItems.innerHTML = `<ul class="list-group list-group-flush">${
    cart.map(item => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div class="me-2">
          <small class="d-block fw-semibold">${item.name}</small>
          <small class="text-muted">$${item.price.toFixed(2)} x ${item.qty}</small>
        </div>
        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-sm btn-outline-secondary dec-qty" data-id="${item.id}">-</button>
          <span class="badge bg-secondary rounded-pill">${item.qty}</span>
          <button class="btn btn-sm btn-outline-secondary inc-qty" data-id="${item.id}">+</button>
          <button class="btn btn-sm btn-outline-danger ms-1 remove-item" data-id="${item.id}"><i class="bi bi-trash"></i></button>
        </div>
      </li>
    `).join("")
  }</ul>`;

  cartTotal.textContent = `$${subtotal.toFixed(2)}`;
  cartFooter.classList.remove("d-none");
  saveStorage("cart", cart);
}

// ---- Add to Cart ----
function addToCart(id, qty = 1) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty });
  renderCart();
  showToast(`${product.name} added to cart!`);
  saveStorage("cart", cart);
}

// ---- Wishlist ----
function toggleWishlist(id, btnEl) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) wishlist.splice(idx, 1);
  else wishlist.push(id);

  // Optimistically update the clicked button so feedback is instant
  if (btnEl) {
    btnEl.querySelector("i").className = wishlist.includes(id) ? "bi bi-heart-fill" : "bi bi-heart";
    btnEl.classList.toggle("in-wishlist", wishlist.includes(id));
    btnEl.classList.remove("heart-bounce");
    void btnEl.offsetWidth;
    btnEl.classList.add("heart-bounce");
  }

  // Delay re-render to let the animation play
  setTimeout(() => {
    saveStorage("wishlist", wishlist);
    renderProducts();
    renderWishlist();
    const p = products.find(x => x.id === id);
    showToast(p ? `${idx > -1 ? "Removed from" : "Added to"} wishlist` : "", idx > -1 ? "info" : "success");
  }, btnEl ? 300 : 0);
}

function renderWishlist() {
  const count = wishlist.length;
  wishlistBadge.classList.toggle("d-none", count === 0);
  wishlistBadge.textContent = count;
  $("wishlistBtn")?.setAttribute("aria-label", `Wishlist (${count} items)`);

  if (count === 0) {
    wishlistBody.innerHTML = '<p class="text-muted text-center">Your wishlist is empty.</p>';
    return;
  }
  const items = wishlist.map(id => products.find(p => p.id === id)).filter(Boolean);
  wishlistBody.innerHTML = items.map(p => `
    <div class="d-flex align-items-center gap-3 mb-3 pb-2 border-bottom">
      <img src="${p.image}" alt="${p.name}" style="width:60px;height:60px;object-fit:contain;" onerror="this.src='${FALLBACK_IMG}'">
      <div class="flex-grow-1">
        <small class="d-block fw-semibold">${p.name}</small>
        <span class="fw-bold text-primary small">$${p.price.toFixed(2)}</span>
      </div>
      <button class="btn btn-sm btn-outline-primary add-to-cart" data-id="${p.id}" title="Add to cart"><i class="bi bi-cart-plus"></i></button>
      <button class="btn btn-sm btn-outline-danger remove-wishlist" data-id="${p.id}" title="Remove"><i class="bi bi-x"></i></button>
    </div>
  `).join("");
}

// ---- Recently Viewed ----
function addRecentlyViewed(id) {
  recentlyViewed = recentlyViewed.filter(x => x !== id);
  recentlyViewed.unshift(id);
  if (recentlyViewed.length > 6) recentlyViewed = recentlyViewed.slice(0, 6);
  saveStorage("recentlyViewed", recentlyViewed);
  updateRecentlyViewedSection();
}

function updateRecentlyViewedSection() {
  const items = recentlyViewed.map(id => products.find(p => p.id === id)).filter(Boolean);
  if (items.length === 0) {
    recentlySection.classList.add("d-none");
    return;
  }
  recentlySection.classList.remove("d-none");
  recentlyGrid.innerHTML = items.map(p => `
    <div class="col-4 col-md-2">
      <div class="card product-card h-100" data-id="${p.id}" style="cursor:pointer;">
        <div class="card-img-container" data-id="${p.id}" style="height:120px;">
          <img src="${p.image}" alt="${p.name}" loading="lazy" style="max-height:90%;" onerror="this.src='${FALLBACK_IMG}'">
        </div>
        <div class="card-body p-2 text-center">
          <small class="d-block text-truncate fw-semibold">${p.name}</small>
          <small class="fw-bold text-primary small">$${p.price.toFixed(2)}</small>
        </div>
      </div>
    </div>
  `).join("");
}

// ---- Product Detail Modal ----
let activeModalProductId = null;

function openProductModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  activeModalProductId = id;
  modalQty = 1;
  modalQtyEl.textContent = "1";

  modalImage.src = p.image;
  modalImage.alt = p.name;
  modalName.textContent = p.name;
  modalCategory.textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
  modalDesc.textContent = p.description;
  modalRating.innerHTML = `<span class="star-rating">${renderStars(p.rating)}</span> <small class="text-muted">(${p.reviews} reviews)</small>`;

  let priceHtml = `<span class="fw-bold ${p.sale ? "text-danger" : "text-primary"}">$${p.price.toFixed(2)}</span>`;
  if (p.sale) priceHtml += ` <span class="text-decoration-line-through text-muted ms-1 small">$${p.originalPrice.toFixed(2)}</span>`;
  modalPrice.innerHTML = priceHtml;

  const inWishlist = wishlist.includes(p.id);
  modalWishlist.innerHTML = `<i class="bi ${inWishlist ? "bi-heart-fill" : "bi-heart"}"></i>`;
  modalWishlist.classList.toggle("btn-danger", inWishlist);
  modalWishlist.classList.toggle("btn-outline-danger", !inWishlist);

  const modal = new bootstrap.Modal($("productModal"));
  modal.show();
  addRecentlyViewed(id);
}

// ---- Checkout Multi-Step ----
function renderCheckoutStep(step) {
  if (!checkoutContent) return;
  checkoutSteps.querySelectorAll(".step-indicator").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.step) <= step);
  });

  switch (step) {
    case 1: {
      const items = cart.length ? cart.map(i => `<li class="d-flex justify-content-between"><span>${i.name} x${i.qty}</span><span>$${(i.price * i.qty).toFixed(2)}</span></li>`).join("") : '<li class="text-muted">Cart is empty</li>';
      checkoutContent.innerHTML = `<h6>Review Your Order</h6><ul class="list-unstyled small">${items}</ul><hr><div class="d-flex justify-content-between fw-bold"><span>Total</span><span>$${cart.reduce((s,i) => s + i.price * i.qty, 0).toFixed(2)}</span></div>`;
      checkoutPrev.style.display = "none";
      checkoutNext.textContent = "Continue to Shipping";
      break;
    }
    case 2: {
      checkoutContent.innerHTML = `
        <h6>Shipping Information</h6>
        <div class="row g-2">
          <div class="col-6"><label class="form-label small">First Name</label><input class="form-control form-control-sm" value="John"></div>
          <div class="col-6"><label class="form-label small">Last Name</label><input class="form-control form-control-sm" value="Doe"></div>
          <div class="col-12"><label class="form-label small">Address</label><input class="form-control form-control-sm" value="123 Main St"></div>
          <div class="col-6"><label class="form-label small">City</label><input class="form-control form-control-sm" value="New York"></div>
          <div class="col-3"><label class="form-label small">State</label><input class="form-control form-control-sm" value="NY"></div>
          <div class="col-3"><label class="form-label small">ZIP</label><input class="form-control form-control-sm" value="10001"></div>
        </div>`;
      checkoutPrev.style.display = "inline-block";
      checkoutNext.textContent = "Continue to Payment";
      break;
    }
    case 3: {
      checkoutContent.innerHTML = `
        <h6>Payment Details</h6>
        <div class="row g-2">
          <div class="col-12"><label class="form-label small">Card Number</label><input class="form-control form-control-sm" value="4242 4242 4242 4242" disabled></div>
          <div class="col-6"><label class="form-label small">Expiry</label><input class="form-control form-control-sm" value="12/28" disabled></div>
          <div class="col-6"><label class="form-label small">CVV</label><input class="form-control form-control-sm" value="123" disabled></div>
        </div>
        <p class="small text-muted mt-2"><i class="bi bi-shield-lock"></i> Your payment info is simulated and secure.</p>`;
      checkoutPrev.style.display = "inline-block";
      checkoutNext.textContent = "Place Order";
      break;
    }
    case 4: {
      checkoutContent.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-check-circle-fill text-success display-4"></i>
          <h5 class="mt-3">Order Confirmed!</h5>
          <p class="text-muted mb-0">Thank you for your purchase.</p>
          <small class="text-muted">Order #SW-${Date.now().toString(36).toUpperCase()}</small>
        </div>`;
      checkoutPrev.style.display = "none";
      checkoutNext.textContent = "Done";
      break;
    }
  }
}

// ---- Debounced Search ----
let searchDebounceTimer;
let suggestionDebounceTimer;

function updateSuggestions(q) {
  clearTimeout(suggestionDebounceTimer);
  if (!q.trim()) { searchSuggestions.style.display = "none"; return; }
  suggestionDebounceTimer = setTimeout(() => {
    const matches = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
    if (matches.length === 0) { searchSuggestions.style.display = "none"; return; }
    searchSuggestions.innerHTML = matches.map(p =>
      `<button class="dropdown-item suggest-item py-1 small" data-id="${p.id}">
        <i class="bi bi-search me-1"></i> ${p.name} <span class="text-muted float-end">$${p.price.toFixed(2)}</span>
      </button>`
    ).join("");
    searchSuggestions.style.display = "block";
  }, 200);
}

// ---- Dark Mode ----
function applyTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  const icon = darkModeToggle?.querySelector("i");
  if (icon) icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-fill";
  saveStorage("darkMode", theme);
}

function toggleDarkMode() {
  const current = document.documentElement.getAttribute("data-bs-theme");
  applyTheme(current === "dark" ? "light" : "dark");
}

// ---- Chat ----
let chatOpen = false;

chatToggle?.addEventListener("click", () => {
  chatOpen = !chatOpen;
  chatBox.classList.toggle("d-none", !chatOpen);
  chatToggle.innerHTML = chatOpen ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-chat-dots-fill"></i>';
});

function appendChatMsg(text, type) {
  const div = document.createElement("div");
  div.className = "chat-msg " + type;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

chatSend?.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendChatMsg(msg, "sent");
  chatInput.value = "";
  setTimeout(() => appendChatMsg("Thanks for reaching out! Our team will get back to you shortly.", "received"), 800);
});

chatInput?.addEventListener("keydown", e => { if (e.key === "Enter") chatSend.click(); });

// ---- Event Delegation: Product Grid ----
productGrid?.addEventListener("click", e => {
  const target = e.target;

  // Wishlist button
  const wlBtn = target.closest(".wishlist-btn");
  if (wlBtn) {
    e.stopPropagation();
    toggleWishlist(parseInt(wlBtn.dataset.id), wlBtn);
    return;
  }

  // Add to cart button
  const cartBtn = target.closest(".add-to-cart");
  if (cartBtn) {
    e.stopPropagation();
    addToCart(parseInt(cartBtn.dataset.id));
    return;
  }

  // Click on image, image container, or title -> open modal
  const cardImg = target.closest(".card-img-container");
  const cardTitle = target.closest(".card-title");
  if (cardImg || cardTitle) {
    const id = parseInt((cardImg || cardTitle).dataset.id);
    if (id) openProductModal(id);
    return;
  }

  // Click on whole card (but not buttons) -> modal
  const card = target.closest(".product-card");
  if (card && !target.closest("button")) {
    const id = parseInt(card.dataset.id);
    if (id) openProductModal(id);
  }
});

// ---- Recently Viewed click ----
recentlyGrid?.addEventListener("click", e => {
  const card = e.target.closest(".product-card");
  if (card) {
    const id = parseInt(card.dataset.id);
    if (id) openProductModal(id);
  }
});

// ---- Cart Events ----
cartItems?.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  const item = cart.find(i => i.id === id);
  if (!item) return;

  if (btn.classList.contains("inc-qty")) item.qty++;
  else if (btn.classList.contains("dec-qty")) {
    if (--item.qty <= 0) cart = cart.filter(i => i.id !== id);
  } else if (btn.classList.contains("remove-item")) cart = cart.filter(i => i.id !== id);
  renderCart();
});

// ---- Wishlist Body Events ----
wishlistBody?.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (btn.classList.contains("add-to-cart")) addToCart(id);
  else if (btn.classList.contains("remove-wishlist")) toggleWishlist(id, btn);
});

// ---- Category Filter ----
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});

// ---- Sort ----
$("sortSelect")?.addEventListener("change", e => {
  sortBy = e.target.value;
  renderProducts();
});

// ---- Search ----
searchForm?.addEventListener("submit", e => {
  e.preventDefault();
  searchQuery = searchInput.value.trim();
  searchSuggestions.style.display = "none";
  renderProducts();
});

searchInput?.addEventListener("input", e => {
  searchQuery = e.target.value.trim();
  updateSuggestions(searchQuery);
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => renderProducts(), 150);
});

searchInput?.addEventListener("blur", () => {
  setTimeout(() => { searchSuggestions.style.display = "none"; }, 200);
});

searchSuggestions?.addEventListener("mousedown", e => {
  const item = e.target.closest(".suggest-item");
  if (item) {
    const id = parseInt(item.dataset.id);
    openProductModal(id);
    searchSuggestions.style.display = "none";
  }
});

// ---- Modal Qty ----
$("modalQtyDec")?.addEventListener("click", () => {
  if (modalQty > 1) modalQty--;
  if (modalQtyEl) modalQtyEl.textContent = modalQty;
});
$("modalQtyInc")?.addEventListener("click", () => {
  modalQty++;
  if (modalQtyEl) modalQtyEl.textContent = modalQty;
});

// ---- Modal Add to Cart ----
modalAddCart?.addEventListener("click", () => {
  if (activeModalProductId) {
    addToCart(activeModalProductId, modalQty);
    bootstrap.Modal.getInstance($("productModal")).hide();
  }
});

// ---- Modal Wishlist ----
modalWishlist?.addEventListener("click", () => {
  if (activeModalProductId) {
    toggleWishlist(activeModalProductId);
    const inWl = wishlist.includes(activeModalProductId);
    modalWishlist.innerHTML = `<i class="bi ${inWl ? "bi-heart-fill" : "bi-heart"}"></i>`;
    modalWishlist.classList.toggle("btn-danger", inWl);
    modalWishlist.classList.toggle("btn-outline-danger", !inWl);
  }
});

// ---- Checkout ----
$("checkoutBtn")?.addEventListener("click", () => {
  checkoutStep = 1;
  renderCheckoutStep(checkoutStep);
});

checkoutNext?.addEventListener("click", () => {
  if (checkoutStep === 4) {
    const order = {
      id: "SW-" + Date.now().toString(36).toUpperCase(),
      items: JSON.parse(JSON.stringify(cart)),
      total: cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2),
      date: new Date().toISOString(),
      status: "pending"
    };
    const orders = loadStorage("orders", []);
    orders.unshift(order);
    saveStorage("orders", orders);
    cart = [];
    renderCart();
    saveStorage("cart", cart);
    bootstrap.Modal.getInstance($("checkoutModal"))?.hide();
    showToast("Order placed! Thank you for shopping.");
    return;
  }
  checkoutStep++;
  renderCheckoutStep(checkoutStep);
});

checkoutPrev?.addEventListener("click", () => {
  if (checkoutStep > 1) checkoutStep--;
  renderCheckoutStep(checkoutStep);
});

// ---- Dark Mode Toggle ----
darkModeToggle?.addEventListener("click", toggleDarkMode);

// ---- Newsletter ----
newsletterForm?.addEventListener("submit", e => {
  e.preventDefault();
  const input = newsletterForm.querySelector("input");
  if (!input.value.trim()) return;
  newsletterMsg.textContent = "Thanks for subscribing! Check your inbox.";
  input.value = "";
});

// ---- Wishlist Button in Nav ----
$("wishlistBtn")?.addEventListener("click", () => {
  const offcanvas = new bootstrap.Offcanvas($("wishlistOffcanvas"));
  offcanvas.show();
});

// ---- Init ----
function init() {
  // Apply dark mode
  const saved = loadStorage("darkMode", "light");
  applyTheme(saved);

  // Hide skeleton after a brief delay (simulate load)
  setTimeout(() => {
    renderProducts();
  }, 600);

  renderCart();
  renderWishlist();
}

init();
