# Types and DTOs Separation Guide

**Project:** ITI Angular E-Commerce Frontend  
**Last Updated:** February 2026

---

## Overview

This project follows the Single Responsibility Principle by separating **Types** from **DTOs (Data Transfer Objects)**:

- **Types**: Define entity shapes and domain types (e.g., `User`, `UserRole`)
- **DTOs**: Define data transfer contracts for API requests/responses

---

## Directory Structure

```
src/app/domains/auth/
├── types/                      # Type definitions (entities)
│   ├── user.type.ts           # User entity type
│   └── index.ts               # Barrel export
│
├── dto/                        # Data Transfer Objects
│   ├── login-request.dto.ts   # Login request DTO
│   ├── register-request.dto.ts # Register request DTO
│   ├── auth-response.dto.ts   # Auth response DTO
│   ├── email-otp-request.dto.ts
│   ├── email-otp-login-request.dto.ts
│   ├── verify-email-request.dto.ts
│   ├── register-response.dto.ts
│   ├── success-response.dto.ts
│   └── index.ts               # Barrel export
│
├── components/                 # UI components
├── services/                   # Domain services
└── routes.ts                   # Domain routes
```

---

## Naming Conventions

### Types
- File: `*.type.ts` (e.g., `user.type.ts`)
- Interface: PascalCase (e.g., `User`, `UserRole`)

### DTOs
- File: `*.dto.ts` (e.g., `login-request.dto.ts`)
- Interface: PascalCase + Dto suffix (e.g., `LoginRequestDto`, `AuthResponseDto`)

---

## Usage Examples

### Importing Types

```typescript
import { User, UserRole } from '@domains/auth/types';

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer'
};
```

### Importing DTOs

```typescript
import { LoginRequestDto, AuthResponseDto } from '@domains/auth/dto';

const loginRequest: LoginRequestDto = {
  email: 'john@example.com',
  password: 'secret123'
};
```

### Using in Services

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { User } from '@domains/auth/types';
import { LoginRequestDto, AuthResponseDto } from '@domains/auth/dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  login(credentials: LoginRequestDto): Observable<AuthResponseDto> {
    return this.api.post<AuthResponseDto>('/auth/login', credentials);
  }
}
```

---

## TypeScript Path Aliases

The project uses path aliases for cleaner imports:

| Alias | Maps To |
|-------|---------|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/app/core/*` |
| `@domains/*` | `src/app/domains/*` |
| `@shared/*` | `src/app/shared/*` |
| `@layouts/*` | `src/app/layouts/*` |
| `@env/*` | `src/environments/*` |

### Configuration

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@app/*": ["app/*"],
      "@domains/*": ["app/domains/*"],
      "@core/*": ["app/core/*"]
    }
  }
}
```

---

## Benefits

### Single Responsibility
- **Types**: Only define entity shapes
- **DTOs**: Only handle data transfer contracts

### Clear Separation
- Easy to find what you need
- Types in `types/`, DTOs in `dto/`

### Better Maintainability
- Changes to entities don't affect DTOs
- Changes to API contracts don't affect types

### Type Safety
- Full TypeScript type checking
- IntelliSense support

### Reusability
- Types can be used across multiple DTOs
- DTOs can compose multiple types

---

## Migration Guide

### Before (Combined)

```typescript
// auth.service.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
```

### After (Separated)

```typescript
// types/user.type.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// dto/login-request.dto.ts
export interface LoginRequestDto {
  email: string;
  password: string;
}

// dto/auth-response.dto.ts
import { User } from '../types/user.type';

export interface AuthResponseDto {
  token: string;
  user: User;
}
```

---

## Best Practices

1. **Always use path aliases** for imports
   ```typescript
   // ✅ Good
   import { User } from '@domains/auth/types';
   
   // ❌ Bad
   import { User } from '../../../domains/auth/types';
   ```

2. **Keep types pure** - no business logic
   ```typescript
   // ✅ Good - Just type definition
   export interface User {
     id: string;
     name: string;
   }
   ```

3. **Use DTO suffix** for clarity
   ```typescript
   // ✅ Good
   export interface LoginRequestDto { }
   
   // ❌ Bad
   export interface LoginRequest { }
   ```

4. **Export from barrel files** for easy imports
   ```typescript
   // types/index.ts
   export * from './user.type';
   
   // dto/index.ts
   export * from './login-request.dto';
   export * from './register-request.dto';
   ```

5. **One interface per file** for better organization
   ```typescript
   // ✅ Good - One interface per file
   // login-request.dto.ts
   export interface LoginRequestDto { }
   
   // register-request.dto.ts
   export interface RegisterRequestDto { }
   ```

---

## Available DTOs

### Authentication Domain

| DTO | Purpose |
|-----|---------|
| `LoginRequestDto` | Login with email/password |
| `RegisterRequestDto` | Register new user |
| `AuthResponseDto` | Authentication response |
| `EmailOtpRequestDto` | Request OTP email |
| `EmailOtpLoginRequestDto` | Login with OTP |
| `VerifyEmailRequestDto` | Verify email token |
| `RegisterResponseDto` | Registration response |
| `SuccessResponseDto` | Generic success response |

---

## Resources

- [TypeScript Path Aliases](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Data Transfer Object Pattern](https://en.wikipedia.org/wiki/Data_transfer_object)
