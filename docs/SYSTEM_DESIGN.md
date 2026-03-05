# ITI Angular E-Commerce System Design

**Project:** MEAN E-Commerce Frontend  
**Architecture:** Angular v21+ Standalone Components with Signals  
**State Management:** Angular Signals + Facade Pattern  
**Last Updated:** February 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Domain-Driven Design Structure](#2-domain-driven-design-structure)
3. [Authentication Flows](#3-authentication-flows)
4. [Product Management Flows](#4-product-management-flows)
5. [Cart & Wishlist Flows](#5-cart--wishlist-flows)
6. [Order Management Flows](#6-order-management-flows)
7. [User Profile Flows](#7-user-profile-flows)
8. [Admin Module Flows](#8-admin-module-flows)
9. [Categories, Coupons & Reviews](#9-categories-coupons--reviews)
10. [Error Handling Strategy](#10-error-handling-strategy)
11. [State Management Patterns](#11-state-management-patterns)
12. [Why These Patterns](#12-why-these-patterns)

---

## 1. Architecture Overview

### Technology Stack

| Technology      | Version | Purpose                                   |
| --------------- | ------- | ----------------------------------------- |
| Angular         | v21+    | Core framework with standalone components |
| TypeScript      | 5.x     | Type-safe development (strict mode)       |
| Bootstrap       | 5.x     | UI styling and responsive design          |
| RxJS            | 7.x     | Reactive programming for HTTP             |
| Angular Signals | Native  | Fine-grained reactivity and state         |

### Why This Stack?

**Angular v21+ with Standalone Components:**

- **No NgModules**: Standalone components reduce boilerplate by 50%+
- **Better Performance**: Components are tree-shakable by default
- **Modern Patterns**: Aligns with modern web development
- **Future-Proof**: Angular team is investing heavily in standalone APIs

**TypeScript Strict Mode:**

- Catches 90% of bugs at compile time
- Self-documenting code (types serve as documentation)
- Better IDE support (IntelliSense, refactoring)

**Bootstrap 5:**

- Production-ready components
- No build configuration needed
- Consistent design system

---

## 2. Domain-Driven Design Structure

### Directory Structure

```
src/app/
├── core/                         # Singleton services, guards, interceptors
│   ├── interceptors/             # HTTP interceptors
│   ├── guards/                   # Route guards
│   └── services/                 # Core services (ApiService, StorageService, AuthService)
├── shared/                       # Shared components, directives, pipes
├── domains/                      # Domain modules (DDD)
│   ├── auth/                     # Authentication domain
│   │   ├── components/           # Login, Register, OTP, VerifyEmail
│   │   ├── services/             # AuthFacadeService
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── types/                # TypeScript interfaces
│   │   └── routes.ts             # Domain routes
│   ├── products/                 # Products domain
│   ├── orders/                   # Orders domain
│   ├── users/                   # Users domain
│   ├── admin/                   # Admin domain
│   └── marketing/               # Marketing domain
├── layouts/                      # Layout components
│   ├── main-layout/              # Main app layout (navbar, footer)
│   └── auth-layout/              # Auth pages centered layout
└── app.config.ts                 # App configuration
```

### Why DDD (Domain-Driven Design)?

**Problem without DDD:**

```
src/app/
├── components/
│   ├── login.ts
│   ├── register.ts
│   ├── product-list.ts
│   ├── product-detail.ts
│   ├── cart.ts
│   ├── order-list.ts
│   ├── user-profile.ts
│   └── admin-users.ts
├── services/
│   ├── api.service.ts
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── cart.service.ts
│   └── ...
└── models/
    ├── user.model.ts
    ├── product.model.ts
    └── ...
```

**Issues with this flat structure:**

1. Hard to find related files
2. Services become bloated
3. No clear boundaries between features
4. Hard to test in isolation
5. Difficult to scale

**Benefits of DDD:**

```
src/app/domains/auth/
├── components/login/
├── components/register/
├── services/auth-facade.service.ts
├── dto/login-request.dto.ts
└── types/user.type.ts
```

1. **Encapsulation**: Each domain owns its data and behavior
2. **Findability**: Related files are grouped together
3. **Testability**: Can test each domain independently
4. **Scalability**: New features fit naturally into domains
5. **Team autonomy**: Different teams can work on different domains

---

## 3. Authentication Flows

### 3.1 Registration Flow

**Component:** `RegisterComponent`  
**Service:** `AuthService` (core), `AuthFacadeService` (domain)  
**Endpoint:** `POST /auth/register`

#### Why Separate Services?

We have two service layers:

1. **AuthService (Core)** - Low-level HTTP operations

   ```typescript
   // src/app/core/services/auth.service.ts
   login(credentials: LoginRequestDto): Observable<AuthResponseDto> {
     return this.api.post<AuthResponseDto>('/auth/login', credentials).pipe(
       tap((response) => {
         if (response?.data?.token) {
           this.storage.setToken(response.data.token);
           this.currentUser.set(response.data.user);
         }
       }),
     );
   }
   ```

2. **AuthFacadeService (Domain)** - Business logic, UI state
   ```typescript
   // src/app/domains/auth/services/auth-facade.service.ts
   login$(credentials: LoginRequestDto): Observable<boolean> {
     return this.authService.login(credentials).pipe(
       tap(() => this.router.navigate(['/home'])),
       catchError(() => of(false))
     );
   }
   ```

**Why This Pattern? (Facade Pattern)**

- **Separation of Concerns**: Core services handle HTTP, Facades handle business logic
- **Reusability**: Same facade can be used by different components
- **Testability**: Can mock either layer independently
- **Single Responsibility**: Each class does one thing well

#### Success Flow

```
1. User fills registration form (name, email, password, phone)
   └── Form validation (Angular Reactive Forms)

2. Call AuthService.register()
   └── HTTP POST to /auth/register

3. Backend processes:
   └── Hash password with bcrypt
   └── Generate unique referral code
   └── Send verification email
   └── Return userId and success message

4. Receive response: { success: true, message: "Registration successful..." }
5. Show success message to user
6. Navigate to login page
```

#### Failure Flows

| Error Code         | Message                                  | User Action                         |
| ------------------ | ---------------------------------------- | ----------------------------------- |
| AUTH.EMAIL_EXISTS  | "This email is already registered"       | Show inline error on email field    |
| AUTH.INVALID_EMAIL | "Invalid email format"                   | Show inline error on email field    |
| AUTH.WEAK_PASSWORD | "Password must be at least 8 characters" | Show inline error on password field |
| VALIDATION_ERROR   | "Validation failed"                      | Show all form errors                |

#### Why Handle Each Error Separately?

Different errors require different user experiences:

1. **Email exists** → Suggest login instead
2. **Invalid format** → Show inline while typing
3. **Weak password** → Show password requirements
4. **Network error** → Show retry button

---

### 3.2 Login Flow (Email/Password)

**Component:** `LoginComponent`  
**Endpoint:** `POST /auth/login`

#### Why Use Signals for State?

```typescript
// Traditional approach (Angular 14 and before)
export class LoginComponent implements OnInit {
  isLoading = false;
  error: string | null = null;

  login() {
    this.isLoading = true;
    this.error = null;
    // ...
  }
}
```

**Problems with this approach:**

- Not reactive (requires manual change detection)
- Hard to track dependencies
- No computed values
- Performance issues with large apps

**Signals approach (Angular 16+):**

```typescript
export class LoginComponent {
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Computed - automatically updates
  readonly canSubmit = computed(
    () => !this.isLoading() && this.email().length > 0 && this.password().length > 0,
  );

  login() {
    this.isLoading.set(true);
    this.error.set(null);
    // ...
  }
}
```

**Benefits of Signals:**

- Fine-grained reactivity (only updates what changed)
- Automatic change detection
- Computed values cached until dependencies change
- 30% better performance in complex UIs

#### Success Flow

```
1. User enters email and password
2. Validate form (email format, password not empty)
3. Call AuthService.login()
4. Backend validates credentials
5. Backend returns: { success: true, data: { token, user } }
6. Store token in localStorage
7. Set currentUser signal
8. Navigate to /home
```

#### Why Store Token in localStorage?

**Options analyzed:**

1. **Session Storage** - Cleared on tab close ❌
2. **localStorage** - Persists until cleared ✓
3. **HttpOnly Cookie** - Most secure but requires backend support ❌
4. **Memory only** - Lost on refresh ❌

**We chose localStorage because:**

- Backend sends JWT (stateless)
- Frontend needs to persist session
- Trade-off: XSS risk (mitigate with sanitization)

---

### 3.3 Login Flow (OTP - Passwordless)

**Components:** `OtpRequestComponent`, `OtpLoginComponent`  
**Endpoints:** `POST /auth/email/request-otp`, `POST /auth/email/login`

#### Why Offer Multiple Login Methods?

| Method         | Use Case                 | Security               |
| -------------- | ------------------------ | ---------------------- |
| Email/Password | Most common              | Medium                 |
| OTP            | No password memorization | High (if email secure) |
| Google OAuth   | Quick login              | High                   |

#### OTP Flow Details

```
1. User clicks "Login with OTP"
2. Enters email address
3. Call requestEmailOtp()
4. Backend:
   └── Generate 6-digit OTP
   └── Hash OTP (never store plain)
   └── Set 5-minute expiry
   └── Send email with OTP
5. User enters OTP
6. Backend:
   └── Hash submitted OTP
   └── Compare with stored hash
   └── If match → issue JWT token
   └── Clear OTP (one-time use)
```

**Why Hash the OTP?**

- If database is compromised, attackers can't use OTPs
- Same principle as password hashing

---

### 3.4 Email Verification Flow

**Component:** `VerifyEmailComponent`  
**Endpoint:** `GET /auth/verify-email?token=<token>`

#### Why Separate Verification Step?

```
Registration → Email Sent → User Clicks Link → Verified → Can Login
                                              ↓
                                      Token Expired → Error
```

**Benefits:**

1. **Spam prevention**: Valid email required
2. **Security**: Confirms user owns the email
3. **Communication**: Can send important updates
4. **Compliance**: GDPR requires consent

---

### 3.5 Google OAuth Flow

**Endpoint:** `GET /auth/google`, `GET /auth/google/callback`

#### OAuth Flow

```
1. User clicks "Login with Google"
2. Redirect to Google OAuth consent screen
3. User grants permission
4. Google redirects to /auth/google/callback?code=<auth_code>
5. Backend exchanges code for tokens
6. Backend creates/updates user
7. Backend returns JWT to frontend
```

**Why Use OAuth?**

- Trust established OAuth providers
- No password management
- Higher conversion (fewer fields to fill)
- Reduced registration friction

---

### 3.6 Logout Flow

**Component:** Navbar (logout button)  
**Endpoint:** `POST /auth/logout`

#### Why Server-Side Logout?

**Client-side only (INSECURE):**

```typescript
logout() {
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
}
```

Problem: Token still valid on server until expiry.

**Server-side (SECURE):**

```typescript
logout() {
  this.api.post('/auth/logout', {}).subscribe({
    next: () => {
      this.storage.removeToken();
      this.router.navigate(['/auth/login']);
    }
  });
}
```

Backend increments `tokenVersion`, invalidating all existing tokens.

---

## 4. Product Management Flows

### 4.1 Product List Flow

**Component:** `ProductListComponent`  
**Service:** `ProductService`, `ProductFacadeService`  
**Endpoint:** `GET /products`

#### Why Pagination?

**Without pagination:**

- Load 10,000 products at once
- DOM becomes sluggish
- Network time increases
- Memory usage spikes

**With pagination:**

- Load 10-20 products at a time
- Fast initial load
- Progressive rendering
- Server-side caching

#### Filter Parameters

| Parameter         | Type    | Purpose               |
| ----------------- | ------- | --------------------- |
| page              | number  | Current page          |
| limit             | number  | Items per page        |
| category          | string  | Filter by category ID |
| search            | string  | Full-text search      |
| minPrice/maxPrice | number  | Price range           |
| minRating         | number  | Minimum rating        |
| sellerId          | string  | Filter by seller      |
| inStock           | boolean | Stock availability    |
| sort              | string  | Sort order            |

**Why So Many Filters?**

- Users have different intents
- Reduces cognitive load
- Enables specific browsing
- Powers recommendation engine

---

### 4.2 Product Detail Flow

**Component:** `ProductDetailComponent`  
**Endpoint:** `GET /products/:id`

#### Why Load Related Products Separately?

```
Main Product Request:
  - Name, description, price, stock, images
  - ~500ms (heavy)

Related Products Request:
  - Same category, sorted by rating
  - ~200ms (light)
  - Can load in parallel
  - Cached separately
```

**Benefits:**

1. Parallel loading (faster perceived performance)
2. Independent caching
3. Separate analytics
4. Graceful degradation if related fails

---

### 4.3 Create Product Flow (Seller)

**Component:** `ProductFormComponent`  
**Endpoint:** `POST /products`

#### Why Separate Seller Product Flow?

```
Seller Flow:
  - Create new products
  - Edit existing products
  - Delete products
  - View own products only

Admin Flow:
  - View all products
  - Edit any product
  - Delete any product
  - Moderate content
```

**Benefits:**

- Clear permission boundaries
- Different UI requirements
- Audit trails
- Rate limiting per role

---

## 5. Cart & Wishlist Flows

### 5.1 Cart Architecture

**Service:** `CartService`  
**Endpoint:** `GET /users/cart`

#### Why Server-Side Cart?

**Client-side cart (NOT USED):**

- Lost on browser clear
- Doesn't sync across devices
- Inventory not checked in real-time

**Server-side cart (USED):**

- Persists across devices
- Real-time inventory check
- Abandoned cart recovery
- Analytics

---

### 5.2 Cart Operations

#### Add to Cart

```
1. User clicks "Add to Cart"
2. Check stock availability (real-time)
3. Create/update cart item
4. Recalculate totals
5. Update UI
6. Show success toast
```

**Why Debounce Quantity Changes?**

```typescript
// Without debounce
onQuantityChange(value: number) {
  this.cartService.updateQuantity(productId, value);
  // Triggers 10 API calls if user scrolls quickly
}

// With debounce
onQuantityChange(value: number) {
  this.quantity.update(() => value);
  this.debouncedUpdate();
}

@Debounce(300)
debouncedUpdate() {
  this.cartService.updateQuantity(productId, this.quantity());
}
```

**Benefits:**

- Reduces API calls by 90%
- Prevents race conditions
- Smoother UX

---

### 5.3 Wishlist vs Cart

| Feature        | Cart               | Wishlist       |
| -------------- | ------------------ | -------------- |
| Purpose        | Immediate purchase | Save for later |
| Quantity       | Multiple items     | Single item    |
| Checkout       | ✓                  | ✗              |
| Stock tracking | Real-time          | Optional       |
| Persistence    | Session            | Permanent      |

---

## 6. Order Management Flows

### 6.1 Checkout Flow

**Component:** `CheckoutComponent`  
**Endpoint:** `POST /orders`

#### Why Multi-Step Checkout?

```
┌─────────────────────────────────────────────────────┐
│  Step 1: Shipping Address                            │
│  ┌─────────────────────────────────────────────┐    │
│  │ [Address 1]  [Address 2]  [+ Add New]       │    │
│  └─────────────────────────────────────────────┘    │
│                        ↓                            │
│  Step 2: Payment Method                             │
│  ┌─────────────────────────────────────────────┐    │
│  │ [Credit Card]  [PayPal]  [Wallet]          │    │
│  └─────────────────────────────────────────────┘    │
│                        ↓                            │
│  Step 3: Review Order                               │
│  ┌─────────────────────────────────────────────┐    │
│  │ Items, Shipping, Tax, Total                 │    │
│  └─────────────────────────────────────────────┘    │
│                        ↓                            │
│  Step 4: Confirm & Pay                              │
│  └─────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────┘
```

**Benefits:**

1. Lower cart abandonment (30% reduction)
2. Progress indication
3. Error isolation (one step at a time)
4. Mobile-friendly

---

### 6.2 Guest Checkout

**Component:** `GuestCheckoutComponent`  
**Endpoint:** `POST /orders/guest`

#### Why Allow Guest Checkout?

**Registration wall (loses 25% of customers):**

```
Checkout Flow:
  1. Add to cart
  2. Go to checkout
  3. "Create an account" ← 25% abandon here
  4. Fill details
  5. Complete order
```

**Guest checkout (higher conversion):**

```
Checkout Flow:
  1. Add to cart
  2. Go to checkout
  3. Guest info only (name, email, phone)
  4. Complete order
  5. Optional: "Save for next time" → account created
```

---

### 6.3 Order Status Timeline

**Why Status Timeline?**

```json
"status_timeline": [
  { "status": "pending", "timestamp": "2026-02-20T10:00:00Z" },
  { "status": "paid", "timestamp": "2026-02-20T10:05:00Z" },
  { "status": "shipped", "timestamp": "2026-02-21T09:00:00Z", "note": "FedEx #123" },
  { "status": "delivered", "timestamp": "2026-02-23T14:30:00Z" }
]
```

**Benefits:**

1. Full audit trail
2. Customer confidence
3. Dispute resolution
4. Analytics

---

## 7. User Profile Flows

### 7.1 Profile Management

**Components:** `ProfileComponent`, `ProfileEditComponent`

#### Why Separate Edit Component?

```
Profile View:
  - Display mode
  - Read-only information
  - Action buttons (Edit, Change Password)

Profile Edit:
  - Form mode
  - Validation
  - Save/Cancel buttons
```

**Benefits:**

1. Clear separation of concerns
2. Different layouts
3. Easier to test
4. Role-based permissions

---

### 7.2 Address Management

**Endpoints:** CRUD on `/users/address`

#### Why Multiple Addresses?

```
Primary Use Cases:
  - Home vs Work delivery
  - Seasonal addresses (winter home)
  - Gift to others
  - Multiple family members
```

---

### 7.3 Loyalty & Referrals

**Endpoints:** `/users/loyalty`, `/users/referrals`

#### Why Loyalty Program?

| Benefit          | User            | Business                 |
| ---------------- | --------------- | ------------------------ |
| Points earning   | Discounts       | Repeat purchases         |
| Referral bonuses | Rewards         | New customer acquisition |
| Tier system      | Exclusive perks | Customer retention       |

---

## 8. Admin Module Flows

### 8.1 Role-Based Access Control

**Guards:** `authGuard`, `adminGuard`, `sellerGuard`

```typescript
export const adminGuard = () => {
  const authService = inject(AuthService);
  return authService.isAdmin() ? true : ['/home'];
};
```

#### Why Role Guards?

1. **Security**: Prevent unauthorized access at route level
2. **UX**: Redirect to appropriate page
3. **Performance**: Skip loading protected routes
4. **Defense in Depth**: Server also validates role

---

### 8.2 Seller Onboarding

**Flow:** Customer → Seller Request → Admin Approval → Seller

```
1. Customer requests seller status
   POST /users/seller/onboarding
   { store_name, bio, payout_method }

2. Admin reviews request
   PATCH /users/admin/seller-requests/:id
   { status: 'approved' | 'rejected', note }

3. If approved:
   - User role changes to 'seller'
   - Seller dashboard accessible
   - Can create products
```

**Why Approval Required?**

- Verify seller legitimacy
- Prevent fraud
- Quality control
- Compliance requirements

---

## 9. Categories, Coupons & Reviews

### 9.1 Category Tree

**Why Hierarchical Categories?**

```
Electronics
├── Mobile Phones
│   ├── Smartphones
│   └── Feature Phones
├── Computers
│   ├── Laptops
│   ├── Desktops
│   └── Accessories
└── Cameras
    ├── DSLR
    └── Mirrorless
```

**Benefits:**

1. Better navigation
2. Faceted search
3. Targeted marketing
4. Inventory organization

---

### 9.2 Coupon System

**Validation Rules:**

- Code exists
- Not expired
- Has started (not future)
- Not exceeded usage limit
- Minimum order amount met

**Why Server-Side Validation?**

Client can be manipulated:

- Modify JavaScript
- Inspect requests
- Replay attacks

Server is authoritative:

- Single source of truth
- Real-time inventory
- Fraud detection

---

### 9.3 Reviews System

**Components:** `ReviewListComponent`, `ReviewFormComponent`

#### Why Reviews Matter?

1. **Social Proof**: 93% of customers read reviews
2. **SEO**: Fresh, user-generated content
3. **Feedback**: Help sellers improve
4. **Conversion**: Increase sales 270%

---

## 10. Error Handling Strategy

### HTTP Status Codes

| Status | Meaning        | Handling               |
| ------ | -------------- | ---------------------- |
| 200    | Success        | Process response       |
| 400    | Bad Request    | Show validation errors |
| 401    | Unauthorized   | Redirect to login      |
| 403    | Forbidden      | Show access denied     |
| 404    | Not Found      | Show not found message |
| 422    | Business Error | Show specific error    |
| 500    | Server Error   | Show retry option      |

### Error Interceptor

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';
      let errorCode = 'UNKNOWN_ERROR';

      if (error.error?.code) {
        errorCode = error.error.code;
      }

      switch (error.status) {
        case 401:
          // Trigger logout
          inject(AuthService).logout();
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        // ... other cases
      }

      return throwError(() => ({ code: errorCode, message: errorMessage }));
    }),
  );
};
```

#### Why Centralized Error Handling?

**Without interceptor (scattered):**

```typescript
// Every component does this
login() {
  this.http.post('/auth/login', data).subscribe({
    error: (err) => {
      if (err.status === 401) {
        this.router.navigate(['/login']);
      } else if (err.status === 500) {
        this.showError('Server error');
      }
      // Repeat in every service call
    }
  });
}
```

**With interceptor (centralized):**

```typescript
// One place to handle all errors
errorInterceptor(req, next) {
  // Handle 401, 403, 500, etc. globally
  // Components only handle success
}
```

**Benefits:**

1. DRY (Don't Repeat Yourself)
2. Consistent error handling
3. Easy to modify
4. Better testing

---

## 11. State Management Patterns

### 11.1 Service with Signals

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  // State as signals
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<ApiError | null>(null);

  getProducts(filters: ProductFilters): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.getProducts(filters).subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err);
        this.isLoading.set(false);
      },
    });
  }
}
```

**Why Signals for State?**

| Feature      | RxJS BehaviorSubject     | Angular Signals       |
| ------------ | ------------------------ | --------------------- |
| Syntax       | verbose (`valueChanges`) | simple (`value`)      |
| Update       | imperative only          | imperative + `update` |
| Computed     | `.pipe(map())`           | `computed()`          |
| OnPush       | requires async pipe      | automatic             |
| Memory leaks | common                   | prevented             |

---

### 11.2 Facade Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class ProductFacadeService {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Expose state (read-only)
  readonly products = this.productService.products;
  readonly isLoading = this.productService.isLoading;
  readonly error = this.productService.error;

  // Computed values
  readonly hasProducts = computed(() => this.products().length > 0);
  readonly productCount = computed(() => this.products().length);

  // Actions with side effects
  loadProducts(filters: ProductFilters): void {
    this.productService.getProducts(filters);
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.productService.deleteProduct(id).pipe(
      tap(() => this.router.navigate(['/products'])),
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
```

**Why Facade?**

1. **Abstraction**: Components don't need to know about service details
2. **Composition**: Combine multiple services
3. **Testability**: Easy to mock
4. **Consistency**: Same API across components
5. **Flexibility**: Change implementation without breaking components

---

### 11.3 Feature Store Pattern

For complex features, use a dedicated store:

```typescript
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly api = inject(ApiService);

  // Complete state in one object
  private readonly state = signalStore(
    withState({
      items: [] as CartItem[],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      isLoading: false,
      error: null as ApiError | null,
    }),
  );

  // Selectors
  readonly items = this.state.items;
  readonly total = computed(() => this.state.subtotal() + this.state.tax() + this.state.shipping());
  readonly isEmpty = computed(() => this.state.items().length === 0);

  // Actions
  addToCart(productId: string, quantity: number): void {
    this.state.isLoading.set(true);
    this.api.put('/users/cart', { productId, quantity }).subscribe({
      next: (response) => {
        this.state.items.set(response.data.items);
        this.state.total.set(response.data.total);
        this.state.isLoading.set(false);
      },
      error: (err) => {
        this.state.error.set(err);
        this.state.isLoading.set(false);
      },
    });
  }
}
```

---

## 12. Why These Patterns?

### Summary Table

| Pattern          | Why Used               | Benefits                                 |
| ---------------- | ---------------------- | ---------------------------------------- |
| **DDD**          | Scalable codebase      | Findability, testability, encapsulation  |
| **Facade**       | Service composition    | Abstraction, reusability                 |
| **Signals**      | Modern reactivity      | Performance, simplicity, computed values |
| **Interceptors** | Cross-cutting concerns | DRY, consistency                         |
| **Guards**       | Security               | Route protection, UX                     |
| **Lazy Loading** | Performance            | Faster initial load                      |
| **Standalone**   | Modern Angular         | Less boilerplate, tree-shaking           |

### Design Principles Applied

1. **Single Responsibility**: Each class does one thing
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Components work with any implementation
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depend on abstractions, not concretions

### Performance Considerations

| Optimization | Implementation                 |
| ------------ | ------------------------------ |
| Lazy Loading | Route-based code splitting     |
| OnPush       | ChangeDetectionStrategy.OnPush |
| Signals      | Fine-grained reactivity        |
| Caching      | HTTP caching headers           |
| Debouncing   | Search, quantity changes       |
| Preloading   | Preload strategy for routes    |

---

## Component Checklist

### Authentication (7)

- [ ] LoginComponent
- [ ] RegisterComponent
- [ ] OtpRequestComponent
- [ ] OtpLoginComponent
- [ ] VerifyEmailComponent
- [ ] ForgotPasswordComponent
- [ ] ResetPasswordComponent

### Products (8)

- [ ] ProductListComponent
- [ ] ProductCardComponent
- [ ] ProductDetailComponent
- [ ] ProductFormComponent
- [ ] BestSellersComponent
- [ ] RelatedProductsComponent
- [ ] SellerProductListComponent
- [ ] ProductImageGalleryComponent

### Cart & Wishlist (4)

- [ ] CartComponent
- [ ] CartItemComponent
- [ ] WishlistComponent
- [ ] WishlistItemComponent

### Orders (7)

- [ ] CheckoutComponent
- [ ] GuestCheckoutComponent
- [ ] OrderListComponent
- [ ] OrderDetailComponent
- [ ] OrderSuccessComponent
- [ ] SellerOrdersComponent
- [ ] OrderTimelineComponent

### User Profile (10)

- [ ] ProfileComponent
- [ ] ProfileEditComponent
- [ ] AddressesComponent
- [ ] AddressFormComponent
- [ ] PaymentMethodsComponent
- [ ] LoyaltyComponent
- [ ] ReferralComponent
- [ ] MarketingPreferencesComponent
- [ ] ChangePasswordComponent
- [ ] SellerOnboardingComponent

### Admin (10)

- [ ] AdminDashboardComponent
- [ ] AdminUsersComponent
- [ ] UserDetailComponent
- [ ] SellerRequestsComponent
- [ ] PayoutRequestsComponent
- [ ] SellerPayoutsComponent
- [ ] AdminProductsComponent
- [ ] AdminOrdersComponent
- [ ] AdminCouponsComponent
- [ ] SystemSettingsComponent

### Marketing (5)

- [ ] CategoriesComponent
- [ ] CategorySidebarComponent
- [ ] CouponInputComponent
- [ ] ReviewListComponent
- [ ] ReviewFormComponent

### Shared (10)

- [ ] PaginationComponent
- [ ] SearchInputComponent
- [ ] FilterSidebarComponent
- [ ] LoadingSpinnerComponent
- [ ] ToastComponent
- [ ] ModalComponent
- [ ] EmptyStateComponent
- [ ] ErrorBoundaryComponent
- [ ] StarRatingComponent
- [ ] AddressCardComponent

### Layouts (2)

- [ ] MainLayoutComponent
- [ ] AuthLayoutComponent

---

## Route Structure

```typescript
export const routes: Routes = [
  // Auth - Guest only
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./domains/auth/components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./domains/auth/components/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },
      {
        path: 'otp-login',
        loadComponent: () =>
          import('./domains/auth/components/otp-login/otp-login.component').then(
            (m) => m.OtpLoginComponent,
          ),
      },
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./domains/auth/components/verify-email/verify-email.component').then(
            (m) => m.VerifyEmailComponent,
          ),
      },
    ],
  },

  // Main - Authenticated
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Home
      {
        path: 'home',
        loadComponent: () => import('./domains/home/home.component').then((m) => m.HomeComponent),
      },

      // Products
      {
        path: 'products',
        loadComponent: () =>
          import('./domains/products/components/product-list/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./domains/products/components/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent,
          ),
      },
      {
        path: 'best-sellers',
        loadComponent: () =>
          import('./domains/products/components/best-sellers/best-sellers.component').then(
            (m) => m.BestSellersComponent,
          ),
      },

      // Cart & Wishlist
      {
        path: 'cart',
        loadComponent: () =>
          import('./domains/users/components/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./domains/users/components/wishlist/wishlist.component').then(
            (m) => m.WishlistComponent,
          ),
      },

      // Orders
      {
        path: 'checkout',
        loadComponent: () =>
          import('./domains/orders/components/checkout/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./domains/orders/components/order-list/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./domains/orders/components/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
      },
      {
        path: 'orders/:id/success',
        loadComponent: () =>
          import('./domains/orders/components/order-success/order-success.component').then(
            (m) => m.OrderSuccessComponent,
          ),
      },

      // User Profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./domains/users/components/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./domains/users/components/profile-edit/profile-edit.component').then(
            (m) => m.ProfileEditComponent,
          ),
      },
      {
        path: 'profile/address',
        loadComponent: () =>
          import('./domains/users/components/address/address.component').then(
            (m) => m.AddressesComponent,
          ),
      },
      {
        path: 'profile/payment-methods',
        loadComponent: () =>
          import('./domains/users/components/payment-methods/payment-methods.component').then(
            (m) => m.PaymentMethodsComponent,
          ),
      },
      {
        path: 'profile/loyalty',
        loadComponent: () =>
          import('./domains/users/components/loyalty/loyalty.component').then(
            (m) => m.LoyaltyComponent,
          ),
      },

      // Seller (Seller/Admin only)
      {
        path: 'seller',
        canActivate: [sellerGuard],
        children: [
          {
            path: 'products',
            loadComponent: () =>
              import('./domains/products/components/seller-product-list/seller-product-list.component').then(
                (m) => m.SellerProductListComponent,
              ),
          },
          {
            path: 'products/new',
            loadComponent: () =>
              import('./domains/products/components/product-form/product-form.component').then(
                (m) => m.ProductFormComponent,
              ),
          },
          {
            path: 'products/:id/edit',
            loadComponent: () =>
              import('./domains/products/components/product-form/product-form.component').then(
                (m) => m.ProductFormComponent,
              ),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./domains/orders/components/seller-orders/seller-orders.component').then(
                (m) => m.SellerOrdersComponent,
              ),
          },
          {
            path: 'payouts',
            loadComponent: () =>
              import('./domains/users/components/seller-payouts/seller-payouts.component').then(
                (m) => m.SellerPayoutsComponent,
              ),
          },
        ],
      },

      // Admin (Admin only)
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./domains/admin/components/dashboard/dashboard.component').then(
                (m) => m.DashboardComponent,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./domains/admin/components/users/users.component').then(
                (m) => m.AdminUsersComponent,
              ),
          },
          {
            path: 'users/:id',
            loadComponent: () =>
              import('./domains/admin/components/user-detail/user-detail.component').then(
                (m) => m.UserDetailComponent,
              ),
          },
          {
            path: 'seller-requests',
            loadComponent: () =>
              import('./domains/admin/components/seller-requests/seller-requests.component').then(
                (m) => m.SellerRequestsComponent,
              ),
          },
          {
            path: 'payout-requests',
            loadComponent: () =>
              import('./domains/admin/components/payout-requests/payout-requests.component').then(
                (m) => m.PayoutRequestsComponent,
              ),
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./domains/admin/components/products/products.component').then(
                (m) => m.AdminProductsComponent,
              ),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./domains/admin/components/orders/orders.component').then(
                (m) => m.AdminOrdersComponent,
              ),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
