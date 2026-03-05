# Payment Flow Guide - Making Orders "Paid"

## Current Flow

After checkout, the order is created with status `"pending"` and then the payment is processed. The order becomes `"paid"` depending on the payment method used.

## Payment Methods & Status Flow

### 1. Stripe (Default - `paymentMethodValue: 'stripe'`)

**Flow:**
1. Order created with status `"pending"`
2. Frontend calls `POST /payments/checkout` with `{ orderId, method: "stripe" }`
3. Backend creates Stripe Payment Intent and returns `clientSecret`
4. Frontend should redirect to Stripe payment page (NOT IMPLEMENTED YET)
5. User completes payment on Stripe
6. Stripe sends webhook to `POST /payments/webhook`
7. Backend updates order status to `"paid"`

**Current Issue:** The frontend receives the `clientSecret` but doesn't redirect to Stripe payment page.

**Solution Options:**

#### Option A: Use Wallet Payment (Immediate "Paid" Status)
Change the payment method to `"wallet"`:

```typescript
// checkout.component.ts line 503
paymentMethodValue: PaymentMethod = 'wallet';  // Changed from 'stripe'
```

**Requirements:**
- User must have sufficient wallet balance
- Order becomes "paid" immediately
- No external payment gateway needed

#### Option B: Implement Stripe Payment UI
Add Stripe Elements to handle the payment:

1. Install Stripe.js:
```bash
npm install @stripe/stripe-js
```

2. Create a Stripe payment component
3. Use the `clientSecret` to complete payment
4. Wait for webhook to confirm

#### Option C: Simulate Stripe Webhook (Development Only)
Manually trigger the webhook to mark order as paid:

```bash
# Get the payment intent ID from the response
# Then call the webhook endpoint (requires Stripe signature - complex)
```

### 2. Wallet Payment (Immediate)

**Flow:**
1. Order created with status `"pending"`
2. Frontend calls `POST /payments/checkout` with `{ orderId, method: "wallet" }`
3. Backend checks wallet balance
4. If sufficient, deducts amount and marks order as `"paid"` immediately
5. Frontend redirects to success page

**To Use:**
```typescript
// checkout.component.ts
paymentMethodValue: PaymentMethod = 'wallet';
```

**Backend Logic:**
```javascript
// payments.service.js
if (normalizedMethod === "wallet") {
  const user = await usersRepo.findById(userId);
  const walletBalance = Number(user?.wallet_balance ?? 0);
  
  if (walletBalance < Number(order.total_amount)) {
    throw ApiError.badRequest({
      code: "PAYMENT.INSUFFICIENT_WALLET_BALANCE",
      message: "Insufficient wallet balance"
    });
  }

  // Deduct from wallet
  const nextBalance = walletBalance - Number(order.total_amount);
  await usersRepo.updateById(userId, { wallet_balance: nextBalance });

  // Mark order as paid
  await paymentsRepo.updateOrderPaymentStatus(orderId, {
    status: "paid",
    payment_info: {
      method: "wallet",
      status: "succeeded"
    }
  });

  return {
    method: "wallet",
    status: "paid",  // ✅ Immediately paid!
    message: "Order paid successfully using wallet"
  };
}
```

### 3. Cash on Delivery (COD)

**Flow:**
1. Order created with status `"pending"`
2. Frontend calls `POST /payments/checkout` with `{ orderId, method: "cod" }`
3. Backend updates payment method to `"cod"` but keeps status `"pending"`
4. Order stays `"pending"` until admin/seller marks it as `"paid"` after delivery

**To Use:**
```typescript
paymentMethodValue: PaymentMethod = 'cod';
```

### 4. PayPal

**Flow:**
1. Order created with status `"pending"`
2. Frontend calls `POST /payments/checkout` with `{ orderId, method: "paypal" }`
3. Backend updates payment method to `"paypal"` but keeps status `"pending"`
4. Would need PayPal integration to complete (NOT IMPLEMENTED)

## Quick Fix: Use Wallet Payment

The easiest way to get orders to "paid" status immediately is to use wallet payment:

### Step 1: Add Wallet Balance to User

You can add wallet balance via the backend or admin panel. For testing, you can manually update the user's wallet:

```javascript
// In MongoDB or via API
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { wallet_balance: 10000 } }  // $100.00
)
```

Or create an admin endpoint to add wallet balance.

### Step 2: Change Payment Method to Wallet

```typescript
// src/app/domains/orders/components/checkout/checkout.component.ts
// Line 503
paymentMethodValue: PaymentMethod = 'wallet';  // Changed from 'stripe'
```

### Step 3: Test the Flow

1. Add items to cart
2. Go to checkout
3. Place order
4. Payment will be processed immediately
5. Order status will be `"paid"`
6. Wallet balance will be deducted

## Frontend Payment Facade Response Handling

The `PaymentFacadeService` checks the response:

```typescript
// payment-facade.service.ts
processPayment(request: CheckoutPaymentRequest): Observable<any> {
  return this.paymentService.processCheckout(request).pipe(
    tap((response) => {
      if (response.success && response.data) {
        if (response.data.clientSecret) {
          // Stripe - needs UI to complete payment
          this.clientSecret.set(response.data.clientSecret);
        } else if (response.data.paymentStatus === 'paid' || response.data.paymentStatus === 'pending') {
          // Wallet/COD - redirect to success
          this.cartService.getCart().subscribe();
          this.router.navigate(['/payment/success', request.orderId]);
        }
      }
    })
  );
}
```

## Backend Payment Response Format

### Stripe Response:
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx"
  }
}
```

### Wallet Response:
```json
{
  "success": true,
  "data": {
    "method": "wallet",
    "status": "paid",
    "message": "Order paid successfully using wallet"
  }
}
```

### COD Response:
```json
{
  "success": true,
  "data": {
    "method": "cod",
    "status": "pending",
    "message": "Cash on delivery selected"
  }
}
```

## Recommended Solution

For immediate testing and development, use **Wallet Payment**:

1. Add wallet balance to test users
2. Change `paymentMethodValue` to `'wallet'`
3. Orders will be marked as "paid" immediately
4. No external payment gateway integration needed

For production, implement proper Stripe integration with Stripe Elements UI.

## Files to Modify

### For Wallet Payment:
- `src/app/domains/orders/components/checkout/checkout.component.ts` - Change `paymentMethodValue` to `'wallet'`

### For Stripe Integration (Future):
- Create `src/app/domains/payment/components/stripe-payment/stripe-payment.component.ts`
- Install `@stripe/stripe-js`
- Handle `clientSecret` from payment response
- Redirect to Stripe payment page
- Handle payment confirmation

## Testing Wallet Payment

1. **Add wallet balance** (via MongoDB or admin API):
```javascript
// Example: Add $100 to user wallet
db.users.updateOne(
  { _id: ObjectId("USER_ID") },
  { $set: { wallet_balance: 10000 } }  // Amount in cents
)
```

2. **Change payment method**:
```typescript
paymentMethodValue: PaymentMethod = 'wallet';
```

3. **Place order**:
- Cart total: $50
- Wallet balance: $100
- After payment: Wallet balance = $50, Order status = "paid"

4. **Verify**:
```bash
GET /orders/:orderId
# Response should show status: "paid"
```
