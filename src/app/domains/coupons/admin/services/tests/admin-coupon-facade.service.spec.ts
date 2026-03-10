import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  AdminCouponListResponse,
  AdminCouponResponse,
  AdminCouponActionResponse,
  AdminValidateCouponResponse,
  AdminCouponStatsResponse,
  Coupon,
  CouponUsageStats,
} from '../../dto';
import { CreateCouponRequest } from '../../dto/create-coupon-request.dto';
import { UpdateCouponRequest } from '../../dto/update-coupon-request.dto';
import { ValidateCouponRequest } from '../../dto/validate-coupon-request.dto';
import { ValidateCouponResponse } from '../../dto/validate-coupon-response.dto';
import { AdminCouponFacadeService, PaginationState } from '../admin-coupon-facade.service';
import { AdminCouponService } from '../admin-coupon.service';

// Mock AdminCouponService
const createMockCouponService = () => {
  return {
    getCoupons: vi.fn(),
    getCouponById: vi.fn(),
    createCoupon: vi.fn(),
    updateCoupon: vi.fn(),
    deleteCoupon: vi.fn(),
    activateCoupon: vi.fn(),
    deactivateCoupon: vi.fn(),
    validateCoupon: vi.fn(),
    getCouponStats: vi.fn(),
  };
};

