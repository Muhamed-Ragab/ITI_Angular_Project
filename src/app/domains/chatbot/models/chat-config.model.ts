/**
 * Chatbot configuration interface
 */
export interface ChatbotConfig {
  maxHistoryLength: number;
  modelName: string;
  systemInstruction: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export const DEFAULT_CHATBOT_CONFIG: ChatbotConfig = {
  maxHistoryLength: 10,
  modelName: 'gemini-2.5-flash',
  systemInstruction: 'You are a helpful customer support assistant for an e-commerce platform.',
  timeout: 30000,
  maxRetries: 2,
  retryDelay: 1000,
};
