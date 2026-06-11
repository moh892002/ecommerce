# ShopWave — E-Commerce Frontend Demo

[![Vanilla JS](https://img.shields.io/badge/vanilla-js-f7df1e?logo=javascript&logoColor=000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap 5.3](https://img.shields.io/badge/bootstrap-5.3-712cf9?logo=bootstrap)](https://getbootstrap.com)
[![Deploy to Netlify](https://img.shields.io/badge/deploy-netlify-00c7b7?logo=netlify)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USER/shopwave)

A fully-functional single-page e-commerce storefront built with vanilla HTML, CSS, and JavaScript. No build step, no framework, no backend — just open the file and shop.

![ShopWave screenshot](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&crop=center)

---

## Features

- **Product browsing** — grid with category filter, sort, and debounced search with live suggestions
- **Shopping cart** — add/remove/quantity, free-shipping progress bar, badge bump animation
- **Wishlist** — instant heart toggle with bounce animation, persisted across sessions
- **Product detail modal** — full info, star ratings, qty selector, add-to-cart/wishlist
- **Multi-step checkout** — review → shipping → payment → confirmation; saves orders
- **Recently viewed** — last 6 products shown below the grid
- **Dark mode** — persists in localStorage, smooth theme transition
- **Live chat widget** — simulated customer support
- **Newsletter signup** — with confirmation message
- **Skeleton loaders** — placeholder cards while products "load"
- **Toast notifications** — queued sequentially, never overwrite

### Admin Dashboard

- **Secure login** — gateway before any admin functionality
- **Dashboard** — stats (products, orders, revenue, sale items) + donut chart by category
- **Products CRUD** — add, edit, delete products; changes sync to the main shop
- **Orders viewer** — full order list with status management (Pending → Shipped → Delivered → Cancelled)
- **Categories manager** — add, edit, delete categories; product form reflects changes live

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Layout | Bootstrap 5.3 (CDN) |
| Icons | Bootstrap Icons (CDN) |
| Font | Poppins (Google Fonts) |
| Images | Unsplash (`images.unsplash.com`) |
| Fallback | `placehold.co/400x400?text=Unavailable` |
| Persistence | `localStorage` (`shopwave_*` keys) |
| Admin auth | Hardcoded credentials (see below) |

---

## Quick Start

```bash
# Option 1 — open directly in browser
open index.html

# Option 2 — start a local dev server
npx serve .
# then open http://localhost:3000
```

No install, no dependencies, no build step.

---

## Admin Panel

Navigate to `admin/index.html` and sign in with:

```
Username: admin
Password: admin123
```

The admin and main shop share data through `localStorage`. Changes made in the admin (products, categories) are reflected on the main page on reload.

---

## Project Structure

```
ecommerce/
├── index.html              # Main shop page
├── css/
│   └── style.css           # Custom styles over Bootstrap
├── js/
│   ├── data.js             # State, helpers, product data, toast
│   ├── shop.js             # Rendering & business logic
│   └── app.js              # Event listeners & initialization
├── admin/
│   ├── index.html          # Admin dashboard
│   ├── css/
│   │   └── admin.css       # Admin layout & stats
│   └── js/
│       └── admin.js        # Admin logic
├── package.json            # Dev server script
├── netlify.toml            # Netlify deploy config
├── AGENTS.md               # AI-assisted development notes
└── README.md               # You are here
```

---

## Deploy

### Netlify (one click)

Push to GitHub, connect the `ecommerce/` folder as the publish directory (or the whole repo root).  
The included `netlify.toml` sets security headers.

### GitHub Pages

Push the `ecommerce/` folder contents to the root of a `gh-pages` branch.

---

## What's Not Included

- **Backend** — all data lives in `localStorage`. No database, no API, no user accounts.
- **Real payments** — the checkout uses a simulated card (4242...) with no actual processing.
- **Tests** — this is a demo project without unit or integration tests.
- **Build pipeline** — intentionally zero-config. For a production project you'd add webpack/vite.
- **Image upload** — products use URL-based images. No file upload in the admin.

---

## License

MIT
