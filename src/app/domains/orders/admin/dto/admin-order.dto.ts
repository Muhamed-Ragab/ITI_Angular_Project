/**
 * Admin Order DTOs
 * Matching actual API response shape
 */

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'paid';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded' | 'succeeded' | 'requires_payment_method';

export interface OrderStatusTimeline {
  status: string;
  changed_at: string;
  source: string;
  note?: string;
}

export interface OrderItem {
  product: string;
  seller_id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export interface PaymentInfo {
  stripe_payment_intent_id: string | null;
  status: string;
  method: string | null;
}

export interface CouponInfo {
  code: string;
  type: string;
  value: number;
  discount_amount: number;
}

export interface AdminOrder {
  _id: string;
  user: string | null;
  guest_info: GuestInfo | null;
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  coupon_info: CouponInfo | null;
  status: OrderStatus;
  status_timeline: OrderStatusTimeline[];
  shipping_address: ShippingAddress;
  items: OrderItem[];
  payment_info: PaymentInfo;
  createdAt: string;
  updatedAt: string;
}

// ─── Response Wrappers ────────────────────────────────────────────────────────

export interface AdminOrderResponse {
  success: boolean;
  data: AdminOrder;
  message?: string;
}

export interface AdminOrderListResponse {
  success: boolean;
  data: {
    orders: AdminOrder[];
    pagination: AdminOrderPagination;
  };
  message?: string;
}

export interface AdminOrderHistoryResponse {
  success: boolean;
  data: OrderStatusTimeline[];
}

export interface AdminOrderActionResponse {
  success: boolean;
  message: string;
  data?: AdminOrder;
}

export interface AdminOrderPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Keep these for backwards compatibility
export type OrderHistory = OrderStatusTimeline;
export type ShippingAddressLegacy = ShippingAddress;
