# Multi-Vendor E-Commerce Platform

A production-quality multi-vendor e-commerce web application built with **C# / ASP.NET Core** (backend) and **Next.js + TypeScript** (frontend), using **PostgreSQL** as the database.

## Features

- **Three Roles:** Admin, Dealer (vendor), Customer
- **Dealer Shops:** Dealers register their own shop and manage product catalogs
- **Product Approval Workflow:** New dealer products start hidden and require Admin approval before public visibility
- **Customer Storefront:** Browse, search, filter, sort approved products; cart and checkout
- **Admin Oversight:** Full platform management — users, dealers, products, categories, orders, approvals, statistics
- **Dealer Management:** Admin can filter, add, edit, and delete dealers from the admin dashboard
- **Comprehensive Demo Data:** 500 products, 56 orders, 21 users for realistic testing
- **Role-Based Authorization:** Every endpoint enforces ownership and role checks server-side

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# / ASP.NET Core Web API |
| ORM | Entity Framework Core 9.0 |
| Database | PostgreSQL |
| Auth | JWT + BCrypt password hashing |
| Frontend | Next.js 14+ (App Router) + TypeScript + React |
| Styling | Tailwind CSS |
| API Docs | Swagger / OpenAPI |

## Project Structure

```
C-Project/
├── backend/             # ASP.NET Core Web API
│   ├── src/
│   │   ├── ECommerce.API/              # Presentation layer
│   │   ├── ECommerce.Application/      # Business logic
│   │   ├── ECommerce.Domain/           # Entities & interfaces
│   │   └── ECommerce.Infrastructure/   # EF Core & repositories
│   └── docs/
├── frontend/            # Next.js application
│   ├── app/             # App Router pages
│   ├── components/      # Shared UI components
│   ├── features/        # Feature modules
│   ├── services/        # API client
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript types
│   └── lib/             # Utilities
└── database/            # SQL scripts and migrations
```

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

## Setup

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U md.prantoislam -c "CREATE DATABASE ecommerce_db;"
```

Database tables and seed data are created automatically on backend startup in Development mode.

### 2. Backend Setup

```bash
cd backend
dotnet restore
cd src/ECommerce.API
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"
```

API will be available at `http://localhost:5001` with Swagger at `/swagger`.

> **Note:** The `ASPNETCORE_ENVIRONMENT=Development` flag is required for database seeding (demo users + data).

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`.

### 4. Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
```

### Development Credentials

#### Original Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer@ecommerce.com | Dealer@123 |
| Customer | customer@ecommerce.com | Customer@123 |

#### Seeded Dealer Accounts (all approved)
| Email | Password | Shop Name | Category |
|-------|----------|-----------|----------|
| tech@demo.com | Dealer@123 | TechHub | Electronics |
| fashion@demo.com | Dealer@123 | StyleShop | Clothing |
| home@demo.com | Dealer@123 | HomeNest | Home & Garden |
| book@demo.com | Dealer@123 | PageTurner | Books |
| sport@demo.com | Dealer@123 | SportZone | Sports |
| beauty@demo.com | Dealer@123 | GlowUp | Beauty |
| auto@demo.com | Dealer@123 | AutoParts Pro | Automotive |
| food@demo.com | Dealer@123 | FreshBite | Food & Beverage |
| pet@demo.com | Dealer@123 | PetPals | Electronics |
| art@demo.com | Dealer@123 | CreativeCorner | Clothing |

#### Seeded Customer Accounts
| Email | Password |
|-------|----------|
| john@demo.com | Customer@123 |
| sarah@demo.com | Customer@123 |
| mike@demo.com | Customer@123 |
| emma@demo.com | Customer@123 |
| james@demo.com | Customer@123 |
| lisa@demo.com | Customer@123 |
| david@demo.com | Customer@123 |
| amy@demo.com | Customer@123 |
| chris@demo.com | Customer@123 |
| nina@demo.com | Customer@123 |

> **WARNING:** These are DEVELOPMENT ONLY credentials. Change before any real deployment.

## How This Project Demonstrates C# and .NET

- **OOP:** Entity classes with relationships, inheritance (role-based user hierarchy), encapsulation in services
- **ASP.NET Core:** Web API with routing, middleware pipeline, dependency injection
- **Entity Framework Core:** Code-first schema, LINQ queries, relationship mapping, transactions
- **Dependency Injection:** Service registration, repository pattern, scoped lifetimes
- **Middleware:** Authentication middleware, exception handling middleware, CORS
- **Auth/Authz:** JWT bearer authentication, role-based `[Authorize]` policies, ownership validation
- **REST:** Clean API design with proper HTTP verbs and status codes
- **Async/Await:** Non-blocking database operations with `async/await` throughout
- **LINQ:** Complex queries for filtering, searching, pagination, aggregations
- **DTOs:** Data transfer objects for request/response separation from entities
- **Relationships:** One-to-one, one-to-many, many-to-many with proper foreign keys
- **Exception Handling:** Global exception handling middleware with consistent error responses
- **Validation:** Data annotations and FluentValidation for input validation

## Documentation

- [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) — Component completion log
- [AI_HANDOVER.md](./AI_HANDOVER.md) — Handoff guide for AI agents
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture and design decisions
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) — Complete API reference
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) — Database schema and ER diagram
- [LOGIN_TESTING_GUIDE.md](./LOGIN_TESTING_GUIDE.md) — Login testing and troubleshooting
