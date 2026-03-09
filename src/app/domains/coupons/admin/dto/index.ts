/**
 * Coupon Admin DTOs Index
 * Export all DTOs for the coupons admin module
 */

// Use explicit re-exports to work with isolatedModules
export type { DiscountType } from './coupon.dto';
export type { Coupon } from './coupon.dto';
export type { CouponUsedByUser } from './coupon.dto';
export type { CouponRecentUsage } from './coupon.dto';
export type { CouponUsageStats } from './coupon.dto';
export type { AdminCouponResponse } from './coupon.dto';
export type { AdminCouponListResponse } from './coupon.dto';
export type { AdminCouponActionResponse } from './coupon.dto';
export type { AdminCouponStatsResponse } from './coupon.dto';
export type { AdminValidateCouponResponse } from './coupon.dto';
export type { AdminCouponPagination } from './coupon.dto';
export type { ValidateCouponResponse } from './coupon.dto';

export * from './coupon-list.dto';
export * from './create-coupon-request.dto';
export * from './update-coupon-request.dto';
export * from './validate-coupon-request.dto';
export * from './validate-coupon-response.dto';