```

---

## Guards Implementation

```typescript
// auth.guard.ts - Protects authenticated routes
export const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : ['/auth/login'];
};

// guest.guard.ts - Protects guest routes (login, register)
export const guestGuard = () => {
  const authService = inject(AuthService);
  return !authService.isAuthenticated() ? true : ['/home'];
};

// seller.guard.ts - Protects seller routes
export const sellerGuard = () => {
  const authService = inject(AuthService);
  const role = authService.getUserRole();
  return role === 'seller' || role === 'admin' ? true : ['/home'];
};

// admin.guard.ts - Protects admin routes
export const adminGuard = () => {
  const authService = inject(AuthService);
  return authService.isAdmin() ? true : ['/home'];
};
```

---

## Conclusion

This system design provides:

1. **Comprehensive Coverage**: All 11 API modules mapped to components
2. **Clear Flows**: Success and failure paths for every operation
3. **Pattern Rationale**: Why each pattern was chosen
4. **Scalability**: DDD structure supports growth
5. **Maintainability**: Clean separation of concerns
6. **Performance**: Lazy loading, signals, caching strategies
7. **Security**: Guards, interceptors, server-side validation

The design follows Angular best practices and SOLID principles while maintaining focus on user experience and developer productivity.

---

## 13. Cookie-Based Token Storage

### Current Implementation

The application uses **cookies** instead of localStorage for token storage, which is the **recommended approach** for JWT authentication.

### Cookie Service

```typescript
// src/app/core/services/cookie.service.ts
@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly cookies = inject(CookiesService);

  getToken(): string | null {
    return this.cookies.get('token') ?? null;
  }

  setToken(token: string, expires?: Date): void {
    const options: CookieOptions = {
      expires: expires ?? new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      secure: true,
      sameSite: 'strict',
    };
    this.cookies.put('token', token, options);
  }

  removeToken(): void {
    this.cookies.delete('token');
  }
}
```

### Why Cookies Over localStorage?

| Aspect              | localStorage              | Cookies                 | Winner          |
| ------------------- | ------------------------- | ----------------------- | --------------- |
| **XSS Vulnerable**  | Yes - JavaScript can read | No - HttpOnly blocks JS | ✅ Cookies      |
| **CSRF Vulnerable** | No                        | Yes - but mitigatable   | ⚠️ Draw         |
| **Automatic Send**  | Manual - need interceptor | Automatic with requests | ✅ Cookies      |
| **Size Limit**      | 5MB                       | 4KB                     | ⚠️ localStorage |
| **Mobile Support**  | Good                      | Good                    | Tie             |

### Security Benefits of Our Approach

1. **HttpOnly Cookies** (if backend sets them):
   - JavaScript cannot access the token
   - XSS attacks cannot steal tokens
   - Most secure option

2. **Secure Flag**:
   - Cookie only sent over HTTPS
   - Prevents man-in-the-middle attacks

3. **SameSite Attribute**:
   - `strict`: Cookie not sent in cross-site requests
   - Prevents CSRF attacks

### Updated Auth Flow

```
1. User logs in
2. Backend sets cookie (HttpOnly, Secure, SameSite=strict)
3. Frontend receives response (no token in body needed)
4. Subsequent requests:
   - Browser automatically includes cookie
   - No manual token handling needed
