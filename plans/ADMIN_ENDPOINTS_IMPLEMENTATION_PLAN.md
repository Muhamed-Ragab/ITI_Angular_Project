# Admin Endpoints Implementation Plan

**Project:** ITI Angular E-Commerce Frontend  
**Date:** March 2026  
**Status:** Draft

---

## 1. Overview

This document outlines the comprehensive implementation plan for adding admin endpoints to the Angular frontend. The admin module will enable administrators to manage users, products, orders, payments, categories, coupons, and CMS content through a dedicated admin dashboard.

### Admin Features Summary

| Feature | Description |
|---------|-------------|
| **User Management** | List users, update roles, restrict/unrestrict users, delete users, manage seller requests, loyalty points, marketing broadcast, payout reviews |
| **Product Management** | Admin product CRUD operations (create, read, update, delete any product) |
| **Order Management** | List all orders (platform-wide), update order status |
| **Payment Management** | View all payments with filtering |
| **Category Management** | CRUD operations for categories (already partially implemented) |
| **Coupon Management** | CRUD for coupons |
| **Content Management** | CRUD for CMS content (banners, FAQs) |

### Reference Documentation

- [COMPLETE_API_REFERENCE.md](../../docs/COMPLETE_API_REFERENCE.md)
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [TYPES_AND_DTOS.md](../../docs/TYPES_AND_DTOS.md)

---

## 2. Technical Requirements

### 2.1 Existing Technology Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Angular v21+ (Standalone Components) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Bootstrap 5 + Bootstrap Icons |
| **State Management** | Angular Signals |
| **HTTP Client** | Angular HttpClient with Interceptors |
| **Forms** | FormsModule + Reactive Forms |

### 2.2 Required Dependencies

No additional npm packages required. All functionality can be achieved using existing Angular and Bootstrap capabilities.

### 2.3 Existing Patterns to Follow

Based on the current codebase analysis:

```typescript
// Service Pattern (from src/app/domains/products/admin/services/admin-product.service.ts)
@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly api = inject(ApiService);
  
  getProducts(filters: AdminProductFilters = {}): Observable<AdminProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<AdminProductListResponse>('/products', params);
  }
}
```

```typescript
// Facade Pattern (from src/app/domains/orders/services/orders-facade.service.ts)
@Injectable({ providedIn: 'root' })
export class OrdersFacadeService {
  readonly orders = signal<Order[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<PaginationState>({...});
  
  getOrders$(params?: {...}): Observable<...> {
    // Implementation
  }
}
```

```typescript
// Route Guard (from src/app/domains/categories/guards/admin.guard.ts)
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.currentUser();
  if (user?.role === 'admin') return true;
  
  router.navigate(['/home']);
  return false;
};
```

---

## 3. Step-by-Step Implementation Process

### Phase 1: Infrastructure Setup (Tasks 1-5)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Create admin domain folder structure | None |
| 2 | Create shared admin types/interfaces | None |
| 3 | Implement admin route configuration | Task 1 |
| 4 | Create admin layout component | Task 1 |
| 5 | Add admin routes to app.routes.ts | Task 3, Task 4 |

### Phase 2: User Management Module (Tasks 6-15)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 6 | Create user management DTOs | Task 2 |
| 7 | Implement AdminUserService | Task 6 |
| 8 | Implement AdminUserFacadeService | Task 7 |
| 9 | Create user list component | Task 8 |
| 10 | Create user detail/edit component | Task 8 |
| 11 | Create seller requests component | Task 8 |
| 12 | Create loyalty points management component | Task 8 |
| 13 | Create marketing broadcast component | Task 8 |
| 14 | Create payout reviews component | Task 8 |
| 15 | Wire up user management routes | Tasks 9-14 |

### Phase 3: Order Management Module (Tasks 16-19)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 16 | Create order management DTOs | Task 2 |
| 17 | Implement AdminOrderService | Task 16 |
| 18 | Create admin order list component | Task 17 |
| 19 | Create admin order detail component | Task 17 |

### Phase 4: Payment Management Module (Tasks 20-22)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 20 | Create payment management DTOs | Task 2 |
| 21 | Implement AdminPaymentService | Task 20 |
| 22 | Create payment list component | Task 21 |

### Phase 5: Category Management Module (Tasks 23-25)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 23 | Enhance existing category DTOs | Existing categories domain |
| 24 | Create category management components | Existing category service |
| 25 | Wire up category management routes | Task 24 |

