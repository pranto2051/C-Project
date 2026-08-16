# Login Demo Testing Guide

## Setup & Prerequisites

### 1. Database Setup
Ensure PostgreSQL is running on `localhost:5432` with user `md.prantoislam`:
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running, start it:
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Linux
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
> Seeding takes ~30-45 seconds due to BCrypt hashing of 21 passwords.

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

### Original Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer@ecommerce.com | Dealer@123 |
| Customer | customer@ecommerce.com | Customer@123 |

### Seeded Dealer Accounts (all approved)
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

### Seeded Customer Accounts
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

## Testing Checklist

### Backend API Testing (Postman/curl)

1. **Register Demo User**
```bash
curl -X POST http://localhost:5001/api/auth/register \
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
curl -X POST http://localhost:5001/api/auth/login \
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
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer <token_from_login>"
```

4. **Test Dealer Login**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tech@demo.com","password":"Dealer@123"}'
```

5. **Test Admin Stats**
```bash
curl -X GET http://localhost:5001/api/admin/stats \
  -H "Authorization: Bearer <admin_token>"
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

5. **Test Seeded Dealer Login**
   - Email: `tech@demo.com`
   - Password: `Dealer@123`
   - Should login and show TechHub dealer dashboard

6. **Test Seeded Customer Login**
   - Email: `john@demo.com`
   - Password: `Customer@123`
   - Should login and see customer dashboard

7. **Test Logout**
   - After logging in, logout from the app
   - Should clear tokens from localStorage
   - Should redirect to login page

8. **Test Invalid Credentials**
   - Email: `admin@ecommerce.com`
   - Password: `WrongPassword`
   - Should show: "Login failed. Please check your credentials."

9. **Test Account Persistence**
   - Login successfully
   - Refresh the page
   - Should remain logged in (tokens restored from localStorage)

### Admin Dealer Management Testing

1. **View Dealers**
   - Login as admin
   - Navigate to `/admin/dealers`
   - Should show list of 10 seeded dealers

2. **Filter Dealers**
   - Use Category filter to select "Electronics"
   - Should filter dealers by category
   - Use Search to find dealers by name/email

3. **Add New Dealer**
   - Click "+ Add Dealer"
   - Fill in all required fields
   - Should create new dealer and appear in list

4. **Edit Dealer**
   - Click "Edit" on a dealer
   - Modify shop details
   - Should update dealer profile

5. **Delete Dealer**
   - Click "Delete" on a dealer
   - Confirm deletion
   - Should remove dealer from list

6. **Clear Demo Data**
   - Use POST `/api/admin/clear-demo-data` endpoint
   - Should remove all seeded data
   - Only admin account should remain

## Troubleshooting

### Issue: "Login failed. Please check your credentials."
**Causes:**
- Database not running
- Backend not in Development mode (seeding skipped)
- Wrong database username in connection string
- Backend not running on port 5001

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Run backend in Development mode: `ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"`
3. Check that `appsettings.Development.json` has correct `Username` (should be `md.prantoislam`)
4. Verify backend is accessible: `curl http://localhost:5001/api/auth/login`

### Issue: "relation users does not exist"
**Cause:** Database tables not created

**Solution:**
1. Ensure backend starts in Development mode (triggers `EnsureCreated()`)
2. Check backend logs for table creation SQL

### Issue: CORS Error
**Cause:** Frontend can't reach backend

**Solution:**
1. Ensure `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in `frontend/.env.local`
2. Ensure CORS is configured in `Program.cs` (allows `http://localhost:3000`)
3. Check that backend is actually running on port 5001

### Issue: JWT Token Invalid
**Cause:** JWT_SECRET_KEY mismatch or token expired

**Solution:**
1. Ensure same secret key is used in Program.cs and JwtTokenGenerator.cs
2. Tokens expire after 15 minutes (configurable)
3. Use refresh token to get new access token

### Issue: "Cannot find module './682.js'" (Next.js)
**Cause:** Corrupted `.next` build cache

**Solution:**
```bash
cd frontend
rm -rf .next
npm run dev
```

### Issue: Port 5001 Already in Use
**Cause:** Stale backend process running

**Solution:**
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Wait a moment, then restart backend
cd backend/src/ECommerce.API
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"
```

### Issue: Seeding Takes Too Long
**Cause:** BCrypt hashing 21 passwords takes ~30-45 seconds

**Solution:** Wait for seeding to complete. The backend will log when ready. Check with:
```bash
curl http://localhost:5001/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@ecommerce.com","password":"Admin@123"}'
```

## Database Inspection

### Connect to PostgreSQL
```bash
psql -h localhost -U md.prantoislam -d ecommerce_db

# View seeded users
SELECT id, email, "FullName", "Role", "IsActive" FROM "Users";

# Check password hashes (should NOT be the placeholder)
SELECT email, "PasswordHash" FROM "Users" LIMIT 1;

# View dealer profiles
SELECT dp."ShopName", dp."ShopCategory", dp."IsApproved", u."Email"
FROM "DealerProfiles" dp
JOIN "Users" u ON dp."UserId" = u."Id";

# View product counts by dealer
SELECT dp."ShopName", COUNT(p."Id") as "ProductCount"
FROM "DealerProfiles" dp
JOIN "Products" p ON dp."Id" = p."DealerId"
GROUP BY dp."ShopName";

# View order counts
SELECT COUNT(*) as "TotalOrders" FROM "Orders";
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
✅ Added admin dealer CRUD endpoints — GET/POST/PUT/DELETE /api/admin/dealers
✅ Added dealer approve endpoint — PUT /api/admin/dealers/{id}/approve
✅ Added clear demo data endpoint — POST /api/admin/clear-demo-data
✅ Created comprehensive `DatabaseSeeder.cs` — 21 users, 500 products, 56 orders
✅ Added admin dealers page — `/admin/dealers` with filters, add/edit modal, delete confirmation
✅ Seeded 21 users with valid BCrypt hashes
✅ Seeded 8 categories (Electronics, Clothing, Home & Garden, Books, Sports, Beauty, Automotive, Food & Beverage)
✅ Seeded 500 products (50 per dealer)
✅ Seeded 56 orders with order items
✅ All demo logins verified working
✅ Fixed `.next` build cache corruption
✅ Fixed stale backend processes on port 5001

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