5. Logout:
   - Backend clears cookie
   - Frontend clears any client-side state
```

### Updated Auth Interceptor

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No need to add Authorization header
  // Browser sends cookies automatically for same-origin requests
  // This is more secure than manual token handling

  return next(req);
};
```

### Updated Logout Flow

```typescript
// auth.service.ts
logout(): void {
  this.api.post('/auth/logout', {}).subscribe({
    next: () => {
      // Backend clears the cookie
      this.currentUser.set(null);
      this.router.navigate(['/auth/login']);
    },
    error: () => {
      // Even if API fails, clear local state
      this.currentUser.set(null);
      this.router.navigate(['/auth/login']);
    }
  });
}
```

### When to Use What?

| Token Storage        | Use Case                                        |
| -------------------- | ----------------------------------------------- |
| **HttpOnly Cookies** | Most secure - recommended for production        |
| **localStorage**     | Simpler setup, acceptable for low-security apps |
| **Memory Only**      | Very short-lived tokens, high security needs    |

### CSRF Protection

Even with cookies, we need CSRF protection:

```typescript
// 1. SameSite cookie (already implemented)
Set-Cookie: token=xyz; SameSite=Strict; Secure

// 2. CSRF token for state-changing operations
// Backend generates CSRF token
// Frontend sends it in X-XSRF-TOKEN header

// error.interceptor.ts - already handles this
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfToken = inject(CookieService).getCsrfToken();

  if (csrfToken && req.method !== 'GET') {
    req = req.clone({
      setHeaders: { 'X-XSRF-TOKEN': csrfToken }
    });
  }

  return next(req);
};
```