describe('AdminCouponFacadeService - Comprehensive Unit Tests', () => {
  let facade: AdminCouponFacadeService;
  let mockCouponService: ReturnType<typeof createMockCouponService>;

  beforeEach(() => {
    mockCouponService = createMockCouponService();

    TestBed.configureTestingModule({
      providers: [
        AdminCouponFacadeService,
        { provide: AdminCouponService, useValue: mockCouponService },
      ],
    });

    facade = TestBed.inject(AdminCouponFacadeService);
  });

  afterEach(() => {
    vi.clearAllMocks();
    facade.clearState();
  });

  // ============================================
  // Initial State Tests
  // ============================================

  describe('Initial State', () => {
    it('should have empty coupons array', () => {
      expect(facade.coupons()).toEqual([]);
    });

    it('should have null currentCoupon', () => {
      expect(facade.currentCoupon()).toBeNull();
    });

    it('should have null couponStats', () => {
      expect(facade.couponStats()).toBeNull();
    });

    it('should have isLoading false', () => {
      expect(facade.isLoading()).toBe(false);
    });

    it('should have null error', () => {
      expect(facade.error()).toBeNull();
    });

    it('should have default pagination', () => {
      const expectedPagination: PaginationState = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      };
      expect(facade.pagination()).toEqual(expectedPagination);
    });

    it('should have empty filters', () => {
      expect(facade.filters()).toEqual({});
    });
  });

  // ============================================
  // getCoupons$() Tests
  // ============================================

  describe('getCoupons$() - Happy Path', () => {
    it('should return coupons when API call succeeds', () => {
      const mockCoupons: Coupon[] = [
        {
          _id: 'coupon-1',
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
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: {
          coupons: mockCoupons,
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockCouponService.getCoupons.mockReturnValue(of(mockResponse));

      let result: Coupon[] | null | undefined;
      facade.getCoupons$().pipe(take(1)).subscribe((coupons) => {
        result = coupons;
      });

      expect(mockCouponService.getCoupons).toHaveBeenCalled();
      expect(result?.length).toBe(1);
      expect(result?.[0].code).toBe('SAVE20');
    });

    it('should update coupons signal on success', () => {
      const mockCoupons: Coupon[] = [
        {
          _id: 'coupon-1',
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
      ];

      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: {
          coupons: mockCoupons,
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockCouponService.getCoupons.mockReturnValue(of(mockResponse));

      facade.getCoupons$().pipe(take(1)).subscribe();

      expect(facade.coupons().length).toBe(1);
      expect(facade.coupons()[0].code).toBe('TEST');
    });

    it('should update pagination signal on success', () => {
      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: {
          coupons: [],
          pagination: { page: 2, limit: 20, total: 50, pages: 3 },
        },
      };

      mockCouponService.getCoupons.mockReturnValue(of(mockResponse));

      facade.getCoupons$().pipe(take(1)).subscribe();

      expect(facade.pagination().page).toBe(2);
      expect(facade.pagination().limit).toBe(20);
      expect(facade.pagination().total).toBe(50);
      expect(facade.pagination().pages).toBe(3);
    });

    it('should set isLoading to false after operation', () => {
      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
      };

      mockCouponService.getCoupons.mockReturnValue(of(mockResponse));

      facade.getCoupons$().pipe(take(1)).subscribe();

      expect(facade.isLoading()).toBe(false);
    });
  });

  describe('getCoupons$() - Error Handling', () => {
    it('should return null and set error on API failure', () => {
      mockCouponService.getCoupons.mockReturnValue(
        throwError(() => ({ error: { message: 'Failed to load coupons' } }))
      );

      let result: Coupon[] | null | undefined;
      facade.getCoupons$().pipe(take(1)).subscribe((coupons) => {
        result = coupons;
      });

      expect(result).toBeNull();
      expect(facade.error()).toBe('Failed to load coupons');
    });

    it('should set isLoading to false on error', () => {
      mockCouponService.getCoupons.mockReturnValue(
        throwError(() => ({ error: { message: 'Error' } }))
      );

      facade.getCoupons$().pipe(take(1)).subscribe();

      expect(facade.isLoading()).toBe(false);
    });

    it('should handle 404 error', () => {
      mockCouponService.getCoupons.mockReturnValue(
        throwError(() => ({ status: 404, error: { message: 'Not found' } }))
      );

      facade.getCoupons$().pipe(take(1)).subscribe();

      expect(facade.error()).toBe('Not found');
    });

    it('should return null when success is false', () => {
      const mockResponse: AdminCouponListResponse = {
        success: false,
        data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
      };

      mockCouponService.getCoupons.mockReturnValue(of(mockResponse));

      let result: Coupon[] | null | undefined;
      facade.getCoupons$().pipe(take(1)).subscribe((coupons) => {
        result = coupons;
      });

      expect(result).toBeNull();
    });
  });

  // ============================================
  // getCouponById$() Tests
  // ============================================

  describe('getCouponById$() - Happy Path', () => {
    it('should return coupon when API call succeeds', () => {
      const mockCoupon: Coupon = {
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
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: mockCoupon,
      };

      mockCouponService.getCouponById.mockReturnValue(of(mockResponse));

      let result: Coupon | null | undefined;
      facade.getCouponById$('coupon-123').pipe(take(1)).subscribe((coupon) => {
        result = coupon;
      });

      expect(mockCouponService.getCouponById).toHaveBeenCalledWith('coupon-123');
      expect(result?._id).toBe('coupon-123');
      expect(result?.code).toBe('SAVE20');
    });

    it('should update currentCoupon signal', () => {
      const mockCoupon: Coupon = {
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
        createdAt: '',
        updatedAt: '',
      };

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: mockCoupon,
      };

      mockCouponService.getCouponById.mockReturnValue(of(mockResponse));

      facade.getCouponById$('coupon-123').pipe(take(1)).subscribe();

      expect(facade.currentCoupon()?._id).toBe('coupon-123');
    });
  });

  describe('getCouponById$() - Error Handling', () => {
    it('should return null and set error on failure', () => {
      mockCouponService.getCouponById.mockReturnValue(
        throwError(() => ({ error: { message: 'Coupon not found' } }))
      );

      let result: Coupon | null | undefined;
      facade.getCouponById$('invalid').pipe(take(1)).subscribe((coupon) => {
        result = coupon;
      });

      expect(result).toBeNull();
      expect(facade.error()).toBe('Coupon not found');
    });
  });

  // ============================================
  // createCoupon$() Tests
  // ============================================

  describe('createCoupon$() - Happy Path', () => {
    it('should return created coupon when API call succeeds', () => {
      const request: CreateCouponRequest = {
        code: 'NEWCOUPON',
        type: 'percentage',
        value: 20,
      };

      const mockCoupon: Coupon = {
        _id: 'new-id',
        code: 'NEWCOUPON',
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

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Created',
        data: mockCoupon,
      };

      mockCouponService.createCoupon.mockReturnValue(of(mockResponse));
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [mockCoupon], pagination: { page: 1, limit: 10, total: 1, pages: 1 } },
        })
      );

      let result: Coupon | null | undefined;
      facade.createCoupon$(request).pipe(take(1)).subscribe((coupon) => {
        result = coupon;
      });

      expect(mockCouponService.createCoupon).toHaveBeenCalledWith(request);
      expect(result?._id).toBe('new-id');
    });

    it('should update currentCoupon signal', () => {
      const request: CreateCouponRequest = {
        code: 'NEW',
        type: 'percentage',
        value: 10,
      };

      const mockCoupon: Coupon = {
        _id: 'new-id',
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
        createdAt: '',
        updatedAt: '',
      };

      mockCouponService.createCoupon.mockReturnValue(
        of({
          success: true,
          message: 'Created',
          data: mockCoupon,
        })
      );
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [mockCoupon], pagination: { page: 1, limit: 10, total: 1, pages: 1 } },
        })
      );

      facade.createCoupon$(request).pipe(take(1)).subscribe();

      expect(facade.currentCoupon()?._id).toBe('new-id');
    });
  });

  describe('createCoupon$() - Error Handling', () => {
    it('should return null and set error on failure', () => {
      const request: CreateCouponRequest = {
        code: 'EXISTING',
        type: 'percentage',
        value: 10,
      };

      mockCouponService.createCoupon.mockReturnValue(
        throwError(() => ({ error: { message: 'Code already exists' } }))
      );

      let result: Coupon | null | undefined;
      facade.createCoupon$(request).pipe(take(1)).subscribe((coupon) => {
        result = coupon;
      });

      expect(result).toBeNull();
      expect(facade.error()).toBe('Code already exists');
    });
  });

  // ============================================
  // updateCoupon$() Tests
  // ============================================

  describe('updateCoupon$() - Happy Path', () => {
    it('should return updated coupon when API call succeeds', () => {
      const request: UpdateCouponRequest = {
        code: 'UPDATED',
        value: 25,
      };

      const mockCoupon: Coupon = {
        _id: 'coupon-123',
        code: 'UPDATED',
        type: 'percentage',
        value: 25,
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
        updatedAt: '2024-01-15T00:00:00Z',
      };

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: mockCoupon,
      };

      mockCouponService.updateCoupon.mockReturnValue(of(mockResponse));
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [mockCoupon], pagination: { page: 1, limit: 10, total: 1, pages: 1 } },
        })
      );

      let result: Coupon | null | undefined;
      facade.updateCoupon$('coupon-123', request).pipe(take(1)).subscribe((coupon) => {
        result = coupon;
      });

      expect(mockCouponService.updateCoupon).toHaveBeenCalledWith('coupon-123', request);
      expect(result?.code).toBe('UPDATED');
    });
  });

  describe('updateCoupon$() - Error Handling', () => {
    it('should return null and set error on failure', () => {
      const request: UpdateCouponRequest = { code: 'NEWCODE' };

      mockCouponService.updateCoupon.mockReturnValue(
        throwError(() => ({ error: { message: 'Update failed' } }))
      );

      let result: Coupon | null | undefined;
      facade.updateCoupon$('coupon-123', request).pipe(take(1)).subscribe((coupon) => {
        result = coupon;
      });

      expect(result).toBeNull();
      expect(facade.error()).toBe('Update failed');
    });
  });

  // ============================================
  // deleteCoupon$() Tests
  // ============================================

  describe('deleteCoupon$() - Happy Path', () => {
    it('should return true when deletion succeeds', () => {
      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Deleted',
      };

      mockCouponService.deleteCoupon.mockReturnValue(of(mockResponse));
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        })
      );

      let result: boolean | undefined;
      facade.deleteCoupon$('coupon-123').pipe(take(1)).subscribe((success) => {
        result = success;
      });

      expect(mockCouponService.deleteCoupon).toHaveBeenCalledWith('coupon-123');
      expect(result).toBe(true);
    });

    it('should clear currentCoupon on success', () => {
      // First set a current coupon
      facade.currentCoupon.set({
        _id: 'coupon-123',
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
      });

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Deleted',
      };

      mockCouponService.deleteCoupon.mockReturnValue(of(mockResponse));
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        })
      );

      facade.deleteCoupon$('coupon-123').pipe(take(1)).subscribe();

      expect(facade.currentCoupon()).toBeNull();
    });
  });

  describe('deleteCoupon$() - Error Handling', () => {
    it('should return false and set error on failure', () => {
      mockCouponService.deleteCoupon.mockReturnValue(
        throwError(() => ({ error: { message: 'Delete failed' } }))
      );

      let result: boolean | undefined;
      facade.deleteCoupon$('coupon-123').pipe(take(1)).subscribe((success) => {
        result = success;
      });

      expect(result).toBe(false);
      expect(facade.error()).toBe('Delete failed');
    });
  });

  // ============================================
  // validateCoupon$() Tests
  // ============================================

  describe('validateCoupon$() - Happy Path', () => {
    it('should return validation result when API call succeeds', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 100,
      };

      const mockValidationResult: ValidateCouponResponse = {
        valid: true,
        discountAmount: 20,
        message: 'Valid',
      };

      const mockResponse: AdminValidateCouponResponse = {
        success: true,
        data: mockValidationResult,
      };

      mockCouponService.validateCoupon.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | null | undefined;
      facade.validateCoupon$(request).pipe(take(1)).subscribe((validation) => {
        result = validation;
      });

      expect(mockCouponService.validateCoupon).toHaveBeenCalledWith(request);
      expect(result?.valid).toBe(true);
      expect(result?.discountAmount).toBe(20);
    });

    it('should return invalid validation result', () => {
      const request: ValidateCouponRequest = {
        code: 'EXPIRED',
        cartTotal: 100,
      };

      const mockResponse: AdminValidateCouponResponse = {
        success: true,
        data: {
          valid: false,
          discountAmount: 0,
          message: 'Coupon expired',
        },
      };

      mockCouponService.validateCoupon.mockReturnValue(of(mockResponse));

      let result: ValidateCouponResponse | null | undefined;
      facade.validateCoupon$(request).pipe(take(1)).subscribe((validation) => {
        result = validation;
      });

      expect(result?.valid).toBe(false);
    });
  });

  describe('validateCoupon$() - Error Handling', () => {
    it('should return null and set error on failure', () => {
      const request: ValidateCouponRequest = {
        code: 'INVALID',
        cartTotal: 100,
      };

      mockCouponService.validateCoupon.mockReturnValue(
        throwError(() => ({ error: { message: 'Validation failed' } }))
      );

      let result: ValidateCouponResponse | null | undefined;
      facade.validateCoupon$(request).pipe(take(1)).subscribe((validation) => {
        result = validation;
      });

      expect(result).toBeNull();
      expect(facade.error()).toBe('Validation failed');
    });
  });

  // ============================================
  // getCouponStats$() Tests
  // ============================================

  describe('getCouponStats$() - Happy Path', () => {
    it('should return coupon stats', () => {
      const mockStats: CouponUsageStats = {
        totalUsed: 10,
        totalDiscountGiven: 150,
        usedByUsers: [
          {
            userId: 'user-1',
            userName: 'John',
            userEmail: 'john@test.com',
            usedAt: '2024-01-15T10:00:00Z',
            discountAmount: 15,
          },
        ],
        recentUsage: [],
      };

      const mockResponse: AdminCouponStatsResponse = {
        success: true,
        data: mockStats,
      };

      mockCouponService.getCouponStats.mockReturnValue(of(mockResponse));

      let result: CouponUsageStats | null | undefined;
      facade.getCouponStats$('coupon-123').pipe(take(1)).subscribe((stats) => {
        result = stats;
      });

      expect(result?.totalUsed).toBe(10);
      expect(result?.totalDiscountGiven).toBe(150);
    });

    it('should update couponStats signal', () => {
      const mockStats: CouponUsageStats = {
        totalUsed: 5,
        totalDiscountGiven: 75,
        usedByUsers: [],
        recentUsage: [],
      };

      const mockResponse: AdminCouponStatsResponse = {
        success: true,
        data: mockStats,
      };

      mockCouponService.getCouponStats.mockReturnValue(of(mockResponse));

      facade.getCouponStats$('coupon-123').pipe(take(1)).subscribe();

      expect(facade.couponStats()?.totalUsed).toBe(5);
    });
  });

  describe('getCouponStats$() - Error Handling', () => {
    it('should return null and set error on failure', () => {
      mockCouponService.getCouponStats.mockReturnValue(
        throwError(() => ({ error: { message: 'Stats not found' } }))
      );

      let result: CouponUsageStats | null | undefined;
      facade.getCouponStats$('coupon-123').pipe(take(1)).subscribe((stats) => {
        result = stats;
      });

      expect(result).toBeNull();
      expect(facade.error()).toBe('Stats not found');
    });
  });

  // ============================================
  // Pagination and Filter Methods Tests
  // ============================================

  describe('goToPage()', () => {
    it('should update page and reload coupons', () => {
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 3, limit: 10, total: 0, pages: 0 } },
        })
      );

      facade.goToPage(3);

      expect(facade.pagination().page).toBe(3);
    });
  });

  describe('setFilters()', () => {
    it('should update filters and reset to page 1', () => {
      facade.pagination.set({ page: 3, limit: 10, total: 30, pages: 3 });

      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        })
      );

      facade.setFilters({ status: 'active' });

      expect(facade.filters().status).toBe('active');
      expect(facade.pagination().page).toBe(1);
    });
  });

  describe('clearFilters()', () => {
    it('should clear filters and reset to page 1', () => {
      facade.filters.set({ status: 'active', discountType: 'percentage' });
      facade.pagination.set({ page: 3, limit: 10, total: 30, pages: 3 });

      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        })
      );

      facade.clearFilters();

      expect(facade.filters()).toEqual({});
      expect(facade.pagination().page).toBe(1);
    });
  });

  describe('getPageNumbers()', () => {
    it('should return page numbers for pagination UI', () => {
      facade.pagination.set({ page: 3, limit: 10, total: 50, pages: 5 });

      const pageNumbers = facade.getPageNumbers();

      expect(pageNumbers).toContain(1);
      expect(pageNumbers).toContain(3);
      expect(pageNumbers).toContain(5);
    });

    it('should handle single page', () => {
      facade.pagination.set({ page: 1, limit: 10, total: 5, pages: 1 });

      const pageNumbers = facade.getPageNumbers();

      expect(pageNumbers).toEqual([1]);
    });
  });

  // ============================================
  // clearState() Tests
  // ============================================

  describe('clearState()', () => {
    it('should reset all signals to initial state', () => {
      // Modify state
      facade.coupons.set([
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
      ]);
      facade.currentCoupon.set({
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
      });
      facade.isLoading.set(true);
      facade.error.set('Some error');

      facade.clearState();

      expect(facade.coupons()).toEqual([]);
      expect(facade.currentCoupon()).toBeNull();
      expect(facade.isLoading()).toBe(false);
      expect(facade.error()).toBeNull();
      expect(facade.pagination().page).toBe(1);
    });
  });

  // ============================================
  // loadCoupons() Tests
  // ============================================

  describe('loadCoupons()', () => {
    it('should call getCoupons$ and subscribe', () => {
      mockCouponService.getCoupons.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        })
      );

      facade.loadCoupons();

      expect(mockCouponService.getCoupons).toHaveBeenCalled();
    });
  });
});
