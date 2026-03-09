/**
 * Update Order Request DTO
 * Request body for updating order details
 */

import { ShippingAddress } from './admin-order.dto';
import { OrderItemRequest } from './create-order-request.dto';

/** Update Order Request */
export interface UpdateOrderRequest {
  items?: OrderItemRequest[];
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  notes?: string;
}
