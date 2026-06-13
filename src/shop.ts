import type { Product, CartItem, SortOption, Review, Coupon } from "./types";
import { FREE_SHIPPING_THRESHOLD, FALLBACK_IMG, RECENTLY_VIEWED_MAX } from "./types";
import * as state from "./data";
import { getProducts, saveCart, saveWishlist, getReviews, addReview, validateCoupon } from "./api";
import { isStripeConfigured, mountCardElement, unmountCardElement } from "./stripe";

// ---- Pure helpers (testable) ----
export function getFilteredProducts(prods: Product[], category: string, query: string, sort: SortOption, priceMin?: number | null, priceMax?: number | null): Product[] {
  let result = prods.filter(p => {
    const cat = category === "all" || p.category === category;
    const q = !query || p.name.toLowerCase().includes(query.toLowerCase());
    const priceOk = (priceMin == null || p.price >= priceMin) && (priceMax == null || p.price <= priceMax);
    return cat && q && priceOk;
  });
  switch (sort) {
    case "price-asc": result.sort((a, b) => a.price - b.price); break;
    case "price-desc": result.sort((a, b) => b.price - a.price); break;
    case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "rating": result.sort((a, b) => b.rating - a.rating); break;
  }
  return result;
}

export function calcCartSubtotal(cartArr: CartItem[]): number {
  return cartArr.reduce((s, i) => s + i.price * i.qty, 0);
}

export function calcCartItemCount(cartArr: CartItem[]): number {
  return cartArr.reduce((s, i) => s + i.qty, 0);
}

