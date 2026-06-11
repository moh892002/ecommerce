/* =============================================
   ShopWave — Shop Logic (render, add, toggle)
   ============================================= */

// ---- Pure helpers (testable) ----
function getFilteredProducts(prods, category, query, sort) {
  let result = prods.filter(p => {
    const cat = category === "all" || p.category === category;
    const q = !query || p.name.toLowerCase().includes(query.toLowerCase());
    return cat && q;
  });
  switch (sort) {
    case "price-asc": result.sort((a, b) => a.price - b.price); break;
    case "price-desc": result.sort((a, b) => b.price - a.price); break;
    case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
    case "rating": result.sort((a, b) => b.rating - a.rating); break;
  }
  return result;
}

function calcCartSubtotal(cartArr) {
  return cartArr.reduce((s, i) => s + i.price * i.qty, 0);
}

function calcCartItemCount(cartArr) {
  return cartArr.reduce((s, i) => s + i.qty, 0);
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
  let filtered = getFilteredProducts(products, currentCategory, searchQuery, sortBy);

  productGrid.classList.remove("d-none");
  skeletonGrid.classList.add("d-none");

  if (filtered.length === 0) {
    productGrid.innerHTML = `<div class="col-12 text-center py-5"><i class="bi bi-search display-4 text-muted"></i><p class="text-muted mt-2 mb-0">No products found.</p></div>`;
    noProducts.classList.add("d-none");
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
          <img src="${p.image}" alt="${p.name}" loading="lazy" data-id="${p.id}" class="img-loading" onerror="this.src='${FALLBACK_IMG}'; this.classList.remove('img-loading')" onload="this.classList.remove('img-loading')">
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
  productGrid.classList.remove("product-grid-animate");
  requestAnimationFrame(() => productGrid.classList.add("product-grid-animate"));
  updateRecentlyViewedSection();
}

// ---- Render Cart ----
function renderCart() {
  const totalQty = calcCartItemCount(cart);
  cartBadge.textContent = totalQty;
  $("cartBtn")?.setAttribute("aria-label", `Shopping cart (${totalQty} items)`);
  cartBadge.classList.remove("bump");
  void cartBadge.offsetWidth;
  if (totalQty > 0) cartBadge.classList.add("bump");

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="text-center py-5"><i class="bi bi-cart3 display-4 text-muted"></i><p class="text-muted mt-2 mb-0">Your cart is empty.</p></div>';
    cartFooter.classList.add("d-none");
    shippingProgressWrap.classList.add("d-none");
    return;
  }

  const subtotal = calcCartSubtotal(cart);
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
  safeSave("cart", cart);
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
  safeSave("cart", cart);
}

// ---- Wishlist ----
function toggleWishlist(id, btnEl) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) wishlist.splice(idx, 1);
  else wishlist.push(id);

  if (btnEl) {
    btnEl.querySelector("i").className = wishlist.includes(id) ? "bi bi-heart-fill" : "bi bi-heart";
    btnEl.classList.toggle("in-wishlist", wishlist.includes(id));
    btnEl.classList.remove("heart-bounce");
    void btnEl.offsetWidth;
    btnEl.classList.add("heart-bounce");
  }

  setTimeout(() => {
    safeSave("wishlist", wishlist);
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
    safeSave("recentlyViewed", recentlyViewed);
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

// ---- Validation ----
function validateShippingInputs() {
  const fields = checkoutContent.querySelectorAll("#shippingForm input[required]");
  let valid = true;
  fields.forEach(f => {
    f.classList.remove("is-invalid");
    if (!f.value.trim()) {
      f.classList.add("is-invalid");
      valid = false;
    }
  });
  if (!valid) showToast("Please fill in all shipping fields.", "danger");
  return valid;
}

// ---- Checkout Multi-Step ----
function renderCheckoutStep(step) {
  if (!checkoutContent) return;
  checkoutSteps.querySelectorAll(".step-indicator").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.step) <= step);
  });

  checkoutNext.disabled = false;
  checkoutNext.innerHTML = "Continue";

  switch (step) {
    case 1: {
      const total = calcCartSubtotal(cart);
      const items = cart.length ? cart.map(i => `<li class="d-flex justify-content-between"><span>${i.name} x${i.qty}</span><span>$${(i.price * i.qty).toFixed(2)}</span></li>`).join("") : '<li class="text-muted">Cart is empty</li>';
      checkoutContent.innerHTML = `<h6>Review Your Order</h6><ul class="list-unstyled small">${items}</ul><hr><div class="d-flex justify-content-between fw-bold"><span>Total</span><span>$${total.toFixed(2)}</span></div>`;
      checkoutPrev.style.display = "none";
      checkoutNext.textContent = "Continue to Shipping";
      break;
    }
    case 2: {
      checkoutContent.innerHTML = `
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
      checkoutNext.innerHTML = '<span class="spinner-border spinner-border-sm d-none" id="placeOrderSpinner"></span> Place Order';
      checkoutNext.disabled = false;
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

// ---- Search Suggestions ----
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
function appendChatMsg(text, type) {
  const div = document.createElement("div");
  div.className = "chat-msg " + type;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}
