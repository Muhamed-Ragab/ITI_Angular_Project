import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatMessagesComponent } from '../chat-messages/chat-messages.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [ChatMessagesComponent, ChatInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating Action Button -->
    <button
      class="chatbot-fab btn btn-primary btn-lg shadow"
      (click)="toggleChat()"
      [attr.aria-expanded]="isOpen()"
      aria-label="Toggle chat"
    >
      @if (isOpen()) {
        <i class="bi bi-x-lg"></i>
      } @else {
        <i class="bi bi-chat-dots-fill"></i>
      }
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div class="chatbot-window card shadow-lg">
        <!-- Header -->
        <div class="chatbot-header card-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-robot text-primary"></i>
            <div>
              <h6 class="mb-0">Customer Support</h6>
              <small class="text-muted">Powered by AI</small>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button
              class="btn btn-sm btn-outline-secondary"
              (click)="clearConversation()"
              title="Clear conversation"
            >
              <i class="bi bi-trash"></i>
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              (click)="toggleChat()"
              title="Close chat"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <app-chat-messages />

        <!-- Input -->
        <app-chat-input />
      </div>
    }
  `,
  styles: [`
    .chatbot-fab {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      z-index: 1050;
      transition: transform 0.3s ease;
    }
    
    .chatbot-fab:hover {
      transform: scale(1.1);
    }
    
    .chatbot-window {
      position: fixed;
      bottom: 6rem;
      right: 2rem;
      width: 380px;
      max-width: calc(100vw - 4rem);
      height: 500px;
      max-height: calc(100vh - 14rem);
      z-index: 1050;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }
    
    .chatbot-header {
      background: #fff;
      border-bottom: 1px solid #dee2e6;
      padding: 0.75rem 1rem;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (max-width: 576px) {
      .chatbot-window {
        right: 1rem;
        bottom: 5.5rem;
        width: calc(100vw - 2rem);
        height: calc(100vh - 12rem);
      }
      
      .chatbot-fab {
        right: 1rem;
        bottom: 1rem;
      }
    }
  `],
})
export class ChatbotWidgetComponent {
  private readonly chatbotService = inject(ChatbotService);

  readonly isOpen = this.chatbotService.isOpen;

  toggleChat(): void {
    this.chatbotService.toggleChat();
  }

  clearConversation(): void {
    this.chatbotService.clearConversation();
  }
}
