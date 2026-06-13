export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  sale: boolean;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  created_at?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Order {
  id: string;
  items: number;
  total: number;
  date: string;
  status: string;
  userId?: string;
  shipping?: ShippingInfo;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface Review {
  id?: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountPercent: number;
  minPurchase: number;
  expiresAt: string;
  active: boolean;
}

export type SortOption = "default" | "price-asc" | "price-desc" | "name" | "rating";
export type ToastType = "success" | "danger" | "info";
export type CheckoutStep = 1 | 2 | 3 | 4;

export const FREE_SHIPPING_THRESHOLD = 50;
export const FALLBACK_IMG = "https://placehold.co/400x400?text=Unavailable";
export const RECENTLY_VIEWED_MAX = 6;
export const SEARCH_DEBOUNCE_MS = 150;
export const SUGGESTION_DEBOUNCE_MS = 200;
