# AI Handover Document

This document is written so a *different* AI agent with zero chat history can pick up this project immediately.

## Objective

Build a complete, production-quality **multi-vendor e-commerce web application** for a university project. Three roles: Admin, Dealer, Customer. Core feature: Dealer products require Admin approval before public visibility.

## Current Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# / ASP.NET Core Web API (.NET 9.0) |
| ORM | Entity Framework Core 9.0 |
| Database | PostgreSQL 14+ |
| Auth | JWT Bearer + BCrypt password hashing |
| Frontend | Next.js 14+ (App Router) + TypeScript + React |
| Styling | Tailwind CSS |
| API Docs | Swagger / OpenAPI |

## Architecture

### Backend (Layered)
```
ECommerce.API/           # Presentation layer — Controllers, Program.cs, Middleware
├── ECommerce.Application/  # Application layer — Services, DTOs, Interfaces
├── ECommerce.Domain/       # Domain layer — Entities, Enums, Interfaces
└── ECommerce.Infrastructure/ # Infrastructure — DbContext, Repositories, Migrations
```

### Frontend
```
app/           # Next.js App Router pages
components/    # Shared UI components (Button, Input, Card, Badge, Modal, Table, Toast)
features/      # Feature modules (auth, products, cart, orders, admin)
services/      # API client wrappers
hooks/         # Custom React hooks
types/         # TypeScript type definitions
lib/           # Utilities and helpers
```

## Completed Modules

| Module | Status | Notes |
|--------|--------|-------|
| Documentation (7 files) | ✅ Complete | README, PROJECT_PROGRESS, AI_HANDOVER, ARCHITECTURE, API_DOCUMENTATION, DATABASE_DESIGN, LOGIN_TESTING_GUIDE |
| Database Schema | ✅ Complete | EF Core entities, configurations, EnsureCreated |
| Database Seeding | ✅ Complete | 21 users (1 admin, 10 dealers, 10 customers), 500 products, 56 orders, 8 categories |
| Backend Project Structure | ✅ Complete | .NET 9.0 solution with 4 projects (API, Application, Domain, Infrastructure) |
| EF Core Models | ✅ Complete | 10 entities with Fluent API configurations |
| EF Core Migrations | ⏳ Pending | Using EnsureCreated(); migration files not yet generated |
| Authentication | ✅ Complete | Login, Register, JWT token generation, BCrypt hashing |
| Authorization | ✅ Complete | Role-based [Authorize] on all protected endpoints |
| API Controllers | ✅ Complete | Auth, Admin, Dealer, Products, Cart, Order controllers |
| Admin Dealer CRUD | ✅ Complete | GET/POST/PUT/DELETE /api/admin/dealers, approve endpoint, clear-demo-data |
| Frontend Project | ✅ Complete | Next.js 14+ with App Router, TypeScript, Tailwind |
| Frontend Pages | ✅ Complete | All routes: shop, auth, dealer dashboard, admin dashboard |
| Frontend Components | ✅ Complete | Shared UI kit (Button, Input, Card, Badge, Modal, Table, etc.) |
| API Client | ✅ Complete | Axios-based with interceptors, auth headers, token refresh |
| Auth Context | ✅ Complete | React Context with login/register/logout, localStorage persistence |
| Demo Login | ✅ Complete | All roles verified working (3 original + 7 seeded demo accounts) |
| Admin Dealers Page | ✅ Complete | Filter by category/name, table, add/edit modal, delete confirmation |
| Testing | ⏳ Pending | Need to test full flows in browser |

## Database Schema Status

Finalized per master prompt Section 4. Entities:
- User (with Role enum: Admin/Dealer/Customer)
- DealerProfile (1:1 with User)
- CustomerProfile (1:1 with User)
- Category (self-referencing for subcategories)
- Product (with ApprovalStatus enum)
- ProductImage
- Cart (1:1 with CustomerProfile)
- CartItem
- Order
- OrderItem

