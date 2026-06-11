/* =============================================
   ShopWave — Event Listeners & Init
   ============================================= */

// ---- Chat ----
let chatOpen = false;

chatToggle?.addEventListener("click", () => {
  chatOpen = !chatOpen;
  chatBox.classList.toggle("d-none", !chatOpen);
  chatToggle.innerHTML = chatOpen ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-chat-dots-fill"></i>';
});

chatSend?.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  if (!msg) return;
  appendChatMsg(msg, "sent");
  chatInput.value = "";
  setTimeout(() => appendChatMsg("Thanks for reaching out! Our team will get back to you shortly.", "received"), 800);
});

chatInput?.addEventListener("keydown", e => { if (e.key === "Enter") chatSend.click(); });

// ---- Product Grid ----
productGrid?.addEventListener("click", e => {
  const target = e.target;
  const wlBtn = target.closest(".wishlist-btn");
  if (wlBtn) {
    e.stopPropagation();
    toggleWishlist(parseInt(wlBtn.dataset.id), wlBtn);
    return;
  }
  const cartBtn = target.closest(".add-to-cart");
  if (cartBtn) {
    e.stopPropagation();
    addToCart(parseInt(cartBtn.dataset.id));
    return;
  }
  const cardImg = target.closest(".card-img-container");
  const cardTitle = target.closest(".card-title");
  if (cardImg || cardTitle) {
    const id = parseInt((cardImg || cardTitle).dataset.id);
    if (id) openProductModal(id);
    return;
  }
  const card = target.closest(".product-card");
  if (card && !target.closest("button")) {
    const id = parseInt(card.dataset.id);
    if (id) openProductModal(id);
  }
});

// ---- Recently Viewed ----
recentlyGrid?.addEventListener("click", e => {
  const card = e.target.closest(".product-card");
  if (card) {
    const id = parseInt(card.dataset.id);
    if (id) openProductModal(id);
  }
});

// ---- Cart ----
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

// ---- Wishlist Body ----
wishlistBody?.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (btn.classList.contains("add-to-cart")) addToCart(id);
  else if (btn.classList.contains("remove-wishlist")) toggleWishlist(id, btn);
});

// ---- Filter & Sort ----
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});

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
  if (checkoutStep === 2 && !validateShippingInputs()) return;
  if (checkoutStep === 4) {
    checkoutNext.disabled = true;
    const spinner = $("placeOrderSpinner");
    if (spinner) spinner.classList.remove("d-none");
    const rawTotal = calcCartSubtotal(cart);
    const order = {
      id: "SW-" + Date.now().toString(36).toUpperCase(),
      items: calcCartItemCount(cart),
      total: Math.round(rawTotal * 100) / 100,
      date: new Date().toISOString(),
      status: "pending"
    };
    try {
      const orders = loadStorage("orders", []);
      orders.unshift(order);
      safeSave("orders", orders);
      cart = [];
      renderCart();
      safeSave("cart", cart);
      bootstrap.Modal.getInstance($("checkoutModal"))?.hide();
      showToast("Order placed! Thank you for shopping.");
    } catch {
      showToast("Something went wrong placing your order. Please try again.", "danger");
      checkoutNext.disabled = false;
      if (spinner) spinner.classList.add("d-none");
    }
    return;
  }
  checkoutStep++;
  renderCheckoutStep(checkoutStep);
});

checkoutPrev?.addEventListener("click", () => {
  if (checkoutStep > 1) checkoutStep--;
  renderCheckoutStep(checkoutStep);
});

// ---- Dark Mode ----
darkModeToggle?.addEventListener("click", toggleDarkMode);

// ---- Newsletter ----
newsletterForm?.addEventListener("submit", e => {
  e.preventDefault();
  const input = newsletterForm.querySelector("input");
  if (!input.value.trim()) return;
  newsletterMsg.textContent = "Thanks for subscribing! Check your inbox.";
  input.value = "";
});

// ---- Wishlist Button ----
$("wishlistBtn")?.addEventListener("click", () => {
  const offcanvas = new bootstrap.Offcanvas($("wishlistOffcanvas"));
  offcanvas.show();
});

// ---- Init ----
function init() {
  const saved = loadStorage("darkMode", "light");
  applyTheme(saved);
  setTimeout(() => renderProducts(), 600);
  renderCart();
  renderWishlist();
}

init();