### Phase 6: Coupon Management Module (Tasks 26-30)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 26 | Create coupon management DTOs | Task 2 |
| 27 | Implement AdminCouponService | Task 26 |
| 28 | Create coupon list component | Task 27 |
| 29 | Create coupon form component | Task 27 |
| 30 | Wire up coupon management routes | Tasks 28-29 |

### Phase 7: Content Management Module (Tasks 31-35)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 31 | Create content management DTOs | Task 2 |
| 32 | Implement AdminContentService | Task 31 |
| 33 | Create content list component | Task 32 |
| 34 | Create content form component | Task 32 |
| 35 | Wire up content management routes | Tasks 33-34 |

### Phase 8: Dashboard & Integration (Tasks 36-40)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 36 | Create admin dashboard component | Tasks 6-35 |
| 37 | Add navigation to admin layout | Task 4, Task 36 |
| 38 | Implement admin breadcrumbs | Task 4 |
| 39 | Add loading states and error handling | All services |
| 40 | Final integration testing | All tasks |

---

## 4. Database Schema Modifications

The frontend implementation does not require database changes. However, DTOs must match the backend API responses.

### 4.1 Required DTOs by Feature

#### User Management DTOs

```typescript
// AdminUserListResponse (GET /users)
interface AdminUserListResponse {
  success: boolean;
  data: {
    users: AdminUser[];
    pagination: Pagination;
  };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  isRestricted: boolean;
  isDeleted: boolean;
  createdAt: string;
}

// UpdateUserRoleRequest (PUT /users/admin/:id/role)
interface UpdateUserRoleRequest {
  role: 'customer' | 'seller';
}

// RestrictUserRequest (PATCH /users/admin/:id/restriction)
interface RestrictUserRequest {
  isRestricted: boolean;
}

// GrantLoyaltyPointsRequest (PATCH /users/admin/:id/loyalty)
interface GrantLoyaltyPointsRequest {
  points: number;
}

// SellerRequest (GET /users/admin/seller-requests)
interface SellerRequest {
  id: string;
  user: { id: string; name: string; email: string };
  store_name: string;
  bio: string;
  payout_method: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// ReviewSellerRequest (PATCH /users/admin/seller-requests/:id)
interface ReviewSellerRequestRequest {
  status: 'approved' | 'rejected';
  note?: string;
}

// Payout (GET /users/admin/seller-payouts)
interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
}

// ReviewPayoutRequest (PATCH /users/admin/seller-payouts/:id/:payoutId)
interface ReviewPayoutRequest {
  status: 'approved' | 'rejected';
  note?: string;
}

// MarketingBroadcastRequest (POST /users/admin/marketing/broadcast)
interface MarketingBroadcastRequest {
  channel: 'push_notifications' | 'email_newsletter' | 'promotional_notifications';
  title: string;
  body: string;
}
```

#### Order Management DTOs

```typescript
// AdminOrderListResponse (GET /orders)
interface AdminOrderListResponse {
  success: boolean;
  data: {
    orders: AdminOrder[];
    pagination: Pagination;
  };
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  user: { id: string; name: string; email: string };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  payment: { method: string; status: string; transactionId?: string };
  createdAt: string;
  updatedAt: string;
}

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// UpdateOrderStatusRequest (PUT /orders/:id/status)
interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}
```

#### Payment Management DTOs

```typescript
// AdminPaymentListResponse (GET /payments/admin)
interface AdminPaymentListResponse {
  success: boolean;
  data: {
    payments: Payment[];
    totalRevenue: number;
    pagination: Pagination;
  };
}

interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
}

interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

#### Coupon Management DTOs

```typescript
// Coupon (from API)
interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  expiresAt: string;
  usageLimit?: number;
  userLimit?: number;
  usageCount: number;
  active: boolean;
  createdAt: string;
}

// CreateCouponRequest (POST /coupons)
interface CreateCouponRequest {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  expiresAt: string;
  usageLimit?: number;
  userLimit?: number;
}

// UpdateCouponRequest (PUT /coupons/:id)
interface UpdateCouponRequest {
  code?: string;
  type?: 'percentage' | 'fixed';
  value?: number;
  minOrderAmount?: number;
  expiresAt?: string;
  usageLimit?: number;
  userLimit?: number;
  active?: boolean;
}

