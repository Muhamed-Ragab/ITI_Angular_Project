# Seller Endpoints Implementation Plan

**Project:** ITI Angular E-Commerce Frontend  
**Date:** March 2026  
**Status:** Draft

---

## 1. Overview

This document outlines the comprehensive implementation plan for adding seller-specific endpoints to the Angular frontend. The seller module will enable sellers to manage their products, orders, payouts, and onboarding status through a dedicated seller dashboard.

### Seller Features Summary

| Feature | Description |
|---------|-------------|
| **Product Management** | Create, read, update, delete own products, image uploads |
| **Order Management** | List seller-specific orders, update order status |
| **Payout Management** | Request payout, payout history, wallet balance |
| **Seller Onboarding** | Request seller status, get onboarding status |

### Reference Documentation

- [COMPLETE_API_REFERENCE.md](../../docs/COMPLETE_API_REFERENCE.md)
- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
- [TYPES_AND_DTOS.md](../../docs/TYPES_AND_DTOS.md)
- [ADMIN_ENDPOINTS_IMPLEMENTATION_PLAN.md](./ADMIN_ENDPOINTS_IMPLEMENTATION_PLAN.md) - Reference for similar patterns

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
export class SellerProductService {
  private readonly api = inject(ApiService);
  
  getProducts(filters: SellerProductFilters = {}): Observable<SellerProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<SellerProductListResponse>('/products/seller', params);
  }
}
```

```typescript
// Facade Pattern (from src/app/domains/orders/services/orders-facade.service.ts)
@Injectable({ providedIn: 'root' })
export class SellerOrdersFacadeService {
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
// Seller Guard (to be created - based on admin.guard.ts)
export const sellerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.currentUser();
  if (user?.role === 'seller' || user?.role === 'admin') return true;
  
  router.navigate(['/home']);
  return false;
};
```

---

## 3. Step-by-Step Implementation Process

### Phase 1: Infrastructure Setup (Tasks 1-6)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Create seller domain folder structure | None |
| 2 | Create shared seller types/interfaces | None |
| 3 | Implement sellerGuard for route protection | None |
| 4 | Implement seller route configuration | Task 1, Task 3 |
| 5 | Create seller layout component | Task 1 |
| 6 | Add seller routes to app.routes.ts | Task 4, Task 5 |

### Phase 2: Product Management Module (Tasks 7-16)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 7 | Create product management DTOs for seller | Task 2 |
| 8 | Implement SellerProductService | Task 7 |
| 9 | Implement SellerProductFacadeService | Task 8 |
| 10 | Create seller product list component | Task 9 |
| 11 | Create seller product form component (create/edit) | Task 9 |
| 12 | Create product image upload component | Task 11 |
| 13 | Create product detail/view component | Task 9 |
| 14 | Wire up product management routes | Tasks 10-13 |
| 15 | Add product status indicators (active/inactive) | Task 10 |
| 16 | Implement product delete with confirmation | Task 11 |

### Phase 3: Order Management Module (Tasks 17-22)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 17 | Create order management DTOs for seller | Task 2 |
| 18 | Implement SellerOrderService | Task 17 |
| 19 | Implement SellerOrdersFacadeService | Task 18 |
| 20 | Create seller order list component | Task 19 |
| 21 | Create seller order detail component | Task 19 |
| 22 | Implement order status update functionality | Task 21 |

### Phase 4: Payout Management Module (Tasks 23-29)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 23 | Create payout management DTOs | Task 2 |
| 24 | Implement PayoutService | Task 23 |
| 25 | Implement PayoutFacadeService | Task 24 |
| 26 | Create payout history component | Task 25 |
| 27 | Create request payout component | Task 25 |
| 28 | Create wallet balance display component | Task 25 |
| 29 | Wire up payout routes | Tasks 26-28 |

### Phase 5: Seller Onboarding Module (Tasks 30-34)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 30 | Create onboarding DTOs | Task 2 |
| 31 | Implement SellerOnboardingService | Task 30 |
| 32 | Create seller request form component | Task 31 |
| 33 | Create onboarding status component | Task 31 |
| 34 | Wire up onboarding routes | Tasks 32-33 |

### Phase 6: Dashboard & Integration (Tasks 35-40)

| Task | Description | Dependencies |
|------|-------------|--------------|
| 35 | Create seller dashboard component | Tasks 7-34 |
| 36 | Add navigation to seller layout | Task 5, Task 35 |
| 37 | Implement seller breadcrumbs | Task 5 |
| 38 | Add loading states and error handling | All services |
| 39 | Integrate with existing auth (role checks) | Task 3 |
| 40 | Final integration testing | All tasks |

---

## 4. Database Schema Modifications

The frontend implementation does not require database changes. However, DTOs must match the backend API responses.

### 4.1 Required DTOs by Feature

#### Product Management DTOs

```typescript
// SellerProduct (GET /products/seller)
interface SellerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: { id: string; name: string };
  stock: number;
  images: string[];
  average_rating: number;
  ratings_count: number;
  is_active: boolean;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// SellerProductListResponse
