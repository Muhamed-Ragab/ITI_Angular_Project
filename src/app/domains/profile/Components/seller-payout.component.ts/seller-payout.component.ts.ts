import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error';

@Component({
  selector: 'app-seller-payout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormErrorComponent],
  template: `
    <div class="card border-0 shadow-sm mt-4 bg-light border-start border-4 border-success">
      <div class="card-body p-4" [formGroup]="form">
        <h5 class="fw-bold text-success mb-3">Withdraw Earnings</h5>

        <div class="input-group">
          <span class="input-group-text">$</span>
          <input
            type="number"
            class="form-control"
            formControlName="amount"
            [class.is-invalid]="controlInvalid('amount')"
          />
          <button
            class="btn btn-success fw-bold"
            (click)="withdraw.emit()"
            [disabled]="loading || form.invalid"
          >
            Withdraw
          </button>
        </div>

        <!-- Error Messages -->
        <app-form-error *ngIf="controlInvalid('amount')" [control]="form.get('amount')"></app-form-error>

        <!-- Success/Status Message -->
        <div *ngIf="status && !controlInvalid('amount')" class="mt-2 small text-success fw-bold">
          {{ status }}
        </div>
      </div>
    </div>
  `,
})
export class SellerPayoutComponent {
  @Input() form!: FormGroup;
  @Input() loading!: boolean;
  @Input() status!: string;

  @Output() withdraw = new EventEmitter();

  controlInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}