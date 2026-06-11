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
  js/app.js           — All client logic: products, cart, wishlist, search, checkout, dark mode, chat
  admin/
    index.html        — Admin dashboard shell
    css/admin.css     — Admin layout & stat cards
    js/admin.js       — Admin: login, products CRUD, orders viewer, dashboard chart
```

## Stack

- **Bootstrap 5.3** + **Bootstrap Icons** via CDN
- **Poppins** (Google Fonts) — the only font family
- All product images from Unsplash (`images.unsplash.com`)
- Fallback image: `placehold.co/400x400?text=Unavailable`

## Key conventions

- All data persists via `localStorage` with `shopwave_*` keys
- Product data starts hardcoded in `js/app.js` but is **overridden** by `shopwave_products` if admin has saved edits
- Orders placed in checkout are saved to `shopwave_orders` (key `"orders"`) so they appear in the admin dashboard
- Admin reads/writes `shopwave_products` and `shopwave_orders`; main site reads both
- Toast messages queue up sequentially (not overwritten)
- Search is debounced at 150ms; search suggestions at 200ms
- Staggered card entrance animation capped at `Math.min(i * 0.05, 0.5)s`
- Image `onerror` fallback applied to all product images

## Adding a product

Add an entry to the `products` array in `js/app.js` (line ~6). Required fields: `id`, `name`, `category`, `price`, `rating`, `reviews`, `image`, `description`. Optional: `originalPrice`, `sale`. Admin dashboard also allows adding products via UI — those are saved to `shopwave_products` and override the hardcoded array.

## Data flow

- Product grid, cart, wishlist, recently viewed all re-render via `innerHTML` (no virtual DOM)
- `renderProducts()` → triggered by filter, sort, search, wishlist toggle
- `renderCart()` → triggered by add/remove/change quantity
- Wishlist toggle optimistically updates the clicked button before re-render (300ms delay for animation)
- Checkout step 4 writes order to `shopwave_orders` in localStorage so admin sees it
- Admin: edits/creates products in `shopwave_products`; main site fetches from there on load

## What's missing for production

No backend, no payment (simulated), no image CDN, no tests, no build pipeline, no CSP, no a11y pass.

## Files to read first

- `index.html:1-15` — meta, CDN links, font
- `js/app.js:6-19` — product data (hardcoded defaults)
- `js/app.js:22-26` — localStorage override + state init
- `js/app.js:87-122` — fallback image constant + toast queue
- `css/style.css:32` — font family
- `css/style.css:88-116` — product card structure
- `admin/js/admin.js:1-30` — admin data loading logic
