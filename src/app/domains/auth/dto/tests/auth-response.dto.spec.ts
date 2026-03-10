import { describe, it, expect } from 'vitest';
import { AuthResponseDto } from '../auth-response.dto';
import { User } from '../../types/user.type';

describe('AuthResponseDto - Comprehensive Unit Tests', () => {
  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - Valid Auth Response', () => {
    it('should create valid auth response', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token-xyz',
        },
      };

      expect(authResponse.success).toBe(true);
      expect(authResponse.message).toBe('Login successful');
      expect(authResponse.data.user.id).toBe('user-123');
      expect(authResponse.data.token).toBe('jwt-token-xyz');
    });

    it('should handle admin role', () => {
      const mockUser: User = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'admin-jwt-token',
        },
      };

      expect(authResponse.data.user.role).toBe('admin');
    });

    it('should handle seller role', () => {
      const mockUser: User = {
        id: 'seller-123',
        name: 'Seller User',
        email: 'seller@example.com',
        role: 'seller',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'seller-jwt-token',
        },
      };

      expect(authResponse.data.user.role).toBe('seller');
    });

    it('should handle user with optional fields', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
        phone: '+1234567890',
        emailVerified: true,
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token-xyz',
        },
      };

      expect(authResponse.data.user.phone).toBe('+1234567890');
      expect(authResponse.data.user.emailVerified).toBe(true);
    });
  });

  // ============================================
  // EDGE CASES - Token Values
  // ============================================

  describe('Edge Cases - Token Values', () => {
    it('should handle JWT token format', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature';
      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: jwtToken,
        },
      };

      expect(authResponse.data.token).toBe(jwtToken);
      expect(authResponse.data.token.split('.').length).toBe(3);
    });

    it('should handle very long token', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const longToken = 'a'.repeat(10000);
      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: longToken,
        },
      };

      expect(authResponse.data.token.length).toBe(10000);
    });

    it('should handle single character token', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'x',
        },
      };

      expect(authResponse.data.token).toBe('x');
    });

    it('should handle token with special characters', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'token!@#$%^&*()',
        },
      };

      expect(authResponse.data.token).toBe('token!@#$%^&*()');
    });
  });

  // ============================================
  // EDGE CASES - User Object
  // ============================================

  describe('Edge Cases - User Object', () => {
    it('should handle user with all optional fields', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
        phone: '+1234567890',
        emailVerified: true,
        addresses: [
          {
            _id: 'addr-1',
            street: '123 Main St',
            city: 'New York',
            country: 'USA',
            zip: '10001',
            isDefault: true,
          },
        ],
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.data.user.addresses?.length).toBe(1);
      expect(authResponse.data.user.addresses?.[0].city).toBe('New York');
    });

    it('should handle user without optional fields', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.data.user.phone).toBeUndefined();
      expect(authResponse.data.user.emailVerified).toBeUndefined();
      expect(authResponse.data.user.addresses).toBeUndefined();
    });

    it('should handle user with very long id', () => {
      const mockUser: User = {
        id: 'a'.repeat(500),
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.data.user.id.length).toBe(500);
    });

    it('should handle user with unicode name', () => {
      const mockUser: User = {
        id: 'user-123',
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.data.user.name).toBe('田中太郎');
    });
  });

  // ============================================
  // EDGE CASES - Message Field
  // ============================================

  describe('Edge Cases - Message Field', () => {
    it('should handle empty message', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: '',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.message).toBe('');
    });

    it('should handle very long message', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const longMessage = 'a'.repeat(10000);
      const authResponse: AuthResponseDto = {
        success: true,
        message: longMessage,
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.message.length).toBe(10000);
    });

    it('should handle message with special characters', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful! Welcome, @john!',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.message).toBe('Login successful! Welcome, @john!');
    });
  });

  // ============================================
  // TOKEN PARSING TESTS
  // ============================================

  describe('Token Parsing Tests', () => {
    it('should parse JWT token structure', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: jwtToken,
        },
      };

      const parts = authResponse.data.token.split('.');
      expect(parts.length).toBe(3);
      // Header
      expect(atob(parts[0])).toContain('HS256');
    });

    it('should handle non-JWT token', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'simple-api-key-token',
        },
      };

      expect(authResponse.data.token).toBe('simple-api-key-token');
    });
  });

  // ============================================
  // SERIALIZATION TESTS
  // ============================================

  describe('Serialization Tests', () => {
    it('should serialize to JSON correctly', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      const json = JSON.stringify(authResponse);
      const parsed = JSON.parse(json);

      expect(parsed.success).toBe(true);
      expect(parsed.message).toBe('Login successful');
      expect(parsed.data.user.id).toBe('user-123');
      expect(parsed.data.token).toBe('jwt-token');
    });

    it('should deserialize from JSON correctly', () => {
      const json = JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
          },
          token: 'jwt-token',
        },
      });

      const authResponse: AuthResponseDto = JSON.parse(json);

      expect(authResponse.success).toBe(true);
      expect(authResponse.data.user.name).toBe('John Doe');
      expect(authResponse.data.token).toBe('jwt-token');
    });
  });

  // ============================================
  // TYPE SAFETY TESTS
  // ============================================

  describe('Type Safety Tests', () => {
    it('should enforce success as true', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.success).toBe(true);
    });

    it('should enforce User type for user object', () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'customer',
      };

      const authResponse: AuthResponseDto = {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: 'jwt-token',
        },
      };

      expect(authResponse.data.user.role).toMatch(/customer|seller|admin/);
    });
  });
});
