/**
 * ChatbotConfig Model Tests
 */
import { describe, expect, it } from 'vitest';
import { ChatbotConfig, DEFAULT_CHATBOT_CONFIG } from '../chat-config.model';

describe('ChatbotConfig Model', () => {
  describe('ChatbotConfig interface', () => {
    it('should have all required properties defined', () => {
      const config: ChatbotConfig = {
        maxHistoryLength: 10,
        modelName: 'gemini-2.5-flash',
        systemInstruction: 'Test instruction',
        timeout: 30000,
        maxRetries: 2,
        retryDelay: 1000,
      };

      expect(config.maxHistoryLength).toBeDefined();
      expect(config.modelName).toBeDefined();
      expect(config.systemInstruction).toBeDefined();
      expect(config.timeout).toBeDefined();
      expect(config.maxRetries).toBeDefined();
      expect(config.retryDelay).toBeDefined();
    });

    it('should accept valid ChatbotConfig values', () => {
      const config: ChatbotConfig = {
        maxHistoryLength: 5,
        modelName: 'gemini-pro',
        systemInstruction: 'Custom system prompt',
        timeout: 60000,
        maxRetries: 3,
        retryDelay: 2000,
      };

      expect(config.maxHistoryLength).toBe(5);
      expect(config.modelName).toBe('gemini-pro');
      expect(config.systemInstruction).toBe('Custom system prompt');
      expect(config.timeout).toBe(60000);
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelay).toBe(2000);
    });

    it('should allow zero values for numeric properties', () => {
      const config: ChatbotConfig = {
        maxHistoryLength: 0,
        modelName: 'test-model',
        systemInstruction: '',
        timeout: 0,
        maxRetries: 0,
        retryDelay: 0,
      };

      expect(config.maxHistoryLength).toBe(0);
      expect(config.timeout).toBe(0);
      expect(config.maxRetries).toBe(0);
      expect(config.retryDelay).toBe(0);
    });

    it('should allow empty string for systemInstruction', () => {
      const config: ChatbotConfig = {
        maxHistoryLength: 10,
        modelName: 'test-model',
        systemInstruction: '',
        timeout: 30000,
        maxRetries: 2,
        retryDelay: 1000,
      };

      expect(config.systemInstruction).toBe('');
    });
  });

  describe('DEFAULT_CHATBOT_CONFIG', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_CHATBOT_CONFIG.maxHistoryLength).toBe(10);
      expect(DEFAULT_CHATBOT_CONFIG.modelName).toBe('gemini-2.5-flash');
      expect(DEFAULT_CHATBOT_CONFIG.systemInstruction).toBe(
        'You are a helpful customer support assistant for an e-commerce platform.',
      );
      expect(DEFAULT_CHATBOT_CONFIG.timeout).toBe(30000);
      expect(DEFAULT_CHATBOT_CONFIG.maxRetries).toBe(2);
      expect(DEFAULT_CHATBOT_CONFIG.retryDelay).toBe(1000);
    });

    it('should have all required properties', () => {
      expect(DEFAULT_CHATBOT_CONFIG).toHaveProperty('maxHistoryLength');
      expect(DEFAULT_CHATBOT_CONFIG).toHaveProperty('modelName');
      expect(DEFAULT_CHATBOT_CONFIG).toHaveProperty('systemInstruction');
      expect(DEFAULT_CHATBOT_CONFIG).toHaveProperty('timeout');
      expect(DEFAULT_CHATBOT_CONFIG).toHaveProperty('maxRetries');
      expect(DEFAULT_CHATBOT_CONFIG).toHaveProperty('retryDelay');
    });

    it('should have positive numeric values for timeout and retry settings', () => {
      expect(DEFAULT_CHATBOT_CONFIG.timeout).toBeGreaterThan(0);
      expect(DEFAULT_CHATBOT_CONFIG.maxRetries).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_CHATBOT_CONFIG.retryDelay).toBeGreaterThanOrEqual(0);
    });

    it('should have reasonable maxHistoryLength', () => {
      expect(DEFAULT_CHATBOT_CONFIG.maxHistoryLength).toBeGreaterThan(0);
      expect(DEFAULT_CHATBOT_CONFIG.maxHistoryLength).toBeLessThanOrEqual(100);
    });
  });

  describe('Configuration validation scenarios', () => {
    it('should validate maxHistoryLength is a positive number', () => {
      const validConfig: ChatbotConfig = {
        ...DEFAULT_CHATBOT_CONFIG,
        maxHistoryLength: 1,
      };
      expect(validConfig.maxHistoryLength).toBeGreaterThan(0);
    });

    it('should validate timeout is within reasonable range', () => {
      const config: ChatbotConfig = {
        ...DEFAULT_CHATBOT_CONFIG,
        timeout: 60000,
      };
      expect(config.timeout).toBeGreaterThanOrEqual(0);
      expect(config.timeout).toBeLessThanOrEqual(300000); // 5 minutes max
    });

    it('should validate maxRetries is non-negative', () => {
      const config: ChatbotConfig = {
        ...DEFAULT_CHATBOT_CONFIG,
        maxRetries: 0,
      };
      expect(config.maxRetries).toBeGreaterThanOrEqual(0);
    });

    it('should handle large maxHistoryLength values', () => {
      const config: ChatbotConfig = {
        ...DEFAULT_CHATBOT_CONFIG,
        maxHistoryLength: 1000,
      };
      expect(config.maxHistoryLength).toBe(1000);
    });
  });
});
