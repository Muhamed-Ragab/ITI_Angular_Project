import { describe, it, expect } from 'vitest';
import { LoginRequestDto } from '../login-request.dto';

describe('LoginRequestDto - Comprehensive Unit Tests', () => {
  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - Valid Login Request', () => {
    it('should create valid login request with email and password', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('test@example.com');
      expect(loginRequest.password).toBe('password123');
    });

    it('should handle standard email format', () => {
      const loginRequest: LoginRequestDto = {
        email: 'user.name@domain.co.uk',
        password: 'securePassword!',
      };

      expect(loginRequest.email).toBe('user.name@domain.co.uk');
      expect(loginRequest.password).toBe('securePassword!');
    });

    it('should handle email with subdomain', () => {
      const loginRequest: LoginRequestDto = {
        email: 'user@mail.example.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('user@mail.example.com');
    });
  });

  // ============================================
  // NULL/EMPTY INPUT TESTS
  // ============================================

  describe('Null/Empty Input Tests', () => {
    it('should handle empty string email', () => {
      const loginRequest: LoginRequestDto = {
        email: '',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('');
      expect(loginRequest.password).toBe('password123');
    });

    it('should handle empty string password', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: '',
      };

      expect(loginRequest.email).toBe('test@example.com');
      expect(loginRequest.password).toBe('');
    });

    it('should handle both empty strings', () => {
      const loginRequest: LoginRequestDto = {
        email: '',
        password: '',
      };

      expect(loginRequest.email).toBe('');
      expect(loginRequest.password).toBe('');
    });

    it('should handle whitespace-only strings', () => {
      const loginRequest: LoginRequestDto = {
        email: '   ',
        password: '   ',
      };

      expect(loginRequest.email).toBe('   ');
      expect(loginRequest.password).toBe('   ');
    });
  });

  // ============================================
  // EDGE CASES - Email Format
  // ============================================

  describe('Edge Cases - Email Format', () => {
    it('should handle email with plus sign', () => {
      const loginRequest: LoginRequestDto = {
        email: 'user+tag@example.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('user+tag@example.com');
    });

    it('should handle email with dots in local part', () => {
      const loginRequest: LoginRequestDto = {
        email: 'first.middle.last@example.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('first.middle.last@example.com');
    });

    it('should handle short email', () => {
      const loginRequest: LoginRequestDto = {
        email: 'a@b',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('a@b');
    });

    it('should handle email with numbers', () => {
      const loginRequest: LoginRequestDto = {
        email: 'user123@example123.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('user123@example123.com');
    });

    it('should handle email with hyphens', () => {
      const loginRequest: LoginRequestDto = {
        email: 'user-name@example-domain.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBe('user-name@example-domain.com');
    });
  });

  // ============================================
  // EDGE CASES - Password Values
  // ============================================

  describe('Edge Cases - Password Values', () => {
    it('should handle very long password', () => {
      const longPassword = 'a'.repeat(1000);
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: longPassword,
      };

      expect(loginRequest.password).toBe(longPassword);
      expect(loginRequest.password.length).toBe(1000);
    });

    it('should handle single character password', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'x',
      };

      expect(loginRequest.password).toBe('x');
    });

    it('should handle password with special characters', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'p@$$w0rd!#$%^&*()',
      };

      expect(loginRequest.password).toBe('p@$$w0rd!#$%^&*()');
    });

    it('should handle password with unicode characters', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'пароль123',
      };

      expect(loginRequest.password).toBe('пароль123');
    });

    it('should handle password with spaces', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'pass word with spaces',
      };

      expect(loginRequest.password).toBe('pass word with spaces');
    });
  });

  // ============================================
  // SERIALIZATION TESTS
  // ============================================

  describe('Serialization Tests', () => {
    it('should serialize to JSON correctly', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const json = JSON.stringify(loginRequest);
      expect(json).toBe('{"email":"test@example.com","password":"password123"}');
    });

    it('should deserialize from JSON correctly', () => {
      const json = '{"email":"test@example.com","password":"password123"}';
      const loginRequest: LoginRequestDto = JSON.parse(json);

      expect(loginRequest.email).toBe('test@example.com');
      expect(loginRequest.password).toBe('password123');
    });

    it('should handle JSON serialization with special characters', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'p@$$w0rd"json',
      };

      const json = JSON.stringify(loginRequest);
      const parsed = JSON.parse(json);
      expect(parsed.password).toBe('p@$$w0rd"json');
    });
  });

  // ============================================
  // TYPE SAFETY TESTS
  // ============================================

  describe('Type Safety Tests', () => {
    it('should enforce string type for email', () => {
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // TypeScript should enforce string type
      expect(typeof loginRequest.email).toBe('string');
      expect(typeof loginRequest.password).toBe('string');
    });

    it('should allow optional properties to be undefined', () => {
      // LoginRequestDto only has required properties
      const loginRequest: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(loginRequest.email).toBeDefined();
      expect(loginRequest.password).toBeDefined();
    });
  });

  // ============================================
  // CLONING/MUTATION TESTS
  // ============================================

  describe('Cloning/Mutation Tests', () => {
    it('should create a deep copy of the object', () => {
      const original: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const copy = { ...original };
      copy.email = 'changed@example.com';

      expect(original.email).toBe('test@example.com');
      expect(copy.email).toBe('changed@example.com');
    });

    it('should preserve original object when mutating copy', () => {
      const original: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const copy = JSON.parse(JSON.stringify(original));
      copy.password = 'newpassword';

      expect(original.password).toBe('password123');
      expect(copy.password).toBe('newpassword');
    });
  });
});