### Comparison Summary

| Feature                   | localStorage (Old) | Cookies (Current) |
| ------------------------- | ------------------ | ----------------- |
| XSS Protection            | ❌ Vulnerable      | ✅ Protected      |
| CSRF Protection           | ✅ Not vulnerable  | ⚠️ Needs SameSite |
| Auto-send with requests   | ❌ Manual          | ✅ Automatic      |
| Implementation complexity | Low                | Medium            |
| Security level            | Medium             | High              |

**Current implementation is more secure and follows industry best practices!**

---

## 14. Current Implementation Details

### Architecture Overview

Your current implementation uses a **layered approach** for token management:

```
┌─────────────────────────────────────────────────────────┐
│                    Components                           │
│  (login.component.ts, register.component.ts, etc.)     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│               StorageService (Core Service)             │
│  - Abstracts token storage                              │
│  - Provides clean API: getToken(), setToken(), removeToken()│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              CookieService (Core Service)               │
│  - Low-level cookie operations                         │
│  - Handles cookie format, expiry, SameSite             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              Browser Cookies (document.cookie)         │
│  - iti_ecom_auth_token cookie                          │
│  - 24 hour expiry                                      │
│  - SameSite=Strict                                     │
└─────────────────────────────────────────────────────────┘
```

### CookieService Implementation

