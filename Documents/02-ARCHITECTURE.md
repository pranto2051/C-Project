# 02 — Architecture

## Overview
This is a **layered monolith** ASP.NET Core Web API with a separate Next.js frontend. The architecture follows clean architecture principles while keeping it simple enough for a university project.

---

## Backend Architecture

### Solution Structure
```
backend/src/
├── ECommerce.API/                    # Presentation Layer
│   ├── Program.cs                    # Entry point, DI registration, middleware pipeline
│   ├── appsettings.json              # Base configuration
│   ├── appsettings.Development.json  # Dev config (DB, JWT keys)
│   ├── Middleware/
│   │   └── ExceptionHandlingMiddleware.cs  # Global exception handler
│   └── Controllers/
│       ├── AuthController.cs         # Login, Register, Refresh, Me
│       ├── AdminController.cs        # User/Dealer/Product/Category management
│       ├── DealerController.cs       # Dealer profile and product management
│       ├── ProductsController.cs     # Public product browsing
│       ├── CartController.cs         # Shopping cart operations
│       └── OrderController.cs        # Order creation and history
│
├── ECommerce.Application/            # Application Layer
│   ├── Services/
│   │   ├── AuthService.cs            # JWT generation, registration, login
│   │   ├── AdminService.cs           # Admin CRUD operations
│   │   ├── DealerService.cs          # Dealer profile and product ops
│   │   ├── ProductService.cs         # Public product queries
│   │   ├── CartService.cs            # Cart operations
│   │   ├── OrderService.cs           # Order creation with stock validation
│   │   └── CategoryService.cs        # Category management
│   ├── DTOs/                         # Request/Response models
│   │   ├── Auth/                     # LoginRequest, RegisterRequest, AuthResponse, UserDto
│   │   ├── Dealer/                   # DealerProfileRequest, DealerProfileResponse, AdminDealerRequest
│   │   ├── Product/                  # ProductRequest, ProductResponse, ProductFilter
│   │   ├── Cart/                     # CartItemRequest, CartItemResponse, CartResponse
│   │   ├── Order/                    # OrderRequest, OrderResponse, OrderItemResponse
│   │   └── Admin/                    # StatsResponse, UserStatusUpdate, RejectProductRequest
│   ├── Interfaces/                   # Service contracts (IAuthService, IAdminService, etc.)
│   ├── Validators/                   # FluentValidation validators
│   └── Mapping/
│       └── MappingProfile.cs         # AutoMapper profile (DTO ↔ Entity)
│
├── ECommerce.Domain/                 # Domain Layer (pure, no dependencies)
│   ├── Entities/
│   │   ├── BaseEntity.cs             # Abstract base with Id, CreatedAt, UpdatedAt
│   │   ├── User.cs                   # Authentication entity with Role enum
│   │   ├── DealerProfile.cs          # Extended profile for dealers
│   │   ├── CustomerProfile.cs        # Extended profile for customers
│   │   ├── Category.cs               # Product categories (self-referencing)
│   │   ├── Product.cs                # Products with ApprovalStatus
│   │   ├── ProductImage.cs           # Multiple images per product
│   │   ├── Cart.cs                   # One active cart per customer
│   │   ├── CartItem.cs               # Items in a cart
│   │   ├── Order.cs                  # Customer orders
│   │   └── OrderItem.cs              # Line items with DealerId denormalized
│   ├── Enums/
│   │   ├── UserRole.cs               # Admin, Dealer, Customer
│   │   ├── ApprovalStatus.cs         # Pending, Approved, Rejected, Unpublished
│   │   └── OrderStatus.cs            # Pending, Confirmed, Shipped, Delivered, Cancelled
│   └── Interfaces/
│       ├── IRepository.cs            # Generic CRUD repository
│       ├── IUnitOfWork.cs            # Transaction management
│       ├── IJwtTokenGenerator.cs     # JWT token creation
│       └── IPasswordHasher.cs        # Password hashing
│
└── ECommerce.Infrastructure/         # Infrastructure Layer
    ├── Data/
    │   ├── AppDbContext.cs            # EF Core DbContext
    │   ├── DatabaseSeeder.cs          # Comprehensive demo data seeder
    │   └── Configurations/            # Fluent API entity configurations
    │       ├── UserConfiguration.cs
    │       ├── DealerProfileConfiguration.cs
    │       ├── CustomerProfileConfiguration.cs
    │       ├── CategoryConfiguration.cs
    │       ├── ProductConfiguration.cs
    │       ├── ProductImageConfiguration.cs
    │       ├── CartConfiguration.cs
    │       ├── CartItemConfiguration.cs
    │       ├── OrderConfiguration.cs
    │       └── OrderItemConfiguration.cs
    ├── Repositories/
    │   ├── Repository.cs              # Generic repository implementation
    │   └── UnitOfWork.cs              # Unit of Work implementation
    └── Services/
        ├── JwtTokenGenerator.cs       # JWT creation with HMAC-SHA256
        └── PasswordHasher.cs          # BCrypt password hashing
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
4. **DTOs:** Separate request/response models from domain entities. Prevents over-posting.
5. **FluentValidation:** Used alongside Data Annotations for complex validation rules.
6. **Global Exception Handling:** Custom middleware catches all exceptions and returns consistent error responses.
7. **Comprehensive Seeding:** DatabaseSeeder creates 21 users, 500 products, 56 orders, and 8 categories.

---

## Frontend Architecture

### Directory Structure
```
frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (providers, fonts)
│   ├── page.tsx                      # Redirects to / (home)
│   ├── globals.css                   # Global styles + Tailwind
│   ├── error.tsx                     # Error boundary
│   ├── loading.tsx                   # Loading state
│   ├── not-found.tsx                 # 404 page
│   │
│   ├── (shop)/                       # Public storefront (with Navbar + Footer)
│   │   ├── layout.tsx                # ShopLayout wrapper
│   │   ├── page.tsx                  # Home page (hero, categories, products by category)
│   │   ├── about/page.tsx            # About page
│   │   ├── contact/page.tsx          # Contact page with form
│   │   ├── products/page.tsx         # Product listing with filters
│   │   ├── products/[id]/page.tsx    # Product detail
│   │   ├── cart/page.tsx             # Shopping cart
│   │   ├── checkout/page.tsx         # Checkout flow
│   │   ├── orders/page.tsx           # Order history
│   │   ├── orders/[id]/page.tsx      # Order detail
│   │   └── account/page.tsx          # User profile
│   │
│   ├── auth/                         # Authentication pages
│   │   ├── layout.tsx                # Auth layout (centered card)
│   │   ├── login/page.tsx            # Login form
│   │   └── register/page.tsx         # Registration form
│   │
│   ├── admin/                        # Admin dashboard
│   │   ├── dashboard/page.tsx        # Admin stats overview
│   │   ├── dealers/page.tsx          # Dealer management (CRUD + filters)
│   │   ├── users/page.tsx            # User management
│   │   ├── products/pending/page.tsx # Pending product approval
│   │   ├── categories/page.tsx       # Category management
│   │   └── stats/page.tsx            # Platform statistics
│   │
│   └── dealer/                       # Dealer dashboard
│       ├── dashboard/page.tsx        # Dealer stats + recent products
│       ├── products/page.tsx         # Dealer product list
│       ├── products/new/page.tsx     # Create new product
│       ├── products/[id]/edit/page.tsx # Edit product
│       └── orders/page.tsx           # Dealer orders
│
├── components/
│   ├── ui/                           # Shared UI kit
│   │   ├── Button.tsx                # Button with variants (primary, secondary, danger, ghost)
│   │   ├── Input.tsx                 # Text input with label, error state
│   │   ├── Textarea.tsx              # Multi-line text input
│   │   ├── Select.tsx                # Dropdown select
│   │   ├── Card.tsx                  # Card container
│   │   ├── Badge.tsx                 # Status badges (colored)
│   │   ├── Modal.tsx                 # Modal dialog
│   │   ├── ConfirmDialog.tsx         # Confirmation dialog
│   │   ├── Table.tsx                 # Data table
│   │   ├── Pagination.tsx            # Page navigation
│   │   ├── Spinner.tsx               # Loading spinner
│   │   ├── EmptyState.tsx            # Empty state placeholder
│   │   └── index.ts                  # Barrel exports
│   │
│   └── layout/                       # Layout components
│       ├── Navbar.tsx                 # Top navigation (logo, links, user dropdown, mobile menu)
│       ├── Footer.tsx                 # Footer with 5 columns (brand, shop, company, support, newsletter)
│       ├── Sidebar.tsx                # Dashboard sidebar (admin/dealer navigation)
│       ├── DashboardLayout.tsx        # Dashboard layout (sidebar + content)
│       └── ShopLayout.tsx             # Shop layout (navbar + content + footer)
│
├── features/
│   ├── auth/                         # Authentication feature
│   │   ├── AuthProvider.tsx           # React Context for auth state
│   │   ├── ProtectedRoute.tsx         # Route guard component
│   │   └── index.ts                   # Barrel exports
│   └── products/                     # Products feature
│       ├── ProductCard.tsx            # Product card with hover effects, add-to-cart
│       └── index.ts                   # Barrel exports
│
├── services/
│   └── api.ts                        # Axios-based API client with interceptors
│
├── hooks/
│   └── index.ts                      # Custom React hooks
│
├── types/
│   └── index.ts                      # TypeScript interfaces
│
└── lib/
    └── utils.ts                      # Utility functions (cn, formatPrice)
