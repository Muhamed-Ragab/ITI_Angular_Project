/**
 * ChatbotMessage Model Tests
 */
import { describe, it, expect } from 'vitest';
import { createChatMessage, type MessageSender, type ChatMessage } from '../chat-message.model';

describe('ChatMessage Model', () => {
  describe('createChatMessage', () => {
    it('should create a message with user sender', () => {
      const message = createChatMessage('Hello', 'user');
      
      expect(message.id).toBeDefined();
      expect(message.content).toBe('Hello');
      expect(message.sender).toBe('user');
      expect(message.type).toBe('text');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should create a message with assistant sender', () => {
      const message = createChatMessage('Hi there!', 'assistant');
      
      expect(message.sender).toBe('assistant');
      expect(message.content).toBe('Hi there!');
    });

    it('should create a message with system sender and error type', () => {
      const message = createChatMessage('Error occurred', 'system', 'error');
      
      expect(message.sender).toBe('system');
      expect(message.type).toBe('error');
    });

    it('should create a message with info type', () => {
      const message = createChatMessage('Welcome!', 'system', 'info');
      
      expect(message.type).toBe('info');
    });

    it('should generate unique IDs for each message', () => {
      const message1 = createChatMessage('First', 'user');
      const message2 = createChatMessage('Second', 'user');
      
      expect(message1.id).not.toBe(message2.id);
    });

    it('should create messages with current timestamp', () => {
      const before = Date.now();
      const message = createChatMessage('Test', 'user');
      const after = Date.now();
      
      const messageTime = message.timestamp.getTime();
      expect(messageTime).toBeGreaterThanOrEqual(before);
      expect(messageTime).toBeLessThanOrEqual(after);
    });

    // Enhanced edge cases below
    
    it('should create message with empty content', () => {
      const message = createChatMessage('', 'user');
      
      expect(message.content).toBe('');
      expect(message.sender).toBe('user');
      expect(message.type).toBe('text');
    });

    it('should create message with very long content', () => {
      const longContent = 'A'.repeat(10000);
      const message = createChatMessage(longContent, 'user');
      
      expect(message.content).toBe(longContent);
      expect(message.content.length).toBe(10000);
    });

    it('should create message with special characters in content', () => {
      const specialContent = 'Hello <script>alert("xss")</script> & "quoted" \n\t\r';
      const message = createChatMessage(specialContent, 'user');
      
      expect(message.content).toBe(specialContent);
    });

    it('should create message with unicode characters', () => {
      const unicodeContent = 'Hello 你好 مرحبا 🌍🔥';
      const message = createChatMessage(unicodeContent, 'assistant');
      
      expect(message.content).toBe(unicodeContent);
    });

    it('should create message with emoji content', () => {
      const emojiContent = '👋😊🎉';
      const message = createChatMessage(emojiContent, 'assistant');
      
      expect(message.content).toBe(emojiContent);
    });

    it('should create message with all sender types', () => {
      const userMessage = createChatMessage('User msg', 'user');
      const assistantMessage = createChatMessage('Assistant msg', 'assistant');
      const systemMessage = createChatMessage('System msg', 'system');
      
      expect(userMessage.sender).toBe('user');
      expect(assistantMessage.sender).toBe('assistant');
      expect(systemMessage.sender).toBe('system');
    });

    it('should create message with all type variations', () => {
      const textMessage = createChatMessage('Text', 'user', 'text');
      const errorMessage = createChatMessage('Error', 'system', 'error');
      const infoMessage = createChatMessage('Info', 'system', 'info');
      
      expect(textMessage.type).toBe('text');
      expect(errorMessage.type).toBe('error');
      expect(infoMessage.type).toBe('info');
    });

    it('should default to text type when not specified', () => {
      const message = createChatMessage('Test', 'user');
      
      expect(message.type).toBe('text');
    });

    it('should allow explicit text type', () => {
      const message = createChatMessage('Test', 'user', 'text');
      
      expect(message.type).toBe('text');
    });

    it('should create message with multiline content', () => {
      const multilineContent = 'Line 1\nLine 2\r\nLine 3';
      const message = createChatMessage(multilineContent, 'assistant');
      
      expect(message.content).toBe(multilineContent);
      expect(message.content).toContain('\n');
    });

    it('should create message with JSON-like content', () => {
      const jsonContent = '{"key": "value", "nested": {"a": 1}}';
      const message = createChatMessage(jsonContent, 'assistant');
      
      expect(message.content).toBe(jsonContent);
    });

    it('should create message with HTML content', () => {
      const htmlContent = '<div><p>Hello</p></div>';
      const message = createChatMessage(htmlContent, 'assistant');
      
      expect(message.content).toBe(htmlContent);
    });

    it('should create message with leading/trailing whitespace', () => {
      const whitespaceContent = '   trimmed   ';
      const message = createChatMessage(whitespaceContent, 'user');
      
      expect(message.content).toBe(whitespaceContent);
    });

    it('should create message with only whitespace', () => {
      const whitespaceOnly = '   \n\t  ';
      const message = createChatMessage(whitespaceOnly, 'user');
      
      expect(message.content).toBe(whitespaceOnly);
    });

    it('should create message with newline characters', () => {
      const newlineContent = '\n\n\n';
      const message = createChatMessage(newlineContent, 'user');
      
      expect(message.content).toBe(newlineContent);
    });

    it('should create ChatMessage interface with all properties', () => {
      const timestamp = new Date();
      const message: ChatMessage = {
        id: 'test-id',
        content: 'Test content',
        sender: 'user' as MessageSender,
        timestamp: timestamp,
        type: 'text',
      };
      
      expect(message.id).toBe('test-id');
      expect(message.content).toBe('Test content');
      expect(message.sender).toBe('user');
      expect(message.timestamp).toBe(timestamp);
      expect(message.type).toBe('text');
    });

    it('should handle MessageSender type correctly', () => {
      const validSenders: MessageSender[] = ['user', 'assistant', 'system'];
      
      validSenders.forEach(sender => {
        const message = createChatMessage('Test', sender);
        expect(message.sender).toBe(sender);
      });
    });

    it('should preserve timestamp as Date object', () => {
      const message = createChatMessage('Test', 'user');
      
      expect(message.timestamp).toBeInstanceOf(Date);
      expect(typeof message.timestamp.getTime()).toBe('number');
    });

    it('should generate valid UUID format', () => {
      const message = createChatMessage('Test', 'user');
      
      // UUID v4 format check
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(message.id).toMatch(uuidRegex);
    });
  });
});
