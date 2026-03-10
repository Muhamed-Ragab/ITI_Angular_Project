import { Injectable, inject } from '@angular/core';
import { GeminiApiService } from '../../../core/services/gemini/gemini-api.service';
import { Observable, of } from 'rxjs';
import { DEFAULT_CHATBOT_CONFIG } from '../models/chat-config.model';
import { ChatStateService } from './chat-state.service';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly geminiApiService = inject(GeminiApiService);
  private readonly chatStateService = inject(ChatStateService);

  readonly messages = this.chatStateService.messages;
  readonly isLoading = this.chatStateService.isLoading;
  readonly isOpen = this.chatStateService.isOpen;

  sendMessage(message: string): Observable<boolean> {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return of(false);
    }

    // Add user message
    this.chatStateService.addMessage(trimmedMessage, 'user');
    this.chatStateService.setLoading(true);

    // Get recent history for context
    const history = this.chatStateService.getRecentHistory(
      DEFAULT_CHATBOT_CONFIG.maxHistoryLength - 1,
    );

    // Call Gemini API
    return new Observable<boolean>((observer) => {
      this.geminiApiService
        .generateContentWithRetry(trimmedMessage, history)
        .then((response) => {
          this.chatStateService.addMessage(response, 'assistant');
          observer.next(true);
          observer.complete();
        })
        .catch((error) => {
          const rawMessage =
            error && typeof error === 'object' && 'message' in error
              ? String((error as Error).message)
              : '';
          const errorMessage = rawMessage.includes('API key')
            ? 'API key not configured. Please add your Gemini API key to environment.ts'
            : rawMessage.toLowerCase().includes('model')
              ? 'Chat model is unavailable. Please update the model name in chat-config.model.ts'
              : 'Sorry, I encountered an error. Please try again.';

          console.error('Chatbot error:', error);
          this.chatStateService.addMessage(errorMessage, 'system', 'error');
          observer.next(false);
          observer.complete();
        })
        .finally(() => {
          this.chatStateService.setLoading(false);
        });
    });
  }

  clearConversation(): void {
    this.chatStateService.clearHistory();
    this.chatStateService.addMessage('Conversation cleared. How can I help you?', 'system', 'info');
  }

  toggleChat(): void {
    this.chatStateService.toggleChat();
  }

  openChat(): void {
    this.chatStateService.openChat();
  }

  closeChat(): void {
    this.chatStateService.closeChat();
  }
}
