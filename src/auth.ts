import * as api from "./api";
import * as state from "./data";
import { getOrders } from "./api";
import type { Order } from "./types";

export function renderAuthUI(): string {
  if (state.currentUserId) {
    return `
      <div class="dropdown">
        <button class="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle"></i> ${state.currentUserEmail || "Account"}
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#" id="myOrdersBtn"><i class="bi bi-box"></i> My Orders</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Sign Out</a></li>
        </ul>
      </div>`;
  }
  return `
    <button class="btn btn-outline-light btn-sm" id="loginBtn" data-bs-toggle="modal" data-bs-target="#authModal">
      <i class="bi bi-person"></i> Sign In
    </button>`;
}

export function renderAuthModalBody(): string {
  return `
    <div id="authFormContainer">
      <ul class="nav nav-pills nav-justified mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="loginTab" data-bs-toggle="pill" data-bs-target="#loginFormPane" type="button">Sign In</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="registerTab" data-bs-toggle="pill" data-bs-target="#registerFormPane" type="button">Register</button>
        </li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="loginFormPane">
          <form id="loginForm">
            <div class="mb-3">
              <label class="form-label small">Email</label>
              <input type="email" class="form-control form-control-sm" id="loginEmail" required>
            </div>
            <div class="mb-3">
              <label class="form-label small">Password</label>
              <input type="password" class="form-control form-control-sm" id="loginPassword" required>
            </div>
            <div class="text-danger small mb-2 d-none" id="loginError"></div>
            <button type="submit" class="btn btn-primary w-100 btn-sm">Sign In</button>
          </form>
        </div>
        <div class="tab-pane fade" id="registerFormPane">
          <form id="registerForm">
            <div class="mb-3">
              <label class="form-label small">Email</label>
              <input type="email" class="form-control form-control-sm" id="registerEmail" required>
            </div>
            <div class="mb-3">
              <label class="form-label small">Password (min 6 chars)</label>
              <input type="password" class="form-control form-control-sm" id="registerPassword" minlength="6" required>
            </div>
            <div class="text-danger small mb-2 d-none" id="registerError"></div>
            <div class="text-success small mb-2 d-none" id="registerSuccess"></div>
            <button type="submit" class="btn btn-primary w-100 btn-sm">Create Account</button>
          </form>
        </div>
      </div>
    </div>
    <div id="ordersContainer" class="d-none">
      <h6 class="fw-bold mb-3"><i class="bi bi-box"></i> My Orders</h6>
      <div id="ordersList"></div>
      <button class="btn btn-outline-secondary btn-sm mt-2" id="backToAuthBtn"><i class="bi bi-arrow-left"></i> Back</button>
    </div>`;
}

export function initAuth() {
  const loginForm = document.getElementById("loginForm") as HTMLFormElement | null;
  const registerForm = document.getElementById("registerForm") as HTMLFormElement | null;

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("loginEmail") as HTMLInputElement).value;
    const password = (document.getElementById("loginPassword") as HTMLInputElement).value;
    const errorEl = document.getElementById("loginError")!;
    errorEl.classList.add("d-none");
    try {
      await api.signIn(email, password);
      bootstrap.Modal.getInstance(document.getElementById("authModal")!)?.hide();
      state.showToast("Signed in successfully!");
    } catch (err: any) {
      errorEl.textContent = err.message || "Invalid credentials";
      errorEl.classList.remove("d-none");
    }
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = (document.getElementById("registerEmail") as HTMLInputElement).value;
    const password = (document.getElementById("registerPassword") as HTMLInputElement).value;
    const errorEl = document.getElementById("registerError")!;
    const successEl = document.getElementById("registerSuccess")!;
    errorEl.classList.add("d-none");
    successEl.classList.add("d-none");
    try {
      await api.signUp(email, password);
      successEl.textContent = "Account created! Check your email to confirm.";
      successEl.classList.remove("d-none");
    } catch (err: any) {
      errorEl.textContent = err.message || "Registration failed";
      errorEl.classList.remove("d-none");
    }
  });

  document.getElementById("myOrdersBtn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    document.getElementById("authFormContainer")?.classList.add("d-none");
    document.getElementById("ordersContainer")?.classList.remove("d-none");
    const orders = await getOrders(state.currentUserId ?? undefined);
    const list = document.getElementById("ordersList");
    if (list) {
      if (orders.length === 0) {
        list.innerHTML = '<p class="text-muted small">No orders yet.</p>';
      } else {
        list.innerHTML = orders.map((o: Order) => `
          <div class="d-flex justify-content-between align-items-center border-bottom py-2">
            <div>
              <small class="fw-semibold d-block">${o.id}</small>
              <small class="text-muted">${new Date(o.date).toLocaleDateString()} · ${o.items} items</small>
            </div>
            <div class="text-end">
              <small class="fw-bold d-block">$${o.total.toFixed(2)}</small>
              <span class="badge bg-${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : 'warning'}">${o.status}</span>
            </div>
          </div>
        `).join("");
      }
    }
  });

  document.getElementById("backToAuthBtn")?.addEventListener("click", () => {
    document.getElementById("authFormContainer")?.classList.remove("d-none");
    document.getElementById("ordersContainer")?.classList.add("d-none");
  });

  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    api.signOut();
    state.showToast("Signed out.");
  });
}

export function updateAuthUI(): void {
  const container = document.getElementById("authContainer");
  if (container) container.innerHTML = renderAuthUI();
}
