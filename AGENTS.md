# ShopWave — E-Commerce Frontend

## Quick start

```bash
npm install
npm run dev
# Opens at http://localhost:3000
```

## Structure

```
ecommerce/
  index.html              — Main shop page (Vite entry)
  admin/index.html        — Admin dashboard (Vite entry)
  src/
    main.ts               — Entry point, event listeners, init (was app.js)
    data.ts               — State, DOM refs, toast queue, dark mode
    shop.ts               — Rendering & business logic (filter, cart, wishlist, checkout)
    api.ts                — API layer (Supabase + localStorage fallback)
    types.ts              — TypeScript interfaces & constants
    vite-env.d.ts         — Vite + Bootstrap type declarations
    styles/
      style.css           — Main shop styles (moved from css/)
      admin.css           — Admin styles (moved from admin/css/)
    admin/
      admin.ts            — Admin: login, products CRUD, orders, categories, chart
  supabase/
    migrations/
      001_initial.sql     — Full Supabase schema (run in SQL editor)
  tests/
    index.html            — QUnit test runner
    tests.js              — Unit tests
  js/                     — Legacy JS (kept for reference, not used by Vite)
  css/                    — Legacy CSS (kept for reference, not used by Vite)
  package.json            — Vite dev/build scripts
  netlify.toml            — Netlify deploy with CSP headers
  AGENTS.md               — This file
  README.md               — GitHub project overview
```

## Stack

- **Vite** (dev server + build) + **TypeScript**
- **Bootstrap 5.3** + **Bootstrap Icons** via CDN
- **Poppins** (Google Fonts) — the only font family
- **Supabase** (backend — optional; falls back to localStorage)
- **Stripe** (payments — optional; falls back to simulation)
- Images from Unsplash + `placehold.co` fallback
- Tests: **QUnit** via CDN (`tests/index.html`)

## Key conventions

- Run `npm run dev` for development, `npm run build` for production
- All data goes through `src/api.ts` which tries Supabase first, falls back to `localStorage` (`shopwave_*` keys)
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to enable Supabase
- Without Supabase configured, the app works exactly like the old version (localStorage only)
- Product data seeds from hardcoded array in `api.ts`, overridden by `shopwave_products` localStorage
- Orders placed are saved to `shopwave_orders` (localStorage) and/or Supabase `orders` table
- Toast messages queue up sequentially (not overwritten)
- Search debounced at 150ms; search suggestions at 200ms
- Staggered card entrance animation capped at `Math.min(i * 0.05, 0.5)s`
- Image `onerror` fallback + `onload` blur-up applied to all product images

## Pure functions (testable without DOM)

- `getFilteredProducts(products, category, query, sort)` → array
- `calcCartSubtotal(cart)` → number
- `calcCartItemCount(cart)` → number
- `renderStars(rating)` → HTML string

## Setting up Supabase

1. Create a project at https://supabase.com
2. Copy your project URL and anon key into `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the SQL in `supabase/migrations/001_initial.sql` in the Supabase SQL Editor
4. Enable Email Auth in Supabase Authentication settings

The app now works with a real backend. Without `.env` vars, it falls back to localStorage.

4. Create a `product-images` bucket in Supabase Storage (for admin image upload)

## Setting up Stripe

1. Create a Stripe account and get your publishable key
2. Add to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. For real payments, create a serverless function to generate PaymentIntents

## Data flow

- Product grid, cart, wishlist, recently viewed all re-render via `innerHTML` (no virtual DOM)
- `renderProducts()` → triggered by filter, sort, search, wishlist toggle
- `renderCart()` → triggered by add/remove/change quantity
- Wishlist toggle optimistically updates the clicked button before re-render (300ms delay for animation)
- Checkout step 4 writes order to API layer (Supabase + localStorage)
- Admin: edits/creates products via API layer; main site fetches from there on load

## Running tests

Open `tests/index.html` in a browser. All tests run in QUnit.

## What's missing for production

No backend (optional via Supabase), no real payment (optional via Stripe), no PWA, no a11y pass.
