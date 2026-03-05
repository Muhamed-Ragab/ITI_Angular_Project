# Stripe Key Configuration Fix

## Issue

Error: "Please call Stripe() with your publishable key. You used an empty string."

## Root Cause

The Stripe publishable key was not properly configured in the `.env` file:
- Wrong variable name: `STRIPE_SECRET_KEY` instead of `NG_APP_STRIPE_PUBLISHABLE_KEY`
- Had quotes around the key value
- Angular environment variables must start with `NG_APP_`

## Solution

### 1. Fixed `.env` File

**Before (Wrong):**
```bash
STRIPE_SECRET_KEY="pk_test_51T6afs45PS59SM0H..."
```

**After (Correct):**
```bash
NG_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51T6afs45PS59SM0Hb7lEjybpj2c7mCkFAcoXiFgng1kY8vCnN05eXWyFZGHohbcFotsJbh71QFE3eURVUaUOuwRj0098W5UH9M
```

### 2. Restart Development Server

**IMPORTANT:** You must restart the Angular development server for environment variable changes to take effect.

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run start
```

### 3. Verify Configuration

After restarting, check the browser console. You should see:
```
=== Stripe Initialization ===
Stripe Key: pk_test_51T6afs45PS5...
```

If you still see "EMPTY", the environment variable is not being loaded.

## Environment Variable Rules

Angular environment variables must follow these rules:

1. **Must start with `NG_APP_`**
   - ✅ `NG_APP_STRIPE_PUBLISHABLE_KEY`
   - ❌ `STRIPE_PUBLISHABLE_KEY`
   - ❌ `STRIPE_SECRET_KEY`

2. **No quotes needed**
   - ✅ `NG_APP_API_URL=https://example.com`
   - ❌ `NG_APP_API_URL="https://example.com"`

3. **Restart required**
   - Changes to `.env` require server restart
   - Hot reload does NOT pick up environment changes

## Verification Steps

1. **Check `.env` file:**
   ```bash
   cat .env
   # Should show:
   # NG_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Restart server:**
   ```bash
   npm run start
   ```

3. **Test payment flow:**
   - Add items to cart
   - Go to checkout
   - Place order
   - Should redirect to Stripe payment page
   - Check browser console for initialization logs

4. **Expected console output:**
   ```
   === Stripe Initialization ===
   Stripe Key: pk_test_51T6afs45PS5...
   Environment: { production: false, apiUrl: "...", stripePublishableKey: "pk_test_..." }
   ```

## Troubleshooting

### Issue: Still showing empty string after restart

**Solution 1: Clear build cache**
```bash
rm -rf .angular
npm run start
```

**Solution 2: Check environment file is being used**
```bash
# Verify the file exists
ls -la .env

# Check the content
cat .env
```

**Solution 3: Hard-code temporarily for testing**
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: import.meta.env.NG_APP_API_URL,
  stripePublishableKey: 'pk_test_51T6afs45PS59SM0Hb7lEjybpj2c7mCkFAcoXiFgng1kY8vCnN05eXWyFZGHohbcFotsJbh71QFE3eURVUaUOuwRj0098W5UH9M',
};
```

### Issue: "Invalid API key provided"

This means the key is loading but is incorrect. Verify:
1. Key starts with `pk_test_` (test mode) or `pk_live_` (live mode)
2. Key is from your Stripe dashboard
3. No extra spaces or quotes

## Current Configuration

Your `.env` file now has:
```bash
NG_APP_API_URL=https://iti-ecommerce-backend.up.railway.app/api/v1
NG_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51T6afs45PS59SM0Hb7lEjybpj2c7mCkFAcoXiFgng1kY8vCnN05eXWyFZGHohbcFotsJbh71QFE3eURVUaUOuwRj0098W5UH9M
```

## Next Steps

1. Stop the development server (Ctrl+C)
2. Restart: `npm run start`
3. Try the payment flow again
4. Check browser console for Stripe initialization logs
5. Payment form should load successfully

## Test Card

Once Stripe loads, use this test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)
