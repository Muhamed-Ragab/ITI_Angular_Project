import { Component, inject, signal, computed } from '@angular/core';
import { BrodcastMarketing } from '../../brodcast.marketing';
import { BroadcastRequest } from '../../brodcast.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-marketing-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container marketing-form">
      <h2>Send Marketing Broadcast</h2>
      
      <form (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Select Channel:</label>
          <select [(ngModel)]="channel" name="channel" class="form-control">
            <option value="email">Email Newsletter</option>
            <option value="push">Push Notification</option>
            <option value="promotional">Promotional</option>
          </select>
        </div>

        <div class="form-group">
          <label>Broadcast Title:</label>
          <input 
            type="text" 
            [(ngModel)]="title" 
            name="title" 
            placeholder="Enter title..."
            required>
        </div>

        <div class="form-group">
          <label>Message Body:</label>
          <textarea 
            [(ngModel)]="body" 
            name="body" 
            rows="4"
            placeholder="Write your message here..."
            required></textarea>
        </div>

        <button type="submit" [disabled]="loading() || isFormInvalid()">
          {{ loading() ? 'Sending...' : 'Send Broadcast' }}
        </button>
      </form>

      <p *ngIf="lastResponse()" class="success-msg">
        ✅ {{ lastResponse() }}
      </p>
    </div>
  `,
  styles: [`
    .marketing-form { max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .success-msg { color: green; margin-top: 15px; font-weight: bold; }
  `]
})
export class MarketingBroadcast {
  // تعريف الـ Signals
  channel = signal<'email' | 'push' | 'promotional'>('email');
  title = signal('');
  body = signal('');
  loading = signal(false);
  lastResponse = signal<string | null>(null);

  // منطق التحقق من البيانات (Computed)
  isFormInvalid = computed(() => !this.title().trim() || !this.body().trim());

  // حقن الخدمة
  private marketingService = inject(BrodcastMarketing);

  onSubmit() {
    if (this.isFormInvalid()) return;

    this.loading.set(true);
    this.lastResponse.set(null);

    const payload: BroadcastRequest = {
      channel: this.channel(),
      title: this.title(),
      body: this.body()
    };

    this.marketingService.sendBrodcast(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.lastResponse.set(res.message);
        
        // تصفير الفورم بعد النجاح
        this.title.set('');
        this.body.set('');
      },
      error: (err) => {
        this.loading.set(false);
        // التعامل مع الخطأ اللي جالنا من السيرفر
        const errorMessage = err.error?.message || 'Something went wrong';
        alert('Error: ' + errorMessage);
        console.error('Broadcast Error Details:', err.error);
      }
    });
  }
}