export function renderStars(rating: number): string {
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
export function renderProducts() {
  let filtered = getFilteredProducts(state.products, state.currentCategory, state.searchQuery, state.sortBy, state.priceMin, state.priceMax);

  if (state.productGrid) state.productGrid.classList.remove("d-none");
  if (state.skeletonGrid) state.skeletonGrid.classList.add("d-none");

  if (filtered.length === 0) {
    if (state.productGrid) {
      state.productGrid.innerHTML = `<div class="col-12 text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="text-muted mt-2 mb-0">No products found.</p></div>`;
    }
    if (state.noProducts) state.noProducts.classList.add("d-none");
    return;
  }
  if (state.noProducts) state.noProducts.classList.add("d-none");

  if (state.productGrid) {
    state.productGrid.innerHTML = filtered.map((p, i) => `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3" style="animation-delay:${Math.min(i * 0.05, 0.5)}s">
        <div class="card product-card h-100 position-relative" data-id="${p.id}">
          ${p.sale ? '<span class="sale-badge badge bg-danger">Sale</span>' : ""}
          <button class="wishlist-btn ${state.wishlist.includes(p.id) ? "in-wishlist" : ""}" data-id="${p.id}" title="Toggle wishlist">
            <i class="bi ${state.wishlist.includes(p.id) ? "bi-heart-fill" : "bi-heart"}"></i>
          </button>
          <div class="card-img-container" data-id="${p.id}">
            <img src="${p.image}" alt="${p.name}" loading="lazy" data-id="${p.id}" class="img-loading" onerror="this.src='${FALLBACK_IMG}'; this.classList.remove('img-loading')" onload="this.classList.remove('img-loading')">
          </div>
          <div class="card-body d-flex flex-column pb-3">
            <h6 class="card-title" data-id="${p.id}">${p.name}</h6>
            <div class="star-rating mb-1">${renderStars(p.rating)} <small class="text-muted">(${p.reviews})</small></div>
            <p class="card-text mb-3 mt-1">
              ${p.sale ? '<span class="old-price text-decoration-line-through text-muted me-2">$' + p.originalPrice!.toFixed(2) + '</span>' : ""}
              <span class="current-price ${p.sale ? "text-danger" : "text-primary"}">$${p.price.toFixed(2)}</span>
            </p>
            <button class="btn btn-outline-primary btn-sm mt-auto w-100 add-to-cart" data-id="${p.id}">
              <i class="bi bi-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  if (state.productGrid) {
    state.productGrid.classList.remove("product-grid-animate");
    requestAnimationFrame(() => state.productGrid!.classList.add("product-grid-animate"));
  }
  updateRecentlyViewedSection();
}

// ---- Coupon ----
export function calcDiscount(subtotal: number): number {
  if (!state.activeCoupon) return 0;
  return subtotal * (state.activeCoupon.discountPercent / 100);
}

export function applyCoupon(subtotal: number): number {
  return subtotal - calcDiscount(subtotal);
}

// ---- Render Cart ----
export function renderCart() {
  const totalQty = calcCartItemCount(state.cart);
  if (state.cartBadge) state.cartBadge.textContent = String(totalQty);
  const cartBtn = document.getElementById("cartBtn");
  cartBtn?.setAttribute("aria-label", `Shopping cart (${totalQty} items)`);
  if (state.cartBadge) {
    state.cartBadge.classList.remove("bump");
    void state.cartBadge.offsetWidth;
    if (totalQty > 0) state.cartBadge.classList.add("bump");
  }

  if (state.cart.length === 0) {
    if (state.cartItems) state.cartItems.innerHTML = '<div class="text-center py-5"><i class="bi bi-cart3 display-4 text-muted"></i><p class="text-muted mt-2 mb-0">Your cart is empty.</p></div>';
    if (state.cartFooter) state.cartFooter.classList.add("d-none");
    if (state.shippingProgressWrap) state.shippingProgressWrap.classList.add("d-none");
    return;
  }

  const subtotal = calcCartSubtotal(state.cart);
  if (subtotal < FREE_SHIPPING_THRESHOLD) {
    const needed = FREE_SHIPPING_THRESHOLD - subtotal;
    const pct = Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    if (state.shippingMsg) state.shippingMsg.textContent = `Add $${needed.toFixed(2)} more for free shipping`;
    if (state.shippingBar) state.shippingBar.style.width = Math.min(pct, 100) + "%";
    if (state.shippingPercent) state.shippingPercent.textContent = Math.min(pct, 100) + "%";
    if (state.shippingProgressWrap) state.shippingProgressWrap.classList.remove("d-none");
  } else {
    if (state.shippingMsg) state.shippingMsg.textContent = "You qualify for free shipping!";
    if (state.shippingBar) state.shippingBar.style.width = "100%";
    if (state.shippingPercent) state.shippingPercent.textContent = "100%";
    if (state.shippingProgressWrap) state.shippingProgressWrap.classList.remove("d-none");
  }

  if (state.cartItems) {
    state.cartItems.innerHTML = `<ul class="list-group list-group-flush">${
      state.cart.map(item => `
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
  }

  const discount = calcDiscount(subtotal);
  const finalTotal = subtotal - discount;

  const couponHtml = `
    <div class="mb-2">
      <div class="input-group input-group-sm">
        <input type="text" class="form-control" id="couponInput" placeholder="Coupon code" value="${state.activeCoupon?.code || ""}">
        <button class="btn btn-outline-primary" id="applyCouponBtn">Apply</button>
      </div>
      ${state.activeCoupon ? '<small class="text-success">' + state.activeCoupon.discountPercent + '% off applied</small>' : ''}
      ${discount > 0 ? '<small class="text-success d-block">Discount: -$' + discount.toFixed(2) + '</small>' : ''}
    </div>`;

  if (state.cartItems) {
    const existingCoupon = state.cartItems.querySelector("#couponInput");
    if (!existingCoupon && state.cart.length > 0) {
      state.cartItems.insertAdjacentHTML("beforebegin", couponHtml);
      document.getElementById("applyCouponBtn")?.addEventListener("click", applyCouponCode);
    }
  }

  if (state.cartTotal) state.cartTotal.textContent = `$${finalTotal.toFixed(2)}`;
  if (state.cartFooter) state.cartFooter.classList.remove("d-none");
  saveCart(state.cart, state.currentUserId ?? undefined);
}

async function applyCouponCode() {
  const code = (document.getElementById("couponInput") as HTMLInputElement)?.value.trim();
  if (!code) { state.showToast("Enter a coupon code.", "info"); return; }
  const coupon = await validateCoupon(code);
  if (coupon) {
    state.setActiveCoupon({ code: coupon.code, discountPercent: coupon.discountPercent });
    state.showToast(`Coupon applied! ${coupon.discountPercent}% off.`);
  } else {
    state.setActiveCoupon(null);
    state.showToast("Invalid or expired coupon.", "danger");
  }
  renderCart();
}

// ---- Add to Cart ----
export function addToCart(id: number, qty = 1) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(i => i.id === id);
  if (existing) existing.qty += qty;
  else state.cart.push({ ...product, qty });
  renderCart();
  state.showToast(`${product.name} added to cart!`);
  saveCart(state.cart, state.currentUserId ?? undefined);
}

// ---- Wishlist ----
export function toggleWishlist(id: number, btnEl?: HTMLElement | null) {
  const idx = state.wishlist.indexOf(id);
  if (idx > -1) state.wishlist.splice(idx, 1);
  else state.wishlist.push(id);

  if (btnEl) {
    const icon = btnEl.querySelector("i");
    if (icon) icon.className = state.wishlist.includes(id) ? "bi bi-heart-fill" : "bi bi-heart";
    btnEl.classList.toggle("in-wishlist", state.wishlist.includes(id));
    btnEl.classList.remove("heart-bounce");
    void btnEl.offsetWidth;
    btnEl.classList.add("heart-bounce");
  }

  setTimeout(() => {
    saveWishlist(state.wishlist, state.currentUserId ?? undefined);
    renderProducts();
    renderWishlist();
    const p = state.products.find(x => x.id === id);
    state.showToast(p ? `${idx > -1 ? "Removed from" : "Added to"} wishlist` : "", idx > -1 ? "info" : "success");
  }, btnEl ? 300 : 0);
}

export function renderWishlist() {
  const count = state.wishlist.length;
  if (state.wishlistBadge) {
    state.wishlistBadge.classList.toggle("d-none", count === 0);
    state.wishlistBadge.textContent = String(count);
  }
  const wlBtn = document.getElementById("wishlistBtn");
  wlBtn?.setAttribute("aria-label", `Wishlist (${count} items)`);

  if (count === 0) {
    if (state.wishlistBody) state.wishlistBody.innerHTML = '<p class="text-muted text-center">Your wishlist is empty.</p>';
    return;
  }
  const items = state.wishlist.map(id => state.products.find(p => p.id === id)).filter(Boolean) as Product[];
  if (state.wishlistBody) {
    state.wishlistBody.innerHTML = items.map(p => `
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
}

// ---- Recently Viewed ----
export function addRecentlyViewed(id: number) {
  let rv = state.recentlyViewed.filter(x => x !== id);
  rv.unshift(id);
  if (rv.length > RECENTLY_VIEWED_MAX) rv = rv.slice(0, RECENTLY_VIEWED_MAX);
  state.setRecentlyViewed(rv);
  try { localStorage.setItem("shopwave_recentlyViewed", JSON.stringify(state.recentlyViewed)); } catch {}
  updateRecentlyViewedSection();
}

export function updateRecentlyViewedSection() {
  const items = state.recentlyViewed.map(id => state.products.find(p => p.id === id)).filter(Boolean) as Product[];
  if (state.recentlySection) {
    if (items.length === 0) {
      state.recentlySection.classList.add("d-none");
      return;
    }
    state.recentlySection.classList.remove("d-none");
  }
  if (state.recentlyGrid) {
    state.recentlyGrid.innerHTML = items.map(p => `
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
}

// ---- Related Products ----
function renderRelatedProducts(productId: number) {
  const p = state.products.find(x => x.id === productId);
  const grid = document.getElementById("relatedProductsGrid");
  if (!grid || !p) return;
  const related = state.products
    .filter(x => x.id !== productId && x.category === p.category)
    .slice(0, 4);
  if (related.length === 0) {
    document.getElementById("relatedProducts")?.classList.add("d-none");
    return;
  }
  document.getElementById("relatedProducts")?.classList.remove("d-none");
  grid.innerHTML = related.map(rp => `
    <div class="col-6 col-md-3">
      <div class="card product-card h-100" data-id="${rp.id}" style="cursor:pointer;">
        <div class="card-img-container" data-id="${rp.id}" style="height:100px;">
          <img src="${rp.image}" alt="${rp.name}" loading="lazy" style="max-height:85%;" onerror="this.src='${FALLBACK_IMG}'">
        </div>
        <div class="card-body p-2 text-center">
          <small class="d-block text-truncate fw-semibold">${rp.name}</small>
          <small class="fw-bold text-primary small">$${rp.price.toFixed(2)}</small>
        </div>
      </div>
    </div>
  `).join("");
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt((card as HTMLElement).dataset.id!);
      if (id) openProductModal(id);
    });
  });
}

// ---- Reviews ----
let reviewRating = 0;

export function renderReviews(productId: number) {
  const list = document.getElementById("reviewsList");
  const formContainer = document.getElementById("reviewFormContainer");
  if (!list) return;

  if (state.currentUserId && formContainer) formContainer.classList.remove("d-none");
  else if (formContainer) formContainer.classList.add("d-none");

  getReviews(productId).then(reviews => {
    if (reviews.length === 0) {
      list.innerHTML = '<p class="text-muted small">No reviews yet. Be the first!</p>';
      return;
    }
    list.innerHTML = reviews.map(r => `
      <div class="d-flex gap-2 mb-2 pb-2 border-bottom">
        <div class="flex-shrink-0">
          <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width:32px;height:32px;font-size:0.8rem;font-weight:600;">
            ${r.userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div class="flex-grow-1">
          <small class="fw-semibold d-block">${r.userName}</small>
          <small class="star-rating" style="font-size:0.7rem;">${renderStars(r.rating)}</small>
          ${r.comment ? `<p class="small text-muted mb-0 mt-1">${r.comment}</p>` : ""}
          <small class="text-muted" style="font-size:0.7rem;">${new Date(r.created_at).toLocaleDateString()}</small>
        </div>
      </div>
    `).join("");
  });
}

function initReviewStars() {
  reviewRating = 0;
  const container = document.getElementById("reviewStarInput");
  if (!container) return;
  container.querySelectorAll("i").forEach(star => {
    star.addEventListener("click", () => {
      reviewRating = parseInt((star as HTMLElement).dataset.star!);
      container.querySelectorAll("i").forEach(s => {
        const val = parseInt((s as HTMLElement).dataset.star!);
        s.className = val <= reviewRating ? "bi bi-star-fill text-warning" : "bi bi-star";
      });
    });
    star.addEventListener("mouseenter", () => {
      const val = parseInt((star as HTMLElement).dataset.star!);
      container.querySelectorAll("i").forEach(s => {
        const sv = parseInt((s as HTMLElement).dataset.star!);
        s.className = sv <= val ? "bi bi-star-fill text-warning" : "bi bi-star";
      });
    });
    star.addEventListener("mouseleave", () => {
      container.querySelectorAll("i").forEach(s => {
        const sv = parseInt((s as HTMLElement).dataset.star!);
        s.className = sv <= reviewRating ? "bi bi-star-fill text-warning" : "bi bi-star";
      });
    });
  });
}

document.getElementById("submitReviewBtn")?.addEventListener("click", async () => {
  const productId = state.activeModalProductId;
  const comment = (document.getElementById("reviewComment") as HTMLTextAreaElement)?.value.trim();
  if (!productId || !reviewRating || !state.currentUserId) {
    state.showToast("Please select a rating and sign in.", "danger");
    return;
  }
  const review: Review = {
    productId,
    userId: state.currentUserId,
    userName: state.currentUserEmail?.split("@")[0] || "Anonymous",
    rating: reviewRating,
    comment,
    created_at: new Date().toISOString(),
  };
  try {
    await addReview(review);
    state.showToast("Review submitted!");
    (document.getElementById("reviewComment") as HTMLTextAreaElement)!.value = "";
    reviewRating = 0;
    document.querySelectorAll("#reviewStarInput i").forEach(s => s.className = "bi bi-star");
    renderReviews(productId);
  } catch {
    state.showToast("Failed to submit review.", "danger");
  }
});

// ---- Product Detail Modal ----
export function openProductModal(id: number) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.setActiveModalProductId(id);
  state.setModalQty(1);
  if (state.modalQtyEl) state.modalQtyEl.textContent = "1";

  if (state.modalImage) { state.modalImage.src = p.image; state.modalImage.alt = p.name; }
  if (state.modalName) state.modalName.textContent = p.name;
  if (state.modalCategory) state.modalCategory.textContent = p.category.charAt(0).toUpperCase() + p.category.slice(1);
  if (state.modalDesc) state.modalDesc.textContent = p.description;
  if (state.modalRating) state.modalRating.innerHTML = `<span class="star-rating">${renderStars(p.rating)}</span> <small class="text-muted">(${p.reviews} reviews)</small>`;

  let priceHtml = `<span class="fw-bold ${p.sale ? "text-danger" : "text-primary"}">$${p.price.toFixed(2)}</span>`;
  if (p.sale) priceHtml += ` <span class="text-decoration-line-through text-muted ms-1 small">$${p.originalPrice!.toFixed(2)}</span>`;
  if (state.modalPrice) state.modalPrice.innerHTML = priceHtml;

  const inWishlist = state.wishlist.includes(p.id);
  if (state.modalWishlist) {
    state.modalWishlist.innerHTML = `<i class="bi ${inWishlist ? "bi-heart-fill" : "bi-heart"}"></i>`;
    state.modalWishlist.classList.toggle("btn-danger", inWishlist);
    state.modalWishlist.classList.toggle("btn-outline-danger", !inWishlist);
  }

  renderRelatedProducts(id);
  renderReviews(id);
  setTimeout(initReviewStars, 100);

  const modalEl = document.getElementById("productModal");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
  addRecentlyViewed(id);
}

// ---- Validation ----
export function validateShippingInputs(): boolean {
  const form = document.getElementById("shippingForm");
  if (!form) return false;
  const fields = form.querySelectorAll<HTMLInputElement>("input[required]");
  let valid = true;
  fields.forEach(f => {
    f.classList.remove("is-invalid");
    if (!f.value.trim()) {
      f.classList.add("is-invalid");
      valid = false;
    }
  });
  if (!valid) state.showToast("Please fill in all shipping fields.", "danger");
  return valid;
}

// ---- Checkout Multi-Step ----
export function renderCheckoutStep(step: number) {
  if (!state.checkoutContent) return;
  if (state.checkoutSteps) {
    state.checkoutSteps.querySelectorAll(".step-indicator").forEach(el => {
      el.classList.toggle("active", parseInt((el as HTMLElement).dataset.step || "0") <= step);
    });
  }
  if (state.checkoutNext) state.checkoutNext.disabled = false;
  if (state.checkoutNext) state.checkoutNext.innerHTML = "Continue";

  switch (step) {
    case 1: {
      const subtotal = calcCartSubtotal(state.cart);
      const discount = calcDiscount(subtotal);
      const total = subtotal - discount;
      const items = state.cart.length
        ? state.cart.map(i => `<li class="d-flex justify-content-between"><span>${i.name} x${i.qty}</span><span>$${(i.price * i.qty).toFixed(2)}</span></li>`).join("")
        : '<li class="text-muted">Cart is empty</li>';
      let totalHtml = `<div class="d-flex justify-content-between fw-bold"><span>Total</span><span>$${total.toFixed(2)}</span></div>`;
      if (discount > 0) {
        totalHtml = `<div class="d-flex justify-content-between text-muted"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="d-flex justify-content-between text-success"><span>Discount (${state.activeCoupon?.code})</span><span>-$ ${discount.toFixed(2)}</span></div>
          <hr class="my-1">
          ${totalHtml}`;
      }
      state.checkoutContent.innerHTML = `<h6>Review Your Order</h6><ul class="list-unstyled small">${items}</ul><hr>${totalHtml}`;
      if (state.checkoutPrev) state.checkoutPrev.style.display = "none";
      if (state.checkoutNext) state.checkoutNext.textContent = "Continue to Shipping";
      break;
    }
    case 2: {
      state.checkoutContent.innerHTML = `
        <form id="shippingForm">
          <h6>Shipping Information</h6>
          <div class="row g-2">
            <div class="col-6"><label class="form-label small">First Name *</label><input class="form-control form-control-sm" name="firstName" required></div>
            <div class="col-6"><label class="form-label small">Last Name *</label><input class="form-control form-control-sm" name="lastName" required></div>
            <div class="col-12"><label class="form-label small">Address *</label><input class="form-control form-control-sm" name="address" required></div>
            <div class="col-6"><label class="form-label small">City *</label><input class="form-control form-control-sm" name="city" required></div>
            <div class="col-3"><label class="form-label small">State *</label><input class="form-control form-control-sm" name="state" required></div>
            <div class="col-3"><label class="form-label small">ZIP *</label><input class="form-control form-control-sm" name="zip" required></div>
          </div>
        </form>`;
      if (state.checkoutPrev) state.checkoutPrev.style.display = "inline-block";
      if (state.checkoutNext) state.checkoutNext.textContent = "Continue to Payment";
      break;
    }
    case 3: {
      const useStripe = isStripeConfigured();
      state.checkoutContent.innerHTML = `
        <h6>Payment Details</h6>
        <div class="row g-2">
          ${useStripe ? `
            <div class="col-12">
              <label class="form-label small">Card Details</label>
              <div id="stripe-card-element" class="form-control p-2" style="min-height:38px;"></div>
            </div>
            <div class="col-12"><small class="text-muted"><i class="bi bi-shield-lock"></i> Secured by Stripe</small></div>
          ` : `
            <div class="col-12"><label class="form-label small">Card Number</label><input class="form-control form-control-sm" value="4242 4242 4242 4242" disabled></div>
            <div class="col-6"><label class="form-label small">Expiry</label><input class="form-control form-control-sm" value="12/28" disabled></div>
            <div class="col-6"><label class="form-label small">CVV</label><input class="form-control form-control-sm" value="123" disabled></div>
          `}
        </div>
        <p class="small text-muted mt-2"><i class="bi bi-shield-lock"></i> ${useStripe ? "Your payment is processed securely by Stripe." : "Your payment info is simulated and secure."}</p>`;
      if (state.checkoutPrev) state.checkoutPrev.style.display = "inline-block";
      if (state.checkoutNext) state.checkoutNext.innerHTML = '<span class="spinner-border spinner-border-sm d-none" id="placeOrderSpinner"></span> Place Order';
      if (state.checkoutNext) state.checkoutNext.disabled = false;
      if (useStripe) setTimeout(() => mountCardElement("stripe-card-element"), 50);
      break;
    }
    case 4: {
      state.checkoutContent.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-check-circle-fill text-success display-4"></i>
          <h5 class="mt-3">Order Confirmed!</h5>
          <p class="text-muted mb-0">Thank you for your purchase.</p>
          <small class="text-muted">Order #SW-${Date.now().toString(36).toUpperCase()}</small>
        </div>`;
      if (state.checkoutPrev) state.checkoutPrev.style.display = "none";
      if (state.checkoutNext) state.checkoutNext.textContent = "Done";
      break;
    }
  }
}

// ---- Search Suggestions ----
export function updateSuggestions(q: string) {
  if (state.suggestionDebounceTimer) clearTimeout(state.suggestionDebounceTimer);
  if (!q.trim()) { if (state.searchSuggestions) state.searchSuggestions.style.display = "none"; return; }
  const timerId = window.setTimeout(() => {
    const matches = state.products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
    if (matches.length === 0) { if (state.searchSuggestions) state.searchSuggestions.style.display = "none"; return; }
    if (state.searchSuggestions) {
      state.searchSuggestions.innerHTML = matches.map(p =>
        `<button class="dropdown-item suggest-item py-1 small" data-id="${p.id}">
          <i class="bi bi-search me-1"></i> ${p.name} <span class="text-muted float-end">$${p.price.toFixed(2)}</span>
        </button>`
      ).join("");
      state.searchSuggestions.style.display = "block";
    }
  }, 200);
  state.setSuggestionDebounceTimer(timerId);
}

// ---- Chat ----
export function appendChatMsg(text: string, type: string) {
  const div = document.createElement("div");
  div.className = "chat-msg " + type;
  div.textContent = text;
  if (state.chatBody) {
    state.chatBody.appendChild(div);
    state.chatBody.scrollTop = state.chatBody.scrollHeight;
  }
}
