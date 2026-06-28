import * as api from "../api";
import type { Product, Order } from "../types";
import "../styles/admin.css";

const ADMIN_CREDENTIALS = { user: "admin", pass: "admin123" };

let currentPage = "dashboard";
let editProductId: number | null = null;
let editCategoryName: string | null = null;

function load(key: string, fallback: any = null) {
  try { const v = localStorage.getItem("shopwave_" + key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key: string, data: any) { localStorage.setItem("shopwave_" + key, JSON.stringify(data)); }

function getOrders(): Order[] {
  return load("orders", []).map((o: any) => ({
    ...o,
    total: typeof o.total === "number" ? o.total : (parseFloat(o.total) || 0),
    items: Array.isArray(o.items) ? o.items.length : (typeof o.items === "number" ? o.items : 0),
    userId: o.userId || ""
  }));
}

function getUsers() {
  try {
    const d = localStorage.getItem("shopwave_users");
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

async function getProducts() {
  return await api.getProducts();
}

async function setProducts(products: Product[]) {
  await api.saveProducts(products);
}

const loginScreen = document.getElementById("loginScreen")!;
const dashboardScreen = document.getElementById("dashboardScreen")!;
const pageContent = document.getElementById("pageContent")!;

document.getElementById("loginForm")!.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = (document.getElementById("loginUser") as HTMLInputElement).value.trim();
  const pass = (document.getElementById("loginPass") as HTMLInputElement).value.trim();
  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    save("admin", 1);
    showDashboard();
  } else {
    document.getElementById("loginError")!.classList.remove("d-none");
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

(document.getElementById("logoutBtn") as HTMLButtonElement).addEventListener("click", () => {
  showLogin();
  (document.getElementById("loginForm") as HTMLFormElement).reset();
});

document.querySelectorAll(".sidebar-link").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sidebar-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    navigateTo((btn as HTMLElement).dataset.page!);
  });
});

function navigateTo(page: string) {
  currentPage = page;
  switch (page) {
    case "dashboard": renderDashboard(); break;
    case "products": renderProducts(); break;
    case "orders": renderOrders(); break;
    case "categories": renderCategories(); break;
    case "users": renderUsers(); break;
  }
}

// ============================================================
//  DASHBOARD
// ============================================================
async function renderDashboard() {
  const products = await getProducts();
  const orders = getOrders();
  const revenue = orders.filter((o: Order) => o.status !== "Cancelled").reduce((s: number, o: Order) => s + (o.total || 0), 0);
  const saleCount = products.filter(p => p.sale).length;
  const last5 = orders.slice(-5).reverse();

  const cats: Record<string, number> = {};
  products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  const catKeys = Object.keys(cats);
  const catVals = Object.values(cats);
  const catColors = ["#0d6efd", "#d63384", "#198754", "#ffc107"];

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
          ${last5.length ? `<table class="table table-sm mb-0"><thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>${last5.map((o: Order) => `<tr><td class="order-id">${o.id}</td><td>${o.items}</td><td>$${o.total.toFixed(2)}</td><td><span class="status-badge bg-${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : o.status === 'Cancelled' ? 'danger' : 'warning'} text-white">${o.status}</span></td></tr>`).join("")}</tbody></table>` : '<p class="text-muted small mb-0">No orders yet.</p>'}
        </div>
      </div>
      <div class="col-md-5">
        <div class="card shadow-sm p-3"><h6 class="fw-bold mb-3">Categories</h6>
          <canvas id="categoryChart" height="180"></canvas>
        </div>
      </div>
    </div>
  `;
  setTimeout(() => drawCategoryChart(catKeys, catVals, catColors), 50);
}

function drawCategoryChart(labels: string[], data: number[], colors: string[]) {
  const c = document.getElementById("categoryChart") as HTMLCanvasElement | null;
  if (!c) return;
  const ctx = c.getContext("2d")!;
  const total = data.reduce((s, v) => s + v, 0);
  const w = c.width = c.parentElement!.clientWidth;
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
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

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
async function renderProducts() {
  const products = await getProducts();
  pageContent.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0"><i class="bi bi-box-seam"></i> Products</h4>
      <button class="btn btn-primary btn-sm" id="addProductBtn"><i class="bi bi-plus-lg"></i> Add Product</button>
    </div>
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Sale</th><th>Rating</th><th style="width:120px;">Actions</th></tr></thead>
          <tbody>${products.map((p: Product) => `
            <tr>
              <td><img src="${p.image}" alt="" loading="lazy" onerror="this.src='https://placehold.co/400x400?text=Err'"></td>
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
  document.querySelectorAll(".edit-product").forEach(b => b.addEventListener("click", () => openProductForm(parseInt((b as HTMLElement).dataset.id!))));
  document.querySelectorAll(".delete-product").forEach(b => b.addEventListener("click", () => deleteProduct(parseInt((b as HTMLElement).dataset.id!))));
}

