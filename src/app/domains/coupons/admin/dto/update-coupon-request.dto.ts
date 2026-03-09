/**
 * Update Coupon Request DTO
 * Request body for updating an existing coupon (all fields optional for partial updates)
 */

import { DiscountType } from './coupon.dto';

/** Update coupon request */
export interface UpdateCouponRequest {
  code?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  min_order_amount?: number;
  usage_limit?: number | null;
  per_user_limit?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}
