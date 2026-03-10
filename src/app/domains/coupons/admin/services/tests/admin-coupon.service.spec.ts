import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AdminCouponActionResponse,
  AdminCouponListResponse,
  AdminCouponResponse,
  AdminCouponStatsResponse,
  AdminValidateCouponResponse,
  CouponFilters,
} from '../../dto';
import { CreateCouponRequest } from '../../dto/create-coupon-request.dto';
import { UpdateCouponRequest } from '../../dto/update-coupon-request.dto';
import { ValidateCouponRequest } from '../../dto/validate-coupon-request.dto';
import { AdminCouponService } from '../admin-coupon.service';

// Mock ApiService
const createMockApiService = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
};

describe('AdminCouponService - Comprehensive Unit Tests', () => {
  let service: AdminCouponService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [AdminCouponService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(AdminCouponService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getCoupons() Tests
  // ============================================

  describe('getCoupons() - Happy Path', () => {
    it('should return coupon list when API call succeeds', () => {
      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: {
          coupons: [
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
            {
              _id: 'coupon-2',
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
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminCouponListResponse | undefined;
      service.getCoupons().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/coupons', expect.any(HttpParams));
      expect(result?.success).toBe(true);
      expect(result?.data.coupons.length).toBe(2);
      expect(result?.data.coupons[0].code).toBe('SAVE20');
    });

    it('should return empty list when no coupons exist', () => {
      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: {
          coupons: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminCouponListResponse | undefined;
      service.getCoupons().subscribe((response) => {
        result = response;
      });

      expect(result?.data.coupons).toEqual([]);
      expect(result?.data.pagination.total).toBe(0);
    });

    it('should pass filters as query parameters', () => {
      const filters: CouponFilters = {
        status: 'active',
        discountType: 'percentage',
        search: 'SAVE',
        page: 2,
        limit: 20,
      };

      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: { coupons: [], pagination: { page: 2, limit: 20, total: 0, pages: 0 } },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getCoupons(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalledWith('/coupons', expect.any(HttpParams));
    });

    it('should filter out undefined/null/empty filter values', () => {
      const filters: CouponFilters = {
        status: undefined,
        discountType: null as any,
        search: '',
        page: 1,
        limit: 10,
      };

      const mockResponse: AdminCouponListResponse = {
        success: true,
        data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getCoupons(filters).subscribe();

      // Should still call with valid params only
      expect(mockApiService.get).toHaveBeenCalled();
    });
  });

  describe('getCoupons() - Error Handling', () => {
    it('should handle 400 Bad Request error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid filter parameters' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCoupons().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCoupons().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });

    it('should handle network error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: { message: 'Network error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCoupons().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(0);
    });
  });

  // ============================================
  // getCouponById() Tests
  // ============================================

  describe('getCouponById() - Happy Path', () => {
    it('should return coupon detail when API call succeeds', () => {
      const couponId = 'coupon-123';
      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
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
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.getCouponById(couponId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith(`/coupons/${couponId}`);
      expect(result?.success).toBe(true);
      expect(result?.data._id).toBe(couponId);
      expect(result?.data.code).toBe('SAVE20');
    });

    it('should return coupon with all fields', () => {
      const couponId = 'coupon-456';
      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
          code: 'FULL',
          description: 'Full featured coupon',
          type: 'fixed',
          value: 15,
          is_active: true,
          starts_at: '2024-01-01T00:00:00Z',
          ends_at: '2024-12-31T23:59:59Z',
          min_order_amount: 50,
          usage_limit: 100,
          used_count: 25,
          per_user_limit: 3,
          usage_by_user: { 'user-1': 2 },
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.getCouponById(couponId).subscribe((response) => {
        result = response;
      });

      expect(result?.data.description).toBe('Full featured coupon');
      expect(result?.data.min_order_amount).toBe(50);
      expect(result?.data.usage_limit).toBe(100);
    });
  });

  describe('getCouponById() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const couponId = 'non-existent';
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Coupon not found' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCouponById(couponId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 500 Internal Server Error', () => {
      const couponId = 'coupon-123';
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCouponById(couponId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // createCoupon() Tests
  // ============================================

  describe('createCoupon() - Happy Path', () => {
    it('should create coupon when API call succeeds', () => {
      const request: CreateCouponRequest = {
        code: 'NEWCOUPON',
        type: 'percentage',
        value: 20,
        description: 'New coupon',
        is_active: true,
      };

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Coupon created successfully',
        data: {
          _id: 'new-coupon-id',
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
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: AdminCouponActionResponse | undefined;
      service.createCoupon(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/coupons', request);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Coupon created successfully');
      expect(result?.data?._id).toBe('new-coupon-id');
    });

    it('should create coupon with all optional fields', () => {
      const request: CreateCouponRequest = {
        code: 'FULLCOUPON',
        description: 'Full featured',
        type: 'fixed',
        value: 15,
        min_order_amount: 50,
        usage_limit: 100,
        per_user_limit: 3,
        starts_at: '2024-01-01T00:00:00Z',
        ends_at: '2024-12-31T23:59:59Z',
        is_active: true,
      };

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Created',
        data: {
          _id: 'new-id',
          code: 'FULLCOUPON',
          type: 'fixed',
          value: 15,
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
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: AdminCouponActionResponse | undefined;
      service.createCoupon(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/coupons', request);
      expect(result?.success).toBe(true);
    });

    it('should create coupon with null usage_limit', () => {
      const request: CreateCouponRequest = {
        code: 'UNLIMITED',
        type: 'percentage',
        value: 10,
        usage_limit: null,
      };

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Created',
        data: {
          _id: 'new-id',
          code: 'UNLIMITED',
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
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: AdminCouponActionResponse | undefined;
      service.createCoupon(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.usage_limit).toBeNull();
    });
  });

  describe('createCoupon() - Error Handling', () => {
    it('should handle 400 Bad Request error - duplicate code', () => {
      const request: CreateCouponRequest = {
        code: 'EXISTING',
        type: 'percentage',
        value: 10,
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Coupon code already exists' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createCoupon(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.message).toContain('already exists');
    });

    it('should handle 500 Internal Server Error', () => {
      const request: CreateCouponRequest = {
        code: 'TEST',
        type: 'percentage',
        value: 10,
      };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to create coupon' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createCoupon(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // updateCoupon() Tests
  // ============================================

  describe('updateCoupon() - Happy Path', () => {
    it('should update coupon when API call succeeds', () => {
      const couponId = 'coupon-123';
      const request: UpdateCouponRequest = {
        code: 'UPDATED',
        value: 25,
      };

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
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
        },
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.updateCoupon(couponId, request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.put).toHaveBeenCalledWith(`/coupons/${couponId}`, request);
      expect(result?.success).toBe(true);
      expect(result?.data.code).toBe('UPDATED');
      expect(result?.data.value).toBe(25);
    });

    it('should update only is_active field', () => {
      const couponId = 'coupon-123';
      const request: UpdateCouponRequest = {
        is_active: false,
      };

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
          code: 'TEST',
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
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.updateCoupon(couponId, request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.is_active).toBe(false);
    });

    it('should handle empty update object', () => {
      const couponId = 'coupon-123';
      const request: UpdateCouponRequest = {};

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
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
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.updateCoupon(couponId, request).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });
  });

  describe('updateCoupon() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const couponId = 'non-existent';
      const request: UpdateCouponRequest = { code: 'NEWCODE' };

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Coupon not found' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateCoupon(couponId, request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 400 Bad Request - duplicate code', () => {
      const couponId = 'coupon-123';
      const request: UpdateCouponRequest = { code: 'EXISTING' };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Coupon code already exists' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateCoupon(couponId, request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });
  });

  // ============================================
  // deleteCoupon() Tests
  // ============================================

  describe('deleteCoupon() - Happy Path', () => {
    it('should delete coupon when API call succeeds', () => {
      const couponId = 'coupon-123';

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Coupon deleted successfully',
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: AdminCouponActionResponse | undefined;
      service.deleteCoupon(couponId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.delete).toHaveBeenCalledWith(`/coupons/${couponId}`);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Coupon deleted successfully');
    });

    it('should return deleted coupon info', () => {
      const couponId = 'coupon-123';

      const mockResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Coupon deleted successfully',
        data: {
          _id: couponId,
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
        },
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: AdminCouponActionResponse | undefined;
      service.deleteCoupon(couponId).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.deletedAt).toBe('2024-06-01T00:00:00Z');
    });
  });

  describe('deleteCoupon() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const couponId = 'non-existent';

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Coupon not found' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.deleteCoupon(couponId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 400 Bad Request - cannot delete', () => {
      const couponId = 'coupon-123';

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Cannot delete coupon with active orders' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.deleteCoupon(couponId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });
  });

  // ============================================
  // activateCoupon() Tests
  // ============================================

  describe('activateCoupon() - Happy Path', () => {
    it('should activate coupon when API call succeeds', () => {
      const couponId = 'coupon-123';

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
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
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.activateCoupon(couponId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.put).toHaveBeenCalledWith(`/coupons/${couponId}`, { is_active: true });
      expect(result?.success).toBe(true);
      expect(result?.data.is_active).toBe(true);
    });
  });

  // ============================================
  // deactivateCoupon() Tests
  // ============================================

  describe('deactivateCoupon() - Happy Path', () => {
    it('should deactivate coupon when API call succeeds', () => {
      const couponId = 'coupon-123';

      const mockResponse: AdminCouponResponse = {
        success: true,
        data: {
          _id: couponId,
          code: 'TEST',
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
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: AdminCouponResponse | undefined;
      service.deactivateCoupon(couponId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.put).toHaveBeenCalledWith(`/coupons/${couponId}`, { is_active: false });
      expect(result?.success).toBe(true);
      expect(result?.data.is_active).toBe(false);
    });
  });

  // ============================================
  // validateCoupon() Tests
  // ============================================

  describe('validateCoupon() - Happy Path', () => {
    it('should validate coupon when API call succeeds', () => {
      const request: ValidateCouponRequest = {
        code: 'SAVE20',
        cartTotal: 100,
        userId: 'user-123',
      };

      const mockResponse: AdminValidateCouponResponse = {
        success: true,
        data: {
          valid: true,
          coupon: {
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
          discountAmount: 20,
          message: 'Coupon is valid',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: AdminValidateCouponResponse | undefined;
      service.validateCoupon(request).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/coupons/validate', request);
      expect(result?.success).toBe(true);
      expect(result?.data.valid).toBe(true);
      expect(result?.data.discountAmount).toBe(20);
    });

    it('should return invalid for expired coupon', () => {
      const request: ValidateCouponRequest = {
        code: 'EXPIRED',
        cartTotal: 100,
      };

      const mockResponse: AdminValidateCouponResponse = {
        success: true,
        data: {
          valid: false,
          discountAmount: 0,
          message: 'Coupon has expired',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: AdminValidateCouponResponse | undefined;
      service.validateCoupon(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.valid).toBe(false);
      expect(result?.data.message).toBe('Coupon has expired');
    });

    it('should return invalid for coupon below minimum', () => {
      const request: ValidateCouponRequest = {
        code: 'MIN50',
        cartTotal: 30,
      };

      const mockResponse: AdminValidateCouponResponse = {
        success: true,
        data: {
          valid: false,
          discountAmount: 0,
          message: 'Minimum order amount not met',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: AdminValidateCouponResponse | undefined;
      service.validateCoupon(request).subscribe((response) => {
        result = response;
      });

      expect(result?.data.valid).toBe(false);
      expect(result?.data.message).toContain('minimum');
    });
  });

  describe('validateCoupon() - Error Handling', () => {
    it('should handle 404 for invalid coupon code', () => {
      const request: ValidateCouponRequest = {
        code: 'INVALID',
        cartTotal: 100,
      };

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Coupon not found' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.validateCoupon(request).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });
  });

  // ============================================
  // getCouponStats() Tests
  // ============================================

  describe('getCouponStats() - Happy Path', () => {
    it('should return coupon stats when API call succeeds', () => {
      const couponId = 'coupon-123';

      const mockResponse: AdminCouponStatsResponse = {
        success: true,
        data: {
          totalUsed: 10,
          totalDiscountGiven: 150,
          usedByUsers: [
            {
              userId: 'user-1',
              userName: 'John Doe',
              userEmail: 'john@example.com',
              usedAt: '2024-01-15T10:00:00Z',
              discountAmount: 15,
            },
          ],
          recentUsage: [
            {
              _id: 'usage-1',
              userId: 'user-1',
              userName: 'John Doe',
              orderId: 'order-1',
              usedAt: '2024-01-15T10:00:00Z',
              discountAmount: 15,
            },
          ],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminCouponStatsResponse | undefined;
      service.getCouponStats(couponId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith(`/coupons/${couponId}`);
      expect(result?.success).toBe(true);
      expect(result?.data.totalUsed).toBe(10);
      expect(result?.data.totalDiscountGiven).toBe(150);
      expect(result?.data.usedByUsers.length).toBe(1);
    });

    it('should handle empty stats', () => {
      const couponId = 'coupon-123';

      const mockResponse: AdminCouponStatsResponse = {
        success: true,
        data: {
          totalUsed: 0,
          totalDiscountGiven: 0,
          usedByUsers: [],
          recentUsage: [],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminCouponStatsResponse | undefined;
      service.getCouponStats(couponId).subscribe((response) => {
        result = response;
      });

      expect(result?.data.totalUsed).toBe(0);
      expect(result?.data.usedByUsers).toEqual([]);
    });
  });

  // ============================================
  // Service Integration Tests
  // ============================================

  describe('Service Integration - Multiple Operations', () => {
    it('should handle CRUD operations in sequence', () => {
      // Create
      const createRequest: CreateCouponRequest = { code: 'TEST', type: 'percentage', value: 10 };
      const createResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Created',
        data: {
          _id: 'new-id',
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
      };

      mockApiService.post.mockReturnValue(of(createResponse));

      let createResult: AdminCouponActionResponse | undefined;
      service.createCoupon(createRequest).subscribe((r) => (createResult = r));

      expect(createResult?.success).toBe(true);

      // Update
      const updateRequest: UpdateCouponRequest = { code: 'UPDATED' };
      const updateResponse: AdminCouponResponse = {
        success: true,
        data: { ...createResult!.data!, code: 'UPDATED' },
      };

      mockApiService.put.mockReturnValue(of(updateResponse));

      let updateResult: AdminCouponResponse | undefined;
      service.updateCoupon('new-id', updateRequest).subscribe((r) => (updateResult = r));

      expect(updateResult?.success).toBe(true);

      // Delete
      const deleteResponse: AdminCouponActionResponse = {
        success: true,
        message: 'Deleted',
      };

      mockApiService.delete.mockReturnValue(of(deleteResponse));

      let deleteResult: AdminCouponActionResponse | undefined;
      service.deleteCoupon('new-id').subscribe((r) => (deleteResult = r));

      expect(deleteResult?.success).toBe(true);
    });

    it('should call correct HTTP methods for each operation', () => {
      // getCoupons uses GET
      mockApiService.get.mockReturnValue(
        of({
          success: true,
          data: { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        }),
      );
      service.getCoupons().subscribe();
      expect(mockApiService.get).toHaveBeenCalledTimes(1);

      // getCouponById uses GET
      mockApiService.get.mockReturnValue(
        of({
          success: true,
          data: {
            _id: '1',
            code: 'TEST',
            type: 'percentage' as any,
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
        }),
      );
      service.getCouponById('1').subscribe();
      expect(mockApiService.get).toHaveBeenCalledTimes(2);

      // createCoupon uses POST
      mockApiService.post.mockReturnValue(of({ success: true, message: 'Created' }));
      service.createCoupon({ code: 'TEST', type: 'percentage' as any, value: 10 }).subscribe();
      expect(mockApiService.post).toHaveBeenCalledTimes(1);

      // updateCoupon uses PUT
      mockApiService.put.mockReturnValue(
        of({
          success: true,
          data: {
            _id: '1',
            code: 'TEST',
            type: 'percentage' as any,
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
        }),
      );
      service.updateCoupon('1', { code: 'TEST' }).subscribe();
      expect(mockApiService.put).toHaveBeenCalledTimes(1);

      // deleteCoupon uses DELETE
      mockApiService.delete.mockReturnValue(of({ success: true, message: 'Deleted' }));
      service.deleteCoupon('1').subscribe();
      expect(mockApiService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
