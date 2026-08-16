# 04 — API Reference

**Base URL:** `http://localhost:5001/api` (Development)

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
  "role": "Customer"
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

All dealer endpoints require **auth + Dealer role**.

### GET /dealers/profile
Get dealer profile.

### PUT /dealers/profile
Update dealer profile.

### GET /dealers/products
Get dealer's own products.

**Query params:** `status` (Pending/Approved/Rejected/Unpublished), `page`, `pageSize`

### POST /dealers/products
Create a new product. Product starts as `Pending`.

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

### PUT /dealers/products/{id}
Update own product. **Requires ownership.**

### DELETE /dealers/products/{id}
Delete own product. **Requires ownership.**

### GET /dealers/orders
Get orders containing dealer's products.

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

### GET /products/{id}
Get product detail.

### GET /categories
Get all categories (public).

### GET /dealers/{id}/public-profile
Get public dealer shop profile.

### POST /cart
Create cart (or get existing). **Requires Customer role.**

### GET /cart
Get current cart with items. **Requires Customer role.**

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
Update cart item quantity. **Requires Customer role.**

### DELETE /cart/items/{id}
Remove cart item. **Requires Customer role.**

### POST /orders
Create order from cart. **Requires Customer role.**

**Request:**
```json
{
  "shippingAddress": "456 Oak Ave, City, Country"
}
```

### GET /orders
Get customer's orders. **Requires Customer role.**

### GET /orders/{id}
Get order detail. **Requires ownership or Admin/Dealer involvement.**

---

## Admin Endpoints

All admin endpoints require **auth + Admin role**.

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/users | List all users (query: `role`, `isActive`, `search`, `page`, `pageSize`) |
| PUT | /admin/users/{id}/status | Activate/deactivate user |

### Dealer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/dealers | List dealers (query: `search`, `category`, `page`, `pageSize`) |
| POST | /admin/dealers | Create dealer (creates user account + profile) |
| PUT | /admin/dealers/{id} | Update dealer profile |
| DELETE | /admin/dealers/{id} | Delete dealer and user account |
| PUT | /admin/dealers/{id}/approve | Approve dealer |

### Product Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/products/pending | List all pending products |
| PUT | /admin/products/{id}/approve | Approve product |
| PUT | /admin/products/{id}/reject | Reject product (requires reason) |
| DELETE | /admin/products/{id} | Delete any product |

### Category Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/categories | List categories |
| POST | /admin/categories | Create category |
| PUT | /admin/categories/{id} | Update category |
| DELETE | /admin/categories/{id} | Delete category (only if no products) |

### Statistics & Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /admin/stats | Get platform statistics |
| POST | /admin/clear-demo-data | Clear all seeded demo data |

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
