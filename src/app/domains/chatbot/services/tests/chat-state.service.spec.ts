import { describe, it, expect } from 'vitest';
import { ChatStateService } from '../chat-state.service';

describe('ChatStateService', () => {
  it('should be created', () => {
    const service = new ChatStateService();
    expect(service).toBeTruthy();
  });

  it('should start with empty messages', () => {
    const service = new ChatStateService();
    expect(service.messages().length).toBe(0);
  });

  it('should start with loading false', () => {
    const service = new ChatStateService();
    expect(service.isLoading()).toBe(false);
  });

  it('should start with chat closed', () => {
    const service = new ChatStateService();
    expect(service.isOpen()).toBe(false);
  });

  it('should add a message', () => {
    const service = new ChatStateService();
    service.addMessage('Hello', 'user');
    
    expect(service.messages().length).toBe(1);
    expect(service.messages()[0].content).toBe('Hello');
    expect(service.messages()[0].sender).toBe('user');
  });

  it('should toggle chat open/close', () => {
    const service = new ChatStateService();
    
    expect(service.isOpen()).toBe(false);
    
    service.toggleChat();
    expect(service.isOpen()).toBe(true);
    
    service.toggleChat();
    expect(service.isOpen()).toBe(false);
  });

  it('should open chat directly', () => {
    const service = new ChatStateService();
    service.openChat();
    expect(service.isOpen()).toBe(true);
  });

  it('should close chat directly', () => {
    const service = new ChatStateService();
    service.openChat();
    service.closeChat();
    expect(service.isOpen()).toBe(false);
  });

  it('should set loading state', () => {
    const service = new ChatStateService();
    
    service.setLoading(true);
    expect(service.isLoading()).toBe(true);
    
    service.setLoading(false);
    expect(service.isLoading()).toBe(false);
  });

  it('should clear history', () => {
    const service = new ChatStateService();
    service.addMessage('First', 'user');
    service.addMessage('Second', 'assistant');
    
    expect(service.messages().length).toBe(2);
    
    service.clearHistory();
    expect(service.messages().length).toBe(0);
    expect(service.conversationId()).toBeNull();
  });

  it('should get recent history with limit', () => {
    const service = new ChatStateService();
    
    for (let i = 0; i < 15; i++) {
      service.addMessage(`Message ${i}`, 'user');
    }
    
    const recent = service.getRecentHistory(10);
    expect(recent.length).toBe(10);
    expect(recent[0].content).toBe('Message 5');
    expect(recent[9].content).toBe('Message 14');
  });

  it('should get all messages if limit exceeds count', () => {
    const service = new ChatStateService();
    service.addMessage('First', 'user');
    service.addMessage('Second', 'user');
    
    const recent = service.getRecentHistory(10);
    expect(recent.length).toBe(2);
  });

  it('should set conversation ID', () => {
    const service = new ChatStateService();
    service.setConversationId('test-id-123');
    expect(service.conversationId()).toBe('test-id-123');
  });
});
