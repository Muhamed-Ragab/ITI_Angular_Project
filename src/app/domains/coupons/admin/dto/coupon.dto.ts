/**
 * Coupon DTOs
 * Data Transfer Objects for coupon management
 */

// ─── Interfaces ─────────────────────────────────────────────────────────────────

/** Discount type enum */
export type DiscountType = 'percentage' | 'fixed';

/** Coupon - full coupon representation */
export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  usage_by_user: Record<string, number>;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/** Coupon usage by user */
export interface CouponUsedByUser {
  userId: string;
  userName: string;
  userEmail: string;
  usedAt: string;
  discountAmount: number;
}

/** Recent coupon usage */
export interface CouponRecentUsage {
  _id: string;
  userId: string;
  userName: string;
  orderId?: string;
  usedAt: string;
  discountAmount: number;
}

/** Coupon usage statistics */
export interface CouponUsageStats {
  totalUsed: number;
  totalDiscountGiven: number;
  usedByUsers: CouponUsedByUser[];
  recentUsage: CouponRecentUsage[];
}

// ─── Response Wrappers ────────────────────────────────────────────────────────

/** Single coupon response */
export interface AdminCouponResponse {
  success: boolean;
  data: Coupon;
}

/** Coupon list response */
export interface AdminCouponListResponse {
  success: boolean;
  data: {
    coupons: Coupon[];
    pagination: AdminCouponPagination;
  };
}

/** Coupon action response (create, update, delete) */
export interface AdminCouponActionResponse {
  success: boolean;
  message: string;
  data?: Coupon;
}

/** Coupon stats response */
export interface AdminCouponStatsResponse {
  success: boolean;
  data: CouponUsageStats;
}

/** Validate coupon response */
export interface AdminValidateCouponResponse {
  success: boolean;
  data: ValidateCouponResponse;
}

/** Pagination info */
export interface AdminCouponPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Validate coupon response data */
export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message: string;
}
