# Type Issues Fixed

## Issues Found and Fixed

### 1. Missing `stripePublishableKey` in Production Environment

**Error:**
```
Property 'stripePublishableKey' does not exist on type '{ production: boolean; apiUrl: string; }'
```

**Fix:**
Added `stripePublishableKey` to `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: import.meta.env.NG_APP_API_URL,
  stripePublishableKey: import.meta.env.NG_APP_STRIPE_PUBLISHABLE_KEY || '',
};
```

### 2. Missing `status` Property in Payment Response Type

**Error:**
```
Property 'status' does not exist on type CheckoutPaymentResponse.data
```

**Fix:**
Updated `CheckoutPaymentResponse` interface to include optional `status` property:

```typescript
export interface CheckoutPaymentResponse {
  success: boolean;
  message?: string;
  data: {
    orderId?: string;
    paymentStatus?: 'paid' | 'pending' | 'failed';
    status?: 'paid' | 'pending' | 'failed';  // Added
    transactionId?: string;
    clientSecret?: string;
    method?: PaymentMethod;
    message?: string;
  };
}
```

## Files Modified

1. `src/environments/environment.prod.ts` - Added Stripe key
2. `src/app/domains/payment/dto/payment.dto.ts` - Updated response type

## Verification

Build completed successfully:
```bash
npm run build
# ✓ Application bundle generation complete
```

## Why These Fixes Were Needed

1. **Environment Type Mismatch**: The dev environment had `stripePublishableKey` but production didn't, causing type inference issues during build

2. **Backend Response Flexibility**: The backend can return either `status` or `paymentStatus` depending on the payment method:
   - Stripe: Returns `clientSecret`
   - Wallet: Returns `status: 'paid'`
   - COD: Returns `status: 'pending'`

Making both properties optional allows the frontend to handle all response formats.
