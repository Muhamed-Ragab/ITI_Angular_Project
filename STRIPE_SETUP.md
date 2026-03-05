# Stripe Payment Setup - Quick Start

## 1. Install Dependencies

```bash
npm install @stripe/stripe-js
```

✅ Already done!

## 2. Get Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Sign up or log in
3. Go to Developers → API keys
4. Copy your **Publishable key** (pk_test_...)

## 3. Configure Environment

Create/update `.env` file:

```bash
NG_APP_API_URL=https://iti-ecommerce-backend.up.railway.app/api/v1
NG_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

## 4. Test Payment

Use test card: `4242 4242 4242 4242`
- Expiry: `12/34`
- CVC: `123`
- ZIP: `12345`

## 5. Flow

1. Add items to cart
2. Go to checkout
3. Place order → Redirects to Stripe payment page
4. Enter card details
5. Click "Pay Now"
6. Success! Order status becomes "paid"

## Files Created

- `src/app/domains/payment/components/stripe-payment/` - Payment form
- `src/app/domains/payment/components/payment-success/` - Success page
- `src/app/domains/payment/components/payment-failure/` - Failure page
- `src/app/domains/payment/routes.ts` - Payment routes

See `STRIPE_PAYMENT_IMPLEMENTATION.md` for full details.