// CouponListResponse (GET /coupons)
interface CouponListResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    pagination: Pagination;
  };
}
```

#### Content Management DTOs

```typescript
// Content (from API)
interface Content {
  id: string;
  section: 'homepage' | 'banner' | 'faq';
  title: string;
  content: string;
  image?: string;
  link?: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// CreateContentRequest (POST /content)
interface CreateContentRequest {
  section: 'homepage' | 'banner' | 'faq';
  title: string;
  content: string;
  image?: string;
  link?: string;
  order?: number;
}

// UpdateContentRequest (PUT /content/:id)
interface UpdateContentRequest {
  section?: 'homepage' | 'banner' | 'faq';
  title?: string;
  content?: string;
  image?: string;
  link?: string;
  order?: number;
  active?: boolean;
}

// ContentListResponse (GET /content)
interface ContentListResponse {
  success: boolean;
  data: {
    content: Content[];
  };
}
```

### 4.2 Shared Types

```typescript
// Pagination
interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Action Response (common for create/update/delete)
interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message?: string;
  };
}
```

---

## 5. Security Considerations

### 5.1 JWT Handling

All admin endpoints require JWT authentication. The existing AuthInterceptor automatically adds the JWT token to outgoing requests.

```typescript
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getToken();
  
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: Bearer ${token} }
    });
    return next(authReq);
  }
  
  return next(req);
};
```

### 5.2 Role-Based Access Control

The adminGuard protects all admin routes:

```typescript
// src/app/domains/categories/guards/admin.guard.ts
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.currentUser();
  if (user?.role === 'admin') return true;
  
  router.navigate(['/home']);
  return false;
};
```

### 5.3 Protected Routes Configuration

All admin routes must include the adminGuard:

```typescript
// Example route configuration
export const adminRoutes: Routes = [
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/user-list/user-list.component')
  },
  {
    path: 'users/:id',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/user-detail/user-detail.component')
  }
];
```

### 5.4 Error Handling

The existing ErrorInterceptor provides global error handling with these key error codes:
- 401: Unauthorized - Please login again
- 403: Forbidden - You do not have permission
- 404: Resource not found
- 500: Server error - Please try again later

---

## 6. Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Infrastructure Setup** | 1-5 | 2 hours |
| **Phase 2: User Management** | 6-15 | 6 hours |
| **Phase 3: Order Management** | 16-19 | 3 hours |
| **Phase 4: Payment Management** | 20-22 | 2 hours |
| **Phase 5: Category Management** | 23-25 | 1 hour |
| **Phase 6: Coupon Management** | 26-30 | 3 hours |
| **Phase 7: Content Management** | 31-35 | 3 hours |
| **Phase 8: Dashboard & Integration** | 36-40 | 4 hours |
| **Total** | **40 tasks** | **~24 hours** |

### Phase Breakdown

1. **Phase 1 (2 hours)**: Set up folder structure, types, routes, and layout
2. **Phase 2 (6 hours)**: User management - most complex feature with multiple sub-features
3. **Phase 3 (3 hours)**: Order listing and status updates
4. **Phase 4 (2 hours)**: Payment viewing and filtering
5. **Phase 5 (1 hour)**: Enhance existing category management
6. **Phase 6 (3 hours)**: Coupon CRUD operations
7. **Phase 7 (3 hours)**: CMS content management
8. **Phase 8 (4 hours)**: Dashboard, navigation, and testing

---

## 7. Specific Tasks with Dependencies

### Task List (Numbered)

```
Phase 1: Infrastructure Setup
├── [1] Create admin domain folder structure
│   └── mkdir -p src/app/domains/admin/{components,services,dto,guards}
├── [2] Create shared admin types/interfaces
│   └── Create src/app/domains/admin/types/admin.types.ts
├── [3] Implement admin route configuration
│   └── Create src/app/domains/admin/routes.ts
├── [4] Create admin layout component
│   └── Create src/app/domains/admin/layout/admin-layout.component.ts
└── [5] Add admin routes to app.routes.ts
    └── Update src/app/app.routes.ts

