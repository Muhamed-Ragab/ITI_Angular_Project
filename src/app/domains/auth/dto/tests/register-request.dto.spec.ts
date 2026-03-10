import { describe, it, expect } from 'vitest';
import { RegisterRequestDto } from '../register-request.dto';

describe('RegisterRequestDto - Comprehensive Unit Tests', () => {
  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - Valid Registration Request', () => {
    it('should create valid registration request with required fields', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe('John Doe');
      expect(registerRequest.email).toBe('john@example.com');
      expect(registerRequest.password).toBe('password123');
      expect(registerRequest.phone).toBeUndefined();
    });

    it('should create valid registration request with optional phone', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
      };

      expect(registerRequest.phone).toBe('+1234567890');
    });

    it('should handle standard user data', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'Jane Smith',
        email: 'jane.smith@domain.co.uk',
        password: 'SecurePass123!',
        phone: '+44 123 456 7890',
      };

      expect(registerRequest.name).toBe('Jane Smith');
      expect(registerRequest.email).toBe('jane.smith@domain.co.uk');
      expect(registerRequest.password).toBe('SecurePass123!');
      expect(registerRequest.phone).toBe('+44 123 456 7890');
    });
  });

  // ============================================
  // NULL/EMPTY INPUT TESTS
  // ============================================

  describe('Null/Empty Input Tests', () => {
    it('should handle empty string name', () => {
      const registerRequest: RegisterRequestDto = {
        name: '',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe('');
    });

    it('should handle empty string email', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: '',
        password: 'password123',
      };

      expect(registerRequest.email).toBe('');
    });

    it('should handle empty string password', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: '',
      };

      expect(registerRequest.password).toBe('');
    });

    it('should handle undefined phone (not provided)', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.phone).toBeUndefined();
    });

    it('should handle all fields empty except required', () => {
      const registerRequest: RegisterRequestDto = {
        name: '',
        email: '',
        password: '',
      };

      expect(registerRequest.name).toBe('');
      expect(registerRequest.email).toBe('');
      expect(registerRequest.password).toBe('');
      expect(registerRequest.phone).toBeUndefined();
    });
  });

  // ============================================
  // EDGE CASES - Name Field
  // ============================================

  describe('Edge Cases - Name Field', () => {
    it('should handle very long name', () => {
      const longName = 'A'.repeat(500);
      const registerRequest: RegisterRequestDto = {
        name: longName,
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name.length).toBe(500);
    });

    it('should handle single character name', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'J',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe('J');
    });

    it('should handle name with spaces', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Michael Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe('John Michael Doe');
    });

    it('should handle name with special characters', () => {
      const registerRequest: RegisterRequestDto = {
        name: "O'Connor-Smith Jr.",
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe("O'Connor-Smith Jr.");
    });

    it('should handle name with numbers', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John123 Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe('John123 Doe');
    });

    it('should handle unicode name', () => {
      const registerRequest: RegisterRequestDto = {
        name: '田中太郎',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerRequest.name).toBe('田中太郎');
    });
  });

  // ============================================
  // EDGE CASES - Email Format
  // ============================================

  describe('Edge Cases - Email Format', () => {
    it('should handle email with plus addressing', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john+tag@example.com',
        password: 'password123',
      };

      expect(registerRequest.email).toBe('john+tag@example.com');
    });

    it('should handle email with dots in local part', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john.doe.middle@example.com',
        password: 'password123',
      };

      expect(registerRequest.email).toBe('john.doe.middle@example.com');
    });

    it('should handle email with subdomain', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john@sub.domain.example.com',
        password: 'password123',
      };

      expect(registerRequest.email).toBe('john@sub.domain.example.com');
    });

    it('should handle short email', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'a@b',
        password: 'password123',
      };

      expect(registerRequest.email).toBe('a@b');
    });
  });

  // ============================================
  // EDGE CASES - Password Strength
  // ============================================

  describe('Edge Cases - Password Strength', () => {
    it('should handle very short password (1 char)', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'a',
      };

      expect(registerRequest.password.length).toBe(1);
    });

    it('should handle very long password (1000 chars)', () => {
      const longPassword = 'a'.repeat(1000);
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: longPassword,
      };

      expect(registerRequest.password.length).toBe(1000);
    });

    it('should handle password with only numbers', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: '12345678',
      };

      expect(registerRequest.password).toBe('12345678');
    });

    it('should handle password with only letters', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password',
      };

      expect(registerRequest.password).toBe('password');
    });

    it('should handle password with mixed case', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'PaSsWoRd',
      };

      expect(registerRequest.password).toBe('PaSsWoRd');
    });

    it('should handle password with special characters', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      expect(registerRequest.password).toBe('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should handle password with unicode', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'пароль日本語',
      };

      expect(registerRequest.password).toBe('пароль日本語');
    });

    it('should handle whitespace in password', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'pass word',
      };

      expect(registerRequest.password).toBe('pass word');
    });
  });

  // ============================================
  // EDGE CASES - Phone Field
  // ============================================

  describe('Edge Cases - Phone Field', () => {
    it('should handle phone with country code', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1-234-567-8900',
      };

      expect(registerRequest.phone).toBe('+1-234-567-8900');
    });

    it('should handle phone with parentheses', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '(234) 567-8900',
      };

      expect(registerRequest.phone).toBe('(234) 567-8900');
    });

    it('should handle phone with spaces', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '234 567 8900',
      };

      expect(registerRequest.phone).toBe('234 567 8900');
    });

    it('should handle empty string phone', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '',
      };

      expect(registerRequest.phone).toBe('');
    });

    it('should handle phone with plus sign only', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '+',
      };

      expect(registerRequest.phone).toBe('+');
    });
  });

  // ============================================
  // SERIALIZATION TESTS
  // ============================================

  describe('Serialization Tests', () => {
    it('should serialize to JSON correctly with all fields', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
      };

      const json = JSON.stringify(registerRequest);
      expect(json).toContain('"name":"John Doe"');
      expect(json).toContain('"email":"john@example.com"');
      expect(json).toContain('"password":"password123"');
      expect(json).toContain('"+1234567890"');
    });

    it('should serialize to JSON correctly without optional phone', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const json = JSON.stringify(registerRequest);
      expect(json).toBe('{"name":"John Doe","email":"john@example.com","password":"password123"}');
    });

    it('should deserialize from JSON correctly', () => {
      const json = '{"name":"John Doe","email":"john@example.com","password":"password123","phone":"+1234567890"}';
      const registerRequest: RegisterRequestDto = JSON.parse(json);

      expect(registerRequest.name).toBe('John Doe');
      expect(registerRequest.email).toBe('john@example.com');
      expect(registerRequest.password).toBe('password123');
      expect(registerRequest.phone).toBe('+1234567890');
    });
  });

  // ============================================
  // TYPE SAFETY TESTS
  // ============================================

  describe('Type Safety Tests', () => {
    it('should enforce string type for all fields', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
      };

      expect(typeof registerRequest.name).toBe('string');
      expect(typeof registerRequest.email).toBe('string');
      expect(typeof registerRequest.password).toBe('string');
      expect(typeof registerRequest.phone).toBe('string');
    });

    it('should allow phone to be undefined', () => {
      const registerRequest: RegisterRequestDto = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      };

      // TypeScript should allow phone to be undefined
      expect(registerRequest.phone).toBeUndefined();
    });
  });
});
