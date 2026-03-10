import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminPaymentService, AdminPaymentsResponse } from '../admin-payment';

// Mock ApiService factory
const createMockApiService = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
};

describe('AdminPaymentService - Comprehensive Unit Tests', () => {
  let service: AdminPaymentService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [AdminPaymentService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(AdminPaymentService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getAdminPayments() Tests
  // ============================================

  describe('getAdminPayments() - Happy Path', () => {
    it('should return payments list when API call succeeds', () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              _id: 'payment-1',
              user: 'user-1',
              total_amount: 100,
              status: 'paid',
              createdAt: '2024-01-01',
            },
            {
              _id: 'payment-2',
              user: 'user-2',
              total_amount: 200,
              status: 'paid',
              createdAt: '2024-01-02',
            },
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminPaymentsResponse | undefined;
      service.getAdminPayments().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/payments?status=paid&page=1&limit=10');
      expect(result?.payments.length).toBe(2);
      expect(result?.payments[0].total_amount).toBe(100);
      expect(result?.pagination.total).toBe(2);
    });

    it('should return empty payments list when no payments exist', () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminPaymentsResponse | undefined;
      service.getAdminPayments().subscribe((response) => {
        result = response;
      });

      expect(result?.payments).toEqual([]);
      expect(result?.pagination.total).toBe(0);
    });

    it('should return payments with all fields', () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              _id: 'payment-1',
              user: 'user-1',
              total_amount: 99.99,
              status: 'paid',
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminPaymentsResponse | undefined;
      service.getAdminPayments().subscribe((response) => {
        result = response;
      });

      expect(result?.payments[0].total_amount).toBe(99.99);
    });
  });

  describe('getAdminPayments() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Admin access required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getAdminPayments().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(401);
    });

    it('should handle 403 Forbidden for non-admin users', () => {
      const errorResponse = new HttpErrorResponse({
        status: 403,
        statusText: 'Forbidden',
        error: { message: 'Admin access required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getAdminPayments().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(403);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch payments' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getAdminPayments().subscribe({
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
      service.getAdminPayments().subscribe({
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
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long payment ID', () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              _id: 'a'.repeat(500),
              user: 'user-1',
              total_amount: 100,
              status: 'paid',
              createdAt: '2024-01-01',
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminPaymentsResponse | undefined;
      service.getAdminPayments().subscribe((response) => {
        result = response;
      });

      expect(result?.payments[0]._id).toHaveLength(500);
    });

    it('should handle negative amount', () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              _id: 'payment-1',
              user: 'user-1',
              total_amount: -50,
              status: 'refunded',
              createdAt: '2024-01-01',
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminPaymentsResponse | undefined;
      service.getAdminPayments().subscribe((response) => {
        result = response;
      });

      expect(result?.payments[0].total_amount).toBe(-50);
    });

    it('should handle zero amount payments', () => {
      const mockResponse = {
        success: true,
        data: {
          payments: [
            {
              _id: 'payment-1',
              user: 'user-1',
              total_amount: 0,
              status: 'paid',
              createdAt: '2024-01-01',
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: AdminPaymentsResponse | undefined;
      service.getAdminPayments().subscribe((response) => {
        result = response;
      });

      expect(result?.payments[0].total_amount).toBe(0);
    });
  });
});
