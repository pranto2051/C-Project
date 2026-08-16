# API Documentation

Base URL: `http://localhost:5001/api` (development)

All endpoints return JSON. Errors follow this shape:
```json
{
  "message": "Error description",
  "errors": { "field": ["validation error"] }
}
```

---

## Authentication

### POST /auth/register
Register a new user (Dealer or Customer).

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "Customer" // or "Dealer"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "Customer",
  "token": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### POST /auth/login
Authenticate and receive JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:** Same as register response.

### GET /auth/me
Get current authenticated user profile. **Requires auth.**

**Response 200:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "role": "Customer",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### POST /auth/refresh
Refresh an expired access token. Currently returns 401 (refresh tokens not persisted in demo).

**Request:**
```json
{
  "refreshToken": "base64_token"
}
```

**Response 401:**
```json
{
  "message": "Refresh token expired. Please log in again."
}
```

---

## Dealer Endpoints

### GET /dealers/profile
Get dealer profile. **Requires auth + Dealer role.**

**Response 200:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "shopName": "My Shop",
  "shopDescription": "Best products",
  "shopCategory": "Electronics",
  "address": "123 Main St",
  "logoUrl": "https://...",
  "isApproved": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /dealers/profile
Update dealer profile. **Requires auth + Dealer role.**

**Request:** Same shape as GET response (all fields optional).

### GET /dealers/products
Get dealer's own products. **Requires auth + Dealer role.**

**Query params:** `status` (Pending/Approved/Rejected/Unpublished — optional filter), `page`, `pageSize`

**Response 200:**
```json
{
  "items": [...],
  "total": 10,
  "page": 1,
  "pageSize": 10
}
```

### POST /dealers/products
Create a new product. **Requires auth + Dealer role.** Product starts as `Pending`.

**Request:**
```json
{
  "name": "Wireless Headphones",
  "description": "High quality...",
  "price": 99.99,
  "stockQuantity": 50,
  "categoryId": "uuid",
  "sku": "WH-001",
  "images": [
    { "imageUrl": "https://...", "displayOrder": 0 }
  ]
}
```

**Response 201:** Product object with `approvalStatus: "Pending"`.

### PUT /dealers/products/{id}
Update own product. **Requires auth + Dealer role + ownership.**

**Request:** Same as POST (all fields optional).

### DELETE /dealers/products/{id}
Delete own product. **Requires auth + Dealer role + ownership.**

### GET /dealers/orders
Get orders containing dealer's products. **Requires auth + Dealer role.**

---

## Customer / Public Endpoints

### GET /products
Browse approved products with search, filter, sort, pagination.

**Query params:**
- `search` — search in name/description
- `categoryId` — filter by category
- `minPrice`, `maxPrice` — price range
- `sortBy` — `price_asc`, `price_desc`, `newest`, `popular`
- `page`, `pageSize`

**Response 200:** Same shape as dealer products list.

### GET /products/{id}
Get product detail. **Requires auth (any role) or public for approved products.**

### GET /categories
Get all categories (public).

### GET /dealers/{id}/public-profile
Get public dealer shop profile (public).

### POST /cart
Create cart (or get existing). **Requires auth + Customer role.**

### GET /cart
Get current cart with items. **Requires auth + Customer role.**

**Response 200:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Wireless Headphones",
      "productImageUrl": "https://...",
      "quantity": 2,
      "priceAtAdd": 99.99,
      "subtotal": 199.98
    }
  ],
  "totalAmount": 199.98,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /cart/items/{id}
Update cart item quantity. **Requires auth + Customer role.**

### DELETE /cart/items/{id}
Remove cart item. **Requires auth + Customer role.**

### POST /orders
Create order from cart. **Requires auth + Customer role.**

**Request:**
```json
{
  "shippingAddress": "456 Oak Ave, City, Country"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "customerId": "uuid",
  "status": "Pending",
  "totalAmount": 199.98,
  "shippingAddress": "456 Oak Ave, City, Country",
  "items": [...],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /orders
Get customer's orders. **Requires auth + Customer role.**

### GET /orders/{id}
Get order detail. **Requires auth + ownership or Admin/Dealer (if involved).**

---

## Admin Endpoints

All admin endpoints require **auth + Admin role**.

### GET /admin/users
List all users with optional filters.

**Query params:** `role` (Admin/Dealer/Customer), `isActive` (true/false), `search` (email/name), `page`, `pageSize`

### PUT /admin/users/{id}/status
Activate or deactivate a user.

**Request:**
```json
{
  "isActive": false
}
```

### GET /admin/dealers
List all dealers with shop info. Supports filtering.

**Query params:** `search` (shop name/email), `category` (shop category), `page`, `pageSize`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid",
      "userId": "uuid",
      "shopName": "TechHub",
      "shopDescription": "Electronics store",
      "shopCategory": "Electronics",
      "address": "123 Tech St",
      "logoUrl": "https://...",
      "isApproved": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 10
}
```

### POST /admin/dealers
Create a new dealer (creates user account + dealer profile).

**Request:**
```json
{
  "shopName": "New Shop",
  "shopDescription": "Description here",
  "shopCategory": "Electronics",
  "address": "456 Main St",
  "logoUrl": "https://...",
  "isApproved": true,
  "email": "newdealer@example.com",
  "password": "SecurePass123!",
  "fullName": "New Dealer",
  "phone": "+1234567890"
}
```

**Response 201:** Dealer profile object.

### PUT /admin/dealers/{id}
Update dealer profile (admin override).

**Request:** Same shape as POST (all fields optional except shop fields).

### DELETE /admin/dealers/{id}
Delete dealer and associated user account. **Requires auth + Admin role.**

### PUT /admin/dealers/{id}/approve
Approve a dealer (sets `isApproved = true`).

### GET /admin/products/pending
List all pending products across all dealers.

### PUT /admin/products/{id}/approve
Approve a product. Sets status to Approved and PublishedAt.

### PUT /admin/products/{id}/reject
Reject a product.

**Request:**
```json
{
  "rejectionReason": "Image quality too low"
}
```

### DELETE /admin/products/{id}
Delete any product (Admin override).

### GET /admin/categories
List categories.

### POST /admin/categories
Create category.

### PUT /admin/categories/{id}
Update category.

### DELETE /admin/categories/{id}
Delete category (only if no products depend on it).

### GET /admin/stats
Get platform statistics.

**Response 200:**
```json
{
  "totalUsers": 21,
  "totalDealers": 10,
  "totalCustomers": 10,
  "totalProducts": 500,
  "pendingProducts": 167,
  "approvedProducts": 167,
  "rejectedProducts": 166,
  "totalOrders": 56,
  "totalRevenue": 123456.78
}
```

### POST /admin/clear-demo-data
Clear all seeded demo data (dealers, customers, products, orders, categories). **Requires auth + Admin role.**

This endpoint removes all data seeded by `DatabaseSeeder.cs` to allow fresh testing. Only the original admin user account is preserved.

**Response 200:**
```json
{
  "message": "Demo data cleared successfully"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role/ownership) |
| 404 | Not found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Server error |

---

## Demo Credentials

### Original Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ecommerce.com | Admin@123 |
| Dealer | dealer@ecommerce.com | Dealer@123 |
| Customer | customer@ecommerce.com | Customer@123 |

### Seeded Dealer Accounts (all approved)
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

### Seeded Customer Accounts
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
