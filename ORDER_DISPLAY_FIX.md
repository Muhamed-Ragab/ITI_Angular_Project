# Order Display Fix - Undefined Total and ID Errors

## Issues

### Issue 1: Undefined Total
Runtime error when displaying orders:
```
TypeError: Cannot read properties of undefined (reading 'toFixed')
at OrderListComponent line 95
```

### Issue 2: Undefined Order ID
API error when viewing order details:
```
GET /api/v1/orders/undefined 400 (Bad Request)
```

## Root Causes

### 1. Multiple Field Name Formats for Amounts
The backend returns order data with different field names:
- Some orders have `total`, `subtotal`, `tax`, `shipping`
- Other orders have `total_amount`, `subtotal_amount`, `tax_amount`, `shipping_amount`

### 2. Multiple Field Name Formats for Order ID
Orders can have either:
- `id` (string)
- `_id` (MongoDB ObjectId as string)

The Order DTO supports both formats, but the components were only accessing one format.

## Solutions

### Fix 1: Order List Component - Total Amount

Added helper method to handle both field name formats:

```typescript
getOrderTotal(order: any): number {
  // Handle both total and total_amount field names
  return order.total ?? order.total_amount ?? 0;
}
```

Template updated:
```html
<span class="fw-bold">EGP {{ getOrderTotal(order).toFixed(2) }}</span>
```

### Fix 2: Order List Component - Order ID

Added helper method to handle both ID field names:

```typescript
getOrderId(order: any): string {
  // Handle both id and _id field names
  return order.id ?? order._id ?? '';
}
```

Template updated:
```html
<a [routerLink]="['/orders', getOrderId(order)]" class="btn btn-sm btn-outline-primary">
  View Details
</a>
```

### Order Detail Component

Added helper methods for all amount fields:

```typescript
getOrderTotal(): number {
  const order = this.ordersFacade.currentOrder();
  return order?.total ?? order?.total_amount ?? 0;
}

getOrderSubtotal(): number {
  const order = this.ordersFacade.currentOrder();
  return order?.subtotal ?? order?.subtotal_amount ?? 0;
}

getOrderTax(): number {
  const order = this.ordersFacade.currentOrder();
  return order?.tax ?? order?.tax_amount ?? 0;
}

getOrderShipping(): number {
  const order = this.ordersFacade.currentOrder();
  return order?.shipping ?? order?.shipping_amount ?? 0;
}
```

## Files Modified

1. `src/app/domains/orders/components/order-list/order-list.component.ts`
   - Added `getOrderTotal()` method to handle both `total` and `total_amount`
   - Added `getOrderId()` method to handle both `id` and `_id`
   - Updated template to use helper methods

2. `src/app/domains/orders/components/order-detail/order-detail.component.ts`
   - Added `getOrderTotal()`, `getOrderSubtotal()`, `getOrderTax()`, `getOrderShipping()` methods
   - Updated template to use helper methods

## Why Both Field Names Exist

The backend API returns different field names depending on the order type:

**Authenticated Orders:**
```json
{
  "total": 450,
  "subtotal": 400,
  "tax": 40,
  "shipping": 10
}
```

**Guest Orders:**
```json
{
  "total_amount": 450,
  "subtotal_amount": 400,
  "tax_amount": 40,
  "shipping_amount": 10
}
```

The Order DTO includes both field names to support both formats:

```typescript
export interface Order {
  total: number;
  total_amount?: number;
  subtotal: number;
  subtotal_amount?: number;
  tax: number;
  tax_amount?: number;
  shipping: number;
  shipping_amount?: number;
  // ...
}
```

## Testing

1. View orders list at `/orders`
2. Click on an order to view details
3. All amounts should display correctly without errors
4. Works for both authenticated and guest orders

## Prevention

Always use helper methods or optional chaining when accessing order amounts:

```typescript
// ✅ Good
order.total ?? order.total_amount ?? 0

// ❌ Bad
order.total.toFixed(2)  // Will crash if total is undefined
```
