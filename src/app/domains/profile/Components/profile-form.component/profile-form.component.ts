import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProfile } from '../../dto/user-profile.dto';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorComponent],
  template: `
    @if (statusMessage) {
      <div class="alert alert-success alert-dismissible fade show shadow mb-4 border-0 border-start border-4 border-success">
        <i class="bi bi-check-circle-fill me-2"></i> {{ statusMessage }}
        <button type="button" class="btn-close" (click)="clearMessage.emit()"></button>
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="save.emit()">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-4 border-bottom pb-2">Account Details</h5>

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Full Name</label>
              <input
                class="form-control"
                [class.is-invalid]="controlInvalid('name')"
                formControlName="name"
              />
              <app-form-error *ngIf="controlInvalid('name')" [control]="form.get('name')"></app-form-error>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Email</label>
              <input class="form-control bg-light" [value]="user.email" disabled />
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Phone</label>
              <input
                class="form-control"
                [class.is-invalid]="controlInvalid('phone')"
                formControlName="phone"
              />
              <app-form-error *ngIf="controlInvalid('phone')" [control]="form.get('phone')"></app-form-error>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-bold text-secondary">Language</label>
              <select
                class="form-select"
                formControlName="preferred_language"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div class="col-12 mt-4 pt-3 border-top" formGroupName="marketing_preferences">
              <h6 class="fw-bold mb-3"><i class="bi bi-bell me-2 text-primary"></i>Notification Settings</h6>
              
              <div class="d-flex flex-wrap gap-4">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="push_notifications" id="pushNotify">
                  <label class="form-check-label small fw-bold" for="pushNotify">Push Alerts</label>
                </div>

                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="email_newsletter" id="emailNotify">
                  <label class="form-check-label small fw-bold" for="emailNotify">Newsletter</label>
                </div>

                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" formControlName="promotional_notifications" id="promoNotify">
                  <label class="form-check-label small fw-bold" for="promoNotify">Promotions</label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
        [disabled]="isSaving || form.invalid"
      >
        {{ isSaving ? 'Saving Changes...' : 'Save Settings' }}
      </button>
    </form>
  `
})
export class ProfileFormComponent {
  @Input() form!: FormGroup;
  @Input() user!: UserProfile;
  @Input() isSaving!: boolean;
  @Input() statusMessage!: string;

  @Output() save = new EventEmitter();
  @Output() clearMessage = new EventEmitter();

  controlInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}