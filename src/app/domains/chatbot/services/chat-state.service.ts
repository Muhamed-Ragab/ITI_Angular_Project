import { Injectable, signal, Signal } from '@angular/core';
import { ChatMessage, createChatMessage } from '../models/chat-message.model';

@Injectable({ providedIn: 'root' })
export class ChatStateService {
  private readonly messagesSignal = signal<ChatMessage[]>([]);
  private readonly isLoadingSignal = signal(false);
  private readonly isOpenSignal = signal(false);
  private readonly conversationIdSignal = signal<string | null>(null);

  readonly messages: Signal<ChatMessage[]> = this.messagesSignal.asReadonly();
  readonly isLoading: Signal<boolean> = this.isLoadingSignal.asReadonly();
  readonly isOpen: Signal<boolean> = this.isOpenSignal.asReadonly();
  readonly conversationId: Signal<string | null> = this.conversationIdSignal.asReadonly();

  addMessage(
    content: string,
    sender: 'user' | 'assistant' | 'system',
    type: 'text' | 'error' | 'info' = 'text',
  ): void {
    const message = createChatMessage(content, sender, type);
    this.messagesSignal.update((messages) => [...messages, message]);
  }

  clearHistory(): void {
    this.messagesSignal.set([]);
    this.conversationIdSignal.set(null);
  }

  toggleChat(): void {
    this.isOpenSignal.update((isOpen) => !isOpen);
  }

  openChat(): void {
    this.isOpenSignal.set(true);
  }

  closeChat(): void {
    this.isOpenSignal.set(false);
  }

  setLoading(loading: boolean): void {
    this.isLoadingSignal.set(loading);
  }

  setConversationId(id: string | null): void {
    this.conversationIdSignal.set(id);
  }

  getRecentHistory(limit: number = 10): ChatMessage[] {
    const messages = this.messagesSignal();
    return messages.slice(-limit);
  }
}
