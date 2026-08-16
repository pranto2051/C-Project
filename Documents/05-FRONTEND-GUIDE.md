# 05 — Frontend Guide

## Overview
Next.js 14+ App Router with TypeScript, Tailwind CSS, and React Context for state management.

---

## Route Structure

### Public Pages (with Navbar + Footer)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero banner, stats, category grid, featured products, products by category |
| `/about` | About | Company story, stats, values, team section |
| `/contact` | Contact | Contact form, FAQ accordion |
| `/products` | Products | Product listing with sidebar filters (search, category, sort, price) |
| `/products/[id]` | Product Detail | Image gallery, product info, quantity selector, related products |

### Authentication Pages
| Route | Page | Description |
|-------|------|-------------|
| `/auth/login` | Login | Email/password form |
| `/auth/register` | Register | Full name, email, phone, password, role selection |

### Customer Pages (require Customer role)
| Route | Page | Description |
|-------|------|-------------|
| `/cart` | Cart | Cart items, quantity controls, order summary |
| `/checkout` | Checkout | Shipping address, order placement |
| `/orders` | Orders | Order history list |
| `/orders/[id]` | Order Detail | Order details with items |
| `/account` | Account | User profile management |

### Dealer Pages (require Dealer role)
| Route | Page | Description |
|-------|------|-------------|
| `/dealer/dashboard` | Dashboard | Stats, recent products |
| `/dealer/products` | Products | Product list with status filter |
| `/dealer/products/new` | New Product | Create product form |
| `/dealer/products/[id]/edit` | Edit Product | Edit product form |
| `/dealer/orders` | Orders | Orders containing dealer's products |

### Admin Pages (require Admin role)
| Route | Page | Description |
|-------|------|-------------|
| `/admin/dashboard` | Dashboard | Stats overview + dealer table with all info |
| `/admin/dealers` | Dealers | Dealer management (filter, CRUD, owner info) |
| `/admin/users` | Customers | Customer management (activate/deactivate) |
| `/admin/products/pending` | Pending Products | Product approval queue |
| `/admin/categories` | Categories | Category management |
| `/admin/stats` | Statistics | Platform statistics |

---

## Key Components

### UI Kit (`components/ui/`)
| Component | Purpose |
|-----------|---------|
| `Button` | Primary, secondary, danger, ghost variants with loading state |
| `Input` | Text input with label, error state, required indicator |
| `Textarea` | Multi-line text input |
| `Select` | Dropdown select with label |
| `Card` | Card container |
| `Badge` | Colored status badges |
| `Modal` | Modal dialog with overlay |
| `ConfirmDialog` | Confirmation dialog (delete, etc.) |
| `Table` | Data table |
| `Pagination` | Page navigation |
| `Spinner` | Loading spinner (sm/md/lg) |
| `EmptyState` | Empty state with icon, title, description, action |
| `ProductCardSkeleton` | Skeleton loader for product cards with shimmer animation |
| `ProductGridSkeleton` | Grid of skeleton cards (configurable count and columns) |
| `ProductDetailSkeleton` | Full skeleton for product detail page |
| `LoadingProgress` | Top progress bar with percentage badge and animated spinner |

### Loading Animation System
| Component | Purpose |
|-----------|---------|
| `LoadingProgress` | Fixed top progress bar with percentage (0-100%) and shimmer effect |
| `ProductCardSkeleton` | Animated skeleton matching ProductCard layout |
| `ProductGridSkeleton` | Configurable grid of skeleton cards |
| `ProductDetailSkeleton` | Full page skeleton for product detail |
| `useLoadingProgress` | Custom hook for programmatic loading progress control |

### Loading Animation Features
- **Percentage Progress Bar**: Shows real-time loading percentage (0-100%)
- **Shimmer Effect**: Animated gradient sweep on skeleton elements
- **Smooth Transitions**: Progress bar fades out when loading completes
- **Configurable**: Customizable grid columns and skeleton counts
- **Reusable**: All components export from `components/ui/index.ts`

### Usage Examples
```tsx
// Loading progress bar
import { LoadingProgress } from '@/components/ui';
<LoadingProgress isLoading={isLoading} />

// Product grid skeleton
import { ProductGridSkeleton } from '@/components/ui';
<ProductGridSkeleton count={8} columns={4} />

// Product detail skeleton
import { ProductDetailSkeleton } from '@/components/ui';
<ProductDetailSkeleton />

// Custom hook for progress
import { useLoadingProgress } from '@/hooks';
const { progress, start, complete } = useLoadingProgress();
```

### Layout Components (`components/layout/`)
| Component | Purpose |
|-----------|---------|
| `Navbar` | Logo, nav links (Products, About, Contact), user dropdown, mobile menu |
| `Footer` | 5-column: brand/socials, Shop, Company, Support, Newsletter signup |
| `ShopLayout` | Wraps Navbar + Footer around public pages |
| `Sidebar` | Dashboard navigation (admin/dealer specific links) |
| `DashboardLayout` | Sidebar + content wrapper for dashboard pages |

### Feature Components (`features/`)
| Component | Purpose |
|-----------|---------|
| `AuthProvider` | React Context for auth state (login, register, logout) |
| `ProtectedRoute` | Route guard — redirects unauthorized users |
| `ProductCard` | Product card with image, name, price, category, add-to-cart |

---

## API Client (`services/api.ts`)

Axios-based with:
- Base URL from `NEXT_PUBLIC_API_URL`
- Auto-attach Bearer token via request interceptor
- Auto-refresh on 401 response
- Typed methods for every API endpoint

### Usage
```typescript
import { authApi, adminApi, dealerApi, customerApi } from '@/services/api';

// Login
const response = await authApi.login({ email, password });

// Admin: get dealers
const dealers = await adminApi.getDealers({ search, category });

// Dealer: create product
await dealerApi.createProduct(productData);

// Customer: add to cart
await customerApi.addToCart({ productId, quantity });
```

---

## Styling

- **Tailwind CSS** for all styling
- **Utility-first** approach — no CSS modules or styled-components
- **Responsive design** — mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Color palette:** Primary (blue), neutral (gray), success (green), danger (red), warning (yellow)
- **Font:** Inter (via next/font)
- **Animations:** Custom shimmer animation for skeleton loaders (defined in `tailwind.config.ts`)
