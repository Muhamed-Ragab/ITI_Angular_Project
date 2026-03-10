import { describe, expect, it } from 'vitest';
import { CouponFilters, CouponListResponse } from '../coupon-list.dto';
import {
  AdminCouponActionResponse,
  AdminCouponListResponse,
  AdminCouponPagination,
  AdminCouponResponse,
  Coupon,
  CouponRecentUsage,
  CouponUsageStats,
  CouponUsedByUser,
  DiscountType,
  ValidateCouponResponse,
} from '../coupon.dto';
import { CreateCouponRequest } from '../create-coupon-request.dto';
import { UpdateCouponRequest } from '../update-coupon-request.dto';
import { ValidateCouponRequest } from '../validate-coupon-request.dto';
import { ValidateCouponResponse as ValidateCouponResponseDTO } from '../validate-coupon-response.dto';

// ============================================
// COUPON INTERFACE TESTS
// ============================================

describe('Coupon Interface - Comprehensive Unit Tests', () => {
  // Happy Path Tests
  describe('Happy Path - Valid Coupon', () => {
    it('should create valid coupon with all required fields', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'SAVE20',
        description: '20% off your order',
        type: 'percentage' as DiscountType,
        value: 20,
        is_active: true,
        starts_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        min_order_amount: 50,
        usage_limit: 100,
        used_count: 25,
        per_user_limit: 3,
        usage_by_user: { 'user-1': 2, 'user-2': 1 },
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        __v: 0,
      };

      expect(coupon._id).toBe('coupon-123');
      expect(coupon.code).toBe('SAVE20');
      expect(coupon.type).toBe('percentage');
      expect(coupon.value).toBe(20);
      expect(coupon.is_active).toBe(true);
      expect(coupon.usage_limit).toBe(100);
      expect(coupon.used_count).toBe(25);
    });

    it('should handle fixed discount type coupon', () => {
      const coupon: Coupon = {
        _id: 'coupon-456',
        code: 'FLAT10',
        type: 'fixed' as DiscountType,
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(coupon.type).toBe('fixed');
      expect(coupon.value).toBe(10);
    });

    it('should handle coupon with optional description', () => {
      const couponWithoutDesc: Coupon = {
        _id: 'coupon-789',
        code: 'NODESC',
        type: 'percentage',
        value: 15,
        is_active: false,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(couponWithoutDesc.description).toBeUndefined();
    });
  });

  // Edge Cases - Null/Undefined Values
  describe('Edge Cases - Null and Undefined Values', () => {
    it('should handle null starts_at and ends_at', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'PERMANENT',
        type: 'percentage',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(coupon.starts_at).toBeNull();
      expect(coupon.ends_at).toBeNull();
    });

    it('should handle null usage_limit (unlimited)', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'UNLIMITED',
        type: 'fixed',
        value: 5,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(coupon.usage_limit).toBeNull();
    });

    it('should handle deleted coupon with deletedAt timestamp', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'DELETED',
        type: 'percentage',
        value: 10,
        is_active: false,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: '2024-06-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
      };

      expect(coupon.deletedAt).toBe('2024-06-01T00:00:00Z');
      expect(coupon.is_active).toBe(false);
    });

    it('should handle empty usage_by_user', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'NEW',
        type: 'percentage',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(coupon.usage_by_user).toEqual({});
    });
  });

  // Edge Cases - Expired Coupons
  describe('Edge Cases - Expired Coupons', () => {
    it('should handle expired coupon', () => {
      const expiredCoupon: Coupon = {
        _id: 'coupon-123',
        code: 'EXPIRED',
        type: 'percentage',
        value: 15,
        is_active: false,
        starts_at: '2023-01-01T00:00:00Z',
        ends_at: '2023-12-31T23:59:59Z',
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-12-31T23:59:59Z',
      };

      expect(expiredCoupon.ends_at).toBe('2023-12-31T23:59:59Z');
      expect(expiredCoupon.is_active).toBe(false);
    });

    it('should handle future (upcoming) coupon', () => {
      const upcomingCoupon: Coupon = {
        _id: 'coupon-123',
        code: 'FUTURE',
        type: 'percentage',
        value: 25,
        is_active: true,
        starts_at: '2025-01-01T00:00:00Z',
        ends_at: '2025-12-31T23:59:59Z',
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-12-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z',
      };

      expect(upcomingCoupon.starts_at).toBe('2025-01-01T00:00:00Z');
      expect(upcomingCoupon.is_active).toBe(true);
    });
  });

  // Edge Cases - Exhausted Coupons
  describe('Edge Cases - Exhausted Coupons', () => {
    it('should handle fully exhausted coupon', () => {
      const exhaustedCoupon: Coupon = {
        _id: 'coupon-123',
        code: 'EXHAUSTED',
        type: 'percentage',
        value: 10,
        is_active: false,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: 100,
        used_count: 100,
        per_user_limit: 1,
        usage_by_user: { 'user-1': 1, 'user-2': 1, 'user-3': 1 },
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
      };

      expect(exhaustedCoupon.usage_limit).toBe(100);
      expect(exhaustedCoupon.used_count).toBe(100);
      expect(exhaustedCoupon.used_count).toBe(exhaustedCoupon.usage_limit);
    });

    it('should handle partially used coupon', () => {
      const partiallyUsed: Coupon = {
        _id: 'coupon-123',
        code: 'PARTIAL',
        type: 'percentage',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: 100,
        used_count: 50,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(partiallyUsed.used_count).toBe(50);
      expect(partiallyUsed.usage_limit).toBe(100);
    });
  });

  // Edge Cases - Invalid Discount Values
  describe('Edge Cases - Invalid Discount Values', () => {
    it('should handle zero discount value', () => {
      const zeroCoupon: Coupon = {
        _id: 'coupon-123',
        code: 'ZERO',
        type: 'percentage',
        value: 0,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(zeroCoupon.value).toBe(0);
    });

    it('should handle very high percentage discount', () => {
      const highDiscount: Coupon = {
        _id: 'coupon-123',
        code: 'BIG100',
        type: 'percentage',
        value: 100,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(highDiscount.value).toBe(100);
    });

    it('should handle negative discount value', () => {
      const negativeCoupon: Coupon = {
        _id: 'coupon-123',
        code: 'NEGATIVE',
        type: 'percentage',
        value: -10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      expect(negativeCoupon.value).toBe(-10);
    });
  });

  // Serialization Tests
  describe('Serialization Tests', () => {
    it('should serialize coupon to JSON correctly', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'TEST',
        type: 'percentage',
        value: 20,
        is_active: true,
        starts_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        min_order_amount: 50,
        usage_limit: 100,
        used_count: 0,
        per_user_limit: 3,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const json = JSON.stringify(coupon);
      const parsed = JSON.parse(json);

      expect(parsed._id).toBe('coupon-123');
      expect(parsed.code).toBe('TEST');
      expect(parsed.type).toBe('percentage');
      expect(parsed.value).toBe(20);
    });

    it('should deserialize coupon from JSON correctly', () => {
      const json = JSON.stringify({
        _id: 'coupon-123',
        code: 'TEST',
        type: 'fixed',
        value: 15,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const coupon: Coupon = JSON.parse(json);

      expect(coupon._id).toBe('coupon-123');
      expect(coupon.type).toBe('fixed');
      expect(coupon.usage_limit).toBeNull();
    });
  });

  // Type Safety Tests
  describe('Type Safety Tests', () => {
    it('should enforce DiscountType as percentage or fixed', () => {
      const percentageCoupon: Coupon = {
        _id: '1',
        code: 'PERCENT',
        type: 'percentage',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      };

      const fixedCoupon: Coupon = {
        _id: '2',
        code: 'FIXED',
        type: 'fixed',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      };

      expect(percentageCoupon.type).toBe('percentage');
      expect(fixedCoupon.type).toBe('fixed');
      expect([percentageCoupon.type, fixedCoupon.type]).toContain('percentage');
      expect([percentageCoupon.type, fixedCoupon.type]).toContain('fixed');
    });
  });
});

// ============================================
// ADMIN COUPON RESPONSE WRAPPER TESTS
// ============================================

describe('AdminCouponResponse - Unit Tests', () => {
  it('should create valid single coupon response', () => {
    const coupon: Coupon = {
      _id: 'coupon-123',
      code: 'TEST',
      type: 'percentage',
      value: 20,
      is_active: true,
      starts_at: null,
      ends_at: null,
      min_order_amount: 0,
      usage_limit: null,
      used_count: 0,
      per_user_limit: 1,
      usage_by_user: {},
      deletedAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const response: AdminCouponResponse = {
      success: true,
      data: coupon,
    };

    expect(response.success).toBe(true);
    expect(response.data.code).toBe('TEST');
  });

  it('should handle failed response', () => {
    const response: AdminCouponResponse = {
      success: false,
      data: {} as Coupon,
    };

    expect(response.success).toBe(false);
  });
});

describe('AdminCouponListResponse - Unit Tests', () => {
  it('should create valid coupon list response with pagination', () => {
    const coupons: Coupon[] = [
      {
        _id: '1',
        code: 'COUPON1',
        type: 'percentage',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      },
      {
        _id: '2',
        code: 'COUPON2',
        type: 'fixed',
        value: 5,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      },
    ];

    const pagination: AdminCouponPagination = {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1,
    };

    const response: AdminCouponListResponse = {
      success: true,
      data: {
        coupons,
        pagination,
      },
    };

    expect(response.success).toBe(true);
    expect(response.data.coupons.length).toBe(2);
    expect(response.data.pagination.page).toBe(1);
    expect(response.data.pagination.total).toBe(2);
  });

  it('should handle empty coupon list', () => {
    const response: AdminCouponListResponse = {
      success: true,
      data: {
        coupons: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      },
    };

    expect(response.data.coupons).toEqual([]);
    expect(response.data.pagination.total).toBe(0);
  });
});

describe('AdminCouponActionResponse - Unit Tests', () => {
  it('should create valid action response with data', () => {
    const coupon: Coupon = {
      _id: 'new-coupon',
      code: 'NEW',
      type: 'percentage',
      value: 15,
      is_active: true,
      starts_at: null,
      ends_at: null,
      min_order_amount: 0,
      usage_limit: null,
      used_count: 0,
      per_user_limit: 1,
      usage_by_user: {},
      deletedAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const response: AdminCouponActionResponse = {
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    };

    expect(response.success).toBe(true);
    expect(response.message).toBe('Coupon created successfully');
    expect(response.data?._id).toBe('new-coupon');
  });

  it('should handle action response without data', () => {
    const response: AdminCouponActionResponse = {
      success: true,
      message: 'Coupon deleted successfully',
    };

    expect(response.success).toBe(true);
    expect(response.data).toBeUndefined();
  });
});

describe('AdminCouponPagination - Unit Tests', () => {
  it('should create valid pagination', () => {
    const pagination: AdminCouponPagination = {
      page: 3,
      limit: 20,
      total: 95,
      pages: 5,
    };

    expect(pagination.page).toBe(3);
    expect(pagination.limit).toBe(20);
    expect(pagination.total).toBe(95);
    expect(pagination.pages).toBe(5);
  });

  it('should handle single page pagination', () => {
    const pagination: AdminCouponPagination = {
      page: 1,
      limit: 10,
      total: 5,
      pages: 1,
    };

    expect(pagination.pages).toBe(1);
    expect(pagination.page).toBe(pagination.pages);
  });
});

// ============================================
// COUPON FILTERS AND LIST TESTS
// ============================================

describe('CouponFilters - Unit Tests', () => {
  describe('Happy Path', () => {
    it('should create filters with all optional fields', () => {
      const filters: CouponFilters = {
        status: 'active',
        discountType: 'percentage',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        search: 'SAVE20',
        page: 1,
        limit: 10,
        sort: 'createdAt:desc',
      };

      expect(filters.status).toBe('active');
      expect(filters.discountType).toBe('percentage');
      expect(filters.search).toBe('SAVE20');
    });

    it('should create filters with only search', () => {
      const filters: CouponFilters = {
        search: 'DISCOUNT',
      };

      expect(filters.search).toBe('DISCOUNT');
      expect(filters.status).toBeUndefined();
    });

    it('should create empty filters', () => {
      const filters: CouponFilters = {};

      expect(Object.keys(filters).length).toBe(0);
    });
  });

  describe('Status Filter Values', () => {
    it('should allow active status', () => {
      const filters: CouponFilters = { status: 'active' };
      expect(filters.status).toBe('active');
    });

    it('should allow inactive status', () => {
      const filters: CouponFilters = { status: 'inactive' };
      expect(filters.status).toBe('inactive');
    });

    it('should allow expired status', () => {
      const filters: CouponFilters = { status: 'expired' };
      expect(filters.status).toBe('expired');
    });

    it('should allow upcoming status', () => {
      const filters: CouponFilters = { status: 'upcoming' };
      expect(filters.status).toBe('upcoming');
    });
  });
});

describe('CouponListResponse - Unit Tests', () => {
  it('should create valid list response', () => {
    const response: CouponListResponse = {
      coupons: [
        {
          _id: '1',
          code: 'TEST',
          type: 'percentage',
          value: 10,
          is_active: true,
          starts_at: null,
          ends_at: null,
          min_order_amount: 0,
          usage_limit: null,
          used_count: 0,
          per_user_limit: 1,
          usage_by_user: {},
          deletedAt: null,
          createdAt: '',
          updatedAt: '',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    };

    expect(response.coupons.length).toBe(1);
    expect(response.pagination.total).toBe(1);
  });
});

// ============================================
// CREATE COUPON REQUEST TESTS
// ============================================

describe('CreateCouponRequest - Unit Tests', () => {
  describe('Happy Path', () => {
    it('should create request with all required fields', () => {
      const request: CreateCouponRequest = {
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
      };

      expect(request.code).toBe('SAVE20');
      expect(request.type).toBe('percentage');
      expect(request.value).toBe(20);
    });

    it('should create request with all optional fields', () => {
      const request: CreateCouponRequest = {
        code: 'FULL',
        description: 'Full featured coupon',
        type: 'fixed',
        value: 15,
        min_order_amount: 50,
        usage_limit: 100,
        per_user_limit: 3,
        starts_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        is_active: true,
      };

      expect(request.description).toBe('Full featured coupon');
      expect(request.min_order_amount).toBe(50);
      expect(request.usage_limit).toBe(100);
      expect(request.per_user_limit).toBe(3);
      expect(request.is_active).toBe(true);
    });

    it('should handle null usage_limit', () => {
      const request: CreateCouponRequest = {
        code: 'UNLIMITED',
        type: 'percentage',
        value: 10,
        usage_limit: null,
      };

      expect(request.usage_limit).toBeNull();
    });

    it('should handle null dates', () => {
      const request: CreateCouponRequest = {
        code: 'PERMANENT',
        type: 'percentage',
        value: 10,
        starts_at: null,
        ends_at: null,
      };

      expect(request.starts_at).toBeNull();
      expect(request.ends_at).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum value of zero', () => {
      const request: CreateCouponRequest = {
        code: 'ZERO',
        type: 'percentage',
        value: 0,
        min_order_amount: 0,
      };

      expect(request.value).toBe(0);
      expect(request.min_order_amount).toBe(0);
    });

    it('should handle very long coupon code', () => {
      const longCode = 'A'.repeat(50);
      const request: CreateCouponRequest = {
        code: longCode,
        type: 'percentage',
        value: 10,
      };

      expect(request.code.length).toBe(50);
    });

    it('should handle special characters in code', () => {
      const request: CreateCouponRequest = {
        code: 'SAVE-20%',
        type: 'percentage',
        value: 20,
      };

      expect(request.code).toBe('SAVE-20%');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const request: CreateCouponRequest = {
        code: 'TEST',
        type: 'fixed',
        value: 10,
        is_active: true,
      };

      const json = JSON.stringify(request);
      const parsed = JSON.parse(json);

      expect(parsed.code).toBe('TEST');
      expect(parsed.type).toBe('fixed');
      expect(parsed.value).toBe(10);
    });
  });
});

// ============================================
// UPDATE COUPON REQUEST TESTS
// ============================================

describe('UpdateCouponRequest - Unit Tests', () => {
  describe('Happy Path - Partial Updates', () => {
    it('should update only code', () => {
      const request: UpdateCouponRequest = {
        code: 'NEWCODE',
      };

      expect(request.code).toBe('NEWCODE');
      expect(request.value).toBeUndefined();
    });

    it('should update only value', () => {
      const request: UpdateCouponRequest = {
        value: 30,
      };

      expect(request.value).toBe(30);
      expect(request.code).toBeUndefined();
    });

    it('should update only is_active', () => {
      const request: UpdateCouponRequest = {
        is_active: false,
      };

      expect(request.is_active).toBe(false);
    });

    it('should update multiple fields', () => {
      const request: UpdateCouponRequest = {
        code: 'UPDATED',
        value: 25,
        description: 'Updated description',
        is_active: true,
      };

      expect(request.code).toBe('UPDATED');
      expect(request.value).toBe(25);
      expect(request.description).toBe('Updated description');
      expect(request.is_active).toBe(true);
    });

    it('should allow null for nullable fields', () => {
      const request: UpdateCouponRequest = {
        usage_limit: null,
        ends_at: null,
      };

      expect(request.usage_limit).toBeNull();
      expect(request.ends_at).toBeNull();
    });
  });

  describe('Empty Update', () => {
    it('should allow empty update object', () => {
      const request: UpdateCouponRequest = {};

      expect(Object.keys(request).length).toBe(0);
    });
  });
});

// ============================================
// VALIDATE COUPON REQUEST TESTS
// ============================================

describe('ValidateCouponRequest - Unit Tests', () => {
  describe('Happy Path', () => {
    it('should create request with required fields', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 100,
      };

      expect(request.code).toBe('SAVE20');
      expect(request.cartTotal).toBe(100);
    });

    it('should create request with optional userId', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 100,
        userId: 'user-123',
      };

      expect(request.userId).toBe('user-123');
    });

    it('should create request with optional productIds', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 100,
        productIds: ['prod-1', 'prod-2', 'prod-3'],
      };

      expect(request.productIds?.length).toBe(3);
      expect(request.productIds).toContain('prod-1');
    });

    it('should create request with all fields', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 250.5,
        userId: 'user-456',
        productIds: ['prod-a', 'prod-b'],
      };

      expect(request.code).toBe('SAVE20');
      expect(request.cartTotal).toBe(250.5);
      expect(request.userId).toBe('user-456');
      expect(request.productIds?.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero cartTotal', () => {
      const request: ValidateCouponRequest = {
        code: 'FREE',
        cartTotal: 0,
      };

      expect(request.cartTotal).toBe(0);
    });

    it('should handle empty productIds array', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 100,
        productIds: [],
      };

      expect(request.productIds).toEqual([]);
    });

    it('should handle very large cartTotal', () => {
      const request: ValidateCouponRequest = {
        code: 'BIG',
        cartTotal: 999999.99,
      };

      expect(request.cartTotal).toBe(999999.99);
    });
  });
});

