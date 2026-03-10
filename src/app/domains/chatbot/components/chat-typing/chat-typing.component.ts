import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-chat-typing',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="typing-indicator p-2">
      <div class="d-flex gap-1">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  `,
  styles: [`
    .typing-indicator {
      display: inline-block;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      background: #6c757d;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }
    
    .dot:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    .dot:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
  `],
})
export class ChatTypingComponent {}
