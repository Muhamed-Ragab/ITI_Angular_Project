# Development Guidelines - ITI Angular E-Commerce (Simplified)

**Project:** ITI Angular E-Commerce Frontend  
**Architecture:** Simplified DDD (Auth Domain Only)  
**Styling:** Bootstrap 5  
**Last Updated:** February 2026

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── interceptors/        # HTTP interceptors (auth, error)
│   │   ├── guards/              # Route guards (auth, guest)
│   │   └── services/            # Core services (Auth, API, Storage)
│   │
│   ├── shared/                  # Shared components, directives, pipes
│   │   ├── components/          # Reusable UI components
│   │   ├── directives/          # Custom directives
│   │   └── pipes/               # Custom pipes
│   │
│   ├── domains/                 # Domain modules
│   │   └── auth/                # Authentication domain (ONLY)
│   │       ├── components/      # Login, Register, OTP, Verify Email
│   │       ├── services/        # Auth facade service
│   │       ├── models/          # Request/Response models
│   │       └── routes.ts        # Auth domain routes
│   │
│   ├── layouts/                 # Layout components
│   │   ├── main-layout/         # Main app layout with navbar/footer
│   │   └── auth-layout/         # Auth pages centered layout
│   │
│   ├── app.config.ts            # App configuration
│   ├── app.routes.ts            # Root routes
│   └── app.ts                   # Root component
│
├── environments/                # Environment configs
└── styles.css                   # Global styles (Bootstrap)
```

---

## Technology Stack

- **Framework:** Angular v21+ (Standalone Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Bootstrap 5 + Bootstrap Icons
- **State Management:** Angular Signals
- **HTTP Client:** Angular HttpClient with Interceptors
- **Forms:** FormsModule + Reactive Forms

---

## Coding Standards

### TypeScript Best Practices

```typescript
// ✅ Use strict type checking
const user: User | null = null;

// ✅ Prefer type inference when obvious
const count = 0; // inferred as number

// ❌ Don't use `any` type
const data: unknown; // Use unknown instead
```

### Angular Best Practices

```typescript
// ✅ Use standalone components (default in Angular v20+)
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, FormsModule]
})

// ✅ Use signals for state management
@Component({
  selector: 'app-example',
  template: `{{ count() }}`
})
export class ExampleComponent {
  readonly count = signal(0);
  readonly doubled = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(c => c + 1);
  }
}

// ✅ Use inject() for dependency injection
export class ExampleComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
}

// ✅ Use OnPush change detection
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Component Structure

```typescript
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthFacadeService } from '../../services/auth-facade.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2>Login</h2>
      <form (ngSubmit)="onLogin()">
        <input [(ngModel)]="email" name="email" />
        <input [(ngModel)]="password" name="password" type="password" />
        <button [disabled]="isLoading()">Login</button>
      </form>
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

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component class | PascalCase + Component | `LoginComponent` |
| Component selector | `app-` + kebab-case | `<app-login>` |
| Component file | `*.component.ts` | `login.component.ts` |
| Service class | PascalCase + Service | `AuthService` |
| Service file | `*.service.ts` | `auth.service.ts` |
| Model interface | PascalCase | `User`, `LoginRequest` |
| Model file | `*.model.ts` | `login-request.model.ts` |
| Guard | PascalCase + Guard | `AuthGuard` |
| Guard file | `*.guard.ts` | `auth.guard.ts` |
| Interceptor | camelCase + Interceptor | `authInterceptor` |
| Interceptor file | `*.interceptor.ts` | `auth.interceptor.ts` |

### CSS Classes (Bootstrap)

```html
<!-- ✅ Use Bootstrap utility classes -->
<button class="btn btn-primary">Click Me</button>
<div class="card shadow-sm">Content</div>
<div class="d-flex justify-content-center">Flex</div>

<!-- ❌ Don't use Tailwind classes -->
<div class="flex items-center"> <!-- BAD -->
```

---

## Core Services

### ApiService

Base HTTP client for all API calls:

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  
  get<T>(endpoint: string, params?: HttpParams): Observable<T>
  post<T>(endpoint: string, body: unknown): Observable<T>
  put<T>(endpoint: string, body: unknown): Observable<T>
  delete<T>(endpoint: string): Observable<void>
}
```

### StorageService

LocalStorage wrapper:

