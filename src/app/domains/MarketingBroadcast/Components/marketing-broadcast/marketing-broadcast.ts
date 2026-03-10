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
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0"><i class="bi bi-megaphone-fill me-2"></i>Send Marketing Broadcast</h4>
            </div>
            
            <div class="card-body p-4">
              <form (ngSubmit)="onSubmit()">
                
                <div class="mb-3">
                  <label class="form-label fw-bold">Target Channel</label>
                  <select [(ngModel)]="channel" name="channel" class="form-select shadow-none">
                    <option value="email">Email Newsletter</option>
                    <option value="push">Push Notification</option>
                    <option value="promotional">Promotional Offer</option>
                  </select>
                  <div class="form-text">Choose how users will receive this message.</div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Broadcast Title</label>
                  <input 
                    type="text" 
                    [(ngModel)]="title" 
                    name="title" 
                    class="form-control" 
                    placeholder="e.g., Summer Sale 2026"
                    required>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">Message Content</label>
                  <textarea 
                    [(ngModel)]="body" 
                    name="body" 
                    class="form-control" 
                    rows="5"
                    placeholder="Enter the full message details here..."
                    required></textarea>
                </div>

                <div class="d-grid">
                  <button type="submit" 
                          class="btn btn-primary btn-lg" 
                          [disabled]="loading() || isFormInvalid()">
                    <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading() ? 'Processing Broadcast...' : 'Broadcast Now' }}
                  </button>
                </div>
              </form>

              <div *ngIf="lastResponse()" class="alert alert-success mt-4 d-flex align-items-center" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                <div>{{ lastResponse() }}</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { border: none; border-radius: 12px; }
    .card-header { border-radius: 12px 12px 0 0 !important; }
    .form-control:focus, .form-select:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1); }
  `]
})
export class MarketingBroadcast {
  channel = signal<'email' | 'push' | 'promotional'>('email');
  title = signal('');
  body = signal('');
  loading = signal(false);
  lastResponse = signal<string | null>(null);
  
  isFormInvalid = computed(() => !this.title().trim() || !this.body().trim());
  
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
        this.title.set('');
        this.body.set('');
        setTimeout(() => this.lastResponse.set(null), 5000);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMessage = err.error?.message || 'Failed to send broadcast';
        alert('Error: ' + errorMessage);
      }
    });
  }
}