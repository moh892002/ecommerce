/* ================================================
   ShopWave — QUnit Tests
   ================================================ */

// Populate fixture with DOM elements referenced by shop functions
document.getElementById("qunit-fixture").innerHTML += `
  <div id="productGrid"></div>
  <div id="skeletonGrid"></div>
  <div id="noProducts" class="d-none"></div>
  <div id="recentlySection" class="d-none"></div>
  <div id="recentlyGrid"></div>
  <div id="cartBadge"></div>
  <div id="cartBtn"></div>
  <div id="cartItems"></div>
  <div id="cartTotal"></div>
  <div id="cartFooter" class="d-none"></div>
  <div id="shippingProgressWrap" class="d-none"></div>
  <div id="shippingMsg"></div>
  <div id="shippingBar"></div>
  <div id="shippingPercent"></div>
  <div id="wishlistBadge" class="d-none"></div>
  <div id="wishlistBtn"></div>
  <div id="wishlistBody"></div>
  <div id="mainToast" class="toast"></div>
  <div id="toastMessage"></div>
`;

const testProducts = [
  { id: 1, name: "Wireless Headphones", category: "electronics", price: 59.99, rating: 4.5, reviews: 128 },
  { id: 2, name: "Smart Watch", category: "electronics", price: 129.99, rating: 4.3, reviews: 95 },
  { id: 3, name: "Bluetooth Speaker", category: "electronics", price: 39.99, rating: 4.6, reviews: 210 },
  { id: 4, name: "Cotton T-Shirt", category: "clothing", price: 19.99, rating: 4.1, reviews: 340 },
  { id: 5, name: "Denim Jacket", category: "clothing", price: 89.99, rating: 4.4, reviews: 67 },
  { id: 6, name: "Running Shoes", category: "clothing", price: 74.99, rating: 4.7, reviews: 412 },
];

// Mock render functions that touch the DOM to avoid side-effects
function mockRender() {}
const __origRender = { renderCart, renderProducts, renderWishlist, showToast };
renderCart = mockRender;
renderProducts = mockRender;
renderWishlist = mockRender;
showToast = mockRender;

// ============================================================
//  renderStars
// ============================================================

QUnit.module("renderStars");

QUnit.test("returns 5 full stars for rating 5", assert => {
  const html = renderStars(5);
  assert.equal(html.match(/bi-star-fill/g)?.length, 5);
  assert.equal(html.match(/bi-star-half/g)?.length, 0);
  assert.equal(html.match(/bi-star/g)?.length, 0);
});

QUnit.test("returns half star for .5 rating", assert => {
  const html = renderStars(4.5);
  assert.equal(html.match(/bi-star-fill/g)?.length, 4);
  assert.equal(html.match(/bi-star-half/g)?.length, 1);
});

QUnit.test("returns empty stars for rating 0", assert => {
  const html = renderStars(0);
  assert.equal(html.match(/bi-star-fill/g)?.length, 0);
  assert.equal(html.match(/bi-star/g)?.length, 5);
});

QUnit.test("returns correct stars for 3.2 rating", assert => {
  const html = renderStars(3.2);
  assert.equal(html.match(/bi-star-fill/g)?.length, 3);
  assert.equal(html.match(/bi-star-half/g)?.length, 0);
  assert.equal(html.match(/bi-star/g)?.length, 2);
});

// ============================================================
//  getFilteredProducts
// ============================================================

QUnit.module("getFilteredProducts");

QUnit.test("returns all products when category is 'all' and no query", assert => {
  const result = getFilteredProducts(testProducts, "all", "", "default");
  assert.equal(result.length, 6);
});

QUnit.test("filters by category", assert => {
  const result = getFilteredProducts(testProducts, "clothing", "", "default");
  assert.equal(result.length, 3);
  assert.ok(result.every(p => p.category === "clothing"));
});

QUnit.test("filters by search query (case-insensitive)", assert => {
  const result = getFilteredProducts(testProducts, "all", "headphones", "default");
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Wireless Headphones");
});

QUnit.test("sorts by price ascending", assert => {
  const result = getFilteredProducts(testProducts, "all", "", "price-asc");
  assert.equal(result[0].price, 19.99);
  assert.equal(result[result.length-1].price, 129.99);
});

QUnit.test("sorts by price descending", assert => {
  const result = getFilteredProducts(testProducts, "all", "", "price-desc");
  assert.equal(result[0].price, 129.99);
  assert.equal(result[result.length-1].price, 19.99);
});

QUnit.test("sorts by name A-Z", assert => {
  const result = getFilteredProducts(testProducts, "all", "", "name");
  assert.equal(result[0].name, "Bluetooth Speaker");
  assert.equal(result[result.length-1].name, "Wireless Headphones");
});

QUnit.test("sorts by rating descending", assert => {
  const result = getFilteredProducts(testProducts, "all", "", "rating");
  assert.equal(result[0].rating, 4.7);
  assert.equal(result[0].name, "Running Shoes");
});

QUnit.test("returns empty array when no match", assert => {
  const result = getFilteredProducts(testProducts, "all", "zzznotfound", "default");
  assert.equal(result.length, 0);
});

