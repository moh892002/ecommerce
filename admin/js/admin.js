const ADMIN_CREDENTIALS = { user: "admin", pass: "admin123" };

// ---- State ----
let currentPage = "dashboard";
let editProductId = null;

// ---- Storage helpers ----
function load(key, fallback) {
  try { const v = localStorage.getItem("shopwave_" + key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, data) { localStorage.setItem("shopwave_" + key, JSON.stringify(data)); }

function getOrders() {
  return load("orders", []).map(o => ({
    ...o,
    total: typeof o.total === "number" ? o.total : (parseFloat(o.total) || 0),
    items: Array.isArray(o.items) ? o.items.length : (typeof o.items === "number" ? o.items : 0)
  }));
}
function setOrders(o) { save("orders", o); }

function getProducts() {
  const stored = load("products", null);
  if (stored) return stored;
  // Fallback: read from the hardcoded list (same as main site)
  return getDefaultProducts();
}

function setProducts(p) { save("products", p); }

function getCategories() {
  const stored = load("categories", null);
  if (stored) return stored;
  return ["electronics", "clothing", "home", "accessories"];
}
function setCategories(c) { save("categories", c); }

function getDefaultProducts() {
  return [
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
}

// ---- DOM Refs ----
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const pageContent = document.getElementById("pageContent");

// ---- Login ----
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    save("admin", 1);
    showDashboard();
  } else {
    document.getElementById("loginError").classList.remove("d-none");
  }
});

function showLogin() {
  save("admin", 0);
  loginScreen.classList.remove("d-none");
  dashboardScreen.classList.add("d-none");
}

function showDashboard() {
  loginScreen.classList.add("d-none");
  dashboardScreen.classList.remove("d-none");
  navigateTo("dashboard");
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  showLogin();
  document.getElementById("loginForm").reset();
});

// ---- Navigation ----
document.querySelectorAll(".sidebar-link").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    navigateTo(btn.dataset.page);
  });
});

function navigateTo(page) {
  currentPage = page;
  switch (page) {
    case "dashboard": renderDashboard(); break;
    case "products": renderProducts(); break;
    case "orders": renderOrders(); break;
    case "categories": renderCategories(); break;
  }
}

// ============================================================
//  DASHBOARD
// ============================================================
function renderDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const revenue = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
  const saleCount = products.filter(p => p.sale).length;

  const last5 = orders.slice(-5).reverse();

  // Category breakdown for chart
  const cats = {};
  products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  const catKeys = Object.keys(cats);
  const catVals = Object.values(cats);
  const catColors = ["#0d6efd","#d63384","#198754","#ffc107"];

  pageContent.innerHTML = `
    <h4 class="fw-bold mb-4"><i class="bi bi-speedometer2"></i> Dashboard</h4>
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card stat-card p-3 shadow-sm"><div class="d-flex align-items-center gap-3"><div class="stat-icon bg-primary bg-opacity-10 text-primary"><i class="bi bi-box-seam"></i></div><div><small class="text-muted">Products</small><h4 class="fw-bold mb-0">${products.length}</h4></div></div></div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card p-3 shadow-sm"><div class="d-flex align-items-center gap-3"><div class="stat-icon bg-success bg-opacity-10 text-success"><i class="bi bi-truck"></i></div><div><small class="text-muted">Orders</small><h4 class="fw-bold mb-0">${orders.length}</h4></div></div></div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card p-3 shadow-sm"><div class="d-flex align-items-center gap-3"><div class="stat-icon bg-warning bg-opacity-10 text-warning"><i class="bi bi-currency-dollar"></i></div><div><small class="text-muted">Revenue</small><h4 class="fw-bold mb-0">$${revenue.toFixed(2)}</h4></div></div></div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card stat-card p-3 shadow-sm"><div class="d-flex align-items-center gap-3"><div class="stat-icon bg-danger bg-opacity-10 text-danger"><i class="bi bi-tag"></i></div><div><small class="text-muted">On Sale</small><h4 class="fw-bold mb-0">${saleCount}</h4></div></div></div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-md-7">
        <div class="card shadow-sm p-3"><h6 class="fw-bold mb-3">Recent Orders</h6>
          ${last5.length ? `<table class="table table-sm mb-0"><thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${last5.map(o => `<tr><td class="order-id">${o.id}</td><td>${o.items}</td><td>$${o.total.toFixed(2)}</td><td><span class="status-badge bg-${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : o.status === 'Cancelled' ? 'danger' : 'warning'} text-white">${o.status}</span></td></tr>`).join("")}</tbody></table>` : '<p class="text-muted small mb-0">No orders yet.</p>'}
        </div>
      </div>
      <div class="col-md-5">
        <div class="card shadow-sm p-3"><h6 class="fw-bold mb-3">Categories</h6>
          <canvas id="categoryChart" height="180"></canvas>
        </div>
      </div>
    </div>
  `;

  // Draw simple category chart
  setTimeout(() => drawCategoryChart(catKeys, catVals, catColors), 50);
}