async function openProductForm(id: number | null) {
  editProductId = id;
  const products = await getProducts();
  const categories = load("categories", ["electronics", "clothing", "home", "accessories"]);
  const p = id ? products.find(x => x.id === id) : null;

  document.getElementById("productFormTitle")!.textContent = p ? "Edit Product" : "Add Product";
  document.getElementById("pfSubmit")!.textContent = p ? "Update" : "Save";
  (document.getElementById("pfId") as HTMLInputElement).value = p ? String(p.id) : "";
  (document.getElementById("pfName") as HTMLInputElement).value = p ? p.name : "";
  const catSelect = document.getElementById("pfCategory") as HTMLSelectElement;
  catSelect.innerHTML = categories.map((c: string) => `<option value="${c}">${c}</option>`).join("");
  catSelect.value = p ? p.category : (categories[0] || "");
  (document.getElementById("pfPrice") as HTMLInputElement).value = p ? String(p.price) : "";
  (document.getElementById("pfOriginalPrice") as HTMLInputElement).value = p ? (p.originalPrice ? String(p.originalPrice) : "") : "";
  (document.getElementById("pfSale") as HTMLSelectElement).value = p ? (p.sale ? "true" : "false") : "false";
  (document.getElementById("pfRating") as HTMLInputElement).value = p ? String(p.rating) : "";
  (document.getElementById("pfImage") as HTMLInputElement).value = p ? p.image : "";
  (document.getElementById("pfDesc") as HTMLTextAreaElement).value = p ? p.description : "";

  new (bootstrap as any).Modal(document.getElementById("productFormModal")!).show();

  // Image upload
  const uploadBtn = document.getElementById("pfImageUploadBtn");
  const fileInput = document.getElementById("pfImageFileInput") as HTMLInputElement | null;
  uploadBtn?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const url = await api.uploadImage(file);
    if (url) {
      (document.getElementById("pfImage") as HTMLInputElement).value = url;
      alert("Image uploaded!");
    } else {
      alert("Upload failed. Make sure Supabase Storage is configured.");
    }
  });
}

(document.getElementById("productForm") as HTMLFormElement).addEventListener("submit", async (e) => {
  e.preventDefault();
  const products = await getProducts();
  const id = editProductId || (products.length ? Math.max(...products.map(x => x.id)) + 1 : 1);
  const originalPriceVal = (document.getElementById("pfOriginalPrice") as HTMLInputElement).value.trim();
  const product: Product = {
    id,
    name: (document.getElementById("pfName") as HTMLInputElement).value.trim(),
    category: (document.getElementById("pfCategory") as HTMLSelectElement).value,
    price: parseFloat((document.getElementById("pfPrice") as HTMLInputElement).value),
    originalPrice: originalPriceVal ? parseFloat(originalPriceVal) : null,
    sale: (document.getElementById("pfSale") as HTMLSelectElement).value === "true",
    rating: parseFloat((document.getElementById("pfRating") as HTMLInputElement).value) || 0,
    reviews: editProductId ? (products.find(x => x.id === id)?.reviews || 0) : 0,
    image: (document.getElementById("pfImage") as HTMLInputElement).value.trim(),
    description: (document.getElementById("pfDesc") as HTMLTextAreaElement).value.trim()
  };

  if (editProductId) {
    const idx = products.findIndex(x => x.id === id);
    if (idx > -1) products[idx] = product;
  } else {
    products.push(product);
  }
  await setProducts(products);
  (bootstrap as any).Modal.getInstance(document.getElementById("productFormModal")!)!.hide();
  renderProducts();
});

async function deleteProduct(id: number) {
  if (!confirm("Delete this product?")) return;
  let products = await getProducts();
  products = products.filter(p => p.id !== id);
  await setProducts(products);
  await api.deleteProductFromDB(id);
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
          <tbody>${orders.length ? [...orders].reverse().map((o: Order) => `
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
      const o = orders.find((x: Order) => x.id === (sel as HTMLElement).dataset.id);
      if (o) { o.status = (sel as HTMLSelectElement).value; save("orders", orders); renderOrders(); }
    });
  });
}

// ============================================================
//  CATEGORIES
// ============================================================
async function renderCategories() {
  const categories = await api.getCategories();
  const products = await getProducts();
  pageContent.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0"><i class="bi bi-tags"></i> Categories</h4>
      <button class="btn btn-primary btn-sm" id="addCategoryBtn"><i class="bi bi-plus-lg"></i> Add Category</button>
    </div>
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Products</th><th style="width:120px;">Actions</th></tr></thead>
          <tbody>${categories.map((c: string) => `
            <tr>
              <td class="fw-semibold small">${c}</td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${products.filter((p: Product) => p.category === c).length}</span></td>
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
  document.querySelectorAll(".edit-category").forEach(b => b.addEventListener("click", () => openCategoryForm((b as HTMLElement).dataset.name!)));
  document.querySelectorAll(".delete-category").forEach(b => b.addEventListener("click", () => deleteCategory((b as HTMLElement).dataset.name!)));
}

function openCategoryForm(name: string | null) {
  editCategoryName = name;
  document.getElementById("catFormTitle")!.textContent = name ? "Edit Category" : "Add Category";
  document.getElementById("catSubmit")!.textContent = name ? "Update" : "Save";
  (document.getElementById("catName") as HTMLInputElement).value = name || "";
  new (bootstrap as any).Modal(document.getElementById("categoryFormModal")!).show();
}

(document.getElementById("categoryForm") as HTMLFormElement).addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (document.getElementById("catName") as HTMLInputElement).value.trim();
  if (!name) return;
  let categories = await api.getCategories();
  if (editCategoryName) {
    const idx = categories.indexOf(editCategoryName);
    if (idx > -1) categories[idx] = name;
  } else {
    if (categories.includes(name)) { alert("Category already exists."); return; }
    categories.push(name);
  }
  await api.saveCategories(categories);
  (bootstrap as any).Modal.getInstance(document.getElementById("categoryFormModal")!)!.hide();
  renderCategories();
});

