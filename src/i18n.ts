/**
 * Simple i18n module.
 *
 * Add more locales as needed. To switch locale, set VITE_DEFAULT_LOCALE
 * or call setLocale(). Translations are flat key-value maps.
 */

const locales: Record<string, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.deals": "Deals",
    "search.placeholder": "Search products...",
    "cart.empty": "Your cart is empty.",
    "wishlist.empty": "Your wishlist is empty.",
    "checkout.title": "Checkout",
    "checkout.review": "Review Your Order",
    "checkout.shipping": "Shipping Information",
    "checkout.payment": "Payment Details",
    "checkout.confirmed": "Order Confirmed!",
    "checkout.placeOrder": "Place Order",
    "product.addToCart": "Add to Cart",
    "product.related": "Related Products",
    "product.reviews": "Reviews",
    "footer.quickLinks": "Quick Links",
    "footer.weAccept": "We Accept",
    "footer.followUs": "Follow Us",
  },
};

let currentLocale = import.meta.env.VITE_DEFAULT_LOCALE || "en";

export function setLocale(locale: string): void {
  currentLocale = locale;
  document.documentElement.lang = locale;
}

export function t(key: string, fallback?: string): string {
  return locales[currentLocale]?.[key] || fallback || key;
}

export function currentLang(): string {
  return currentLocale;
}

// Auto-set lang on load
document.documentElement.lang = currentLocale;
