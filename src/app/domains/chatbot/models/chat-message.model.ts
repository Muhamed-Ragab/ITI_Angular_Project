/**
 * Message sender type
 */
export type MessageSender = 'user' | 'assistant' | 'system';

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  type: 'text' | 'error' | 'info';
}

/**
 * Create a new chat message with auto-generated ID and timestamp
 */
export function createChatMessage(
  content: string,
  sender: MessageSender,
  type: 'text' | 'error' | 'info' = 'text',
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    content,
    sender,
    timestamp: new Date(),
    type,
  };
}