// ============================================
// VALIDATE COUPON RESPONSE TESTS
// ============================================

describe('ValidateCouponResponse - Unit Tests', () => {
  describe('Happy Path - Valid Coupon', () => {
    it('should create valid response with discount', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'SAVE20',
        type: 'percentage',
        value: 20,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      };

      const response: ValidateCouponResponse = {
        valid: true,
        coupon,
        discountAmount: 20,
        message: 'Coupon is valid',
      };

      expect(response.valid).toBe(true);
      expect(response.coupon?.code).toBe('SAVE20');
      expect(response.discountAmount).toBe(20);
      expect(response.message).toBe('Coupon is valid');
    });

    it('should create valid response for fixed discount', () => {
      const coupon: Coupon = {
        _id: 'coupon-456',
        code: 'FLAT10',
        type: 'fixed',
        value: 10,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      };

      const response: ValidateCouponResponse = {
        valid: true,
        coupon,
        discountAmount: 10,
        message: 'Coupon is valid',
      };

      expect(response.coupon?.type).toBe('fixed');
      expect(response.discountAmount).toBe(10);
    });
  });

  describe('Invalid Coupon Responses', () => {
    it('should handle invalid coupon (expired)', () => {
      const response: ValidateCouponResponse = {
        valid: false,
        discountAmount: 0,
        message: 'Coupon has expired',
      };

      expect(response.valid).toBe(false);
      expect(response.coupon).toBeUndefined();
      expect(response.message).toBe('Coupon has expired');
    });

    it('should handle invalid coupon (exhausted)', () => {
      const response: ValidateCouponResponse = {
        valid: false,
        discountAmount: 0,
        message: 'Coupon usage limit reached',
      };

      expect(response.valid).toBe(false);
      expect(response.message).toBe('Coupon usage limit reached');
    });

    it('should handle invalid coupon (below minimum)', () => {
      const response: ValidateCouponResponse = {
        valid: false,
        discountAmount: 0,
        message: 'Minimum order amount not met',
      };

      expect(response.valid).toBe(false);
      expect(response.message).toContain('minimum');
    });

    it('should handle invalid coupon code', () => {
      const response: ValidateCouponResponse = {
        valid: false,
        discountAmount: 0,
        message: 'Invalid coupon code',
      };

      expect(response.valid).toBe(false);
      expect(response.message).toBe('Invalid coupon code');
    });
  });

  describe('Zero Discount Amount', () => {
    it('should handle zero discount amount for invalid coupon', () => {
      const response: ValidateCouponResponse = {
        valid: false,
        discountAmount: 0,
        message: 'Coupon not applicable',
      };

      expect(response.discountAmount).toBe(0);
    });

    it('should handle zero discount for 100% off coupon on zero cart', () => {
      const coupon: Coupon = {
        _id: 'coupon-123',
        code: 'FREE',
        type: 'percentage',
        value: 100,
        is_active: true,
        starts_at: null,
        ends_at: null,
        min_order_amount: 0,
        usage_limit: null,
        used_count: 0,
        per_user_limit: 1,
        usage_by_user: {},
        deletedAt: null,
        createdAt: '',
        updatedAt: '',
      };

      const response: ValidateCouponResponse = {
        valid: true,
        coupon,
        discountAmount: 0,
        message: 'Coupon is valid',
      };

      expect(response.valid).toBe(true);
      expect(response.discountAmount).toBe(0);
    });
  });
});

