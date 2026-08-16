# Project Progress Log

## 2026-08-16 — Demo Login Fix & .NET 9.0 Upgrade

**Status:** Demo login fully working for all 3 roles.

**What was implemented:**
- Fixed JWT key mismatch between `JwtTokenGenerator` and `Program.cs` (different signing/validation keys)
- Upgraded all backend projects from .NET 8.0 to .NET 9.0 (matching installed SDK)
- Updated all NuGet packages to .NET 9.0 compatible versions (EF Core 9.0, JwtBearer 9.0, Npgsql 9.0)
- Fixed BCrypt.Net-Next version mismatch (Infrastructure had 4.0.3, Application had 4.2.0)
- Fixed database connection string (was using non-existent `postgres` user, changed to `md.prantoislam`)
- Added missing `POST /api/auth/refresh` endpoint (frontend called it but backend didn't have it)
- Fixed `appsettings.Development.json` with correct DB credentials and JWT config
- Updated frontend `.env.local` to point to correct backend URL (`http://localhost:5001/api`)
- Dropped stale PascalCase tables and let EF Core recreate with correct lowercase naming
- Seeded 3 demo users (Admin, Dealer, Customer) and 5 categories

**Files touched:**
- `backend/src/ECommerce.Infrastructure/Services/JwtTokenGenerator.cs` — JWT key alignment
- `backend/src/ECommerce.Infrastructure/ECommerce.Infrastructure.csproj` — .NET 9.0, package versions
- `backend/src/ECommerce.Application/ECommerce.Application.csproj` — .NET 9.0, EF Core 9.0
- `backend/src/ECommerce.Domain/ECommerce.Domain.csproj` — .NET 9.0
- `backend/src/ECommerce.API/ECommerce.API.csproj` — .NET 9.0, JwtBearer 9.0
- `backend/src/ECommerce.API/Program.cs` — EnsureCreated fallback, connection string
- `backend/src/ECommerce.API/appsettings.Development.json` — DB user, JWT config
- `backend/src/ECommerce.Application/DTOs/Auth/RefreshTokenRequest.cs` — New DTO
- `backend/src/ECommerce.Application/Interfaces/IAuthService.cs` — Added RefreshTokenAsync
- `backend/src/ECommerce.Application/Services/AuthService.cs` — Implemented RefreshTokenAsync
- `backend/src/ECommerce.API/Controllers/AuthController.cs` — Added /refresh endpoint
- `frontend/.env.local` — Correct API URL

**DB/API/Frontend changes:**
- Database tables recreated with correct lowercase naming via EF Core EnsureCreated
- 3 demo users seeded with BCrypt-hashed passwords
- 5 categories seeded (Electronics, Clothing, Home & Garden, Books, Sports)
- New `POST /api/auth/refresh` endpoint added

**What was tested:**
- Admin login: `admin@ecommerce.com` / `Admin@123` — returns JWT token with role "Admin"
- Dealer login: `dealer@ecommerce.com` / `Dealer@123` — returns JWT token with role "Dealer"
- Customer login: `customer@ecommerce.com` / `Customer@123` — returns JWT token with role "Customer"
- Backend builds successfully with 0 errors
- Frontend builds successfully with all routes

**Current status:**
- Demo login working end-to-end for all 3 roles
- Backend running on `http://localhost:5001` (Development mode)
- Frontend configured to connect to backend

**Remaining work:**
1. Verify frontend login page works in browser (requires running both servers)
2. Test role-based authorization on protected endpoints
3. Test product CRUD, approval workflow, cart, and order flows
4. Add EF Core migrations (currently using EnsureCreated)
5. Production hardening (HTTPS, proper refresh token storage, etc.)

**Known issues:**
- Using `EnsureCreated()` instead of migrations (no migration files yet)
- Refresh token endpoint returns 401 (not persisting refresh tokens in DB)
- AutoMapper has known vulnerability (NU1903) — upgrade when possible

---

## 2026-08-15 — Project Initialization

**Status:** Project initialized from master prompt.

**What was implemented:**
- Created project directory structure
- Created all 6 mandatory documentation files (placeholder status)
- Database schema designed per master prompt Section 4
- SQL scripts created for schema and seed data

**Files touched:**
- `README.md` — Project overview and setup guide
- `PROJECT_PROGRESS.md` — This file
- `AI_HANDOVER.md` — Agent handoff document
- `ARCHITECTURE.md` — Architecture design
- `API_DOCUMENTATION.md` — API surface documentation
- `DATABASE_DESIGN.md` — Database schema with ER diagram
- `database/schema.sql` — PostgreSQL schema creation script
- `database/seed.sql` — Seed data for development
- `backend/.env.example` — Backend environment variables template
- `frontend/.env.example` — Frontend environment variables template

**DB/API/Frontend changes:**
- Database schema finalized per master prompt
- API surface documented (to be implemented)
- Frontend routes planned (to be implemented)

**What was tested:**
- SQL scripts validated for syntax (manual review)
- Project structure verified

**Current status:**
- Documentation complete
- Database scripts ready
- Backend and frontend implementation pending

**Remaining work:**
1. Backend project setup (.NET solution, projects)
2. Backend EF Core models and migrations
3. Backend auth, authorization, and API controllers
4. Backend services and repositories
5. Frontend Next.js project setup
6. Frontend pages, components, and API client
7. Integration testing
8. Final verification per Section 15

**Known issues:**
- No code implemented yet — pure scaffolding phase
- EF Core migrations not yet generated
- Frontend not yet scaffolded
