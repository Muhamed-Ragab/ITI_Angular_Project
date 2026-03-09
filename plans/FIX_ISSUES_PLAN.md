# Fix Plan for Identified Issues

## Overview
This plan outlines the steps to fix the issues identified in the codebase review.

---

## Priority 1: Critical Issues (Must Fix)

### Issue 1: Missing ESLint Dependency
**File**: `package.json`, `eslint.config.js`  
**Problem**: Lint command fails because `typescript-eslint` is not installed

**Fix**:
1. Add `typescript-eslint` to devDependencies:
   ```bash
   npm install --save-dev typescript-eslint
   ```

---

## Priority 2: Production Readiness Issues

### Issue 2: Debug Console Logs in Production Code
**File**: [`src/app/core/services/cart.service.ts`](src/app/core/services/cart.service.ts:52-66)

**Fix**: Remove all `console.log` and `console.error` statements from lines 52-66:
```typescript
// REMOVE THESE LINES:
console.log('=== CartService.removeFromCart ===');
console.log('Product ID to remove:', product_id);
console.log('Product ID type:', typeof product_id);
console.log('DELETE URL:', `/users/cart/${product_id}`);
console.log('Remove successful, response:', response);
console.error('Remove failed, error:', error);
console.error('Error status:', error.status);
console.error('Error message:', error.error?.message || error.message);
```

### Issue 3: Hardcoded Stripe Key
**File**: [`src/environments/environment.ts:4`](src/environments/environment.ts:4)

**Fix**: Remove the hardcoded fallback and rely only on environment variable:
```typescript
// BEFORE:
stripePublishableKey: import.meta.env.NG_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'

// AFTER:
stripePublishableKey: import.meta.env.NG_APP_STRIPE_PUBLISHABLE_KEY || ''
```
Add validation to warn if key is missing.

---

## Priority 3: Code Quality Improvements

### Issue 4: Redundant AuthGuard
**File**: [`src/app/app.routes.ts:71-76`](src/app/app.routes.ts:71)

**Fix**: Remove redundant `canActivate` from profile route (it's already protected by parent):
```typescript
// REMOVE canActivate: [authGuard] from profile route
{
  path: 'profile',
  loadComponent: () => import('./domains/profile/profile-page.component/profile-page.component')
    .then(m => m.ProfilePageComponent),
  // REMOVE: canActivate: [authGuard] 
}
```

### Issue 5: Enable Strict TypeScript
**File**: `tsconfig.json:27`

**Fix**: Change `noImplicitAny` to true:
```json
"noImplicitAny": true
```
Note: This may require adding type annotations throughout the codebase.

---

## Priority 4: Optional Improvements

### Issue 6: Search for Additional Debug Logs
Run a search to find other console.log statements:
```bash
grep -r "console.log" src/app --include="*.ts"
```

---

## Verification Steps

After implementing fixes, verify with:

```bash
# Build the project
npm run build

# Run linter
npm run lint
```

---

## Summary of Changes

| Priority | Issue | Effort | Risk |
|----------|-------|--------|------|
| 1 | Install typescript-eslint | Low | Low |
| 2 | Remove debug logs | Low | Low |
| 3 | Remove hardcoded Stripe key | Low | Low |
| 4 | Remove redundant AuthGuard | Low | Low |
| 5 | Enable strict TypeScript | Medium | Medium |
| 6 | Find other debug logs | Low | Low |

---

## Next Steps

To proceed with fixing these issues, switch to **Code mode** and implement each fix in priority order.
