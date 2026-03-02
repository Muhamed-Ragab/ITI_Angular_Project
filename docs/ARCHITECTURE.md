# Angular E-Commerce Application Architecture (Simplified)

**Project:** ITI Angular E-Commerce Frontend  
**Backend API:** MEAN E-Commerce Backend (See [COMPLETE_API_REFERENCE.md](./COMPLETE_API_REFERENCE.md))  
**Architecture Pattern:** Simplified DDD with Auth Domain Only  
**Last Updated:** February 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Auth Domain](#auth-domain)
4. [Naming Conventions](#naming-conventions)
5. [Service Architecture](#service-architecture)
6. [Component Architecture](#component-architecture)

---

## 1. Architecture Overview

### Simplified Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  (Components, Layouts, Shared Components)                │
├─────────────────────────────────────────────────────────┤
│                   Domain Layer                           │
│  (Auth Domain Only)                                      │
├─────────────────────────────────────────────────────────┤
│                 Infrastructure Layer                     │
│  (HTTP Interceptors, API Client, Guards)                 │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework:** Angular v21+ (Standalone Components)
- **Styling:** Bootstrap 5.x
- **State Management:** Angular Signals
- **HTTP Client:** Angular HttpClient with Interceptors
- **Forms:** Reactive Forms + FormsModule
- **Routing:** Lazy-loaded routes

---

## 2. File Structure

```
src/
├── app/
│   ├── core/                          # Core Module (Singleton Services)
│   │   ├── interceptors/              # HTTP Interceptors
│   │   │   ├── auth.interceptor.ts    # JWT token injection
│   │   │   └── error.interceptor.ts   # Global error handling
│   │   ├── guards/                    # Route Guards
│   │   │   ├── auth.guard.ts          # Authentication check
│   │   │   └── guest.guard.ts         # Redirect authenticated users
│   │   └── services/                  # Core Services
│   │       ├── auth.service.ts        # Authentication service
│   │       ├── api.service.ts         # Base API client
│   │       └── storage.service.ts     # LocalStorage wrapper
│   │
│   ├── shared/                        # Shared Module
│   │   ├── components/                # Reusable UI Components
│   │   │   ├── button/                # Button component
│   │   │   ├── input/                 # Input component
│   │   │   ├── card/                  # Card component
│   │   │   └── alert/                 # Alert component
│   │   ├── directives/                # Custom Directives
│   │   └── pipes/                     # Custom Pipes
│   │
│   ├── domains/                       # Domain Modules
│   │   └── auth/                      # Authentication Domain (ONLY)
│   │       ├── components/
│   │       │   ├── login/
│   │       │   │   ├── login.component.ts
│   │       │   │   └── login.component.html
│   │       │   ├── register/
│   │       │   ├── otp-login/
│   │       │   └── verify-email/
│   │       ├── services/
│   │       │   └── auth-facade.service.ts
│   │       ├── models/
│   │       │   ├── login-request.model.ts
│   │       │   ├── register-request.model.ts
│   │       │   └── auth-response.model.ts
│   │       └── routes.ts
│   │
│   ├── layouts/                       # Layout Components
│   │   ├── main-layout/               # Main app layout
│   │   └── auth-layout/               # Auth pages layout
│   │
│   ├── app.config.ts                  # App configuration
│   ├── app.routes.ts                  # Root routes
│   └── app.ts                         # Root component
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── styles.css                         # Global styles (Bootstrap)
```

---

## 3. Auth Domain

### Authentication Features

The auth domain handles all user authentication flows:

1. **Login** - Email/password authentication
2. **Register** - User registration with email verification
3. **OTP Login** - Passwordless login with email OTP
4. **Email Verification** - Verify email address

### Auth Domain Structure

```
domains/auth/
├── components/
│   ├── login/
│   │   └── login.component.ts
│   ├── register/
│   │   └── register.component.ts
│   ├── otp-login/
│   │   └── otp-login.component.ts
│   └── verify-email/
│       └── verify-email.component.ts
├── services/
│   └── auth-facade.service.ts
├── models/
│   ├── login-request.model.ts
│   ├── register-request.model.ts
│   └── auth-response.model.ts
└── routes.ts
```

### Auth Routes

```typescript
// domains/auth/routes.ts
export const authRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
      { path: 'otp-login', loadComponent: () => import('./components/otp-login/otp-login.component').then(m => m.OtpLoginComponent) },
      { path: 'verify-email', loadComponent: () => import('./components/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) }
    ]
  }
];
```

---

## 4. Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Component | `*.component.ts` | `login.component.ts` |
| Component Template | `*.component.html` | `login.component.html` |
| Component Styles | `*.component.css` | `login.component.css` |
| Service | `*.service.ts` | `auth.service.ts` |
| Model/Interface | `*.model.ts` | `login-request.model.ts` |
| Guard | `*.guard.ts` | `auth.guard.ts` |
| Interceptor | `*.interceptor.ts` | `auth.interceptor.ts` |
| Pipe | `*.pipe.ts` | `currency-format.pipe.ts` |
| Directive | `*.directive.ts` | `autofocus.directive.ts` |
| Routes | `routes.ts` | `domains/auth/routes.ts` |

### Classes & Selectors

| Type | Class Name | Selector | Example |
|------|------------|----------|---------|
| Component | PascalCase | `app-kebab-case` | `LoginComponent` → `<app-login>` |
| Service | PascalCase + Service | N/A | `AuthService` |
| Model | PascalCase | N/A | `LoginRequest` |
| Guard | PascalCase + Guard | N/A | `AuthGuard` |
| Pipe | PascalCase + Pipe | `kebab-case` | `CurrencyFormatPipe` → `{{ price | currencyFormat }}` |
| Directive | PascalCase + Directive | `[appCamelCase]` | `AutofocusDirective` → `[appAutofocus]` |

### Methods & Properties

```typescript
// ✅ DO: Use descriptive names
getUserById(id: string): Observable<User>;
isLoading = signal<boolean>(false);
private readonly authService = inject(AuthService);

// ❌ DON'T: Use vague names
getData(id: string): any;
loading = signal(false);
private auth = inject(AuthService); // Too short
```

### CSS Classes (Bootstrap)

```css
/* Use Bootstrap utility classes */
<button class="btn btn-primary">Submit</button>
<div class="card shadow-sm">...</div>
<div class="d-flex justify-content-center">Flex</div>
```

---

## 5. Service Architecture

### Core Services

#### ApiService

```typescript
// core/services/api.service.ts
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  
  get<T>(endpoint: string, params?: HttpParams): Observable<T>;
  post<T>(endpoint: string, body: unknown): Observable<T>;
  put<T>(endpoint: string, body: unknown): Observable<T>;
  delete<T>(endpoint: string): Observable<void>;
}
```

#### StorageService

```typescript
// core/services/storage.service.ts
@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}
```

#### AuthService

```typescript
// core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  
  login(credentials: LoginRequest): Observable<AuthResponse>;
  register(userData: RegisterRequest): Observable<void>;
  logout(): void;
  requestEmailOtp(email: string): Observable<void>;
  loginWithOtp(email: string, otp: string): Observable<AuthResponse>;
  verifyEmail(token: string): Observable<void>;
  getCurrentUser(): User | null;
}
```

### Interceptors

#### Auth Interceptor

```typescript
// core/interceptors/auth.interceptor.ts
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

#### Error Interceptor

```typescript
// core/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Transform error to user-friendly message
      return throwError(() => transformError(error));
    })
  );
};
```

### Guards

#### Auth Guard

```typescript
// core/guards/auth.guard.ts
export const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : ['/auth/login'];
};
```

#### Guest Guard

```typescript
// core/guards/guest.guard.ts
export const guestGuard = () => {
  const authService = inject(AuthService);
  return !authService.isAuthenticated() ? true : ['/home'];
};
```

---

## 6. Component Architecture

### Component Structure

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="card shadow-sm">
        <div class="card-body">
          <h2>Login</h2>
          <form (ngSubmit)="onLogin()">
            <input [(ngModel)]="email" name="email" />
            <input [(ngModel)]="password" name="password" type="password" />
            <button [disabled]="isLoading()">Login</button>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authFacade = inject(AuthFacadeService);
  
  readonly email = signal('');
  readonly password = signal('');
  readonly isLoading = signal(false);
  
  onLogin(): void {
    this.isLoading.set(true);
    this.authFacade.login$({ email: this.email(), password: this.password() })
      .subscribe(success => this.isLoading.set(false));
  }
}
```