See `DATABASE_DESIGN.md` for full ER diagram and table descriptions.

## Seed Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 21 | 1 admin, 10 dealers, 10 customers |
| Dealer Profiles | 10 | All approved, various categories |
| Customer Profiles | 10 | Various shipping addresses |
| Categories | 8 | Electronics, Clothing, Home & Garden, Books, Sports, Beauty, Automotive, Food & Beverage |
| Products | 500 | 50 per dealer, mix of Pending/Approved/Rejected |
| Orders | 56 | Across multiple customers with order items |

## Live API Endpoints

Base URL: `http://localhost:5001/api` (Development mode)

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`

**Admin:** `GET /api/admin/users`, `PUT /api/admin/users/{id}/status`, `GET/POST/PUT/DELETE /api/admin/dealers`, `PUT /api/admin/dealers/{id}/approve`, `GET /api/admin/products/pending`, `PUT /api/admin/products/{id}/approve`, `PUT /api/admin/products/{id}/reject`, `DELETE /api/admin/products/{id}`, `GET/POST/PUT/DELETE /api/admin/categories`, `GET /api/admin/stats`, `POST /api/admin/clear-demo-data`

**Dealer:** `GET/PUT /api/dealers/profile`, `GET /api/dealers/products`, `POST /api/dealers/products`, `PUT/DELETE /api/dealers/products/{id}`, `GET /api/dealers/orders`

**Public/Customer:** `GET /api/products`, `GET /api/products/{id}`, `GET /api/categories`, `POST/GET /api/cart`, `PUT/DELETE /api/cart/items/{id}`, `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}`

## Live Frontend Routes

Frontend at `http://localhost:3000` (when running `npm run dev`).

**Public/Shop:**
- `/` — Home page with hero and features
- `/products` — Product listing with search/filter/sort
- `/products/[id]` — Product detail

**Auth:**
- `/auth/login` — Login page
- `/auth/register` — Registration page (role selection)

**Customer:**
- `/cart` — Shopping cart
- `/checkout` — Checkout flow
- `/orders` — Order history
- `/orders/[id]` — Order detail
- `/account` — User profile

**Dealer Dashboard:**
- `/dealer/dashboard` — Dealer dashboard (stats + recent products)
- `/dealer/products` — Dealer product management (CRUD)
- `/dealer/products/new` — Create new product
- `/dealer/products/[id]/edit` — Edit product
- `/dealer/orders` — Dealer orders

**Admin Dashboard:**
- `/admin/dashboard` — Admin dashboard (platform stats)
- `/admin/dealers` — Dealer management (filter, add/edit/delete dealers)
- `/admin/users` — User management (activate/deactivate)
- `/admin/products/pending` — Pending product approval queue
- `/admin/categories` — Category management (CRUD)
- `/admin/stats` — Platform statistics

## Auth Implementation Notes

- JWT Bearer authentication (HMAC-SHA256)
- Passwords hashed with BCrypt.Net (cost factor 11)
- Tokens include NameIdentifier (user ID), Email, Name, and Role claims
- Token expiry: 15 minutes (configurable via `JWT_ACCESS_TOKEN_EXPIRY_MINUTES`)
- Refresh tokens: generated but not persisted in DB (demo only)
- All protected endpoints validate token and extract user ID from `ClaimTypes.NameIdentifier`
- Never trust client-supplied IDs for ownership checks — derive from JWT
- Frontend stores tokens in `localStorage` (accessToken, refreshToken)
- Axios interceptor auto-attaches Bearer token to all requests
- On 401, frontend attempts refresh then redirects to login

### Demo Credentials

#### Original Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer@ecommerce.com | Dealer@123 |
| Customer | customer@ecommerce.com | Customer@123 |