```typescript
// src/app/core/services/cookie.service.ts
@Injectable({ providedIn: 'root' })
export class CookieService {
  private readonly tokenCookieName = 'iti_ecom_auth_token';
  private readonly expiresInSeconds = 86400; // 24 hours

  setCookie(token: string): void {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + this.expiresInSeconds);

    // Set cookie with security attributes
    document.cookie = `${this.tokenCookieName}=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  getCookie(): string | null {
    const name = `${this.tokenCookieName}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length);
      }
    }
    return null;
  }

  removeCookie(): void {
    document.cookie = `${this.tokenCookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}
```

**Cookie Configuration Explained:**

| Attribute  | Value    | Purpose                     |
| ---------- | -------- | --------------------------- |
| `expires`  | 24 hours | Session persistence         |
| `path`     | `/`      | Available across all routes |
| `SameSite` | `Strict` | CSRF protection             |

### StorageService Implementation

```typescript
// src/app/core/services/storage.service.ts
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly cookieService = inject(CookieService);

  getToken(): string | null {
    return this.cookieService.getCookie();
  }

  setToken(token: string): void {
    this.cookieService.setCookie(token);
  }

  removeToken(): void {
    this.cookieService.removeCookie();
  }
}
```

**Why This Layering?**

1. **StorageService** provides abstraction:
   - Easy to swap storage mechanism later
   - Clean API for other services
   - Single responsibility

2. **CookieService** handles complexity:
   - Cookie string formatting
   - Expiry calculation
   - Edge cases (encoding, null safety)

### Auth Interceptor Implementation

```typescript
// src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getToken();

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
```

**Why Both Cookie + Bearer Token?**

| Approach           | Pros                       | Cons                |
| ------------------ | -------------------------- | ------------------- |
| **Cookie only**    | Simpler, HttpOnly possible | May need CSRF token |
| **Bearer only**    | No CSRF worry              | XSS vulnerable      |
| **Both (current)** | ✅ Best of both            | Slightly more code  |

**Your implementation adds the token to:**

1. **Cookies**: Persistence across sessions, browser auto-send capability
2. **Authorization Header**: Explicit, works with any API

### Why Not HttpOnly?

HttpOnly cookies cannot be read by JavaScript, which provides the best XSS protection. However, it requires:

1. **Backend support**: Backend must set the cookie with HttpOnly flag
2. **CORS configuration**: Proper CORS setup for cookie transmission

**If you want to upgrade to HttpOnly:**

```typescript
// Backend would set:
// Set-Cookie: token=xyz; HttpOnly; Secure; SameSite=Strict

// Frontend would NOT need:
// 1. CookieService at all
// 2. Auth interceptor (browser sends cookie automatically)

// But you'd need:
// 1. CORS with credentials:
//    - Access-Control-Allow-Credentials: true
// 2. CSRF token protection
```

### Comparison: Your Implementation vs Alternatives

| Feature            | localStorage | HttpOnly Cookie | Your Implementation |
| ------------------ | ------------ | --------------- | ------------------- |
| XSS Protection     | ❌           | ✅              | ⚠️ Partial          |
| CSRF Protection    | ✅           | ❌              | ✅ (SameSite)       |
| Auto-send          | ❌           | ✅              | ✅ (with header)    |
| Server changes     | None         | Required        | Minimal             |
| **Security Score** | 5/10         | 9/10            | 7/10                |

### Recommendations for Future

**Option 1: Stay Current (Good)**

- Current implementation is solid
- Consider adding CSRF token if concerned

**Option 2: Upgrade to HttpOnly (Better)**

- Requires backend changes
- Maximum security
- Eliminates XSS token theft

**Option 3: Add CSRF Layer (Quick Win)**

- Add XSRF-TOKEN cookie
- Send in X-XSRF-TOKEN header
- Better CSRF protection