```

### Key Design Decisions

1. **App Router:** Next.js 14+ App Router for better performance and React Server Components support.
2. **Route Groups:** `(shop)` for public storefront pages with Navbar + Footer layout.
3. **Feature-based organization:** `features/` groups related components and hooks.
4. **Shared UI Kit:** Consistent design system built once in `components/ui/`.
5. **API Client:** Centralized in `services/api.ts` with typed methods for each endpoint.
6. **No state management library:** React Context + hooks sufficient for this project size.

---

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

---

## Database Architecture

- **PostgreSQL** via EF Core 9.0 (Npgsql provider)
- **Code-first schema** via `EnsureCreated()` (migrations pending)
- **Foreign keys** with proper cascade rules
- **Indexes** on frequently queried columns (ApprovalStatus, CategoryId, DealerId)
- **Transactions** for order creation + stock decrement
- **Comprehensive seeding** via `DatabaseSeeder.cs` in Development mode

---

## Environment Configuration

### Backend (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ecommerce_db;Username=md.prantoislam"
  },
  "JwtSettings": {
    "SecretKey": "SUPER_SECRET_KEY_MUST_BE_LONG_ENOUGH_1234567890",
    "Issuer": "ECommerceAPI",
    "Audience": "ECommerceApp",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  }
}
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
```
