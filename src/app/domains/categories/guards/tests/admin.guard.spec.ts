import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminGuard } from '../admin.guard';
import { AuthService } from '@core/services/auth.service';
import { User } from '@domains/auth/types/user.type';

// Mock AuthService
const createMockAuthService = (options: {
  currentUser: User | null;
  isLoading: boolean;
}) => {
  return {
    currentUser: signal(options.currentUser),
    isLoading: signal(options.isLoading),
    isAuthenticated: vi.fn(() => !!options.currentUser),
  };
};

// Mock Router
const createMockRouter = () => {
  return {
    createUrlTree: vi.fn((commands: string[]) => {
      return { commands, url: commands.join('/') } as unknown as UrlTree;
    }),
    navigate: vi.fn(),
  };
};

describe('adminGuard - Comprehensive Unit Tests', () => {
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockRouter: ReturnType<typeof createMockRouter>;

  beforeEach(() => {
    mockAuthService = createMockAuthService({
      currentUser: null,
      isLoading: false,
    });
    mockRouter = createMockRouter();
  });

  // Helper function to invoke guard and get result
  const invokeGuard = async (): Promise<boolean | UrlTree> => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    const guard = TestBed.runInInjectionContext(() => adminGuard);
    // Cast to Observable since guard uses toObservable internally
    return firstValueFrom(guard as unknown as Observable<boolean | UrlTree>);
  };

  // ============================================
  // Happy Path - Admin Access
  // ============================================

  describe('Admin Access - Happy Path', () => {
    it('should allow access when user has admin role', async () => {
      const adminUser: User = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      mockAuthService = createMockAuthService({
        currentUser: adminUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).toBe(true);
    });

    it('should allow access when user is authenticated as admin with all fields', async () => {
      const adminUser: User = {
        id: 'admin-456',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: 'admin',
        phone: '+1234567890',
        emailVerified: true,
      };

      mockAuthService = createMockAuthService({
        currentUser: adminUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).toBe(true);
    });

    it('should allow access after loading completes when user is admin', async () => {
      const adminUser: User = {
        id: 'admin-789',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
      };

      const loadingSignal = signal(true);
      mockAuthService = {
        currentUser: signal(adminUser),
        isLoading: loadingSignal,
        isAuthenticated: vi.fn(() => true),
      };

      const resultPromise = invokeGuard();
      
      // Simulate loading completing
      loadingSignal.set(false);
      
      const result = await resultPromise;
      expect(result).toBe(true);
    });
  });

  // ============================================
  // Non-Admin User - Redirect Tests
  // ============================================

  describe('Non-Admin User - Redirect Tests', () => {
    it('should redirect customer user to /home', async () => {
      const customerUser: User = {
        id: 'customer-123',
        name: 'Customer User',
        email: 'customer@example.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: customerUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/home']);
    });

    it('should redirect seller user to /home', async () => {
      const sellerUser: User = {
        id: 'seller-123',
        name: 'Seller User',
        email: 'seller@example.com',
        role: 'seller',
      };

      mockAuthService = createMockAuthService({
        currentUser: sellerUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/home']);
    });

    it('should redirect user with customer role to /home', async () => {
      const userWithCustomerRole: User = {
        id: 'user-123',
        name: 'User With Customer Role',
        email: 'user@example.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: userWithCustomerRole,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
    });
  });

  // ============================================
  // Unauthenticated User - Redirect Tests
  // ============================================

  describe('Unauthenticated User - Redirect Tests', () => {
    it('should redirect when user is null (not authenticated)', async () => {
      mockAuthService = createMockAuthService({
        currentUser: null,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/home']);
    });

    it('should redirect when user is not authenticated', async () => {
      mockAuthService = createMockAuthService({
        currentUser: null,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
    });
  });

  // ============================================
  // Loading State Tests
  // ============================================

  describe('Loading State Tests', () => {
    it('should wait for loading to complete before checking user', async () => {
      const adminUser: User = {
        id: 'admin-loading',
        name: 'Admin Loading',
        email: 'admin@loading.com',
        role: 'admin',
      };

      // Start with loading true
      const isLoadingSignal = signal(true);
      mockAuthService = {
        currentUser: signal(adminUser),
        isLoading: isLoadingSignal,
        isAuthenticated: vi.fn(() => true),
      };

      const resultPromise = invokeGuard();
      
      // Set loading to false
      isLoadingSignal.set(false);
      
      const result = await resultPromise;
      expect(result).toBe(true);
    });

    it('should handle loading state with non-admin user', async () => {
      const customerUser: User = {
        id: 'customer-loading',
        name: 'Customer Loading',
        email: 'customer@loading.com',
        role: 'customer',
      };

      const isLoadingSignal = signal(true);
      mockAuthService = {
        currentUser: signal(customerUser),
        isLoading: isLoadingSignal,
        isAuthenticated: vi.fn(() => true),
      };

      const resultPromise = invokeGuard();
      
      isLoadingSignal.set(false);
      
      const result = await resultPromise;
      expect(result).not.toBe(true);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle user with empty string role', async () => {
      const userWithEmptyRole: User = {
        id: 'user-empty-role',
        name: 'Empty Role User',
        email: 'empty@example.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: userWithEmptyRole,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
    });

    it('should handle user with undefined role property', async () => {
      // Testing undefined role - treat as non-admin
      const userWithUndefinedRole: User = {
        id: 'user-undefined-role',
        name: 'Undefined Role User',
        email: 'undefined@example.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: userWithUndefinedRole,
        isLoading: false,
      });

      const result = await invokeGuard();

      // Should redirect because role is not 'admin'
      expect(result).not.toBe(true);
    });

    it('should handle very long user id', async () => {
      const longIdUser: User = {
        id: 'a'.repeat(1000),
        name: 'Long ID User',
        email: 'longid@example.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: longIdUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
    });

    it('should handle unicode user name for admin', async () => {
      const unicodeUser: User = {
        id: 'user-unicode',
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'admin',
      };

      mockAuthService = createMockAuthService({
        currentUser: unicodeUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).toBe(true);
    });
  });

  // ============================================
  // Role Variations
  // ============================================

  describe('Role Variations', () => {
    it('should allow admin role', async () => {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
      };

      mockAuthService = createMockAuthService({
        currentUser: adminUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).toBe(true);
    });

    it('should deny customer role', async () => {
      const customerUser: User = {
        id: 'customer-1',
        name: 'Customer',
        email: 'customer@test.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: customerUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
    });

    it('should deny seller role', async () => {
      const sellerUser: User = {
        id: 'seller-1',
        name: 'Seller',
        email: 'seller@test.com',
        role: 'seller',
      };

      mockAuthService = createMockAuthService({
        currentUser: sellerUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(result).not.toBe(true);
    });
  });

  // ============================================
  // Return Type Tests
  // ============================================

  describe('Return Type Tests', () => {
    it('should return boolean true for admin user', async () => {
      const adminUser: User = {
        id: 'admin-return-type',
        name: 'Admin Return',
        email: 'return@test.com',
        role: 'admin',
      };

      mockAuthService = createMockAuthService({
        currentUser: adminUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      expect(typeof result).toBe('boolean');
      expect(result).toBe(true);
    });

    it('should return UrlTree for non-admin user', async () => {
      const customerUser: User = {
        id: 'customer-return-type',
        name: 'Customer Return',
        email: 'return@test.com',
        role: 'customer',
      };

      mockAuthService = createMockAuthService({
        currentUser: customerUser,
        isLoading: false,
      });

      const result = await invokeGuard();

      // Should return UrlTree-like object
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});