```typescript
@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem<T>(key: string): T | null
  setItem<T>(key: string, value: T): void
  removeItem(key: string): void
  getToken(): string | null
  setToken(token: string): void
  removeToken(): void
}
```

### AuthService

Authentication service with signals:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());
  
  login(credentials: LoginRequest): Observable<AuthResponse>
  register(userData: RegisterRequest): Observable<void>
  logout(): void
  requestEmailOtp(email: string): Observable<void>
  loginWithOtp(email: string, otp: string): Observable<AuthResponse>
  verifyEmail(token: string): Observable<void>
}
```

---

## Auth Domain

### Components

1. **LoginComponent** - Email/password login
2. **RegisterComponent** - User registration
3. **OtpLoginComponent** - Passwordless OTP login
4. **VerifyEmailComponent** - Email verification

### Models

```typescript
// login-request.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

// register-request.model.ts
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// auth-response.model.ts
export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
}
```

### Routes

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

## Routing

### Root Configuration

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
      { path: 'home', loadComponent: () => import('./domains/auth/components/login/login.component').then(m => m.LoginComponent) }
    ]
  },
  { path: '**', redirectTo: 'home' }
];
```

### Route Guards

```typescript
// core/guards/auth.guard.ts
export const authGuard = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated() ? true : ['/auth/login'];
};

// core/guards/guest.guard.ts
export const guestGuard = () => {
  const authService = inject(AuthService);
  return !authService.isAuthenticated() ? true : ['/home'];
};
```

---

## HTTP Interceptors

### Auth Interceptor

Automatically adds JWT token to requests:

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

### Error Interceptor

Global error handling:

```typescript
// core/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';
      
      switch (error.status) {
        case 401: errorMessage = 'Unauthorized'; break;
        case 403: errorMessage = 'Forbidden'; break;
        case 404: errorMessage = 'Not Found'; break;
        case 500: errorMessage = 'Server Error'; break;
      }
      
      return throwError(() => ({ message: errorMessage }));
    })
  );
};
```

---

## State Management

### Signals Pattern

```typescript
@Component({
  selector: 'app-example',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class ExampleComponent {
  readonly count = signal(0);
  readonly doubled = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(c => c + 1);
  }
}
```

### Service with Signals

```typescript
@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly authService = inject(AuthService);
  
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

## Bootstrap Styling

### Common Patterns

#### Cards

```html
<div class="card shadow-sm">
  <div class="card-body">
    <h5 class="card-title">Title</h5>
    <p class="card-text">Content</p>
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

#### Forms

```html
<form>
  <div class="mb-3">
    <label class="form-label">Email</label>
    <input type="email" class="form-control" />
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

#### Alerts

```html
<div class="alert alert-success">Success message</div>
<div class="alert alert-danger">Error message</div>
<div class="alert alert-warning">Warning message</div>
```

#### Buttons

```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline-success">Outline</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
```

---

## Best Practices

### SOLID Principles

- **Single Responsibility**: Each component/service does one thing
- **Open/Closed**: Use DI for extensibility
- **Liskov Substitution**: Guards implement standard interfaces
- **Interface Segregation**: Small, focused services
- **Dependency Inversion**: Depend on abstractions

### DRY Principles

- Use `ApiService` for all HTTP calls
- Use `StorageService` for localStorage
- Global error handling via interceptor
- Reusable layout components
- Shared UI components

---

## Troubleshooting

### Bootstrap styles not loading

Check `src/styles.css`:
```css
@import "bootstrap/dist/css/bootstrap.min.css";
@import "bootstrap-icons/font/bootstrap-icons.css";
```

### Auth not working

1. Check API URL in `environment.ts`
2. Verify backend is running
3. Check browser console for errors
4. Verify token is stored in localStorage

### Route not loading

1. Check route path in `app.routes.ts`
2. Verify component exists and exports correctly
3. Check for lazy loading syntax errors

---

## Resources

- [Angular Documentation](https://angular.dev/)
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/)
- [COMPLETE_API_REFERENCE.md](./COMPLETE_API_REFERENCE.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [QUICK_START.md](./QUICK_START.md)

---

## Definition of Done

Each task is complete when:

- ✅ Code compiles without errors
- ✅ Follows SOLID principles
- ✅ Uses Bootstrap classes (no Tailwind)
- ✅ TypeScript strict mode passes
- ✅ Component tested manually
- ✅ Code follows this guide
