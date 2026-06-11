# ShopWave — E-Commerce Frontend

## Quick start

No build step, no server, no npm. Open `index.html` in any browser.

```
open index.html
```

## Structure

```
ecommerce/
  index.html          — Main shop page
  css/style.css       — Custom styles over Bootstrap
  js/
    data.js           — State, DOM refs, localStorage helpers, toast
    shop.js           — Rendering & business logic (filter, cart, wishlist, checkout)
    app.js            — Event listeners & initialization
  admin/
    index.html        — Admin dashboard shell
    css/admin.css     — Admin layout & stat cards
    js/admin.js       — Admin: login, products CRUD, orders viewer, categories, chart
  tests/
    index.html        — QUnit test runner (open in browser)
    tests.js          — Unit tests for pure functions & state logic
  package.json        — `npm start` runs `npx serve .`
  netlify.toml        — One-click Netlify deploy config
  AGENTS.md           — This file
  README.md           — Project overview for GitHub
```

## Stack

- **Bootstrap 5.3** + **Bootstrap Icons** via CDN
- **Poppins** (Google Fonts) — the only font family
- All product images from Unsplash (`images.unsplash.com`)
- Fallback image: `placehold.co/400x400?text=Unavailable`
- Tests: **QUnit** via CDN (`tests/index.html`)

## Key conventions

- All data persists via `localStorage` with `shopwave_*` keys
- Product data starts hardcoded in `js/data.js` but is **overridden** by `shopwave_products` if admin has saved edits
- Orders placed in checkout are saved to `shopwave_orders` (key `"orders"`) so they appear in the admin dashboard
- Admin reads/writes `shopwave_products` and `shopwave_orders`; main site reads both
- Toast messages queue up sequentially (not overwritten)
- Search is debounced at 150ms; search suggestions at 200ms
- Staggered card entrance animation capped at `Math.min(i * 0.05, 0.5)s`
- Image `onerror` fallback + `onload` blur-up applied to all product images
- `safeSave(key, data)` wraps `saveStorage` in try-catch for quota errors
- Checkout step 2 validates shipping fields before proceeding

## Pure functions (testable without DOM)

- `getFilteredProducts(products, category, query, sort)` → array
- `calcCartSubtotal(cart)` → number
- `calcCartItemCount(cart)` → number
- `renderStars(rating)` → HTML string

## Adding a product

Add an entry to the `products` array in `js/data.js`. Required fields: `id`, `name`, `category`, `price`, `rating`, `reviews`, `image`, `description`. Optional: `originalPrice`, `sale`. Admin dashboard also allows adding products via UI — those are saved to `shopwave_products` and override the hardcoded array.

## Data flow

- Product grid, cart, wishlist, recently viewed all re-render via `innerHTML` (no virtual DOM)
- `renderProducts()` → triggered by filter, sort, search, wishlist toggle
- `renderCart()` → triggered by add/remove/change quantity
- Wishlist toggle optimistically updates the clicked button before re-render (300ms delay for animation)
- Checkout step 4 writes order to `shopwave_orders` in localStorage so admin sees it
- Admin: edits/creates products in `shopwave_products`; main site fetches from there on load

## Running tests

Open `tests/index.html` in a browser. All tests run in QUnit.

## What's missing for production

No backend, no payment (simulated), no image CDN, no build pipeline, no CSP, no a11y pass.

## Files to read first

- `index.html:1-15` — meta, CDN links, font
- `js/data.js:1-30` — product data + localStorage override
- `js/data.js:80-120` — helpers + toast queue
- `js/shop.js:1-30` — pure functions
- `css/style.css:32` — font family
- `css/style.css:88-130` — product card structure
- `tests/tests.js` — test patterns
