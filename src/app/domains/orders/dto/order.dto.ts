/**
 * Order Domain DTOs
 * Data Transfer Objects for order operations
 */

import { PaymentMethod } from '@domains/payment/dto/payment.dto';

// Create Order Request
export interface CreateOrderRequest {
  shippingAddressIndex?: number;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  couponCode?: string;
  paymentMethod: string;
}

// Guest Checkout Request
export interface GuestCheckoutRequest {
  guest_info: {
    name: string;
    email: string;
    phone: string;
  };
  guestEmail?: string;
  shipping_address: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  items: Array<{
    product: string;
    quantity: number;
  }>;
  couponCode?: string;
  paymentMethod: string;
}

// Order Item - for authenticated user orders
export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

// Order Item - for guest orders (matches backend response)
export interface GuestOrderItem {
  product: string;
  seller_id: string;
  title: string;
  price: number;
  quantity: number;
}

// Shipping Address
export interface ShippingAddress {
  street: string;
  city: string;
  state?: string;
  country: string;
  zip: string;
}

// Order Status Timeline
export interface OrderStatusTimeline {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

// Guest Info (for guest orders)
export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

// Payment Info (for guest orders)
export interface PaymentInfo {
  stripe_payment_intent_id?: string | null;
  status: string;
  method: string;
}

// Order Response - supports both authenticated and guest orders
export interface Order {
  _id: string;
  id?: string;
  user?: string | null;
  orderNumber?: string;
  guest_info?: GuestInfo;
  status: OrderStatus;
  items: OrderItem[] | GuestOrderItem[];
  subtotal: number;
  subtotal_amount?: number;
  tax: number;
  tax_amount?: number;
  shipping: number;
  shipping_amount?: number;
  discount?: number;
  discount_amount?: number;
  total: number;
  total_amount?: number;
  shipping_address?: ShippingAddress;
  shippingAddress: ShippingAddress;
  payment?: {
    method: PaymentMethod;
    status: string;
    transactionId?: string;
  };
  payment_info?: PaymentInfo;
  tracking?: {
    number?: string;
    carrier?: string;
  };
  status_timeline: OrderStatusTimeline[];
  coupon_info?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

export interface OrderListResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}