Phase 2: User Management Module
├── [6] Create user management DTOs
│   └── Create src/app/domains/admin/dto/user-admin.dto.ts
├── [7] Implement AdminUserService
│   └── Create src/app/domains/admin/services/admin-user.service.ts
├── [8] Implement AdminUserFacadeService
│   └── Create src/app/domains/admin/services/admin-user-facade.service.ts
├── [9] Create user list component
│   └── Create src/app/domains/admin/components/user-list/user-list.component.ts
├── [10] Create user detail/edit component
│   └── Create src/app/domains/admin/components/user-edit/user-edit.component.ts
├── [11] Create seller requests component
│   └── Create src/app/domains/admin/components/seller-requests/seller-requests.component.ts
├── [12] Create loyalty points management component
│   └── Create src/app/domains/admin/components/loyalty-points/loyalty-points.component.ts
├── [13] Create marketing broadcast component
│   └── Create src/app/domains/admin/components/marketing-broadcast/marketing-broadcast.component.ts
├── [14] Create payout reviews component
│   └── Create src/app/domains/admin/components/payout-reviews/payout-reviews.component.ts
└── [15] Wire up user management routes
    └── Update src/app/domains/admin/routes.ts

Phase 3: Order Management Module
├── [16] Create order management DTOs
│   └── Create src/app/domains/admin/dto/order-admin.dto.ts
├── [17] Implement AdminOrderService
│   └── Create src/app/domains/admin/services/admin-order.service.ts
├── [18] Create admin order list component
│   └── Create src/app/domains/admin/components/order-list/order-list.component.ts
└── [19] Create admin order detail component
    └── Create src/app/domains/admin/components/order-detail/order-detail.component.ts

Phase 4: Payment Management Module
├── [20] Create payment management DTOs
│   └── Create src/app/domains/admin/dto/payment-admin.dto.ts
├── [21] Implement AdminPaymentService
│   └── Create src/app/domains/admin/services/admin-payment.service.ts
└── [22] Create payment list component
    └── Create src/app/domains/admin/components/payment-list/payment-list.component.ts

Phase 5: Category Management Module
├── [23] Enhance existing category DTOs
│   └── Update src/app/domains/categories/dto/category.dto.ts
├── [24] Create category management components
│   └── Enhance src/app/domains/categories/pages/category-list/
└── [25] Wire up category management routes
    └── Update src/app/domains/categories/routes.ts

Phase 6: Coupon Management Module
├── [26] Create coupon management DTOs
│   └── Create src/app/domains/admin/dto/coupon-admin.dto.ts
├── [27] Implement AdminCouponService
│   └── Create src/app/domains/admin/services/admin-coupon.service.ts
├── [28] Create coupon list component
│   └── Create src/app/domains/admin/components/coupon-list/coupon-list.component.ts
├── [29] Create coupon form component
│   └── Create src/app/domains/admin/components/coupon-form/coupon-form.component.ts
└── [30] Wire up coupon management routes
    └── Update src/app/domains/admin/routes.ts

Phase 7: Content Management Module
├── [31] Create content management DTOs
│   └── Create src/app/domains/admin/dto/content-admin.dto.ts
├── [32] Implement AdminContentService
│   └── Create src/app/domains/admin/services/admin-content.service.ts
├── [33] Create content list component
│   └── Create src/app/domains/admin/components/content-list/content-list.component.ts
├── [34] Create content form component
│   └── Create src/app/domains/admin/components/content-form/content-form.component.ts
└── [35] Wire up content management routes
    └── Update src/app/domains/admin/routes.ts

Phase 8: Dashboard & Integration
├── [36] Create admin dashboard component
│   └── Create src/app/domains/admin/components/dashboard/dashboard.component.ts
├── [37] Add navigation to admin layout
│   └── Update src/app/domains/admin/layout/admin-layout.component.ts
├── [38] Implement admin breadcrumbs
│   └── Create src/app/domains/admin/components/breadcrumbs/breadcrumbs.component.ts
├── [39] Add loading states and error handling
│   └── Update all services and components
└── [40] Final integration testing
    └── Manual testing and bug fixes
```

### Dependency Graph

```
Task 1 ─┬─► Task 3 ──► Task 5
        │            ▲
        └─► Task 2 ──┘
        │
        └─► Task 4 ──► Task 5

Task 2 ──► Task 6 ──► Task 7 ──► Task 8 ──► Task 9 ──► Task 15
                                  │        │
                                  │        └─► Task 10 ──► Task 15
                                  │        │
                                  │        └─► Task 11 ──► Task 15
                                  │        │
                                  │        └─► Task 12 ──► Task 15
                                  │        │
                                  │        └─► Task 13 ──► Task 15
                                  │        │
                                  │        └─► Task 14 ──► Task 15
                                  │
Task 2 ──► Task 16 ──► Task 17 ──► Task 18 ──► Task 19

Task 2 ──► Task 20 ──► Task 21 ──► Task 22

Task 23 ──► Task 24 ──► Task 25