describe('ValidateCouponResponseDTO - Unit Tests', () => {
  it('should be compatible with ValidateCouponResponse', () => {
    const dto: ValidateCouponResponseDTO = {
      valid: true,
      discountAmount: 15,
      message: 'Valid coupon',
    };

    const response: ValidateCouponResponse = {
      valid: dto.valid,
      discountAmount: dto.discountAmount,
      message: dto.message,
    };

    expect(response.valid).toBe(true);
    expect(response.discountAmount).toBe(15);
  });
});

// ============================================
// COUPON USAGE STATS TESTS
// ============================================

describe('CouponUsageStats - Unit Tests', () => {
  it('should create valid usage stats', () => {
    const usedByUsers: CouponUsedByUser[] = [
      {
        userId: 'user-1',
        userName: 'John Doe',
        userEmail: 'john@example.com',
        usedAt: '2024-01-15T10:00:00Z',
        discountAmount: 20,
      },
    ];

    const recentUsage: CouponRecentUsage[] = [
      {
        _id: 'usage-1',
        userId: 'user-1',
        userName: 'John Doe',
        orderId: 'order-123',
        usedAt: '2024-01-15T10:00:00Z',
        discountAmount: 20,
      },
    ];

    const stats: CouponUsageStats = {
      totalUsed: 1,
      totalDiscountGiven: 20,
      usedByUsers,
      recentUsage,
    };

    expect(stats.totalUsed).toBe(1);
    expect(stats.totalDiscountGiven).toBe(20);
    expect(stats.usedByUsers.length).toBe(1);
    expect(stats.recentUsage.length).toBe(1);
  });

  it('should handle empty usage stats', () => {
    const stats: CouponUsageStats = {
      totalUsed: 0,
      totalDiscountGiven: 0,
      usedByUsers: [],
      recentUsage: [],
    };

    expect(stats.totalUsed).toBe(0);
    expect(stats.usedByUsers).toEqual([]);
    expect(stats.recentUsage).toEqual([]);
  });

  it('should calculate total discount correctly', () => {
    const usedByUsers: CouponUsedByUser[] = [
      { userId: '1', userName: 'A', userEmail: 'a@test.com', usedAt: '', discountAmount: 10 },
      { userId: '2', userName: 'B', userEmail: 'b@test.com', usedAt: '', discountAmount: 15 },
      { userId: '3', userName: 'C', userEmail: 'c@test.com', usedAt: '', discountAmount: 25 },
    ];

    const stats: CouponUsageStats = {
      totalUsed: 3,
      totalDiscountGiven: 50,
      usedByUsers,
      recentUsage: [],
    };

    const calculatedTotal = usedByUsers.reduce((sum, u) => sum + u.discountAmount, 0);
    expect(calculatedTotal).toBe(50);
    expect(stats.totalDiscountGiven).toBe(calculatedTotal);
  });
});

