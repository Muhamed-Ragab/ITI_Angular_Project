/**
 * Validate Coupon Response DTO
 * Response body for coupon validation
 */

import { Coupon } from './coupon.dto';

/** Validate coupon response */
export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}