function drawCategoryChart(labels, data, colors) {
  const c = document.getElementById("categoryChart");
  if (!c) return;
  const ctx = c.getContext("2d");
  const total = data.reduce((s, v) => s + v, 0);
  const w = c.width = c.parentElement.clientWidth;
  const h = c.height = 200;
  const cx = w / 2, cy = 75, r = Math.min(cx, 75) - 10;

  ctx.clearRect(0, 0, w, h);
  let start = -Math.PI / 2;
  data.forEach((val, i) => {
    const angle = (val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
  });
  // Center hole (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Legend (below the donut, two-column layout)
  ctx.textAlign = "left";
  ctx.font = "11px Poppins, sans-serif";
  const legendTop = cy + r + 20;
  data.forEach((val, i) => {
    const x = i % 2 === 0 ? 20 : w / 2 + 10;
    const y = legendTop + Math.floor(i / 2) * 18;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, y - 8, 10, 10);
    ctx.fillStyle = "#666";
    ctx.fillText(labels[i] + " (" + val + ")", x + 16, y + 2);
  });
}

// ============================================================
//  PRODUCTS
// ============================================================
function renderProducts() {
  const products = getProducts();
  pageContent.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0"><i class="bi bi-box-seam"></i> Products</h4>
      <button class="btn btn-primary btn-sm" id="addProductBtn"><i class="bi bi-plus-lg"></i> Add Product</button>
    </div>
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Sale</th><th>Rating</th><th style="width:120px;">Actions</th></tr></thead>
          <tbody>${products.map(p => `
            <tr>
              <td><img src="${p.image}" alt="" onerror="this.src='https://placehold.co/400x400?text=Err'"></td>
              <td class="fw-semibold small">${p.name}</td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${p.category}</span></td>
              <td>${p.sale ? '<span class="text-decoration-line-through text-muted me-1 small">$' + (p.originalPrice || 0).toFixed(2) + '</span>' : ''}<span class="fw-bold ${p.sale ? 'text-danger' : ''}">$${p.price.toFixed(2)}</span></td>
              <td>${p.sale ? '<span class="badge bg-danger">Sale</span>' : '<span class="badge bg-light text-muted">—</span>'}</td>
              <td>${p.rating.toFixed(1)}</td>
              <td>
                <button class="btn btn-outline-primary btn-icon edit-product" data-id="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-icon delete-product" data-id="${p.id}" title="Delete"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("addProductBtn")?.addEventListener("click", () => openProductForm(null));
  document.querySelectorAll(".edit-product").forEach(b => b.addEventListener("click", () => openProductForm(parseInt(b.dataset.id))));
  document.querySelectorAll(".delete-product").forEach(b => b.addEventListener("click", () => deleteProduct(parseInt(b.dataset.id))));
}

function openProductForm(id) {
  editProductId = id;
  const products = getProducts();
  const categories = getCategories();
  const p = id ? products.find(x => x.id === id) : null;

  document.getElementById("productFormTitle").textContent = p ? "Edit Product" : "Add Product";
  document.getElementById("pfSubmit").textContent = p ? "Update" : "Save";
  document.getElementById("pfId").value = p ? p.id : "";
  document.getElementById("pfName").value = p ? p.name : "";
  const catSelect = document.getElementById("pfCategory");
  catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
  catSelect.value = p ? p.category : (categories[0] || "");
  document.getElementById("pfPrice").value = p ? p.price : "";
  document.getElementById("pfOriginalPrice").value = p ? (p.originalPrice || "") : "";
  document.getElementById("pfSale").value = p ? (p.sale ? "true" : "false") : "false";
  document.getElementById("pfRating").value = p ? p.rating : "";
  document.getElementById("pfImage").value = p ? p.image : "";
  document.getElementById("pfDesc").value = p ? p.description : "";

  new bootstrap.Modal(document.getElementById("productFormModal")).show();
}

document.getElementById("productForm").addEventListener("submit", e => {
  e.preventDefault();
  const products = getProducts();
  const id = editProductId || (products.length ? Math.max(...products.map(x => x.id)) + 1 : 1);
  const originalPriceVal = document.getElementById("pfOriginalPrice").value.trim();
  const product = {
    id,
    name: document.getElementById("pfName").value.trim(),
    category: document.getElementById("pfCategory").value,
    price: parseFloat(document.getElementById("pfPrice").value),
    originalPrice: originalPriceVal ? parseFloat(originalPriceVal) : null,
    sale: document.getElementById("pfSale").value === "true",
    rating: parseFloat(document.getElementById("pfRating").value) || 0,
    reviews: editProductId ? (products.find(x => x.id === id)?.reviews || 0) : 0,
    image: document.getElementById("pfImage").value.trim(),
    description: document.getElementById("pfDesc").value.trim()
  };

  if (editProductId) {
    const idx = products.findIndex(x => x.id === id);
    if (idx > -1) products[idx] = product;
  } else {
    products.push(product);
  }
  setProducts(products);
  bootstrap.Modal.getInstance(document.getElementById("productFormModal")).hide();
  renderProducts();
});

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  let products = getProducts().filter(p => p.id !== id);
  setProducts(products);
  renderProducts();
}

// ============================================================
//  ORDERS
// ============================================================
function renderOrders() {
  const orders = getOrders();
  const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  pageContent.innerHTML = `
    <h4 class="fw-bold mb-3"><i class="bi bi-truck"></i> Orders</h4>
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th style="width:160px;">Update</th></tr></thead>
          <tbody>${orders.length ? [...orders].reverse().map(o => `
            <tr>
              <td class="order-id small">${o.id}</td>
              <td><small>${new Date(o.date).toLocaleDateString()}</small></td>
              <td><small>${o.items}</small></td>
              <td><span class="fw-semibold">$${o.total.toFixed(2)}</span></td>
              <td><span class="status-badge bg-${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : o.status === 'Cancelled' ? 'danger' : 'warning'} text-white">${o.status}</span></td>
              <td>
                <select class="form-select form-select-sm order-status" data-id="${o.id}">
                  ${statuses.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join("")}
                </select>
              </td>
            </tr>`).join("") : `<tr><td colspan="6" class="text-center text-muted py-4">No orders yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.querySelectorAll(".order-status").forEach(sel => {
    sel.addEventListener("change", () => {
      const orders = getOrders();
      const o = orders.find(x => x.id === sel.dataset.id);
      if (o) { o.status = sel.value; setOrders(orders); renderOrders(); }
    });
  });
}

// ============================================================
//  CATEGORIES
// ============================================================
function renderCategories() {
  const categories = getCategories();
  const products = getProducts();
  pageContent.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0"><i class="bi bi-tags"></i> Categories</h4>
      <button class="btn btn-primary btn-sm" id="addCategoryBtn"><i class="bi bi-plus-lg"></i> Add Category</button>
    </div>
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Products</th><th style="width:120px;">Actions</th></tr></thead>
          <tbody>${categories.map(c => `
            <tr>
              <td class="fw-semibold small">${c}</td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${products.filter(p => p.category === c).length}</span></td>
              <td>
                <button class="btn btn-outline-primary btn-icon edit-category" data-name="${c}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-icon delete-category" data-name="${c}" title="Delete"><i class="bi bi-trash"></i></button>
              </td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

  document.getElementById("addCategoryBtn")?.addEventListener("click", () => openCategoryForm(null));
  document.querySelectorAll(".edit-category").forEach(b => b.addEventListener("click", () => openCategoryForm(b.dataset.name)));
  document.querySelectorAll(".delete-category").forEach(b => b.addEventListener("click", () => deleteCategory(b.dataset.name)));
}

let editCategoryName = null;
function openCategoryForm(name) {
  editCategoryName = name;
  document.getElementById("catFormTitle").textContent = name ? "Edit Category" : "Add Category";
  document.getElementById("catSubmit").textContent = name ? "Update" : "Save";
  document.getElementById("catName").value = name || "";
  new bootstrap.Modal(document.getElementById("categoryFormModal")).show();
}

document.getElementById("categoryForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("catName").value.trim();
  if (!name) return;
  let categories = getCategories();
  if (editCategoryName) {
    const idx = categories.indexOf(editCategoryName);
    if (idx > -1) categories[idx] = name;
  } else {
    if (categories.includes(name)) { alert("Category already exists."); return; }
    categories.push(name);
  }
  setCategories(categories);
  bootstrap.Modal.getInstance(document.getElementById("categoryFormModal")).hide();
  renderCategories();
});

function deleteCategory(name) {
  if (!confirm("Delete category \"" + name + "\"?")) return;
  let categories = getCategories().filter(c => c !== name);
  setCategories(categories);
  renderCategories();
}

// ============================================================
//  INIT
// ============================================================
function init() {
  if (load("admin", 0) === 1) {
    showDashboard();
  } else {
    showLogin();
  }
}

init();
