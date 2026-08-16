# 10 — Handover Document

> Quick-start guide for AI agents or new developers picking up this project.

---

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

## Quick Commands

```bash
# Start backend
cd backend/src/ECommerce.API
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"

# Start frontend
cd frontend
npm run dev

# Test login
curl http://localhost:5001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"Admin@123"}'
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer@ecommerce.com | Dealer@123 |
| Customer | customer@ecommerce.com | Customer@123 |

10 seeded dealers (Dealer@123) and 10 seeded customers (Customer@123) also available.

## Live URLs

- **Backend API:** http://localhost:5001
- **Swagger:** http://localhost:5001/swagger
- **Frontend:** http://localhost:3000

## Completed Modules

| Module | Status |
|--------|--------|
| Documentation | Complete (10 files in Documents/) |
| Database Schema | Complete (EF Core entities + configurations) |
| Database Seeding | Complete (21 users, 500 products, 56 orders, 8 categories) |
| Backend Structure | Complete (.NET 9.0, 4 projects) |
| Authentication | Complete (JWT + BCrypt) |
| Authorization | Complete (role-based + ownership checks) |
| API Controllers | Complete (Auth, Admin, Dealer, Products, Cart, Order) |
| Frontend Structure | Complete (Next.js 14, App Router, Tailwind) |
| Frontend Pages | Complete (shop, auth, dealer dashboard, admin dashboard) |
| Frontend Components | Complete (UI kit + layout components) |
| API Client | Complete (Axios with interceptors) |
| Auth Context | Complete (React Context + localStorage) |
| UI Design | Complete (Navbar, Footer, ProductCard, filters) |
| Testing | Pending (need browser testing) |

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/ECommerce.API/Program.cs` | Backend entry point, DI, middleware |
| `backend/src/ECommerce.Infrastructure/Data/AppDbContext.cs` | EF Core DbContext |
| `backend/src/ECommerce.Infrastructure/Data/DatabaseSeeder.cs` | Demo data seeder |
| `backend/src/ECommerce.API/Controllers/*.cs` | API endpoints |
| `frontend/services/api.ts` | API client (all endpoints) |
| `frontend/features/auth/AuthProvider.tsx` | Auth state management |
| `frontend/app/(shop)/page.tsx` | Home page |
| `frontend/components/layout/*.tsx` | Navbar, Footer, Sidebar |
| `Documents/INDEX.md` | Documentation index |

## Known Issues

1. Dealer filtering in `GetAllDealersAsync` broken (returns all dealers)
2. Using `EnsureCreated()` instead of EF Core migrations
3. Refresh tokens not persisted in DB (endpoint returns 401)
4. AutoMapper has known vulnerability (NU1903)
5. `.next` build cache can corrupt (fix: `rm -rf .next`)

## What Must NOT Change

- Technology stack: C# backend, Next.js frontend, PostgreSQL database
- Three roles: Admin, Dealer, Customer
- Dealer product approval workflow (core feature)
- Ownership checks derived from JWT, never client-supplied IDs
- Server-side calculation of order totals and stock validation

## Next Steps

1. Test all frontend pages in browser (login, browse, add to cart, checkout)
2. Fix dealer filtering in backend
3. Generate EF Core migrations
4. Production hardening (HTTPS, refresh tokens, etc.)

---

```
CURRENT STATUS:
Backend and frontend fully implemented with comprehensive UI redesign.
Demo login working for all roles (3 original + 10 seeded dealers + 10 seeded customers).
All documentation consolidated into Documents/ folder (10 organized files).
Backend runs on http://localhost:5001 (Development).
Frontend runs on http://localhost:3000.

LAST COMPLETED TASK:
UI overhaul (Navbar, Footer, Home, Products, Product Detail, Cart, About, Contact pages).
Deleted unused files and consolidated documentation.

KNOWN ISSUES:
Dealer filtering broken. EnsureCreated() used instead of migrations. Refresh tokens not persisted.
```
