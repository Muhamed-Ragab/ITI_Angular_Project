import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../dto/user-profile.dto';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm border-0">

      <div class="card-header bg-white py-3 fw-bold d-flex justify-content-between align-items-center">
        <span>Saved Cards</span>
        <button class="btn btn-sm btn-primary" (click)="onAdd()">+ Add</button>
      </div>

      <div class="card-body p-0">
        @for(card of methods; track card.id){
          <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
            <div>
              <span class="fw-bold small text-uppercase">{{ card.brand }}</span>
              <small class="text-muted d-block">•••• {{ card.last4 }}</small>
            </div>

            <button class="btn btn-sm text-danger" (click)="onDelete(card.id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        }
        @if(methods.length === 0){
          <div class="text-center text-muted small p-3">No saved payment methods.</div>
        }
      </div>

    </div>
  `
})
export class PaymentMethodsComponent {
  @Input() methods: PaymentMethod[] = [];

  @Output() action = new EventEmitter<{ type: 'add' | 'delete'; id?: string }>();

  onAdd() {
    this.action.emit({ type: 'add' });
  }

  onDelete(id: string) {
    this.action.emit({ type: 'delete', id });
  }
}