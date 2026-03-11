import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-seller-apply',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <div class="card border-0 shadow-sm mt-4 bg-light border-start border-primary">
      <div class="card-body p-4" [formGroup]="form">
        <h5 class="fw-bold text-primary mb-3">{{ 'profile.applyTitle' | translate }}</h5>

        <div class="mb-3">
          <input
            class="form-control"
            [placeholder]="'profile.storeNamePlaceholder' | translate"
            formControlName="store_name"
          />
        </div>

        <textarea
          class="form-control mb-3"
          [placeholder]="'profile.bioPlaceholder' | translate"
          formControlName="bio"
        ></textarea>

        <button class="btn btn-dark w-100 fw-bold" (click)="apply.emit()" [disabled]="isApplying">
          @if (isApplying) {
            {{ 'profile.sending' | translate }}
          } @else {
            {{ 'profile.submitRequest' | translate }}
          }
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