interface SellerProductListResponse {
  success: boolean;
  data: {
    products: SellerProduct[];
    pagination: Pagination;
  };
}

// CreateProductRequest (POST /products)
interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

// UpdateProductRequest (PUT /products/:id)
interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
}

// ImageUploadPayloadRequest (POST /products/images/upload-payload)
interface ImageUploadPayloadRequest {
  filename: string;
  contentType: string;
}

// ImageUploadPayloadResponse
interface ImageUploadPayloadResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    imageUrl: string;
  };
}
```

#### Order Management DTOs

```typescript
// SellerOrder (GET /orders/seller)
interface SellerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  customer: {
    name: string;
    shippingAddress: Address;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  seller_id: string;
}

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// SellerOrderListResponse
interface SellerOrderListResponse {
  success: boolean;
  data: {
    orders: SellerOrder[];
    pagination: Pagination;
  };
}

// UpdateSellerOrderStatusRequest (PUT /orders/:id/seller-status)
interface UpdateSellerOrderStatusRequest {
  status: 'shipped' | 'delivered' | 'cancelled';
  note?: string;
}
```

#### Payout Management DTOs

```typescript
// Payout (GET /users/seller/payouts)
interface Payout {
  id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// PayoutListResponse
interface PayoutListResponse {
  success: boolean;
  data: {
    payouts: Payout[];
    pagination: Pagination;
  };
}

// RequestPayoutRequest (POST /users/seller/payouts)
interface RequestPayoutRequest {
  amount: number;
  note?: string;
}

// WalletBalanceResponse (GET /users/seller/wallet)
interface WalletBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    pendingPayouts: number;
    availableBalance: number;
  };
}
```

#### Onboarding DTOs

```typescript
// SellerOnboardingRequest (POST /users/seller/onboarding)
interface SellerOnboardingRequest {
  store_name: string;
  bio: string;
  payout_method: 'bank_transfer' | 'paypal' | 'other';
}

// SellerOnboardingResponse
interface SellerOnboardingResponse {
  success: boolean;
  message: string;
  data: {
    status: 'pending' | 'approved' | 'rejected';
    store_name: string;
  };
}

