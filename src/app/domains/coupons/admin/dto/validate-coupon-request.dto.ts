/**
 * Validate Coupon Request DTO
 * Request body for validating a coupon
 */

/** Validate coupon request */
export interface ValidateCouponRequest {
  code: string;
  cartTotal: number;
  userId?: string;
  productIds?: string[];
}