### Layout Components

#### Main Layout

```typescript
// layouts/main-layout/main-layout.component.ts
@Component({
  selector: 'app-main-layout',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <!-- Navbar content -->
    </nav>
    
    <main class="py-4">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </main>
    
    <footer class="bg-dark text-light py-4">
      <!-- Footer content -->
    </footer>
  `
})
export class MainLayoutComponent {}
```

#### Auth Layout

```typescript
// layouts/auth-layout/auth-layout.component.ts
@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
```

---

## 7. State Management

### Signal-Based State

```typescript
@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser = this.authService.currentUser;
  
  login$(credentials: LoginRequest): Observable<boolean> {
    return this.authService.login(credentials).pipe(
      tap(() => this.router.navigate(['/home'])),
      catchError(() => of(false))
    );
  }
}
```

---

## 8. Routing

### Root Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./domains/auth/routes').then(m => m.authRoutes)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./domains/auth/components/login/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
```

---

## 9. Bootstrap Styling

### Common Bootstrap Classes

| Purpose | Bootstrap Classes |
|---------|-------------------|
| Button | `btn btn-primary`, `btn btn-secondary` |
| Card | `card`, `card-body`, `card shadow-sm` |
| Form | `form-control`, `form-label`, `mb-3` |
| Alert | `alert alert-success`, `alert alert-danger` |
| Layout | `container`, `row`, `col-md-6` |
| Flexbox | `d-flex`, `justify-content-center`, `align-items-center` |
| Spacing | `m-3`, `p-4`, `mt-5`, `mb-3` |
| Navbar | `navbar`, `navbar-expand-lg`, `navbar-dark` |

---

## 10. Best Practices

### SOLID Principles

- **SRP**: Each component/service has single responsibility
- **OCP**: Services use DI, easy to extend
- **LSP**: Guards implement standard interfaces
- **ISP**: Small, focused services
- **DIP**: Depend on abstractions

### DRY Principles

- Use `ApiService` for all HTTP calls
- Use `StorageService` for localStorage
- Global error handling via interceptor
- Reusable layout components

---

## References

- [Angular Documentation](https://angular.dev/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [COMPLETE_API_REFERENCE.md](./COMPLETE_API_REFERENCE.md)
- [AGENTS.md](./AGENTS.md)
- [QUICK_START.md](./QUICK_START.md)
