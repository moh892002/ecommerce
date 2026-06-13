-- ShopWave Supabase Schema
-- Run this in the Supabase SQL Editor

-- Products
CREATE TABLE IF NOT EXISTS products (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  sale BOOLEAN DEFAULT FALSE,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  image TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Products are manageable by admin users"
  ON products FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Categories manageable by admin"
  ON categories FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Carts (one row per user)
CREATE TABLE IF NOT EXISTS carts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  items JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cart"
  ON carts FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items INT NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  shipping JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE USING (auth.role() = 'service_role');

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  product_ids BIGINT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wishlist"
  ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INT NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  min_purchase DECIMAL(10,2) DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons viewable by everyone"
  ON coupons FOR SELECT USING (active = true);

CREATE POLICY "Coupons manageable by admin"
  ON coupons FOR ALL USING (auth.role() = 'service_role');

-- Seed default categories
INSERT INTO categories (name) VALUES
  ('electronics'),
  ('clothing'),
  ('home'),
  ('accessories')
ON CONFLICT (name) DO NOTHING;

-- Seed default products
INSERT INTO products (id, name, category, price, original_price, sale, rating, reviews, image, description)
VALUES
  (1, 'Wireless Headphones', 'electronics', 59.99, 79.99, TRUE, 4.5, 128, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center', 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery life, and deep bass sound.'),
  (2, 'Smart Watch', 'electronics', 129.99, NULL, FALSE, 4.3, 95, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center', 'Fitness tracker and smartwatch with heart-rate monitor, GPS, and a vibrant AMOLED display.'),
  (3, 'Bluetooth Speaker', 'electronics', 39.99, 49.99, TRUE, 4.6, 210, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center', 'Portable waterproof speaker with 360-degree sound and 12-hour playtime.'),
  (4, 'Cotton T-Shirt', 'clothing', 19.99, NULL, FALSE, 4.1, 340, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center', 'Soft 100% organic cotton tee. Comfortable fit for everyday wear.'),
  (5, 'Denim Jacket', 'clothing', 89.99, 119.99, TRUE, 4.4, 67, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop&crop=center', 'Classic denim jacket with a modern slim fit.'),
  (6, 'Running Shoes', 'clothing', 74.99, NULL, FALSE, 4.7, 412, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center', 'Lightweight mesh running shoes with responsive cushioning for maximum comfort.'),
  (7, 'Desk Lamp', 'home', 34.99, 44.99, TRUE, 4.2, 89, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop&crop=center', 'LED desk lamp with adjustable arm, touch dimmer, and built-in USB charging port.'),
  (8, 'Throw Pillow Set', 'home', 24.99, NULL, FALSE, 4.0, 156, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop&crop=center', 'Set of 2 decorative throw pillows with removable linen-feel covers.'),
  (9, 'Wall Clock', 'home', 29.99, NULL, FALSE, 4.3, 45, 'https://images.unsplash.com/photo-1563861826100-9d868c2ad7c6?w=400&h=400&fit=crop&crop=center', 'Minimalist 12-inch wall clock with silent quartz movement.'),
  (10, 'Sunglasses', 'accessories', 15.99, 24.99, TRUE, 3.9, 230, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center', 'UV400 polarized sunglasses in a classic aviator shape.'),
  (11, 'Leather Wallet', 'accessories', 44.99, NULL, FALSE, 4.5, 178, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&crop=center', 'Genuine leather bifold wallet with RFID-blocking technology.'),
  (12, 'Backpack', 'accessories', 49.99, 64.99, TRUE, 4.6, 310, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', 'Durable 25L backpack with padded laptop compartment.')
ON CONFLICT (id) DO NOTHING;
