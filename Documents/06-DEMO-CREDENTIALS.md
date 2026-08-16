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

## All Seeded Dealer Accounts (8 approved, 2 pending)

| Email | Password | Shop Name | Category | Approved |
|-------|----------|-----------|----------|----------|
| dealer1@test.com | Dealer@123 | AlexTechs Shop | Electronics | Yes |
| dealer2@test.com | Dealer@123 | SarahFashions Shop | Clothing | Yes |
| dealer3@test.com | Dealer@123 | MikeHomes Shop | Home & Garden | Yes |
| dealer4@test.com | Dealer@123 | EmmaBookss Shop | Books | Yes |
| dealer5@test.com | Dealer@123 | DavidSportss Shop | Sports | Yes |
| dealer6@test.com | Dealer@123 | LisaToyss Shop | Toys | Yes |
| dealer7@test.com | Dealer@123 | JamesAutos Shop | Automotive | Yes |
| dealer8@test.com | Dealer@123 | OliviaHealths Shop | Health | Yes |
| dealer9@test.com | Dealer@123 | NoahGadgetss Shop | Electronics | No |
| dealer10@test.com | Dealer@123 | AvaStyles Shop | Clothing | No |

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

---

## Database Tables

| Table | Records | Description |
|-------|---------|-------------|
| admins | 1 | Admin accounts |
| dealers | 10 | Dealer accounts + shop info |
| customers | 10 | Customer accounts + shipping info |
| categories | 8 | Product categories |
| products | 550 | Product listings (500 + 50 additional) |
| product_images | 550 | One image per product |
| carts | 10 | One cart per customer |
| orders | ~50 | Sample orders |
| order_items | ~140 | Items within orders |
