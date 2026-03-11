import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastRequest } from '../../brodcast.dto';
import { BrodcastMarketing } from '../../brodcast.marketing';

@Component({
  selector: 'app-marketing-broadcast',
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">
                <i class="bi bi-megaphone-fill me-2"></i>{{ 'marketing.title' | translate }}
              </h4>
            </div>

            <div class="card-body p-4">
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label fw-bold">{{ 'marketing.channel' | translate }}</label>
                  <select [(ngModel)]="channel" name="channel" class="form-select shadow-none">
                    <option value="email">{{ 'marketing.email' | translate }}</option>
                    <option value="push">{{ 'marketing.push' | translate }}</option>
                    <option value="promotional">{{ 'marketing.promotional' | translate }}</option>
                  </select>
                  <div class="form-text">{{ 'marketing.channelHelp' | translate }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold">{{
                    'marketing.broadcastTitle' | translate
                  }}</label>
                  <input
                    type="text"
                    [(ngModel)]="title"
                    name="title"
                    class="form-control"
                    [placeholder]="'marketing.titlePlaceholder' | translate"
                    required
                  />
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold">{{
                    'marketing.messageContent' | translate
                  }}</label>
                  <textarea
                    [(ngModel)]="body"
                    name="body"
                    class="form-control"
                    rows="5"
                    [placeholder]="'marketing.messagePlaceholder' | translate"
                    required
                  ></textarea>
                </div>

                <div class="d-grid">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    [disabled]="loading() || isFormInvalid()"
                  >
                    @if (loading()) {
                      <span class="spinner-border spinner-border-sm me-2"></span>
                    }
                    {{
                      loading()
                        ? ('marketing.processing' | translate)
                        : ('marketing.broadcastNow' | translate)
                    }}
                  </button>
                </div>
              </form>

              @if (lastResponse()) {
                <div class="alert alert-success mt-4 d-flex align-items-center" role="alert">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  <div>{{ lastResponse() }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border: none;
        border-radius: 12px;
      }
      .card-header {
        border-radius: 12px 12px 0 0 !important;
      }
      .form-control:focus,
      .form-select:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
      }
    `,
  ],
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
      body: this.body(),
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
      },
    });
  }
}
