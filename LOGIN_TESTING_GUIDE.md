# Login Demo Testing Guide

## Setup & Prerequisites

### 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432`:
```bash
# If using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# If using Homebrew/standalone
# Already configured from previous session
```

### 2. Backend Setup
```bash
cd backend

# Restore dependencies
dotnet restore

# Build the solution
dotnet build

# Run in Development mode (seeding only happens in Development)
cd src/ECommerce.API
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"
```

> **Important:** You MUST set `ASPNETCORE_ENVIRONMENT=Development` for demo users to be seeded.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# The .env.local is already configured for http://localhost:5001/api
# Run development server
npm run dev

# Frontend will be at http://localhost:3000
```

## Demo Credentials

Use these credentials to test the login:

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@ecommerce.com    | Admin@123    |
| Dealer   | dealer@ecommerce.com   | Dealer@123   |
| Customer | customer@ecommerce.com | Customer@123 |

## Testing Checklist

### Backend API Testing (Postman/curl)

1. **Register Demo User**
```bash
curl -X POST https://localhost:7001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@12345",
    "fullName": "Test User",
    "phone": "+1234567890",
    "role": "Customer"
  }'
```

2. **Login with Admin Credentials**
```bash
curl -X POST https://localhost:7001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ecommerce.com",
    "password": "Admin@123"
  }'
```

Expected response:
```json
{
  "id": "uuid...",
  "email": "admin@ecommerce.com",
  "fullName": "System Admin",
  "role": "Admin",
  "token": "eyJhbGc...",
  "refreshToken": "base64..."
}
```

3. **Get Current User (using Bearer token)**
```bash
curl -X GET https://localhost:7001/api/auth/me \
  -H "Authorization: Bearer <token_from_login>"
```

### Frontend Testing

1. **Navigate to Login Page**
   - Go to `http://localhost:3000/auth/login`

2. **Test Admin Login**
   - Email: `admin@ecommerce.com`
   - Password: `Admin@123`
   - Click "Sign In"
   - Should redirect to home page
   - "Welcome back!" toast should appear

3. **Test Dealer Login**
   - Email: `dealer@ecommerce.com`
   - Password: `Dealer@123`
   - Should successfully login

4. **Test Customer Login**
   - Email: `customer@ecommerce.com`
   - Password: `Customer@123`
   - Should successfully login

5. **Test Logout**
   - After logging in, logout from the app
   - Should clear tokens from localStorage
   - Should redirect to login page

6. **Test Invalid Credentials**
   - Email: `admin@ecommerce.com`
   - Password: `WrongPassword`
   - Should show: "Invalid credentials or inactive user"

7. **Test Account Persistence**
   - Login successfully
   - Refresh the page
   - Should remain logged in (tokens restored from localStorage)

## Troubleshooting

### Issue: "Login failed. Please check your credentials."
**Causes:**
- Database not running
- Backend not in Development mode (seeding skipped)
- Wrong database username in connection string

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Run backend in Development mode: `ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"`
3. Check that `appsettings.Development.json` has correct `Username` (should match your PostgreSQL user)

### Issue: "relation users does not exist"
**Cause:** Database tables not created

**Solution:**
1. Ensure backend starts in Development mode (triggers `EnsureCreated()`)
2. Check backend logs for table creation SQL

### Issue: CORS Error
**Cause:** Frontend can't reach backend

**Solution:**
1. Ensure `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in `frontend/.env.local`
2. Ensure CORS is configured in `appsettings.json` (allows `http://localhost:3000`)
3. Check that backend is actually running on port 5001

### Issue: JWT Token Invalid
**Cause:** JWT_SECRET_KEY mismatch or token expired

**Solution:**
1. Ensure same secret key is used in Program.cs
2. Tokens expire after 15 minutes (configurable)
3. Use refresh token to get new access token

## Database Inspection

### Connect to PostgreSQL
```bash
psql -h localhost -U postgres -d ecommerce_db

# View seeded users
SELECT id, email, "FullName", "Role", "IsActive" FROM "Users";

# Check password hashes (should NOT be the placeholder)
SELECT email, "PasswordHash" FROM "Users" LIMIT 1;
```

## What Changed

✅ Fixed `JwtTokenGenerator.cs` — reads same JWT key as `Program.cs` (env var priority)
✅ Fixed `.csproj` files — upgraded to .NET 9.0 with compatible NuGet packages
✅ Fixed `BCrypt.Net-Next` version — aligned to 4.2.0 across all projects
✅ Fixed `appsettings.Development.json` — correct DB user (`md.prantoislam`), JWT config
✅ Fixed `frontend/.env.local` — API URL points to `http://localhost:5001/api`
✅ Added `RefreshTokenRequest.cs` — DTO for refresh endpoint
✅ Added `POST /api/auth/refresh` endpoint — to AuthController and AuthService
✅ Updated `Program.cs` — `EnsureCreated()` fallback when no migrations exist
✅ Seeded 3 demo users with valid BCrypt hashes
✅ Seeded 5 categories (Electronics, Clothing, Home & Garden, Books, Sports)
✅ All 3 demo logins verified working

## Security Notes

⚠️ **Demo credentials are for development only**
- Change these before deploying to production
- Use proper password management systems in production
- Never hardcode credentials in code
- Use proper .env file management for secrets

✅ **Password Hashing**
- Uses BCrypt with cost factor 11
- Same algorithm as production login system
- Passwords are securely hashed before storage
