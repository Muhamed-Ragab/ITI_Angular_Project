import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminService } from '../admin-service';

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

describe('AdminService - User Management Tests', () => {
  let service: AdminService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [AdminService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(AdminService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getUsers() Tests
  // ============================================

  describe('getUsers() - Happy Path', () => {
    it('should return users list when API call succeeds', () => {
      const params = { page: 1, limit: 10 };
      const mockResponse = {
        success: true,
        data: {
          users: [
            { _id: 'user-1', name: 'User 1', email: 'user1@example.com', role: 'customer' },
            { _id: 'user-2', name: 'User 2', email: 'user2@example.com', role: 'seller' },
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.getUsers(params).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users', params);
      expect(result?.data?.users?.length).toBe(2);
    });

    it('should return empty users list when no users exist', () => {
      const mockResponse = {
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.getUsers({}).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.users).toEqual([]);
    });

    it('should pass filter params when provided', () => {
      const params = { role: 'seller', page: 1, limit: 20 };

      mockApiService.get.mockReturnValue(
        of({
          success: true,
          data: { users: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } },
        }),
      );

      service.getUsers(params).subscribe();

      expect(mockApiService.get).toHaveBeenCalledWith('/users', params);
    });
  });

  describe('getUsers() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Admin access required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUsers({}).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(401);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch users' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUsers({}).subscribe({
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
  // getUserById() Tests
  // ============================================

  describe('getUserById() - Happy Path', () => {
    it('should return user detail when API call succeeds', () => {
      const userId = 'user-123';
      const mockResponse = {
        success: true,
        data: {
          _id: userId,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'customer',
          phone: '+1234567890',
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.getUserById(userId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith(`/users/admin/${userId}`);
      expect(result?.data?._id).toBe(userId);
      expect(result?.data?.name).toBe('John Doe');
    });
  });

  describe('getUserById() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const userId = 'non-existent';
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'User not found' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUserById(userId).subscribe({
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
  // updateUser() Tests
  // ============================================

  describe('updateUser() - Happy Path', () => {
    it('should update user when API call succeeds', () => {
      const userId = 'user-123';
      const userData = { name: 'Updated Name', role: 'seller' };

      const mockResponse = {
        success: true,
        message: 'User updated successfully',
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.updateUser(userId, userData).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.put).toHaveBeenCalledWith(`/users/admin/${userId}`, userData);
      expect(result?.success).toBe(true);
    });
  });

  describe('updateUser() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid data', () => {
      const userId = 'user-123';
      const userData = { role: 'invalid_role' };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid role' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateUser(userId, userData).subscribe({
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
  // softDeleteUser() Tests
  // ============================================

  describe('softDeleteUser() - Happy Path', () => {
    it('should soft delete user when API call succeeds', () => {
      const userId = 'user-123';

      const mockResponse = {
        success: true,
        message: 'User deleted successfully',
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.softDeleteUser(userId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.delete).toHaveBeenCalledWith(`/users/admin/${userId}`);
      expect(result?.success).toBe(true);
    });
  });

  describe('softDeleteUser() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const userId = 'non-existent';

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'User not found' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.softDeleteUser(userId).subscribe({
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
  // toggleBan() Tests
  // ============================================

  describe('toggleBan() - Happy Path', () => {
    it('should ban user when API call succeeds', () => {
      const userId = 'user-123';

      const mockResponse = {
        success: true,
        message: 'User banned successfully',
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.toggleBan(userId, true).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/${userId}/restriction`, {
        isRestricted: true,
      });
      expect(result?.success).toBe(true);
    });

    it('should unban user when API call succeeds', () => {
      const userId = 'user-123';

      const mockResponse = {
        success: true,
        message: 'User unbanned successfully',
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.toggleBan(userId, false).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/${userId}/restriction`, {
        isRestricted: false,
      });
    });
  });

  describe('toggleBan() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const userId = 'non-existent';

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'User not found' },
      });

      mockApiService.patch.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.toggleBan(userId, true).subscribe({
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
  // grantLoyaltyPoints() Tests
  // ============================================

  describe('grantLoyaltyPoints() - Happy Path', () => {
    it('should grant loyalty points when API call succeeds', () => {
      const userId = 'user-123';
      const points = 100;

      const mockResponse = {
        success: true,
        message: 'Loyalty points granted',
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.grantLoyaltyPoints(userId, points).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/${userId}/loyalty`, {
        points,
      });
      expect(result?.success).toBe(true);
    });

    it('should grant negative points for deduction', () => {
      const userId = 'user-123';
      const points = -50;

      const mockResponse = {
        success: true,
        message: 'Loyalty points deducted',
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.grantLoyaltyPoints(userId, points).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(`/users/admin/${userId}/loyalty`, {
        points: -50,
      });
    });
  });

  describe('grantLoyaltyPoints() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid points', () => {
      const userId = 'user-123';
      const points = -1000;

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid points value' },
      });

      mockApiService.patch.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.grantLoyaltyPoints(userId, points).subscribe({
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
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long user ID', () => {
      const longId = 'a'.repeat(500);

      mockApiService.get.mockReturnValue(of({ success: true, data: null }));

      service.getUserById(longId).subscribe();

      expect(mockApiService.get).toHaveBeenCalledWith(`/users/admin/${longId}`);
    });

    it('should handle empty params', () => {
      mockApiService.get.mockReturnValue(
        of({
          success: true,
          data: { users: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } },
        }),
      );

      service.getUsers({}).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });
  });
});
