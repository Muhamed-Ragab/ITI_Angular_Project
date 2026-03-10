import { describe, it, expect } from 'vitest';
import { EmailOtpRequestDto } from '../email-otp-request.dto';
import { EmailOtpLoginRequestDto } from '../email-otp-login-request.dto';
import { GoogleOAuthRequestDto } from '../google-oauth-request.dto';
import { VerifyEmailRequestDto } from '../verify-email-request.dto';
import { RegisterResponseDto } from '../register-response.dto';
import { SuccessResponseDto } from '../success-response.dto';

describe('Other DTOs - Comprehensive Unit Tests', () => {
  // ============================================
  // EmailOtpRequestDto Tests
  // ============================================

  describe('EmailOtpRequestDto', () => {
    it('should create valid OTP request', () => {
      const request: EmailOtpRequestDto = {
        email: 'test@example.com',
      };

      expect(request.email).toBe('test@example.com');
    });

    it('should handle empty email', () => {
      const request: EmailOtpRequestDto = {
        email: '',
      };

      expect(request.email).toBe('');
    });

    it('should handle various email formats', () => {
      const emails = [
        'user@example.com',
        'user+tag@example.com',
        'a@b',
        'user@sub.domain.com',
      ];

      emails.forEach((email) => {
        const request: EmailOtpRequestDto = { email };
        expect(request.email).toBe(email);
      });
    });
  });

  // ============================================
  // EmailOtpLoginRequestDto Tests
  // ============================================

  describe('EmailOtpLoginRequestDto', () => {
    it('should create valid OTP login request', () => {
      const request: EmailOtpLoginRequestDto = {
        email: 'test@example.com',
        otp: '123456',
      };

      expect(request.email).toBe('test@example.com');
      expect(request.otp).toBe('123456');
    });

    it('should handle empty OTP', () => {
      const request: EmailOtpLoginRequestDto = {
        email: 'test@example.com',
        otp: '',
      };

      expect(request.otp).toBe('');
    });

    it('should handle various OTP formats', () => {
      const request: EmailOtpLoginRequestDto = {
        email: 'test@example.com',
        otp: '000000',
      };

      expect(request.otp.length).toBe(6);
    });

    it('should handle long OTP', () => {
      const request: EmailOtpLoginRequestDto = {
        email: 'test@example.com',
        otp: '1234567890'.slice(0, 6), // Max 6 characters
      };

      expect(request.otp.length).toBe(6);
    });
  });

  // ============================================
  // GoogleOAuthRequestDto Tests
  // ============================================

  describe('GoogleOAuthRequestDto', () => {
    it('should create valid Google OAuth request', () => {
      const request: GoogleOAuthRequestDto = {
        code: 'google-auth-code',
      };

      expect(request.code).toBe('google-auth-code');
    });

    it('should handle empty code', () => {
      const request: GoogleOAuthRequestDto = {
        code: '',
      };

      expect(request.code).toBe('');
    });

    it('should handle long authorization code', () => {
      const longCode = 'a'.repeat(2000);
      const request: GoogleOAuthRequestDto = {
        code: longCode,
      };

      expect(request.code.length).toBe(2000);
    });

    it('should handle code with special characters', () => {
      const request: GoogleOAuthRequestDto = {
        code: 'code/with=special&chars',
      };

      expect(request.code).toBe('code/with=special&chars');
    });
  });

  // ============================================
  // VerifyEmailRequestDto Tests
  // ============================================

  describe('VerifyEmailRequestDto', () => {
    it('should create valid verify email request', () => {
      const request: VerifyEmailRequestDto = {
        token: 'verification-token-abc123',
      };

      expect(request.token).toBe('verification-token-abc123');
    });

    it('should handle empty token', () => {
      const request: VerifyEmailRequestDto = {
        token: '',
      };

      expect(request.token).toBe('');
    });

    it('should handle JWT token format', () => {
      const request: VerifyEmailRequestDto = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature',
      };

      expect(request.token.split('.').length).toBe(3);
    });

    it('should handle UUID token', () => {
      const request: VerifyEmailRequestDto = {
        token: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(request.token).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  // ============================================
  // RegisterResponseDto Tests
  // ============================================

  describe('RegisterResponseDto', () => {
    it('should create valid registration response', () => {
      const response: RegisterResponseDto = {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            _id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
            isEmailVerified: false,
          },
          requiresEmailVerification: true,
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.user._id).toBe('user-123');
      expect(response.data.requiresEmailVerification).toBe(true);
    });

    it('should handle user without optional fields', () => {
      const response: RegisterResponseDto = {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            _id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
          },
          requiresEmailVerification: false,
        },
      };

      expect(response.data.user.isEmailVerified).toBeUndefined();
    });

    it('should handle response with verification token', () => {
      const response: RegisterResponseDto = {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            _id: 'user-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'customer',
            emailVerificationTokenHash: 'hash123',
            emailVerificationTokenExpiresAt: '2024-12-31T23:59:59Z',
          },
          requiresEmailVerification: true,
        },
      };

      expect(response.data.user.emailVerificationTokenHash).toBeDefined();
      expect(response.data.user.emailVerificationTokenExpiresAt).toBeDefined();
    });
  });

  // ============================================
  // SuccessResponseDto Tests
  // ============================================

  describe('SuccessResponseDto', () => {
    it('should create valid success response with string data', () => {
      const response: SuccessResponseDto<string> = {
        success: true,
        data: 'Operation completed',
        message: 'Success',
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe('Operation completed');
    });

    it('should create valid success response with object data', () => {
      const response: SuccessResponseDto<{ id: string }> = {
        success: true,
        data: { id: '123' },
        message: 'Success',
      };

      expect(response.data.id).toBe('123');
    });

    it('should create valid success response with array data', () => {
      const response: SuccessResponseDto<string[]> = {
        success: true,
        data: ['item1', 'item2'],
        message: 'Success',
      };

      expect(response.data).toHaveLength(2);
    });

    it('should create valid success response with null data', () => {
      const response: SuccessResponseDto<null> = {
        success: true,
        data: null,
        message: 'Success',
      };

      expect(response.data).toBeNull();
    });

    it('should create valid success response with undefined data', () => {
      const response: SuccessResponseDto<undefined> = {
        success: true,
        data: undefined,
        message: 'Success',
      };

      expect(response.data).toBeUndefined();
    });

    it('should create valid success response with complex nested object', () => {
      const response: SuccessResponseDto<{ user: { name: string }; token: string }> = {
        success: true,
        data: {
          user: { name: 'John' },
          token: 'abc123',
        },
        message: 'Success',
      };

      expect(response.data.user.name).toBe('John');
      expect(response.data.token).toBe('abc123');
    });
  });

  // ============================================
  // Serialization Tests for All DTOs
  // ============================================

  describe('Serialization Tests', () => {
    it('should serialize and deserialize EmailOtpRequestDto', () => {
      const request: EmailOtpRequestDto = { email: 'test@example.com' };
      const json = JSON.stringify(request);
      const parsed = JSON.parse(json);
      expect(parsed.email).toBe('test@example.com');
    });

    it('should serialize and deserialize EmailOtpLoginRequestDto', () => {
      const request: EmailOtpLoginRequestDto = { email: 'test@example.com', otp: '123456' };
      const json = JSON.stringify(request);
      const parsed = JSON.parse(json);
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.otp).toBe('123456');
    });

    it('should serialize and deserialize GoogleOAuthRequestDto', () => {
      const request: GoogleOAuthRequestDto = { code: 'auth-code' };
      const json = JSON.stringify(request);
      const parsed = JSON.parse(json);
      expect(parsed.code).toBe('auth-code');
    });

    it('should serialize and deserialize VerifyEmailRequestDto', () => {
      const request: VerifyEmailRequestDto = { token: 'token-123' };
      const json = JSON.stringify(request);
      const parsed = JSON.parse(json);
      expect(parsed.token).toBe('token-123');
    });

    it('should serialize and deserialize RegisterResponseDto', () => {
      const response: RegisterResponseDto = {
        success: true,
        message: 'Success',
        data: {
          user: { _id: '123', name: 'John', email: 'john@example.com', role: 'customer' },
          requiresEmailVerification: true,
        },
      };
      const json = JSON.stringify(response);
      const parsed = JSON.parse(json);
      expect(parsed.success).toBe(true);
      expect(parsed.data.user._id).toBe('123');
    });

    it('should serialize and deserialize SuccessResponseDto', () => {
      const response: SuccessResponseDto<{ id: string }> = {
        success: true,
        data: { id: '123' },
        message: 'Success',
      };
      const json = JSON.stringify(response);
      const parsed = JSON.parse(json);
      expect(parsed.success).toBe(true);
      expect(parsed.data.id).toBe('123');
    });
  });
});
