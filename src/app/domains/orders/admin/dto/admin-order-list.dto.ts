/**
 * Admin Order List DTOs
 * Filters and response types for order listing
 */

import { OrderStatus, PaymentStatus } from './admin-order.dto';

/** Order filters for listing */
export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
