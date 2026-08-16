-- ============================================
-- UPDATE LOGIN CREDENTIALS
-- Run this to set/verify demo login accounts
-- ============================================

-- Admin login
UPDATE admins
SET "PasswordHash" = '$2a$11$S2ZoaWf3hknWcI/Og0uzg.vHxucE3fJcbHU91qFAH/p.tYRX4heWy'
WHERE "Email" = 'admin@ecommerce.com';

-- Dealer login (dealer1)
UPDATE dealers
SET "PasswordHash" = '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q'
WHERE "Email" = 'dealer1@test.com';

-- Customer login (customer1)
UPDATE customers
SET "PasswordHash" = '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te'
WHERE "Email" = 'customer1@test.com';

-- Verify updates
SELECT 'Admin' as role, "Email", "FullName", "IsActive" FROM admins WHERE "Email" = 'admin@ecommerce.com'
UNION ALL
SELECT 'Dealer', "Email", "FullName", "IsActive" FROM dealers WHERE "Email" = 'dealer1@test.com'
UNION ALL
SELECT 'Customer', "Email", "FullName", "IsActive" FROM customers WHERE "Email" = 'customer1@test.com';
