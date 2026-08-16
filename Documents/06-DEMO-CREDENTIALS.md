# 06 — Demo Credentials

> **WARNING:** These are DEVELOPMENT ONLY credentials. Change before any real deployment.

---

## Quick Login (all roles)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer1@test.com | Dealer@123 |
| Customer | customer1@test.com | Customer@123 |

---

## All Seeded Dealer Accounts (all approved)

| Email | Password | Shop Name | Category |
|-------|----------|-----------|----------|
| dealer1@test.com | Dealer@123 | TechHub | Electronics |
| dealer2@test.com | Dealer@123 | StyleShop | Clothing |
| dealer3@test.com | Dealer@123 | HomeNest | Home & Garden |
| dealer4@test.com | Dealer@123 | PageTurner | Books |
| dealer5@test.com | Dealer@123 | SportZone | Sports |
| dealer6@test.com | Dealer@123 | GlowUp | Beauty |
| dealer7@test.com | Dealer@123 | AutoParts Pro | Automotive |
| dealer8@test.com | Dealer@123 | FreshBite | Food & Beverage |
| dealer9@test.com | Dealer@123 | PetPals | Pets |
| dealer10@test.com | Dealer@123 | CreativeCorner | Art & Crafts |

---

## All Seeded Customer Accounts

| Email | Password |
|-------|----------|
| customer1@test.com | Customer@123 |
| customer2@test.com | Customer@123 |
| customer3@test.com | Customer@123 |
| customer4@test.com | Customer@123 |
| customer5@test.com | Customer@123 |
| customer6@test.com | Customer@123 |
| customer7@test.com | Customer@123 |
| customer8@test.com | Customer@123 |
| customer9@test.com | Customer@123 |
| customer10@test.com | Customer@123 |

---

## Password Pattern
- Admin: `Admin@123`
- Dealers: `Dealer@123` (all 10 dealer accounts share the same password)
- Customers: `Customer@123` (all 10 customer accounts share the same password)

All passwords are BCrypt-hashed with cost factor 11.
