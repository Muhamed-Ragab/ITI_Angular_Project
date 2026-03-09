/**
 * Create Order Request DTO
 * Request body for creating orders from admin panel
 */

import { ShippingAddress } from './admin-order.dto';

/** Order item for creation */
export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

/** Create Order Request */
export interface CreateOrderRequest {
  userId: string;
  items: OrderItemRequest[];
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: string;
  notes?: string;
}
