import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SellerRequestUser, SellerRequestsResponse } from '../../dto/seller-request';
import { AdminService } from '../admin.service';

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

// Mock HttpClient
const createMockHttpClient = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
};

describe('SellerReview AdminService - Comprehensive Unit Tests', () => {
  let service: AdminService;
  let mockApiService: ReturnType<typeof createMockApiService>;
  let mockHttpClient: ReturnType<typeof createMockHttpClient>;

  beforeEach(() => {
    mockApiService = createMockApiService();
    mockHttpClient = createMockHttpClient();

    TestBed.configureTestingModule({
      providers: [
        AdminService,
        { provide: ApiService, useValue: mockApiService },
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    service = TestBed.inject(AdminService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getSellerRequests() Tests
  // ============================================

  describe('getSellerRequests() - Happy Path', () => {
    it('should return seller requests when API call succeeds', () => {
      const mockResponse: SellerRequestsResponse = {
        success: true,
        data: [
          {
            _id: 'user-1',
            name: 'Seller One',
            email: 'seller1@example.com',
            role: 'customer',
            seller_profile: {
              store_name: 'Store One',
              bio: 'Best store',
              payout_method: 'stripe',
              approval_status: 'pending' as const,
              requested_at: '2024-01-01T00:00:00Z',
            },
          },
          {
            _id: 'user-2',
            name: 'Seller Two',
            email: 'seller2@example.com',
            role: 'customer',
            seller_profile: {
              store_name: 'Store Two',
              bio: 'Great store',
              payout_method: 'paypal',
              approval_status: 'pending' as const,
              requested_at: '2024-01-02T00:00:00Z',
            },
          },
        ],
      };

      mockHttpClient.get.mockReturnValue(of(mockResponse));

      let result: SellerRequestUser[] | undefined;
      service.getSellerRequests().subscribe((response) => {
        result = response;
      });

      expect(mockHttpClient.get).toHaveBeenCalled();
      expect(result?.length).toBe(2);
      expect(result?.[0].seller_profile.store_name).toBe('Store One');
      expect(result?.[0].seller_profile.approval_status).toBe('pending');
    });

    it('should return empty list when no requests exist', () => {
      const mockResponse: SellerRequestsResponse = {
        success: true,
        data: [],
      };

      mockHttpClient.get.mockReturnValue(of(mockResponse));

      let result: SellerRequestUser[] | undefined;
      service.getSellerRequests().subscribe((response) => {
        result = response;
      });

      expect(result).toEqual([]);
    });

    it('should return requests with all profile fields', () => {
      const mockResponse: SellerRequestsResponse = {
        success: true,
        data: [
          {
            _id: 'user-1',
            name: 'Seller One',
            email: 'seller1@example.com',
            phone: '+1234567890',
            role: 'customer',
            seller_profile: {
              store_name: 'Store One',
              bio: 'Best store',
              payout_method: 'stripe',
              approval_status: 'approved' as const,
              approval_note: 'Great store',
              requested_at: '2024-01-01T00:00:00Z',
              reviewed_at: '2024-01-02T00:00:00Z',
            },
          },
        ],
      };

      mockHttpClient.get.mockReturnValue(of(mockResponse));

      let result: SellerRequestUser[] | undefined;
      service.getSellerRequests().subscribe((response) => {
        result = response;
      });

      expect(result?.[0].seller_profile.approval_note).toBe('Great store');
      expect(result?.[0].seller_profile.reviewed_at).toBe('2024-01-02T00:00:00Z');
    });
  });

  describe('getSellerRequests() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Admin access required' },
      });

      mockHttpClient.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getSellerRequests().subscribe({
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

      mockHttpClient.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getSellerRequests().subscribe({
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
        error: { message: 'Failed to fetch seller requests' },
      });

      mockHttpClient.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getSellerRequests().subscribe({
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

      mockHttpClient.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getSellerRequests().subscribe({
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
  // reviewSellerRequest() Tests
  // ============================================

  describe('reviewSellerRequest() - Happy Path', () => {
    it('should approve seller request when API call succeeds', () => {
      const userId = 'user-123';
      const mockResponse = {
        success: true,
        data: {
          _id: userId,
          name: 'Seller One',
          seller_profile: {
            approval_status: 'approved' as const,
            reviewed_at: '2024-01-02T00:00:00Z',
          },
        },
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.reviewSellerRequest(userId, 'approved').subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/seller-requests/${userId}`, {
        status: 'approved',
      });
      expect(result?.seller_profile?.approval_status).toBe('approved');
    });

    it('should reject seller request when API call succeeds', () => {
      const userId = 'user-123';
      const mockResponse = {
        success: true,
        data: {
          _id: userId,
          seller_profile: {
            approval_status: 'rejected' as const,
            approval_note: 'Does not meet requirements',
          },
        },
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.reviewSellerRequest(userId, 'rejected').subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/seller-requests/${userId}`, {
        status: 'rejected',
      });
      expect(result?.seller_profile?.approval_status).toBe('rejected');
    });

    it('should approve with note when provided', () => {
      const userId = 'user-123';
      const note = 'Great store, approved!';
      const mockResponse = {
        success: true,
        data: {
          _id: userId,
          seller_profile: { approval_status: 'approved' as const, approval_note: note },
        },
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.reviewSellerRequest(userId, 'approved', note).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/seller-requests/${userId}`, {
        status: 'approved',
        note,
      });
    });
  });

  describe('reviewSellerRequest() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const userId = 'non-existent';
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Seller request not found' },
      });

      mockApiService.patch.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.reviewSellerRequest(userId, 'approved').subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 409 Conflict when already reviewed', () => {
      const userId = 'user-123';
      const errorResponse = new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',
        error: { message: 'Request already reviewed' },
      });

      mockApiService.patch.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.reviewSellerRequest(userId, 'approved').subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(409);
    });

    it('should handle 500 Internal Server Error', () => {
      const userId = 'user-123';
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to review request' },
      });

      mockApiService.patch.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.reviewSellerRequest(userId, 'approved').subscribe({
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
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long user ID', () => {
      const longId = 'a'.repeat(500);
      mockApiService.patch.mockReturnValue(of({ success: true, data: {} }));
      service.reviewSellerRequest(longId, 'approved').subscribe();
      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/seller-requests/${longId}`, {
        status: 'approved',
      });
    });

    it('should handle very long note', () => {
      const userId = 'user-123';
      const longNote = 'A'.repeat(1000);
      mockApiService.patch.mockReturnValue(of({ success: true, data: {} }));
      service.reviewSellerRequest(userId, 'approved', longNote).subscribe();
      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/seller-requests/${userId}`, {
        status: 'approved',
        note: longNote,
      });
    });
  });
});