// OnboardingStatusResponse (GET /users/seller/onboarding/status)
interface OnboardingStatusResponse {
  success: boolean;
  data: {
    status: 'none' | 'pending' | 'approved' | 'rejected';
    store_name?: string;
    bio?: string;
    payout_method?: string;
    note?: string;
    createdAt?: string;
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

All seller endpoints require JWT authentication. The existing AuthInterceptor automatically adds the JWT token to outgoing requests.

```typescript
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getToken();
  
  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }
  
  return next(req);
};
```

### 5.2 Role-Based Access Control

Create a sellerGuard to protect seller routes:

```typescript
// src/app/core/guards/seller.guard.ts
export const sellerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.currentUser();
  // Allow both 'seller' and 'admin' roles
  if (user?.role === 'seller' || user?.role === 'admin') return true;
  
  router.navigate(['/home']);
  return false;
};
```

### 5.3 Protected Routes Configuration

All seller routes must include the sellerGuard:

```typescript
// Example route configuration
export const sellerRoutes: Routes = [
  {
    path: 'products',
    canActivate: [sellerGuard],
    loadComponent: () => import('./components/product-list/product-list.component')
  },
  {
    path: 'products/new',
    canActivate: [sellerGuard],
    loadComponent: () => import('./components/product-form/product-form.component')
  },
  {
    path: 'products/:id',
    canActivate: [sellerGuard],
    loadComponent: () => import('./components/product-detail/product-detail.component')
  }
];
```

### 5.4 Additional Security Considerations

1. **Ownership Validation**: Products can only be edited by their owner
2. **Order Access**: Sellers can only see orders containing their products
3. **Payout Limits**: Validate payout requests against available balance

### 5.5 Error Handling

The existing ErrorInterceptor provides global error handling with these key error codes:
- 401: Unauthorized - Please login again
- 403: Forbidden - You do not have permission (insufficient role)
- 404: Resource not found
- 500: Server error - Please try again later

---

## 6. Timeline

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Infrastructure Setup** | 1-6 | 2 hours |
| **Phase 2: Product Management** | 7-16 | 6 hours |
| **Phase 3: Order Management** | 17-22 | 3 hours |
| **Phase 4: Payout Management** | 23-29 | 3 hours |
| **Phase 5: Onboarding Module** | 30-34 | 2 hours |
| **Phase 6: Dashboard & Integration** | 35-40 | 3 hours |
| **Total** | **40 tasks** | **~19 hours** |

### Phase Breakdown

1. **Phase 1 (2 hours)**: Set up folder structure, types, guards, routes, and layout
2. **Phase 2 (6 hours)**: Product management - CRUD operations, image upload
3. **Phase 3 (3 hours)**: Order listing, filtering, and status updates
4. **Phase 4 (3 hours)**: Payout requests, history, wallet balance
5. **Phase 5 (2 hours)**: Seller onboarding flow and status
6. **Phase 6 (3 hours)**: Dashboard, navigation, and testing

---

## 7. Specific Tasks with Dependencies

### Task List (Numbered)

```
Phase 1: Infrastructure Setup
├── [1] Create seller domain folder structure
│   └── mkdir -p src/app/domains/seller/{components,services,dto,guards,layout}
├── [2] Create shared seller types/interfaces
│   └── Create src/app/domains/seller/types/seller.types.ts
├── [3] Implement sellerGuard
│   └── Create src/app/core/guards/seller.guard.ts
├── [4] Implement seller route configuration
│   └── Create src/app/domains/seller/routes.ts
├── [5] Create seller layout component
│   └── Create src/app/domains/seller/layout/seller-layout.component.ts
└── [6] Add seller routes to app.routes.ts
    └── Update src/app/app.routes.ts

Phase 2: Product Management Module
├── [7] Create product management DTOs
│   └── Create src/app/domains/seller/dto/product.dto.ts
├── [8] Implement SellerProductService
│   └── Create src/app/domains/seller/services/seller-product.service.ts
├── [9] Implement SellerProductFacadeService
│   └── Create src/app/domains/seller/services/seller-product-facade.service.ts
├── [10] Create seller product list component
│   └── Create src/app/domains/seller/components/product-list/product-list.component.ts
├── [11] Create seller product form component
│   └── Create src/app/domains/seller/components/product-form/product-form.component.ts
├── [12] Create product image upload component
│   └── Create src/app/domains/seller/components/product-image-upload/product-image-upload.component.ts
├── [13] Create product detail/view component
│   └── Create src/app/domains/seller/components/product-detail/product-detail.component.ts
├── [14] Wire up product management routes
│   └── Update src/app/domains/seller/routes.ts
├── [15] Add product status indicators
│   └── Update product list component
└── [16] Implement product delete with confirmation
    └── Update product list component

Phase 3: Order Management Module
├── [17] Create order management DTOs for seller
│   └── Create src/app/domains/seller/dto/order.dto.ts
├── [18] Implement SellerOrderService
│   └── Create src/app/domains/seller/services/seller-order.service.ts
├── [19] Implement SellerOrdersFacadeService
│   └── Create src/app/domains/seller/services/seller-orders-facade.service.ts
├── [20] Create seller order list component
│   └── Create src/app/domains/seller/components/order-list/order-list.component.ts
├── [21] Create seller order detail component
│   └── Create src/app/domains/seller/components/order-detail/order-detail.component.ts
└── [22] Implement order status update functionality
    └── Update order detail component

Phase 4: Payout Management Module
├── [23] Create payout management DTOs
│   └── Create src/app/domains/seller/dto/payout.dto.ts
├── [24] Implement PayoutService
│   └── Create src/app/domains/seller/services/payout.service.ts
├── [25] Implement PayoutFacadeService
│   └── Create src/app/domains/seller/services/payout-facade.service.ts
├── [26] Create payout history component
│   └── Create src/app/domains/seller/components/payout-history/payout-history.component.ts
├── [27] Create request payout component
│   └── Create src/app/domains/seller/components/request-payout/request-payout.component.ts
├── [28] Create wallet balance display component
│   └── Create src/app/domains/seller/components/wallet-balance/wallet-balance.component.ts
└── [29] Wire up payout routes
    └── Update src/app/domains/seller/routes.ts

Phase 5: Seller Onboarding Module
├── [30] Create onboarding DTOs
│   └── Create src/app/domains/seller/dto/onboarding.dto.ts
├── [31] Implement SellerOnboardingService
│   └── Create src/app/domains/seller/services/seller-onboarding.service.ts
├── [32] Create seller request form component
│   └── Create src/app/domains/seller/components/onboarding-request/onboarding-request.component.ts
├── [33] Create onboarding status component
│   └── Create src/app/domains/seller/components/onboarding-status/onboarding-status.component.ts
└── [34] Wire up onboarding routes
    └── Update src/app/domains/seller/routes.ts

Phase 6: Dashboard & Integration
├── [35] Create seller dashboard component
│   └── Create src/app/domains/seller/components/dashboard/dashboard.component.ts
├── [36] Add navigation to seller layout
│   └── Update src/app/domains/seller/layout/seller-layout.component.ts
├── [37] Implement seller breadcrumbs
│   └── Create src/app/domains/seller/components/breadcrumbs/breadcrumbs.component.ts
├── [38] Add loading states and error handling
│   └── Update all services and components
├── [39] Integrate with existing auth (role checks)
│   └── Update src/app/core/guards/seller.guard.ts
└── [40] Final integration testing
    └── Manual testing and bug fixes
```

### Dependency Graph

```
Task 1 ─┬─► Task 4 ──► Task 6
        │            ▲
        └─► Task 2 ──┘
        │
        └─► Task 3 ──► Task 4 ──► Task 6
        │
        └─► Task 5 ──► Task 6

Task 2 ──► Task 7 ──► Task 8 ──► Task 9 ──► Task 10 ──► Task 14 ──► Task 15 ──► Task 16
                                  │                │           ▲
                                  │                └─► Task 11 ─┼─► Task 14
                                  │                │           ▲
                                  │                └─► Task 12 ─┼─► Task 14
                                  │                │           ▲
                                  └───────────────┴─► Task 13 ─┘

Task 2 ──► Task 17 ──► Task 18 ──► Task 19 ──► Task 20 ──► Task 22
                                            │           ▲
                                            └─► Task 21 ┘

Task 2 ──► Task 23 ──► Task 24 ──► Task 25 ──► Task 26 ──► Task 29
                                            │           ▲
                                            ├─► Task 27 ┤
                                            │           ▲
                                            └─► Task 28 ┘

Task 2 ──► Task 30 ──► Task 31 ──► Task 32 ──► Task 34
                                            │           ▲
                                            └─► Task 33 ┘

Tasks 10,14,16,20,22,26,29,32,33 ──► Task 35 ──► Task 36 ──► Task 37 ──► Task 38 ──► Task 39 ──► Task 40
```

---

## 8. Potential Challenges and Mitigation Strategies

### 8.1 Challenge: Product Ownership Validation

**Risk**: Seller might try to edit products they don't own.

**Mitigation**:
- Backend validates ownership (PUT /products/:id checks seller_id)
- Frontend can hide edit buttons for non-owned products as UI enhancement
- Show appropriate error messages for unauthorized access attempts

### 8.2 Challenge: Image Upload Complexity

**Risk**: Image uploads require multiple API calls and state management.

**Mitigation**:
- Create reusable image upload component
- Handle pre-signed URL generation
- Show upload progress and error states
- Validate file types and sizes before upload

### 8.3 Challenge: Order Status Update Restrictions

**Risk**: Sellers can only update certain statuses (shipped, delivered, cancelled).

**Mitigation**:
- UI shows only allowed status transitions
- Backend enforces valid state machine transitions
- Clear error messages for invalid transitions

### 8.4 Challenge: Payout Validation

**Risk**: Sellers might request payouts exceeding available balance.

**Mitigation**:
- Display available balance prominently
- Validate payout amount before submission
- Show clear error messages for invalid amounts

### 8.5 Challenge: Onboarding State Management

**Risk**: Different users have different onboarding states (none, pending, approved, rejected).

**Mitigation**:
- Create status component that handles all states
- Redirect pending users to status page
- Show appropriate UI based on current status

### 8.6 Challenge: Role-Based UI Logic

**Risk**: Need to show/hide features based on user role.

**Mitigation**:
- Use sellerGuard for route protection
- Use *ngIf with role checks on UI elements
- Handle customer trying to access seller routes gracefully

### 8.7 Challenge: Large Data Sets (Pagination)

**Risk**: Seller dashboards may need to handle large datasets.

**Mitigation**:
- Implement client-side pagination with server-side fallback
- Use Angular Signals for reactive pagination state
- Add virtual scrolling for lists > 100 items if needed

### 8.8 Challenge: Error Recovery

**Risk**: Network errors during seller operations.

**Mitigation**:
- Implement retry logic with exponential backoff
- Add toast/alert notifications for operation status
- Provide clear retry actions for failed operations

---

## 9. Success Criteria

### 9.1 Functional Criteria

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | Seller can view list of their products | Navigate to /seller/products |
| 2 | Seller can create a new product | Fill form and submit |
| 3 | Seller can edit their own products | Edit existing product |
| 4 | Seller can delete their products | Delete product with confirmation |
| 5 | Seller can upload product images | Upload multiple images |
| 6 | Seller can view orders containing their products | Navigate to /seller/orders |
| 7 | Seller can update order status (shipped/delivered) | Change order status |
| 8 | Seller can view wallet balance | View dashboard |
| 9 | Seller can request payout | Submit payout request |
| 10 | Seller can view payout history | View payout history |
| 11 | Customer can request seller status | Submit onboarding form |
| 12 | User can view onboarding status | Check status page |
| 13 | Seller dashboard shows summary statistics | View dashboard |

### 9.2 Technical Criteria

| # | Criterion | Validation Method |
|---|-----------|-------------------|
| 1 | All seller routes are protected by sellerGuard | Code review + manual test |
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
├── seller/                              # NEW Seller Domain
│   ├── components/
│   │   ├── dashboard/                  # Seller dashboard
│   │   ├── product-list/               # Seller's product listing
│   │   ├── product-form/               # Product create/edit form
│   │   ├── product-detail/             # Product detail view
│   │   ├── product-image-upload/       # Image upload component
│   │   ├── order-list/                 # Seller orders listing
│   │   ├── order-detail/              # Order detail view
│   │   ├── payout-history/             # Payout history
│   │   ├── request-payout/            # Payout request form
│   │   ├── wallet-balance/            # Wallet balance display
│   │   ├── onboarding-request/         # Seller onboarding form
│   │   ├── onboarding-status/          # Onboarding status view
│   │   └── layout/                     # Seller layout with nav
│   │
│   ├── dto/                            # Seller DTOs
│   │   ├── product.dto.ts
│   │   ├── order.dto.ts
│   │   ├── payout.dto.ts
│   │   ├── onboarding.dto.ts
│   │   └── index.ts
│   │
│   ├── services/                       # Seller services
│   │   ├── seller-product.service.ts
│   │   ├── seller-product-facade.service.ts
│   │   ├── seller-order.service.ts
│   │   ├── seller-orders-facade.service.ts
│   │   ├── payout.service.ts
│   │   ├── payout-facade.service.ts
│   │   ├── seller-onboarding.service.ts
│   │   └── seller-onboarding-facade.service.ts
│   │
│   ├── types/                          # Shared types
│   │   └── seller.types.ts
│   │
│   └── routes.ts                       # Seller routes

src/app/core/guards/
└── seller.guard.ts                     # NEW Seller guard
```

### Existing Files to Reference

| File | Purpose |
|------|---------|
| src/app/core/services/api.service.ts | HTTP client pattern |
| src/app/core/guards/auth.guard.ts | Auth guard pattern |
| src/app/domains/categories/guards/admin.guard.ts | Admin guard pattern |
| src/app/domains/products/admin/services/admin-product.service.ts | Product service pattern |
| src/app/domains/orders/services/orders-facade.service.ts | Facade pattern |
| src/app/domains/products/admin/dto/admin-product.dto.ts | DTO pattern |

---

## 11. API Endpoints Summary

### Product Management (Seller)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /products/seller | List seller's products |
| POST | /products | Create new product |
| GET | /products/:id | Get product details |
| PUT | /products/:id | Update product |
| DELETE | /products/:id | Delete product |
| POST | /products/images/upload-payload | Get pre-signed upload URL |
| POST | /products/:id/images/upload | Add image to product |

### Order Management (Seller)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /orders/seller | List seller's orders |
| GET | /orders/:id | Get order details |
| PUT | /orders/:id/seller-status | Update order status |

### Payout Management (Seller)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/seller/payouts | List payout history |
| POST | /users/seller/payouts | Request payout |
| GET | /users/seller/wallet | Get wallet balance |

### Seller Onboarding

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /users/seller/onboarding | Request seller status |
| GET | /users/seller/onboarding/status | Get onboarding status |

---

## 12. Comparison with Admin Implementation

This seller implementation plan complements the [Admin Endpoints Implementation Plan](./ADMIN_ENDPOINTS_IMPLEMENTATION_PLAN.md). Key differences:

| Aspect | Admin | Seller |
|--------|-------|--------|
| **Scope** | Platform-wide | Own data only |
| **Products** | All products | Own products only |
| **Orders** | All orders | Orders with seller's items |
| **Payouts** | Review payouts | Request/view payouts |
| **Onboarding** | Approve requests | Submit request |
| **Guard** | adminGuard | sellerGuard |

---

## 13. Notes

- This plan assumes the backend API is fully implemented as per COMPLETE_API_REFERENCE.md
- The seller layout should include a sidebar navigation with links to all seller sections
- Consider implementing a breadcrumb system for easier navigation
- Use Bootstrap modals for quick actions (update order status, confirm delete)
- Consider adding confirmation dialogs for destructive actions (delete product)
- The dashboard should show summary cards with counts (total products, pending orders, wallet balance, etc.)
- Image upload should handle multiple images with drag-and-drop support
- Order status updates should show only valid transitions based on current status

---

*Plan created: March 2026*
*Last updated: March 2026*