Task 2 ──► Task 26 ──► Task 27 ──► Task 28 ──► Task 30
                                  │        │
                                  └────────┼─► Task 29 ──► Task 30
                                           │
Task 2 ──► Task 31 ──► Task 32 ──► Task 33 ──► Task 35
                                  │        │
                                  └────────┼─► Task 34 ──► Task 35
                                           │
Tasks 9-22,25,30,35 ──► Task 36 ──► Task 37 ──► Task 38 ──► Task 39 ──► Task 40
```

---

## 8. Potential Challenges and Mitigation Strategies

### 8.1 Challenge: API Response Format Consistency

**Risk**: Backend API may return inconsistent response formats across different endpoints.

**Mitigation**:
- Create wrapper interfaces that normalize responses
- Use RxJS map operators to transform responses in services
- Document expected response formats in DTOs

### 8.2 Challenge: Large Data Sets (Pagination)

**Risk**: Admin dashboards may need to handle large datasets (users, orders, payments).

**Mitigation**:
- Implement client-side pagination with server-side fallback
- Use Angular Signals for reactive pagination state
- Add virtual scrolling for lists > 100 items

### 8.3 Challenge: Role-Based UI Logic

**Risk**: Need to show/hide certain features based on user role.

**Mitigation**:
- Create a RoleService with helper methods
- Use *ngIf with role checks on UI elements
- Implement route guards at multiple levels

### 8.4 Challenge: Form Validation

**Risk**: Complex validation rules for coupons, content ordering, etc.

**Mitigation**:
- Use Angular Reactive Forms with custom validators
- Create reusable form components for common patterns
- Add clear error messages to forms

### 8.5 Challenge: State Management Complexity

**Risk**: Multiple admin features need to share state.

**Mitigation**:
- Use Angular Signals consistently
- Create a central AdminState service if needed
- Leverage existing pattern from OrdersFacadeService

### 8.6 Challenge: Error Recovery

**Risk**: Network errors during admin operations.

**Mitigation**:
- Implement retry logic with exponential backoff
- Add toast/alert notifications for operation status
- Provide clear retry actions for failed operations

### 8.7 Challenge: Security - XSS in CMS Content

**Risk**: Admin-entered content may contain malicious scripts.

**Mitigation**:
- Angular's default sanitization handles this
- Use [innerHTML] cautiously
- Consider a sanitized HTML pipe if needed

### 8.8 Challenge: Parallel Development

**Risk**: Multiple features being developed simultaneously may cause merge conflicts.

**Mitigation**:
- Break down tasks as specified
- Create feature branches for each module
- Use feature flags to toggle incomplete features

---

## 9. Success Criteria

### 9.1 Functional Criteria

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | Admin can view list of all users with pagination | Navigate to /admin/users |
| 2 | Admin can update user roles (customer ↔ seller) | Change a user's role |
| 3 | Admin can restrict/unrestrict user accounts | Restrict and try login |
| 4 | Admin can delete (soft-delete) user accounts | Delete user and verify |
| 5 | Admin can view and approve/reject seller requests | Review pending requests |
| 6 | Admin can grant loyalty points to users | Grant points and verify balance |
| 7 | Admin can send marketing broadcasts | Send broadcast (use test channel) |
| 8 | Admin can review and approve/reject seller payouts | Review payout requests |
| 9 | Admin can view all platform orders | Navigate to /admin/orders |
| 10 | Admin can update order status | Change order from pending to shipped |
| 11 | Admin can view all payments with filters | Filter by date and status |
| 12 | Admin can perform full CRUD on categories | Create, edit, delete category |
| 13 | Admin can perform full CRUD on coupons | Create, edit, delete coupon |
| 14 | Admin can perform full CRUD on CMS content | Create, edit, delete content |
| 15 | Admin dashboard shows summary statistics | View dashboard |

### 9.2 Technical Criteria

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | All admin routes are protected by adminGuard | Code review + manual test |
| 2 | All services follow existing patterns | Code review |
| 3 | All components use Angular Signals for state | Code review |
| 4 | All forms use Reactive Forms | Code review |
| 5 | No TypeScript compilation errors | Run npm run build |
| 6 | No ESLint errors | Run npm run lint |
| 7 | Components use Bootstrap 5 classes | Code review |
| 8 | OnPush change detection on all components | Code review |

### 9.3 Non-Functional Criteria

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | Page load time < 2 seconds | Lighthouse audit |
| 2 | Responsive on mobile devices | Manual test (dev tools) |
| 3 | Accessible (keyboard navigation, ARIA) | Manual test |
| 4 | Clear loading states for all async operations | Manual test |
| 5 | Clear error messages for failed operations | Manual test (trigger errors) |

---

## 10. File Structure Reference

### Target Directory Structure

```
src/app/domains/
├── admin/                              # NEW Admin Domain
│   ├── components/
│   │   ├── dashboard/                  # Admin dashboard
│   │   ├── user-list/                  # User listing
│   │   ├── user-edit/                  # User detail/edit
│   │   ├── seller-requests/            # Seller request management
│   │   ├── loyalty-points/             # Loyalty points management
│   │   ├── marketing-broadcast/         # Marketing broadcast
│   │   ├── payout-reviews/             # Payout reviews
│   │   ├── order-list/                 # All orders listing
│   │   ├── order-detail/              # Order detail
│   │   ├── payment-list/               # Payment listing
│   │   ├── coupon-list/                # Coupon listing
│   │   ├── coupon-form/                # Coupon create/edit
│   │   ├── content-list/               # Content listing
│   │   ├── content-form/               # Content create/edit
│   │   └── layout/                     # Admin layout with nav
│   │
│   ├── dto/                            # Admin DTOs
│   │   ├── user-admin.dto.ts
│   │   ├── order-admin.dto.ts
│   │   ├── payment-admin.dto.ts
│   │   ├── coupon-admin.dto.ts
│   │   └── content-admin.dto.ts
│   │
│   ├── services/                       # Admin services
│   │   ├── admin-user.service.ts
│   │   ├── admin-user-facade.service.ts
│   │   ├── admin-order.service.ts
│   │   ├── admin-payment.service.ts
│   │   ├── admin-coupon.service.ts
│   │   └── admin-content.service.ts
│   │
│   ├── types/                          # Shared types
│   │   └── admin.types.ts
│   │
│   └── routes.ts                       # Admin routes
```

### Existing Files to Reference

| File | Purpose |
|------|---------|
| src/app/core/services/api.service.ts | HTTP client pattern |
| src/app/core/guards/auth.guard.ts | Auth guard pattern |
| src/app/domains/categories/guards/admin.guard.ts | Admin guard |
| src/app/domains/products/admin/services/admin-product.service.ts | Service pattern |
| src/app/domains/orders/services/orders-facade.service.ts | Facade pattern |
| src/app/domains/categories/dto/category.dto.ts | DTO pattern |

---

## 11. API Endpoints Summary

### User Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | List all users (paginated) |
| PUT | /users/admin/:id/role | Update user role |
| PATCH | /users/admin/:id/restriction | Restrict/unrestrict user |
| DELETE | /users/admin/:id | Delete user |
| GET | /users/admin/seller-requests | List seller requests |
| PATCH | /users/admin/seller-requests/:id | Review seller request |
| PATCH | /users/admin/:id/loyalty | Grant loyalty points |
| POST | /users/admin/marketing/broadcast | Send marketing broadcast |
| GET | /users/admin/seller-payouts | List seller payouts |
| PATCH | /users/admin/seller-payouts/:id/:payoutId | Review payout |

### Order Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders | List all orders |
| GET | /orders/:id | Get order details |
| PUT | /orders/:id/status | Update order status |

### Payment Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /payments/admin | List all payments |

### Category Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /categories | List categories |
| POST | /categories | Create category |
| PUT | /categories/:id | Update category |
| DELETE | /categories/:id | Delete category |

### Coupon Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /coupons | List coupons |
| GET | /coupons/:id | Get coupon |
| POST | /coupons | Create coupon |
| PUT | /coupons/:id | Update coupon |
| DELETE | /coupons/:id | Delete coupon |

### Content Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /content | List content |
| GET | /content/:id | Get content |
| POST | /content | Create content |
| PUT | /content/:id | Update content |
| DELETE | /content/:id | Delete content |

---

## 12. Notes

- This plan assumes the backend API is fully implemented as per COMPLETE_API_REFERENCE.md
- The admin layout should include a sidebar navigation with links to all admin sections
- Consider implementing a breadcrumb system for easier navigation
- Use Bootstrap modals for quick actions (approve/reject seller requests, update status)
- Consider adding confirmation dialogs for destructive actions (delete user, delete content)
- The dashboard should show summary cards with counts (total users, pending orders, revenue, etc.)

---

*Plan created: March 2026*
*Last updated: March 2026*