QUnit.test("combines category filter and search together", assert => {
  const result = getFilteredProducts(testProducts, "electronics", "watch", "default");
  assert.equal(result.length, 1);
  assert.equal(result[0].name, "Smart Watch");
});

// ============================================================
//  calcCartSubtotal / calcCartItemCount
// ============================================================

QUnit.module("Cart math");

const sampleCart = [
  { id: 1, name: "A", price: 10, qty: 2 },
  { id: 2, name: "B", price: 15, qty: 3 },
];

QUnit.test("calcCartSubtotal sums correctly", assert => {
  assert.equal(calcCartSubtotal(sampleCart), 65);
  assert.equal(calcCartSubtotal([]), 0);
});

QUnit.test("calcCartItemCount counts items correctly", assert => {
  assert.equal(calcCartItemCount(sampleCart), 5);
  assert.equal(calcCartItemCount([]), 0);
});

QUnit.test("calcCartSubtotal handles single item", assert => {
  assert.equal(calcCartSubtotal([{ id: 1, price: 7.5, qty: 4 }]), 30);
});

// ============================================================
//  localStorage helpers
// ============================================================

QUnit.module("Storage");

QUnit.test("loadStorage returns fallback when key missing", assert => {
  const val = loadStorage("__test_nonexistent__", "fallback");
  assert.equal(val, "fallback");
});

QUnit.test("round-trip save and load", assert => {
  const key = "__test_roundtrip__";
  saveStorage(key, { hello: "world", num: 42 });
  const loaded = loadStorage(key, null);
  assert.deepEqual(loaded, { hello: "world", num: 42 });
  localStorage.removeItem("shopwave_" + key);
});

QUnit.test("loadStorage returns null fallback for missing keys", assert => {
  const val = loadStorage("__test_missing__", null);
  assert.strictEqual(val, null);
});

QUnit.test("safeSave catches quota errors gracefully", assert => {
  const orig = localStorage.setItem;
  localStorage.setItem = () => { throw { name: "QuotaExceededError", code: 22 }; };
  assert.ok(safeSave("__test_quota__", "data") === undefined);
  localStorage.setItem = orig;
  localStorage.removeItem("shopwave___test_quota__");
});

// ============================================================
//  Recently viewed
// ============================================================

QUnit.module("Recently viewed");

QUnit.test("addRecentlyViewed prepends and caps at 6", assert => {
  recentlyViewed = [];
  for (let i = 1; i <= 8; i++) {
    addRecentlyViewed(i);
  }
  assert.equal(recentlyViewed.length, 6);
  assert.equal(recentlyViewed[0], 8, "most recent first");
  assert.equal(recentlyViewed[5], 3, "oldest retained");
});

QUnit.test("addRecentlyViewed deduplicates", assert => {
  recentlyViewed = [1, 2, 3];
  addRecentlyViewed(2);
  assert.equal(recentlyViewed.length, 3);
  assert.equal(recentlyViewed[0], 2, "moved to front");
  assert.equal(recentlyViewed[1], 1);
});

QUnit.test("addRecentlyViewed adds new item to front", assert => {
  recentlyViewed = [1, 2];
  addRecentlyViewed(3);
  assert.equal(recentlyViewed[0], 3);
  assert.equal(recentlyViewed.length, 3);
});

// ============================================================
//  Wishlist toggle (state only)
// ============================================================

QUnit.module("Wishlist");

QUnit.test("toggleWishlist adds id when not present", assert => {
  wishlist = [];
  toggleWishlist(42);
  assert.ok(wishlist.includes(42), "id added");
  assert.equal(wishlist.length, 1, "one item");
});

QUnit.test("toggleWishlist removes id when already present", assert => {
  wishlist = [42, 7];
  toggleWishlist(42);
  assert.notOk(wishlist.includes(42), "id removed");
  assert.equal(wishlist.length, 1, "remaining item");
});

QUnit.test("toggleWishlist handles multiple items", assert => {
  wishlist = [1, 2, 3];
  toggleWishlist(2);
  assert.deepEqual(wishlist, [1, 3]);
  toggleWishlist(4);
  assert.deepEqual(wishlist, [1, 3, 4]);
});

// ============================================================
//  Cart state operations
// ============================================================

QUnit.module("Cart state");

QUnit.test("addToCart adds new item", assert => {
  const origProds = products;
  const origCart = cart;
  products = [{ id: 99, name: "Test", category: "x", price: 25, rating: 4, reviews: 1 }];
  cart = [];

  addToCart(99);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 1);

  addToCart(99);
  assert.equal(cart[0].qty, 2, "increments qty on duplicate");

  products = origProds;
  cart = origCart;
});

QUnit.test("addToCart ignores unknown id", assert => {
  const origCart = cart;
  cart = [];
  addToCart(9999);
  assert.equal(cart.length, 0);
  cart = origCart;
});

QUnit.test("cart array mutation through quantity changes", assert => {
  cart = [{ id: 1, name: "A", price: 10, qty: 1 }];
  const item = cart.find(i => i.id === 1);
  item.qty++;
  assert.equal(cart[0].qty, 2);
  cart.splice(0, 1);
  assert.equal(cart.length, 0);
});
