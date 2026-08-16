# 07 — Setup Guide

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)

---

## Quick Start

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

> **Note:** The `ASPNETCORE_ENVIRONMENT=Development` flag is required for database seeding (demo users + data). Seeding takes ~30-45 seconds due to 21 BCrypt hashes.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`.

### 4. Verify

```bash
# Test backend
curl http://localhost:5001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"Admin@123"}'

# Test frontend
open http://localhost:3000
```

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

---

## Troubleshooting

### "Login failed" / No demo users
- Ensure PostgreSQL is running: `pg_isready -h localhost -p 5432`
- Ensure backend is in Development mode: `ASPNETCORE_ENVIRONMENT=Development`
- Check DB username is `md.prantoislam` in `appsettings.Development.json`

### "relation users does not exist"
- Database tables not created. Ensure backend starts in Development mode (triggers `EnsureCreated()`)

### CORS Error
- Ensure `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in `frontend/.env.local`
- Ensure backend CORS allows `http://localhost:3000`

### "Cannot find module './682.js'" (Next.js)
- Corrupted `.next` build cache:
```bash
cd frontend
rm -rf .next
npm run dev
```

### Port 5001 Already in Use
- Kill stale process:
```bash
lsof -ti:5001 | xargs kill -9
```

### Seeding Takes Too Long
- BCrypt hashing 21 passwords takes ~30-45 seconds. Wait for backend to log ready.
