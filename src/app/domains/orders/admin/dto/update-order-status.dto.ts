/**
 * Update Order Status Request DTO
 * Request body for updating order status
 */

import { OrderStatus } from './admin-order.dto';

/** Update Order Status Request */
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
  notifyCustomer: boolean;
}
