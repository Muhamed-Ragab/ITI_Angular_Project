import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@app/core/services/api.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PayoutRequest,
  PayoutResponse,
  ReferralSummary,
  UserProfile,
} from '../../dto/user-profile.dto';
import { ProfileService } from '../profile.service';

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

describe('ProfileService - Comprehensive Unit Tests', () => {
  let service: ProfileService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [ProfileService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(ProfileService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getUserProfile() Tests
  // ============================================

  describe('getUserProfile() - Happy Path', () => {
    it('should return user profile when API call succeeds', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          wallet_balance: 100,
          loyalty_points: 50,
          role: 'customer' as const,
          seller_profile: null,
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfile | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users/profile');
      expect(result?.name).toBe('John Doe');
      expect(result?.email).toBe('john@example.com');
      expect(result?.role).toBe('customer');
      expect(result?.wallet_balance).toBe(100);
    });

    it('should return profile with seller profile', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'Seller User',
          email: 'seller@example.com',
          phone: '+1234567890',
          wallet_balance: 500,
          loyalty_points: 100,
          role: 'seller' as const,
          seller_profile: {
            store_name: 'My Store',
            bio: 'Best store',
            payout_method: 'stripe',
            approval_status: 'approved' as const,
          },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfile | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(result?.seller_profile?.store_name).toBe('My Store');
      expect(result?.seller_profile?.approval_status).toBe('approved');
    });

    it('should return profile with marketing preferences', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          wallet_balance: 100,
          loyalty_points: 50,
          role: 'customer' as const,
          seller_profile: null,
          marketing_preferences: {
            push_notifications: true,
            email_newsletter: false,
            promotional_notifications: true,
          },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfile | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(result?.marketing_preferences?.push_notifications).toBe(true);
      expect(result?.marketing_preferences?.email_newsletter).toBe(false);
    });
  });

  describe('getUserProfile() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Authentication required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUserProfile().subscribe({
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
        error: { message: 'Failed to fetch profile' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getUserProfile().subscribe({
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
  // updateProfile() Tests
  // ============================================

  describe('updateProfile() - Happy Path', () => {
    it('should update profile when API call succeeds', () => {
      const updateData = { name: 'Updated Name', phone: '+9876543210' };

      const mockResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'Updated Name',
          email: 'john@example.com',
          phone: '+9876543210',
          wallet_balance: 100,
          loyalty_points: 50,
          role: 'customer' as const,
          seller_profile: null,
        },
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: UserProfile | undefined;
      service.updateProfile(updateData).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result?.name).toBe('Updated Name');
      expect(result?.phone).toBe('+9876543210');
    });
  });

  describe('updateProfile() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid data', () => {
      const updateData = { name: '', phone: '' };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid profile data' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateProfile(updateData).subscribe({
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
  // updateLanguage() Tests
  // ============================================

  describe('updateLanguage() - Happy Path', () => {
    it('should update language when API call succeeds', () => {
      const mockResponse = {
        success: true,
        data: { preferred_language: 'en' },
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.updateLanguage('en').subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith('/users/preferences/language', {
        language: 'en',
      });
      expect(result?.preferred_language).toBe('en');
    });
  });

  // ============================================
  // updateMarketing() Tests
  // ============================================

  describe('updateMarketing() - Happy Path', () => {
    it('should update marketing preferences when API call succeeds', () => {
      const prefs = {
        push_notifications: true,
        email_newsletter: true,
        promotional_notifications: false,
      };

      const mockResponse = {
        success: true,
        data: prefs,
      };

      mockApiService.patch.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.updateMarketing(prefs).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.patch).toHaveBeenCalledWith('/users/preferences/marketing', prefs);
      expect(result?.push_notifications).toBe(true);
    });
  });

  // ============================================
  // requestSellerOnboarding() Tests
  // ============================================

  describe('requestSellerOnboarding() - Happy Path', () => {
    it('should submit seller onboarding request when API call succeeds', () => {
      const requestData = {
        store_name: 'My Store',
        bio: 'Best products',
        payout_method: 'stripe',
      };

      const mockResponse = {
        success: true,
        data: { status: 'pending', store_name: 'My Store' },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: any | undefined;
      service.requestSellerOnboarding(requestData).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/users/seller/onboarding', requestData);
      expect(result?.status).toBe('pending');
    });
  });

  describe('requestSellerOnboarding() - Error Handling', () => {
    it('should handle 400 Bad Request when already seller', () => {
      const requestData = {
        store_name: 'My Store',
        bio: 'Best products',
        payout_method: 'stripe',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'User is already a seller' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.requestSellerOnboarding(requestData).subscribe({
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
  // requestPayout() Tests
  // ============================================

  describe('requestPayout() - Happy Path', () => {
    it('should request payout when API call succeeds', () => {
      const payoutRequest: PayoutRequest = {
        amount: 500,
        note: 'Monthly payout',
      };

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'payout-1',
            amount: 500,
            status: 'pending' as const,
            createdAt: '2024-01-01T00:00:00Z',
            requested_at: '2024-01-01T00:00:00Z',
            note: 'Monthly payout',
          },
        ],
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: PayoutResponse[] | undefined;
      service.requestPayout(payoutRequest).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/users/seller/payouts', payoutRequest);
      expect(result?.length).toBe(1);
      expect(result?.[0].amount).toBe(500);
      expect(result?.[0].status).toBe('pending');
    });
  });

  describe('requestPayout() - Error Handling', () => {
    it('should handle 400 Bad Request for insufficient balance', () => {
      const payoutRequest: PayoutRequest = {
        amount: 10000,
        note: 'Large payout',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Insufficient balance' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.requestPayout(payoutRequest).subscribe({
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
  // getReferralSummary() Tests
  // ============================================

  describe('getReferralSummary() - Happy Path', () => {
    it('should return referral summary when API call succeeds', () => {
      const mockResponse = {
        success: true,
        data: {
          referralCode: 'REF123',
          referralsCount: 10,
          totalPointsEarned: 500,
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: ReferralSummary | undefined;
      service.getReferralSummary().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users/referrals');
      expect(result?.referralCode).toBe('REF123');
      expect(result?.referralsCount).toBe(10);
      expect(result?.totalPointsEarned).toBe(500);
    });
  });

  describe('getReferralSummary() - Error Handling', () => {
    it('should handle 404 when user has no referrals', () => {
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'No referral data found' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getReferralSummary().subscribe({
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
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle zero wallet balance', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          wallet_balance: 0,
          loyalty_points: 0,
          role: 'customer' as const,
          seller_profile: null,
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfile | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(result?.wallet_balance).toBe(0);
      expect(result?.loyalty_points).toBe(0);
    });

    it('should handle very long name', () => {
      const longName = 'A'.repeat(500);

      const mockResponse = {
        success: true,
        data: {
          id: 'user-123',
          name: longName,
          email: 'john@example.com',
          phone: '+1234567890',
          wallet_balance: 100,
          loyalty_points: 50,
          role: 'customer' as const,
          seller_profile: null,
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: UserProfile | undefined;
      service.getUserProfile().subscribe((response) => {
        result = response;
      });

      expect(result?.name).toBe(longName);
    });
  });
});
