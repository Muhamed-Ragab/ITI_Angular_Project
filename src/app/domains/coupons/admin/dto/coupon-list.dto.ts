/**
 * Coupon List DTOs
 * Filters and response types for coupon listing
 */

import { DiscountType } from './coupon.dto';

/** Coupon filters for listing */
export interface CouponFilters {
  status?: 'active' | 'inactive' | 'expired' | 'upcoming';
  discountType?: DiscountType;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/** Coupon list response data */
export interface CouponListResponse {
  coupons: import('./coupon.dto').Coupon[];
  pagination: import('./coupon.dto').AdminCouponPagination;
}
