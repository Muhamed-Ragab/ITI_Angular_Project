import { Injectable } from '@angular/core';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { environment } from '@env/environment';
import { ChatMessage } from '@domains/chatbot/models/chat-message.model';
import { DEFAULT_CHATBOT_CONFIG } from '@domains/chatbot/models/chat-config.model';

@Injectable({ providedIn: 'root' })
export class GeminiApiService {
  private readonly apiKey = environment.geminiApiKey;
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;

  private initClient(): void {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add it to environment.ts');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: DEFAULT_CHATBOT_CONFIG.modelName,
      systemInstruction: DEFAULT_CHATBOT_CONFIG.systemInstruction,
    });
  }

  async generateContent(prompt: string, history: ChatMessage[]): Promise<string> {
    if (!this.model) {
      this.initClient();
    }
    if (!this.model) {
      throw new Error('Gemini model not initialized');
    }

    const formattedHistory = history
      .filter((msg) => msg.sender !== 'system')
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    const chat = this.model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateContentWithRetry(prompt: string, history: ChatMessage[]): Promise<string> {
    let lastError: Error | null = null;
    let delay = DEFAULT_CHATBOT_CONFIG.retryDelay;

    for (let attempt = 0; attempt < DEFAULT_CHATBOT_CONFIG.maxRetries; attempt++) {
      try {
        return await this.generateContent(prompt, history);
      } catch (error) {
        lastError = error as Error;
        if (lastError.message.includes('API key')) {
          throw lastError;
        }
        await this.sleep(delay);
        delay *= 2;
      }
    }
    throw lastError || new Error('Failed to generate content');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