describe('CouponUsedByUser - Unit Tests', () => {
  it('should create valid used by user record', () => {
    const record: CouponUsedByUser = {
      userId: 'user-123',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      usedAt: '2024-01-15T14:30:00Z',
      discountAmount: 25.5,
    };

    expect(record.userId).toBe('user-123');
    expect(record.userName).toBe('John Doe');
    expect(record.userEmail).toBe('john@example.com');
    expect(record.discountAmount).toBe(25.5);
  });
});

describe('CouponRecentUsage - Unit Tests', () => {
  it('should create valid recent usage with order', () => {
    const usage: CouponRecentUsage = {
      _id: 'usage-123',
      userId: 'user-456',
      userName: 'Jane Doe',
      orderId: 'order-789',
      usedAt: '2024-02-01T09:00:00Z',
      discountAmount: 30,
    };

    expect(usage._id).toBe('usage-123');
    expect(usage.orderId).toBe('order-789');
    expect(usage.discountAmount).toBe(30);
  });

  it('should create valid recent usage without order', () => {
    const usage: CouponRecentUsage = {
      _id: 'usage-123',
      userId: 'user-456',
      userName: 'Jane Doe',
      usedAt: '2024-02-01T09:00:00Z',
      discountAmount: 30,
    };

    expect(usage.orderId).toBeUndefined();
  });
});