function deleteCategory(name: string) {
  if (!confirm(`Delete category "${name}"?`)) return;
  let categories = load("categories", ["electronics", "clothing", "home", "accessories"]).filter((c: string) => c !== name);
  save("categories", categories);
  renderCategories();
}

// ============================================================
//  USERS
// ============================================================
function renderUsers() {
  const users = getUsers();
  const orders = getOrders();
  const statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  pageContent.innerHTML = `
    <h4 class="fw-bold mb-3"><i class="bi bi-people"></i> Users</h4>
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Email</th><th>User ID</th><th>Orders</th><th>Total Spent</th><th style="width:100px;">Actions</th></tr></thead>
          <tbody>${users.length ? users.map((u: any) => {
            const userOrders = orders.filter((o: Order) => o.userId === u.id);
            const totalSpent = userOrders.reduce((s: number, o: Order) => s + (o.total || 0), 0);
            return `<tr>
              <td class="fw-semibold small">${u.email}</td>
              <td><code class="small">${u.id}</code></td>
              <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${userOrders.length}</span></td>
              <td><span class="fw-semibold">$${totalSpent.toFixed(2)}</span></td>
              <td>
                <button class="btn btn-outline-primary btn-icon view-user" data-id="${u.id}" title="View Orders"><i class="bi bi-eye"></i></button>
              </td>
            </tr>`;
          }).join("") : `<tr><td colspan="5" class="text-center text-muted py-4">No registered users yet.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Orders Modal -->
    <div class="modal fade" id="userOrdersModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userOrdersTitle"><i class="bi bi-person"></i> User Orders</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <div id="userOrdersContent" class="p-3"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll(".view-user").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = (btn as HTMLElement).dataset.id!;
      const user = users.find((u: any) => u.id === userId);
      const userOrders = orders.filter((o: Order) => o.userId === userId);
      const totalSpent = userOrders.reduce((s: number, o: Order) => s + (o.total || 0), 0);

      document.getElementById("userOrdersTitle")!.innerHTML =
        `<i class="bi bi-person"></i> ${user?.email || userId}'s Orders`;

      document.getElementById("userOrdersContent")!.innerHTML = userOrders.length ? `
        <div class="mb-3">
          <span class="badge bg-primary">${userOrders.length} orders</span>
          <span class="badge bg-success">Total: $${totalSpent.toFixed(2)}</span>
        </div>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead class="table-light"><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th style="width:140px;">Update</th></tr></thead>
            <tbody>${userOrders.map((o: Order) => `
              <tr>
                <td class="order-id small">${o.id}</td>
                <td><small>${new Date(o.date).toLocaleDateString()}</small></td>
                <td><small>${o.items}</small></td>
                <td><span class="fw-semibold">$${o.total.toFixed(2)}</span></td>
                <td><span class="status-badge bg-${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : o.status === 'Cancelled' ? 'danger' : 'warning'} text-white">${o.status}</span></td>
                <td>
                  <select class="form-select form-select-sm user-order-status" data-id="${o.id}">
                    ${statuses.map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join("")}
                  </select>
                </td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : '<p class="text-muted text-center py-4 mb-0">No orders from this user.</p>';

      new (bootstrap as any).Modal(document.getElementById("userOrdersModal")!).show();
    });
  });
}

// Handle status changes inside the user orders modal (delegated)
document.addEventListener("change", (e) => {
  const sel = (e.target as HTMLElement).closest(".user-order-status") as HTMLSelectElement | null;
  if (!sel) return;
  const orders = getOrders();
  const order = orders.find((o: Order) => o.id === sel.dataset.id);
  if (order) {
    order.status = sel.value;
    save("orders", orders);
    renderUsers();
  }
});

// ---- Init ----
function init() {
  if (load("admin", 0) === 1) {
    showDashboard();
  } else {
    showLogin();
  }
}

init();
