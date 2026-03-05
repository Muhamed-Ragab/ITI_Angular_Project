# Stripe Payment Implementation Guide

## Overview

The Stripe payment flow has been fully implemented. Orders are created with status "pending", then users are redirected to a secure Stripe payment page to complete payment. Once payment is successful, the Stripe webhook updates the order status to "paid".

## Flow Diagram

```
1. User clicks "Place Order"
   ↓
2. Order created (status: "pending")
   ↓
3. POST /payments/checkout { orderId, method: "stripe" }
   ↓
4. Backend creates Stripe Payment Intent
   ↓
5. Backend returns { clientSecret, paymentIntentId }
   ↓
6. Frontend redirects to /payment/stripe?clientSecret=xxx&orderId=xxx
   ↓
7. User enters card details on Stripe payment form
   ↓
8. User clicks "Pay Now"
   ↓
9. Stripe processes payment
   ↓
10. If successful: Redirect to /payment/success/:orderId
    If failed: Show error message
   ↓
11. Stripe sends webhook to backend
   ↓
12. Backend updates order status to "paid"
   ↓
13. User sees success page with order details
```

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Go to Developers → API keys
4. Copy your **Publishable key** (starts with `pk_test_` for test mode)
5. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 2. Configure Frontend

Add the Stripe publishable key to your `.env` file:

```bash
# ITI_Angular_Project/.env
NG_APP_API_URL=https://iti-ecommerce-backend.up.railway.app/api/v1
NG_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

### 3. Configure Backend

The backend already has Stripe configured. Ensure these environment variables are set in Railway:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 4. Set Up Stripe Webhook (Production)

For production, you need to configure Stripe webhooks:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-backend.railway.app/api/v1/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

### 5. Test with Stripe Test Cards

Use these test card numbers in development:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Payment Declined:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Requires Authentication (3D Secure):**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Files Created/Modified

### New Files

1. **Stripe Payment Component**
   - `src/app/domains/payment/components/stripe-payment/stripe-payment.component.ts`
   - Handles Stripe payment form and payment confirmation

2. **Payment Success Component**
   - `src/app/domains/payment/components/payment-success/payment-success.component.ts`
   - Shows success message after payment

3. **Payment Failure Component**
   - `src/app/domains/payment/components/payment-failure/payment-failure.component.ts`
   - Shows error message if payment fails

4. **Payment Routes**
   - `src/app/domains/payment/routes.ts`
   - Defines routes for payment pages

### Modified Files

1. **Environment Configuration**
   - `src/environments/environment.ts` - Added `stripePublishableKey`
   - `.env.example` - Added `NG_APP_STRIPE_PUBLISHABLE_KEY`

2. **Payment Facade Service**
   - `src/app/domains/payment/services/payment-facade.service.ts`
   - Updated to redirect to Stripe payment page when `clientSecret` is received

3. **Checkout Component**
   - `src/app/domains/orders/components/checkout/checkout.component.ts`
   - Changed default payment method back to `'stripe'`

## Testing the Complete Flow

### 1. Start the Application

```bash
cd ITI_Angular_Project
npm run start
```

### 2. Add Items to Cart

1. Browse products
2. Click "Add to Cart"
3. Go to cart

### 3. Proceed to Checkout

1. Click "Checkout"
2. Select or add shipping address
3. Review order details
4. Click "Place Order"

### 4. Complete Payment

1. You'll be redirected to `/payment/stripe`
2. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
3. Click "Pay Now"
4. Wait for payment processing

### 5. Verify Success

1. You'll be redirected to `/payment/success/:orderId`
2. Check order status via API:
   ```bash
   GET /orders/:orderId
   # Should show status: "paid"
   ```

## Backend Webhook Handling

The backend automatically handles Stripe webhooks:

```javascript
// payments.service.js
export const handleStripeWebhook = async (stripeSignature, rawBody) => {
  const event = stripe.webhooks.constructEvent(
    rawBody,
    stripeSignature,
    webhookSecret
  );

  if (event.type === 'payment_intent.succeeded') {
    const orderId = event.data.object.metadata.orderId;
    
    // Update order status to "paid"
    await paymentsRepo.updateOrderPaymentStatus(orderId, {
      status: "paid",
      payment_info: {
        stripe_payment_intent_id: event.data.object.id,
        status: event.data.object.status,
        method: event.data.object.payment_method_types[0]
      }
    });

    // Send notification email
    await sendOrderStatusNotification({
      orderId,
      status: "paid",
      email: user.email,
      name: user.name
    });
  }
};
```

## Troubleshooting

### Issue: "Failed to load Stripe"

**Solution:** Check that `NG_APP_STRIPE_PUBLISHABLE_KEY` is set in `.env` file

### Issue: "Invalid API key"

**Solution:** Verify the Stripe publishable key is correct and starts with `pk_test_`

### Issue: Payment succeeds but order stays "pending"

**Solution:** 
1. Check that Stripe webhook is configured correctly
2. Verify `STRIPE_WEBHOOK_SECRET` is set in backend
3. Check Railway logs for webhook errors

### Issue: "clientSecret is null"

**Solution:** Check backend logs to ensure Payment Intent is being created successfully

## Payment Method Options

Users can choose from multiple payment methods:

### 1. Stripe (Default)
- Secure card payment
- Supports 3D Secure authentication
- Order becomes "paid" after successful payment

### 2. Wallet
- Immediate payment from user's wallet balance
- Order becomes "paid" immediately
- Requires sufficient wallet balance

### 3. Cash on Delivery (COD)
- No online payment required
- Order stays "pending" until delivery
- Admin marks as "paid" after cash collection

### 4. PayPal (Future)
- Would require PayPal integration
- Currently just marks payment as "pending"

## Security Features

1. **PCI Compliance:** Card details never touch your server (handled by Stripe)
2. **Webhook Verification:** Stripe signature verification prevents fake webhooks
3. **HTTPS Required:** All payment pages require HTTPS in production
4. **3D Secure:** Supported for cards that require authentication

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Configure Stripe webhook with live endpoint
- [ ] Enable HTTPS on frontend and backend
- [ ] Test with real card (small amount)
- [ ] Set up Stripe webhook monitoring
- [ ] Configure email notifications for payment events
- [ ] Add error tracking (Sentry, etc.)
- [ ] Test refund flow (if needed)

## Next Steps

1. **Add Payment Method Selection UI**
   - Let users choose between Stripe, Wallet, COD
   - Show wallet balance if wallet is selected
   - Disable wallet if insufficient balance

2. **Add Saved Cards Feature**
   - Save payment methods for faster checkout
   - Use Stripe Setup Intents
   - Show saved cards in checkout

3. **Add Refund Functionality**
   - Admin can refund orders
   - Partial refunds supported
   - Refund to original payment method

4. **Add Payment History**
   - Show all payments for an order
   - Track refunds and adjustments
   - Export payment reports

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