#### Seeded Dealer Accounts (all approved)
| Role | Email | Password | Shop Name | Category |
|------|-------|----------|-----------|----------|
| Dealer | tech@demo.com | Dealer@123 | TechHub | Electronics |
| Dealer | fashion@demo.com | Dealer@123 | StyleShop | Clothing |
| Dealer | home@demo.com | Dealer@123 | HomeNest | Home & Garden |
| Dealer | book@demo.com | Dealer@123 | PageTurner | Books |
| Dealer | sport@demo.com | Dealer@123 | SportZone | Sports |
| Dealer | beauty@demo.com | Dealer@123 | GlowUp | Beauty |
| Dealer | auto@demo.com | Dealer@123 | AutoParts Pro | Automotive |
| Dealer | food@demo.com | Dealer@123 | FreshBite | Food & Beverage |
| Dealer | pet@demo.com | Dealer@123 | PetPals | Electronics |
| Dealer | art@demo.com | Dealer@123 | CreativeCorner | Clothing |

#### Seeded Customer Accounts
| Role | Email | Password |
|------|-------|----------|
| Customer | john@demo.com | Customer@123 |
| Customer | sarah@demo.com | Customer@123 |
| Customer | mike@demo.com | Customer@123 |
| Customer | emma@demo.com | Customer@123 |
| Customer | james@demo.com | Customer@123 |
| Customer | lisa@demo.com | Customer@123 |
| Customer | david@demo.com | Customer@123 |
| Customer | amy@demo.com | Customer@123 |
| Customer | chris@demo.com | Customer@123 |
| Customer | nina@demo.com | Customer@123 |

> **WARNING:** DEVELOPMENT ONLY. Change before any real deployment.

## Known Bugs/Limitations

- Dealer filtering in `GetAllDealersAsync` is not working — returns all dealers regardless of `search` or `category` query params
- Using `EnsureCreated()` instead of EF Core migrations (no migration files generated yet)
- Refresh token endpoint returns 401 (refresh tokens not persisted in DB)
- AutoMapper has known vulnerability (NU1903) — upgrade when possible
- File upload for product images not yet designed
- Payment integration not part of scope (checkout is order creation only)
- Email notifications not part of scope
- HTTPS not configured for local dev (backend runs on HTTP only)
- `.next` build cache can become corrupted — clear with `rm -rf .next` and restart dev server

## What Must NOT Be Changed Without Explicit Reason

- Technology stack: C# backend, Next.js frontend, PostgreSQL database
- Three roles: Admin, Dealer, Customer
- Dealer product approval workflow (core feature)
- Ownership checks derived from JWT, never client-supplied IDs
- Server-side calculation of order totals and stock validation
- The seven documentation files are mandatory and must stay current

```
CURRENT STATUS:
Backend and frontend fully implemented. Demo login working for all roles (3 original + 7 seeded dealer + 10 seeded customer). Admin dealer CRUD complete with filter UI. Comprehensive demo data seeded (500 products, 56 orders). Backend runs on http://localhost:5001 (Development). Frontend runs on http://localhost:3000.

LAST COMPLETED TASK:
Fixed .next build cache corruption and stale backend processes. All servers running. Updated all 7 documentation files.

CURRENT TASK:
All demo login fixes and admin dealer CRUD complete. Ready for integration testing.

NEXT TASK:
1. Fix dealer filtering in GetAllDealersAsync (returns all dealers regardless of filter params)
2. Test complete user flows in browser: login → role-based dashboard → product CRUD → approval workflow → cart → checkout
3. Generate EF Core migrations

KNOWN ISSUES:
Dealer filtering broken. EnsureCreated() used instead of migrations. Refresh tokens not persisted. AutoMapper vulnerability. No HTTPS in dev. .next cache can corrupt.

IMPORTANT DECISIONS:
Technology stack locked per master prompt. Three roles fixed. Approval workflow is core feature. Ownership checks must be server-side from JWT claims. .NET 9.0 used (matching installed SDK). BCrypt.Net-Next 4.2.0 used consistently. Comprehensive seeding added for realistic demo (50 products/dealer).
```
