-- ============================================================================
-- MULTI-VENDOR E-COMMERCE PLATFORM - COMPLETE DATABASE SQL
-- ============================================================================
-- Run this file directly in psql to create the database with full schema
-- and demo data. Ready for testing and development.
--
-- Usage:
--   psql -U md.prantoislam -f database.sql
--
-- Or copy-paste into psql:
--   psql -U md.prantoislam
--   \i database.sql
-- ============================================================================

-- ============================================================================
-- 1. DROP EXISTING TABLES (clean slate)
-- ============================================================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS dealer_profiles CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Users table (Admin, Dealer, Customer)
CREATE TABLE users (
    "Id"            UUID PRIMARY KEY,
    "Email"         VARCHAR(256) NOT NULL,
    "PasswordHash"  TEXT NOT NULL,
    "FullName"      VARCHAR(256) NOT NULL,
    "Phone"         VARCHAR(32),
    "Role"          INTEGER NOT NULL,  -- 1=Admin, 2=Dealer, 3=Customer
    "IsActive"      BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX ix_users_email ON users ("Email");

-- Dealer profiles (1:1 with User where Role=Dealer)
CREATE TABLE dealer_profiles (
    "Id"                UUID PRIMARY KEY,
    "ShopName"          VARCHAR(256) NOT NULL,
    "ShopDescription"   TEXT,
    "ShopCategory"      VARCHAR(128) NOT NULL,
    "Address"           TEXT NOT NULL,
    "LogoUrl"           TEXT,
    "IsApproved"        BOOLEAN NOT NULL DEFAULT FALSE,
    "UserId"            UUID NOT NULL,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_dealer_profiles_users FOREIGN KEY ("UserId") REFERENCES users("Id")
);
CREATE UNIQUE INDEX ix_dealer_profiles_userid ON dealer_profiles ("UserId");

-- Customer profiles (1:1 with User where Role=Customer)
CREATE TABLE customer_profiles (
    "Id"                UUID PRIMARY KEY,
    "ShippingAddress"   TEXT,
    "UserId"            UUID NOT NULL,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_customer_profiles_users FOREIGN KEY ("UserId") REFERENCES users("Id")
);
CREATE UNIQUE INDEX ix_customer_profiles_userid ON customer_profiles ("UserId");

-- Categories
CREATE TABLE categories (
    "Id"                UUID PRIMARY KEY,
    "Name"              VARCHAR(128) NOT NULL,
    "Description"       TEXT,
    "ParentCategoryId"  UUID,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_categories_parent FOREIGN KEY ("ParentCategoryId") REFERENCES categories("Id")
);
CREATE UNIQUE INDEX ix_categories_name ON categories ("Name");

-- Products
CREATE TABLE products (
    "Id"                UUID PRIMARY KEY,
    "Name"              VARCHAR(256) NOT NULL,
    "Description"       TEXT,
    "Price"             DECIMAL(10,2) NOT NULL,
    "StockQuantity"     INTEGER NOT NULL DEFAULT 0,
    "Sku"               VARCHAR(128),
    "ApprovalStatus"    VARCHAR(32) NOT NULL DEFAULT 'Pending',
    "RejectionReason"   TEXT,
    "PublishedAt"       TIMESTAMPTZ,
    "DealerId"          UUID NOT NULL,
    "CategoryId"        UUID NOT NULL,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_products_dealer FOREIGN KEY ("DealerId") REFERENCES dealer_profiles("Id"),
    CONSTRAINT fk_products_category FOREIGN KEY ("CategoryId") REFERENCES categories("Id")
);
CREATE INDEX ix_products_approval_category ON products ("ApprovalStatus", "CategoryId");
CREATE INDEX ix_products_dealer ON products ("DealerId");
CREATE UNIQUE INDEX ix_products_sku ON products ("Sku");

-- Product images
CREATE TABLE product_images (
    "Id"            UUID PRIMARY KEY,
    "ImageUrl"      TEXT NOT NULL,
    "DisplayOrder"  INTEGER NOT NULL DEFAULT 0,
    "ProductId"     UUID NOT NULL,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_images_product FOREIGN KEY ("ProductId") REFERENCES products("Id") ON DELETE CASCADE
);

-- Carts (1:1 with CustomerProfile)
CREATE TABLE carts (
    "Id"            UUID PRIMARY KEY,
    "CustomerId"    UUID NOT NULL,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_carts_customer FOREIGN KEY ("CustomerId") REFERENCES customer_profiles("Id")
);
CREATE UNIQUE INDEX ix_carts_customerid ON carts ("CustomerId");

-- Cart items
CREATE TABLE cart_items (
    "Id"            UUID PRIMARY KEY,
    "CartId"        UUID NOT NULL,
    "ProductId"     UUID NOT NULL,
    "Quantity"      INTEGER NOT NULL DEFAULT 1,
    "PriceAtAdd"    DECIMAL(10,2) NOT NULL,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY ("CartId") REFERENCES carts("Id") ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY ("ProductId") REFERENCES products("Id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX ix_cart_items_cart_product ON cart_items ("CartId", "ProductId");

-- Orders
CREATE TABLE orders (
    "Id"                UUID PRIMARY KEY,
    "CustomerId"        UUID NOT NULL,
    "Status"            VARCHAR(32) NOT NULL DEFAULT 'Pending',
    "TotalAmount"       DECIMAL(12,2) NOT NULL,
    "ShippingAddress"   TEXT NOT NULL,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_orders_customer FOREIGN KEY ("CustomerId") REFERENCES customer_profiles("Id")
);
CREATE INDEX ix_orders_customer ON orders ("CustomerId");
CREATE INDEX ix_orders_status ON orders ("Status");
CREATE INDEX ix_orders_created ON orders ("CreatedAt");

-- Order items
CREATE TABLE order_items (
    "Id"                    UUID PRIMARY KEY,
    "OrderId"               UUID NOT NULL,
    "ProductId"             UUID NOT NULL,
    "DealerId"              UUID NOT NULL,
    "Quantity"              INTEGER NOT NULL,
    "UnitPriceAtPurchase"   DECIMAL(10,2) NOT NULL,
    "Subtotal"              DECIMAL(12,2) NOT NULL,
    "CreatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_order_items_order FOREIGN KEY ("OrderId") REFERENCES orders("Id") ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY ("ProductId") REFERENCES products("Id"),
    CONSTRAINT fk_order_items_dealer FOREIGN KEY ("DealerId") REFERENCES dealer_profiles("Id")
);
CREATE INDEX ix_order_items_order ON order_items ("OrderId");
CREATE INDEX ix_order_items_dealer ON order_items ("DealerId");


-- ============================================================================
-- 3. SEED DATA - CATEGORIES
-- ============================================================================

INSERT INTO categories ("Id", "Name", "Description", "CreatedAt", "UpdatedAt") VALUES
('a1000000-0000-0000-0000-000000000001', 'Electronics',    'Electronic devices and accessories',         NOW(), NOW()),
('a1000000-0000-0000-0000-000000000002', 'Clothing',       'Fashion and apparel',                        NOW(), NOW()),
('a1000000-0000-0000-0000-000000000003', 'Home & Garden',  'Home improvement and garden supplies',       NOW(), NOW()),
('a1000000-0000-0000-0000-000000000004', 'Books',          'Books and educational materials',            NOW(), NOW()),
('a1000000-0000-0000-0000-000000000005', 'Sports',         'Sports equipment and accessories',           NOW(), NOW()),
('a1000000-0000-0000-0000-000000000006', 'Toys',           'Toys and games for all ages',                NOW(), NOW()),
('a1000000-0000-0000-0000-000000000007', 'Automotive',     'Car parts and accessories',                  NOW(), NOW()),
('a1000000-0000-0000-0000-000000000008', 'Health',         'Health and wellness products',               NOW(), NOW());


-- ============================================================================
-- 4. SEED DATA - USERS
-- ============================================================================
-- Passwords:
--   Admin:     Admin@123
--   Dealers:   Dealer@123
--   Customers: Customer@123
-- BCrypt cost factor: 11

-- Admin user
INSERT INTO users ("Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('b1000000-0000-0000-0000-000000000001', 'admin@ecommerce.com', '$2a$11$S2ZoaWf3hknWcI/Og0uzg.vHxucE3fJcbHU91qFAH/p.tYRX4heWy', 'System Admin',     '+1000000000', 1, TRUE, NOW(), NOW());

-- Dealer users (10)
INSERT INTO users ("Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('b2000000-0000-0000-0000-000000000001', 'tech@demo.com',     '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Alex Tech',        '+1000001001', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000002', 'fashion@demo.com',  '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Sarah Fashion',    '+1000001002', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000003', 'home@demo.com',     '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Mike Home',        '+1000001003', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000004', 'books@demo.com',    '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Emma Books',       '+1000001004', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000005', 'sports@demo.com',   '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'David Sports',     '+1000001005', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000006', 'toys@demo.com',     '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Lisa Toys',        '+1000001006', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000007', 'auto@demo.com',     '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'James Auto',       '+1000001007', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000008', 'health@demo.com',   '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Olivia Health',    '+1000001008', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000009', 'gadgets@demo.com',  '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Noah Gadgets',     '+1000001009', 2, TRUE, NOW(), NOW()),
('b2000000-0000-0000-0000-000000000010', 'style@demo.com',    '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q', 'Ava Style',        '+1000001010', 2, TRUE, NOW(), NOW());

-- Customer users (10)
INSERT INTO users ("Id", "Email", "PasswordHash", "FullName", "Phone", "Role", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('b3000000-0000-0000-0000-000000000001', 'john@demo.com',    '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'John Buyer',       '+1000002001', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000002', 'jane@demo.com',    '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Jane Shopper',     '+1000002002', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000003', 'bob@demo.com',     '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Bob Customer',     '+1000002003', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000004', 'alice@demo.com',   '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Alice Consumer',   '+1000002004', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000005', 'tom@demo.com',     '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Tom Price',        '+1000002005', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000006', 'mary@demo.com',    '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Mary Saver',       '+1000002006', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000007', 'chris@demo.com',   '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Chris Deal',       '+1000002007', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000008', 'nina@demo.com',    '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Nina Bargain',     '+1000002008', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000009', 'eric@demo.com',    '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Eric Value',       '+1000002009', 3, TRUE, NOW(), NOW()),
('b3000000-0000-0000-0000-000000000010', 'sara@demo.com',    '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te', 'Sara Smart',       '+1000002010', 3, TRUE, NOW(), NOW());


-- ============================================================================
-- 5. SEED DATA - DEALER PROFILES
-- ============================================================================

INSERT INTO dealer_profiles ("Id", "ShopName", "ShopDescription", "ShopCategory", "Address", "IsApproved", "UserId", "CreatedAt", "UpdatedAt") VALUES
('c2000000-0000-0000-0000-000000000001', 'AlexTechs Shop',         'Leading electronics retailer with the latest gadgets',     'Electronics',   '456 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000001', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000002', 'SarahFashions Shop',     'Trendy fashion for men and women',                          'Clothing',      '789 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000002', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000003', 'MikeHomes Shop',         'Everything for your home and garden',                       'Home & Garden', '321 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000003', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000004', 'EmmaBookss Shop',        'Bestselling books and educational materials',               'Books',         '654 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000004', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000005', 'DavidSportss Shop',      'Premium sports equipment for professionals',                'Sports',        '987 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000005', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000006', 'LisaToyss Shop',         'Fun toys and games for the whole family',                   'Toys',          '147 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000006', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000007', 'JamesAutos Shop',        'Quality auto parts at competitive prices',                  'Automotive',    '258 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000007', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000008', 'OliviaHealths Shop',     'Your trusted health and wellness store',                    'Health',        '369 Commerce Ave, Business District', TRUE,  'b2000000-0000-0000-0000-000000000008', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000009', 'NoahGadgetss Shop',      'Cutting-edge gadgets and accessories',                      'Electronics',   '741 Commerce Ave, Business District', FALSE, 'b2000000-0000-0000-0000-000000000009', NOW(), NOW()),
('c2000000-0000-0000-0000-000000000010', 'AvaStyles Shop',         'Modern style for the fashion-forward',                      'Clothing',      '852 Commerce Ave, Business District', FALSE, 'b2000000-0000-0000-0000-000000000010', NOW(), NOW());


-- ============================================================================
-- 6. SEED DATA - CUSTOMER PROFILES
-- ============================================================================

INSERT INTO customer_profiles ("Id", "ShippingAddress", "UserId", "CreatedAt", "UpdatedAt") VALUES
('c3000000-0000-0000-0000-000000000001', '123 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000001', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000002', '456 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000002', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000003', '789 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000003', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000004', '321 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000004', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000005', '654 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000005', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000006', '987 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000006', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000007', '147 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000007', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000008', '258 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000008', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000009', '369 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000009', NOW(), NOW()),
('c3000000-0000-0000-0000-000000000010', '741 Demo Street, Demo City, Country',     'b3000000-0000-0000-0000-000000000010', NOW(), NOW());


-- ============================================================================
-- 7. SEED DATA - PRODUCTS (50 per dealer = 500 total)
-- ============================================================================
-- Mix of statuses: ~60% Approved, ~20% Pending, ~20% Rejected
-- Products cycle through category IDs

DO $$
DECLARE
    dealer RECORD;
    cat_ids UUID[] := ARRAY[
        'a1000000-0000-0000-0000-000000000001'::uuid,
        'a1000000-0000-0000-0000-000000000002'::uuid,
        'a1000000-0000-0000-0000-000000000003'::uuid,
        'a1000000-0000-0000-0000-000000000004'::uuid,
        'a1000000-0000-0000-0000-000000000005'::uuid,
        'a1000000-0000-0000-0000-000000000006'::uuid,
        'a1000000-0000-0000-0000-000000000007'::uuid,
        'a1000000-0000-0000-0000-000000000008'::uuid
    ];
    product_names TEXT[] := ARRAY[
        'Wireless Bluetooth Headphones', 'Smart Watch Pro', 'Laptop Stand Adjustable', 'USB-C Hub Multiport',
        'Mechanical Keyboard RGB', 'Gaming Mouse Wireless', 'Portable Charger 20000mAh', 'Webcam HD 1080p',
        'Monitor Light Bar', 'Desk Organizer Set'
    ];
    descriptions TEXT[] := ARRAY[
        'High-quality product with premium build quality',
        'Best seller in its category with excellent reviews',
        'Affordable yet durable for everyday use',
        'Professional grade for serious users',
        'Perfect gift for friends and family'
    ];
    statuses TEXT[] := ARRAY['Approved', 'Approved', 'Approved', 'Pending', 'Rejected'];
    counter INT := 0;
    j INT;
    cat_idx INT;
    status_idx INT;
    price DECIMAL;
    stock INT;
    prod_id UUID;
    dealer_prefix TEXT;
BEGIN
    FOR dealer IN SELECT "Id", "ShopName" FROM dealer_profiles LOOP
        dealer_prefix := UPPER(SUBSTRING(dealer."ShopName" FROM 1 FOR 4));
        FOR j IN 0..49 LOOP
            counter := counter + 1;
            prod_id := gen_random_uuid();
            cat_idx := (j % 8) + 1;
            status_idx := (j % 5) + 1;
            price := ROUND((5 + (random() * 495))::numeric, 2);
            stock := (random() * 199)::int;

            INSERT INTO products (
                "Id", "Name", "Description", "Price", "StockQuantity", "Sku",
                "ApprovalStatus", "RejectionReason", "PublishedAt",
                "DealerId", "CategoryId", "CreatedAt", "UpdatedAt"
            ) VALUES (
                prod_id,
                dealer."ShopName" || ' - ' || product_names[(j % 10) + 1] || ' #' || counter,
                descriptions[(j % 5) + 1],
                price,
                stock,
                'SKU-' || dealer_prefix || '-' || LPAD((j + 1)::text, 3, '0'),
                statuses[status_idx],
                CASE WHEN statuses[status_idx] = 'Rejected' THEN 'Does not meet quality standards' ELSE NULL END,
                CASE WHEN statuses[status_idx] = 'Approved' THEN NOW() - (random() * interval '60 days') ELSE NULL END,
                dealer."Id",
                cat_ids[cat_idx],
                NOW(),
                NOW()
            );

            -- Add product image
            INSERT INTO product_images ("Id", "ImageUrl", "DisplayOrder", "ProductId", "CreatedAt", "UpdatedAt")
            VALUES (
                gen_random_uuid(),
                'https://picsum.photos/seed/' || SUBSTRING(prod_id::text FROM 1 FOR 8) || '/400/400',
                0,
                prod_id,
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;


-- ============================================================================
-- 8. SEED DATA - CARTS (one per customer)
-- ============================================================================

INSERT INTO carts ("Id", "CustomerId", "CreatedAt", "UpdatedAt") VALUES
('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000002', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000003', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000004', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000005', 'c3000000-0000-0000-0000-000000000005', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000006', 'c3000000-0000-0000-0000-000000000006', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000007', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000008', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000009', 'c3000000-0000-0000-0000-000000000009', NOW(), NOW()),
('d3000000-0000-0000-0000-000000000010', 'c3000000-0000-0000-0000-000000000010', NOW(), NOW());


-- ============================================================================
-- 9. SEED DATA - ORDERS (3-7 per customer = ~50 total)
-- ============================================================================

DO $$
DECLARE
    cust RECORD;
    order_id UUID;
    order_count INT;
    o INT;
    prod RECORD;
    order_status TEXT;
    total DECIMAL;
    items_count INT;
    item_prod RECORD;
    order_item_id UUID;
    subtotal DECIMAL;
BEGIN
    FOR cust IN SELECT "Id" FROM customer_profiles LOOP
        order_count := 3 + (random() * 4)::int;
        FOR o IN 1..order_count LOOP
            order_id := gen_random_uuid();
            order_status := (ARRAY['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'])[(random() * 5 + 1)::int];

            -- Create order with placeholder total (will update after items)
            INSERT INTO orders ("Id", "CustomerId", "Status", "TotalAmount", "ShippingAddress", "CreatedAt", "UpdatedAt")
            VALUES (order_id, cust."Id", order_status, 0, (random() * 998 + 1)::int || ' Demo Street, Demo City, Country', NOW(), NOW());

            -- Add 1-4 order items from approved products
            total := 0;
            items_count := 0;
            FOR item_prod IN SELECT p."Id", p."Price", p."DealerId" FROM products p WHERE p."ApprovalStatus" = 'Approved' ORDER BY RANDOM() LIMIT (1 + (random() * 3)::int) LOOP
                order_item_id := gen_random_uuid();
                subtotal := ROUND(item_prod."Price" * (1 + (random() * 2)::int), 2);
                total := total + subtotal;
                items_count := items_count + 1;

                INSERT INTO order_items ("Id", "OrderId", "ProductId", "DealerId", "Quantity", "UnitPriceAtPurchase", "Subtotal", "CreatedAt", "UpdatedAt")
                VALUES (order_item_id, order_id, item_prod."Id", item_prod."DealerId", (subtotal / item_prod."Price")::int, item_prod."Price", subtotal, NOW(), NOW());
            END LOOP;

            -- Update order total
            UPDATE orders SET "TotalAmount" = total, "UpdatedAt" = NOW() WHERE "Id" = order_id;
        END LOOP;
    END LOOP;
END $$;


-- ============================================================================
-- 10. VERIFY SEED DATA
-- ============================================================================

SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL SELECT 'Dealer Profiles', COUNT(*) FROM dealer_profiles
UNION ALL SELECT 'Customer Profiles', COUNT(*) FROM customer_profiles
UNION ALL SELECT 'Categories', COUNT(*) FROM categories
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Product Images', COUNT(*) FROM product_images
UNION ALL SELECT 'Carts', COUNT(*) FROM carts
UNION ALL SELECT 'Orders', COUNT(*) FROM orders
UNION ALL SELECT 'Order Items', COUNT(*) FROM order_items;


-- ============================================================================
-- DONE! Database created with full schema and demo data.
--
-- Demo Credentials:
--   Admin:     admin@ecommerce.com     / Admin@123
--   Dealers:   tech@demo.com           / Dealer@123
--   Customers: john@demo.com           / Customer@123
-- ============================================================================
