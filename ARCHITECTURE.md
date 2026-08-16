# Architecture

## Overview

This is a **layered monolith** ASP.NET Core Web API with a separate Next.js frontend. The architecture follows clean architecture principles while keeping it simple enough for a university project.

## Backend Architecture

### Solution Structure

```
ECommerce.sln
├── src/
│   ├── ECommerce.API/              # Presentation Layer
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── Middleware/
│   │   │   └── ExceptionHandlingMiddleware.cs
│   │   └── Controllers/
│   │       ├── AuthController.cs
│   │       ├── AdminController.cs
│   │       ├── DealerController.cs
│   │       ├── ProductsController.cs
│   │       ├── CartController.cs
│   │       └── OrdersController.cs
│   │
│   ├── ECommerce.Application/      # Application Layer
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── AdminService.cs
│   │   │   ├── DealerService.cs
│   │   │   ├── ProductService.cs
│   │   │   ├── CartService.cs
│   │   │   ├── OrderService.cs
│   │   │   └── CategoryService.cs
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   ├── Dealer/
│   │   │   ├── Product/
│   │   │   ├── Cart/
│   │   │   ├── Order/
│   │   │   └── Admin/
│   │   ├── Interfaces/
│   │   ├── Validators/
│   │   └── Mappings/
│   │
│   ├── ECommerce.Domain/           # Domain Layer
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── Interfaces/
│   │
│   └── ECommerce.Infrastructure/   # Infrastructure Layer
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   ├── DatabaseSeeder.cs
│       │   └── Configurations/
│       ├── Repositories/
│       ├── Migrations/
│       └── Services/
│           ├── PasswordHasher.cs
│           └── JwtTokenGenerator.cs
│
└── tests/
    ├── ECommerce.UnitTests/
    └── ECommerce.IntegrationTests/
```

### Layer Responsibilities

| Layer | Responsibility | Depends On |
|-------|---------------|------------|
| **API** | HTTP routing, controllers, middleware, Swagger, DI registration | Application |
| **Application** | Business logic, services, DTOs, validation, orchestration | Domain |
| **Domain** | Entities, enums, domain interfaces, business rules | None (pure) |
| **Infrastructure** | EF Core, database access, repositories, migrations | Domain |

### Dependency Flow

```
API → Application → Domain
       ↓
  Infrastructure → Domain
```

Infrastructure references Domain but not vice versa. Application references Domain. API references Application.

### Key Design Decisions

1. **No CQRS/MediatR:** Overkill for this project size. Simple service layer is sufficient.
2. **No microservices:** Single deployable unit. Easier to develop, test, and deploy.
3. **Repository Pattern:** Abstracts EF Core details from services. Makes testing easier.
4. **DTOs:** Separate request/response models from domain entities. Prevents over-posting and serialization issues.
5. **FluentValidation:** Used alongside Data Annotations for complex validation rules.
6. **Global Exception Handling:** Custom middleware catches all exceptions and returns consistent error responses.
7. **Comprehensive Seeding:** DatabaseSeeder creates 21 users, 500 products, 56 orders, and 8 categories for realistic demo testing.

## Frontend Architecture

### Directory Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── dealers/page.tsx       # Admin dealer CRUD with filters
│   │   ├── products/pending/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── users/page.tsx
│   │   └── stats/page.tsx
│   ├── dealer/
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/edit/page.tsx
│   │   └── orders/page.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── orders/page.tsx
│   ├── orders/[id]/page.tsx
│   ├── account/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # Shared UI kit: Button, Input, Card, Badge, Modal, Table, Toast, Select, Pagination, ConfirmDialog, EmptyState
│   ├── layout/       # Navbar, Footer, Sidebar, DashboardLayout
│   └── forms/        # Reusable form components
├── features/
│   ├── auth/         # Auth feature module (AuthProvider, ProtectedRoute, useAuth)
│   ├── products/     # Products feature module
│   ├── cart/         # Cart feature module
│   ├── orders/       # Orders feature module
│   └── admin/        # Admin feature modules
├── services/
│   └── api.ts        # API client (axios with interceptors, auth headers)
├── hooks/            # Custom React hooks
├── types/
│   └── index.ts      # TypeScript interfaces
├── lib/
│   └── utils.ts      # Helper functions (cn, formatPrice)
└── public/
```

### Key Design Decisions

1. **App Router:** Next.js 14+ App Router for better performance and React Server Components support.
2. **Route Groups:** `(auth)`, `(customer)`, `(dealer)`, `(admin)` for layout grouping without affecting URLs.
3. **Feature-based organization:** `features/` groups related components, hooks, and services.
4. **Shared UI Kit:** Consistent design system built once in `components/ui/`.
5. **API Client:** Centralized in `services/api.ts` with typed methods for each endpoint.
6. **No state management library:** React Context + hooks sufficient for this project size.
7. **Admin Dealers Page:** Dedicated `/admin/dealers` route with category/name filtering, add/edit modal, and delete confirmation.

## Security Architecture

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT Bearer tokens (15-min access, 7-day refresh) |
| Authorization | `[Authorize(Roles = "...")]` + ownership checks from JWT claims |
| Password Storage | BCrypt.Net-Next (cost factor 11) |
| Input Validation | Data Annotations + FluentValidation |
| CORS | Locked to frontend origin only |
| Secrets | Environment variables, `appsettings.Development.json` gitignored |
| Error Handling | Global middleware — no stack traces in responses |
| SQL Injection | Prevented by EF Core parameterized queries |

## Database Architecture

- **PostgreSQL** via EF Core 9.0 (Npgsql provider)
- **Code-first schema** via `EnsureCreated()` (migrations pending)
- **Foreign keys** with proper cascade rules
- **Indexes** on frequently queried columns (ApprovalStatus, CategoryId, DealerId)
- **Transactions** for order creation + stock decrement
- **Comprehensive seeding** via `DatabaseSeeder.cs` in Development mode

### Seed Data Summary

| Entity | Count |
|--------|-------|
| Users | 21 (1 admin, 10 dealers, 10 customers) |
| Dealer Profiles | 10 |
| Customer Profiles | 10 |
| Categories | 8 |
| Products | 500 (50 per dealer) |
| Orders | 56 |

See `DATABASE_DESIGN.md` for the full schema.

## Deviations from Master Prompt

None at this stage. Any future deviations will be documented here with reasoning.
