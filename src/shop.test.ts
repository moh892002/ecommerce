import { describe, it, expect } from "vitest";
import { getFilteredProducts, calcCartSubtotal, calcCartItemCount, renderStars } from "./shop";
import type { Product, CartItem } from "./types";

const testProducts: Product[] = [
  { id: 1, name: "Wireless Headphones", category: "electronics", price: 59.99, originalPrice: 79.99, sale: true, rating: 4.5, reviews: 128, image: "", description: "" },
  { id: 2, name: "Smart Watch", category: "electronics", price: 129.99, originalPrice: null, sale: false, rating: 4.3, reviews: 95, image: "", description: "" },
  { id: 3, name: "Bluetooth Speaker", category: "electronics", price: 39.99, originalPrice: 49.99, sale: true, rating: 4.6, reviews: 210, image: "", description: "" },
  { id: 4, name: "Cotton T-Shirt", category: "clothing", price: 19.99, originalPrice: null, sale: false, rating: 4.1, reviews: 340, image: "", description: "" },
  { id: 5, name: "Denim Jacket", category: "clothing", price: 89.99, originalPrice: 119.99, sale: true, rating: 4.4, reviews: 67, image: "", description: "" },
  { id: 6, name: "Running Shoes", category: "clothing", price: 74.99, originalPrice: null, sale: false, rating: 4.7, reviews: 412, image: "", description: "" },
];

function countStarIcons(html: string, cls: string): number {
  const re = new RegExp(`bi-star-${cls}`, "g");
  return html.match(re)?.length ?? 0;
}

function countEmptyStars(html: string): number {
  const all = html.match(/bi-star/g)?.length ?? 0;
  return all - countStarIcons(html, "fill") - countStarIcons(html, "half");
}

describe("renderStars", () => {
  it("returns 5 full stars for rating 5", () => {
    const html = renderStars(5);
    expect(countStarIcons(html, "fill")).toBe(5);
    expect(countStarIcons(html, "half")).toBe(0);
    expect(countEmptyStars(html)).toBe(0);
  });

  it("returns half star for .5 rating", () => {
    const html = renderStars(4.5);
    expect(countStarIcons(html, "fill")).toBe(4);
    expect(countStarIcons(html, "half")).toBe(1);
  });

  it("returns empty stars for rating 0", () => {
    const html = renderStars(0);
    expect(countStarIcons(html, "fill")).toBe(0);
    expect(countStarIcons(html, "half")).toBe(0);
    expect(countEmptyStars(html)).toBe(5);
  });

  it("returns correct stars for 3.2 rating", () => {
    const html = renderStars(3.2);
    expect(countStarIcons(html, "fill")).toBe(3);
    expect(countStarIcons(html, "half")).toBe(0);
  });
});

describe("getFilteredProducts", () => {
  it("returns all products when category is 'all' and no query", () => {
    const result = getFilteredProducts(testProducts, "all", "", "default");
    expect(result).toHaveLength(6);
  });

  it("filters by category", () => {
    const result = getFilteredProducts(testProducts, "clothing", "", "default");
    expect(result).toHaveLength(3);
    expect(result.every(p => p.category === "clothing")).toBe(true);
  });

  it("filters by search query (case-insensitive)", () => {
    const result = getFilteredProducts(testProducts, "all", "headphones", "default");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Wireless Headphones");
  });

  it("sorts by price ascending", () => {
    const result = getFilteredProducts(testProducts, "all", "", "price-asc");
    expect(result[0].price).toBe(19.99);
    expect(result[result.length - 1].price).toBe(129.99);
  });

  it("sorts by price descending", () => {
    const result = getFilteredProducts(testProducts, "all", "", "price-desc");
    expect(result[0].price).toBe(129.99);
    expect(result[result.length - 1].price).toBe(19.99);
  });

  it("sorts by name A-Z", () => {
    const result = getFilteredProducts(testProducts, "all", "", "name");
    expect(result[0].name).toBe("Bluetooth Speaker");
    expect(result[result.length - 1].name).toBe("Wireless Headphones");
  });

  it("sorts by rating descending", () => {
    const result = getFilteredProducts(testProducts, "all", "", "rating");
    expect(result[0].rating).toBe(4.7);
    expect(result[0].name).toBe("Running Shoes");
  });

  it("returns empty array when no match", () => {
    const result = getFilteredProducts(testProducts, "all", "zzznotfound", "default");
    expect(result).toHaveLength(0);
  });

  it("combines category filter and search together", () => {
    const result = getFilteredProducts(testProducts, "electronics", "watch", "default");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Smart Watch");
  });

  it("filters by price range", () => {
    const result = getFilteredProducts(testProducts, "all", "", "default", 50, 100);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every(p => p.price >= 50 && p.price <= 100)).toBe(true);
  });
});

describe("calcCartSubtotal", () => {
  const sampleCart: CartItem[] = [
    { id: 1, name: "A", category: "x", price: 10, originalPrice: null, sale: false, rating: 0, reviews: 0, image: "", description: "", qty: 2 },
    { id: 2, name: "B", category: "x", price: 15, originalPrice: null, sale: false, rating: 0, reviews: 0, image: "", description: "", qty: 3 },
  ];

  it("sums correctly", () => {
    expect(calcCartSubtotal(sampleCart)).toBe(65);
    expect(calcCartSubtotal([])).toBe(0);
  });

  it("handles single item", () => {
    expect(calcCartSubtotal([{ ...sampleCart[0], qty: 4 }])).toBe(40);
  });
});

describe("calcCartItemCount", () => {
  const sampleCart: CartItem[] = [
    { id: 1, name: "A", category: "x", price: 10, originalPrice: null, sale: false, rating: 0, reviews: 0, image: "", description: "", qty: 2 },
    { id: 2, name: "B", category: "x", price: 15, originalPrice: null, sale: false, rating: 0, reviews: 0, image: "", description: "", qty: 3 },
  ];

  it("counts items correctly", () => {
    expect(calcCartItemCount(sampleCart)).toBe(5);
    expect(calcCartItemCount([])).toBe(0);
  });
});
