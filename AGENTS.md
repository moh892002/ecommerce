# ShopWave — E-Commerce Frontend

## Quick start

No build step, no server, no npm. Open `index.html` in any browser.

```
open index.html
```

## Structure

```
ecommerce/
  index.html      — Main page (navbar, hero carousel, product grid, modals, footer)
  css/style.css   — Custom styles over Bootstrap
  js/app.js       — All logic: products, cart, wishlist, search, checkout, dark mode, chat
```

## Stack

- **Bootstrap 5.3** + **Bootstrap Icons** via CDN
- **Poppins** (Google Fonts) — the only font family
- All product images from Unsplash (`images.unsplash.com`)
- Fallback image: `placehold.co/400x400?text=Unavailable`

## Key conventions

- Cart, wishlist, recently viewed, and dark mode preference all persist via `localStorage` (keys prefixed `shopwave_`)
- Product data is hardcoded in `js/app.js:6-19` — 12 items across 4 categories
- Toast messages queue up sequentially (not overwritten)
- Search is debounced at 150ms; search suggestions at 200ms
- Staggered card entrance animation capped at `Math.min(i * 0.05, 0.5)s`
- Image `onerror` fallback applied to product, recently viewed, and wishlist thumbnails

## Adding a product

Add an entry to the `products` array in `js/app.js`. Required fields: `id`, `name`, `category`, `price`, `rating`, `reviews`, `image`, `description`. Optional: `originalPrice`, `sale`.

## Data flow

- Product grid, cart, wishlist, recently viewed all re-render via `innerHTML` (no virtual DOM)
- `renderProducts()` → triggered by filter, sort, search, wishlist toggle
- `renderCart()` → triggered by add/remove/change quantity
- Wishlist toggle optimistically updates the clicked button before re-render (300ms delay for animation)

## What's missing for production

See `AGENTS.md` review: no backend, no payment, no image CDN, no tests, no build pipeline, no CSP, no meta tags (partial), no a11y pass.

## Files to read first

- `index.html:1-15` — meta, CDN links, font
- `js/app.js:6-19` — product data
- `js/app.js:77-112` — fallback image constant + toast queue
- `css/style.css:32` — font family
- `css/style.css:88-116` — product card structure
