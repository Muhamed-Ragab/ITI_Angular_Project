import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatTypingComponent } from '../chat-typing/chat-typing.component';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [NgClass, DatePipe, ChatTypingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-messages" #messagesContainer>
      @for (message of messages(); track message.id) {
        <div
          class="message-container"
          [ngClass]="{
            'message-user': message.sender === 'user',
            'message-assistant': message.sender === 'assistant',
            'message-system': message.sender === 'system'
          }"
        >
          <div class="message-bubble">
            <div class="message-content" [innerHTML]="formatMessage(message.content)"></div>
            <span class="message-time">{{ message.timestamp | date: 'shortTime' }}</span>
          </div>
        </div>
      }
      
      @if (isLoading()) {
        <div class="message-container message-assistant">
          <div class="message-bubble">
            <app-chat-typing />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      flex: 1 1 auto;
      min-height: 0;
    }

    .chat-messages {
      height: 100%;
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: #f8f9fa;
    }
    
    .message-container {
      display: flex;
      max-width: 80%;
    }
    
    .message-user {
      align-self: flex-end;
      margin-left: auto;
    }
    
    .message-assistant,
    .message-system {
      align-self: flex-start;
    }
    
    .message-bubble {
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      position: relative;
    }
    
    .message-user .message-bubble {
      background: #0d6efd;
      color: white;
      border-bottom-right-radius: 0.25rem;
    }
    
    .message-assistant .message-bubble {
      background: #e9ecef;
      color: #212529;
      border-bottom-left-radius: 0.25rem;
    }
    
    .message-system .message-bubble {
      background: #f8d7da;
      color: #842029;
      border: 1px solid #f5c2c7;
    }
    
    .message-content {
      word-wrap: break-word;
      font-size: 0.9rem;
    }

    .message-content p {
      margin: 0 0 0.5rem;
    }

    .message-content p:last-child {
      margin-bottom: 0;
    }

    .message-content ul {
      padding-left: 1.25rem;
      margin: 0.25rem 0 0.5rem;
    }

    .message-content li {
      margin-bottom: 0.25rem;
    }

    .message-content code {
      background: rgba(0, 0, 0, 0.08);
      padding: 0.1rem 0.35rem;
      border-radius: 0.35rem;
      font-size: 0.85rem;
    }
    
    .message-time {
      display: block;
      font-size: 0.75rem;
      margin-top: 0.25rem;
      opacity: 0.7;
    }
  `],
})
export class ChatMessagesComponent {
  private readonly chatbotService = inject(ChatbotService);
  private readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

  readonly messages = this.chatbotService.messages;
  readonly isLoading = this.chatbotService.isLoading;

  constructor() {
    effect(() => {
      this.scrollToBottom();
    });
  }

  formatMessage(content: string): string {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const lines = escaped.split(/\r?\n/);
    let html = '';
    let inList = false;

    for (const line of lines) {
      const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (listMatch) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${this.formatInline(listMatch[1])}</li>`;
        continue;
      }

      if (inList) {
        html += '</ul>';
        inList = false;
      }

      if (line.trim().length === 0) {
        html += '<p></p>';
      } else {
        html += `<p>${this.formatInline(line)}</p>`;
      }
    }

    if (inList) {
      html += '</ul>';
    }

    return html;
  }

  private formatInline(text: string): string {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.messagesContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
