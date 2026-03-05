# Order Creation Fix - Product Object Issue

## Problem

When creating an order via `POST /orders`, the backend was returning a 404 error with:

```
"ORDER.PRODUCT_NOT_FOUND"
"productId": "{\n  _id: new ObjectId('69a6f0215a72cce3649aca3e'),\n  seller_id: ..., title: 'The Great Gatsby', ...}"
```

The error message showed that the **entire product object** was being sent as the productId instead of just the ID string.

## Root Cause

The issue was in the `AddToCartRequest` DTO and `CartService.addToCart()` method:

### Before (Incorrect):
```typescript
// cart.dto.ts
export interface AddToCartRequest {
  product: string;  // ❌ Wrong field name
  quantity: number;
}

// cart.service.ts
addToCart(product_id: string, quantity: number = 1): Observable<CartResponse> {
  return this.api.put<CartResponse>('/users/cart', { 
    product: product_id,  // ❌ Wrong field name
    quantity 
  });
}
```

### API Documentation Says:
```json
{
  "productId": "507f1f77bcf86cd799439011",  // ✅ Should be "productId"
  "quantity": 2
}
```

## Why This Caused the Order Creation Error

1. When users added items to cart, the frontend sent `{ product: "...", quantity: 1 }`
2. The backend didn't recognize the `product` field (expected `productId`)
3. The backend likely stored the cart item incorrectly or with the full product object
4. When creating an order via `POST /orders`, the backend reads from the user's cart
5. The backend found the full product object instead of just the product ID
6. Order creation failed with "PRODUCT_NOT_FOUND" because it couldn't parse the product ID

## Solution

Fixed the field name to match the API documentation:

### After (Correct):
```typescript
// cart.dto.ts
export interface AddToCartRequest {
  productId: string;  // ✅ Correct field name
  quantity: number;
}

// cart.service.ts
addToCart(product_id: string, quantity: number = 1): Observable<CartResponse> {
  return this.api.put<CartResponse>('/users/cart', { 
    productId: product_id,  // ✅ Correct field name
    quantity 
  });
}
```

## Testing Steps

To verify the fix:

1. **Clear existing cart data** (important - old cart items have wrong structure):
   - Log out and log back in
   - Or manually clear cart via DELETE requests
   
2. **Add items to cart** with the fixed code:
   ```typescript
   cartService.addToCart('69a6f0215a72cce3649aca3e', 1).subscribe();
   ```

3. **Verify cart structure** via `GET /users/cart`:
   ```json
   {
     "items": [
       {
         "productId": "69a6f0215a72cce3649aca3e",  // ✅ Should be string ID
         "name": "The Great Gatsby",
         "price": 150,
         "quantity": 1,
         "subtotal": 150
       }
     ]
   }
   ```

4. **Create order** via `POST /orders`:
   ```json
   {
     "shippingAddress": "69a6f0205a72cce3649aca24",
     "paymentMethod": "stripe"
   }
   ```

5. **Expected result**: Order should be created successfully without "PRODUCT_NOT_FOUND" error

## Files Changed

- `src/app/domains/cart/dto/cart.dto.ts` - Fixed `AddToCartRequest` interface
- `src/app/core/services/cart.service.ts` - Fixed `addToCart()` method to use `productId` field

## Impact

This fix ensures that:
- Cart items are stored correctly in the backend with product IDs (not full objects)
- Order creation works properly by reading valid product IDs from the cart
- The frontend matches the backend API contract exactly
