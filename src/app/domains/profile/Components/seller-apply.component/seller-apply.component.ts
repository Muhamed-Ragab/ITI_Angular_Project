import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card border-0 shadow-sm mt-4 bg-light border-start border-4 border-primary">
      <div class="card-body p-4" [formGroup]="form">
        <h5 class="fw-bold text-primary mb-3">Apply to become a Seller</h5>

        <div class="mb-3">
          <input class="form-control" placeholder="Store Name" formControlName="store_name" />
        </div>

        <textarea
          class="form-control mb-3"
          placeholder="Tell us about your products (Bio)"
          formControlName="bio"
        ></textarea>

        <button class="btn btn-dark w-100 fw-bold" (click)="apply.emit()" [disabled]="isApplying">
          {{ isApplying ? 'Sending...' : 'Submit Seller Request' }}
        </button>

        @if (status) {
          <div class="mt-2 small fw-bold">
            {{ status }}
          </div>
        }
      </div>
    </div>
  `,
})
export class SellerApplyComponent {
  @Input() form!: FormGroup;
  @Input() isApplying!: boolean;
  @Input() status!: string;

  @Output() apply = new EventEmitter();
}
