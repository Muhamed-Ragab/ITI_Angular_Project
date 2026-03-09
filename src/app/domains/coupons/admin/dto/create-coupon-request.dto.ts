/**
 * Create Coupon Request DTO
 * Request body for creating a new coupon
 */

import { DiscountType } from './coupon.dto';

/** Create coupon request */
export interface CreateCouponRequest {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  min_order_amount?: number;
  usage_limit?: number | null;
  per_user_limit?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}
