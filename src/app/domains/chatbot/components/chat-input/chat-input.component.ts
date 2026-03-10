import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (ngSubmit)="onSend()" class="chat-input-form">
      <input
        type="text"
        class="form-control"
        placeholder="Type your message..."
        [(ngModel)]="message"
        name="message"
        [disabled]="isLoading()"
        maxlength="500"
      />
      <button
        type="submit"
        class="btn btn-primary ms-2"
        [disabled]="isLoading() || !message().trim()"
      >
        <i class="bi bi-send-fill"></i>
      </button>
    </form>
  `,
  styles: [`
    :host {
      display: block;
      flex-shrink: 0;
    }

    .chat-input-form {
      display: flex;
      gap: 0.5rem;
      padding: 1rem;
      border-top: 1px solid #dee2e6;
      background: #fff;
    }
    
    .form-control {
      flex: 1;
    }
    
    .btn {
      flex-shrink: 0;
    }
  `],
})
export class ChatInputComponent {
  private readonly chatbotService = inject(ChatbotService);
  
  readonly message = signal('');
  readonly isLoading = this.chatbotService.isLoading;

  onSend(): void {
    const msg = this.message().trim();
    if (!msg) return;

    this.chatbotService.sendMessage(msg).subscribe(() => {
      this.message.set('');
    });
  }
}
