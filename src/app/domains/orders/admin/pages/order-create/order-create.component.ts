import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CreateOrderRequest, ShippingAddress } from '../../dto';
import { AdminOrderFacadeService } from '../../services/admin-order-facade.service';

@Component({
  selector: 'app-admin-order-create',
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <a routerLink="/orders" class="btn btn-outline-secondary btn-sm mb-2">
            <i class="bi bi-arrow-left"></i> {{ 'adminOrders.create.backToOrders' | translate }}
          </a>
          <h1 class="h3 mb-0">{{ 'adminOrders.create.title' | translate }}</h1>
        </div>
      </div>

      <form (ngSubmit)="createOrder()">
        <div class="row">
          <div class="col-lg-8">
            <!-- Customer Info -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.create.customerInfo' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">{{ 'adminOrders.create.userId' | translate }}</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="userId"
                    name="userId"
                    required
                    [placeholder]="'adminOrders.create.userIdPlaceholder' | translate"
                  />
                </div>
              </div>
            </div>

            <!-- Order Items -->
            <div class="card shadow-sm mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ 'adminOrders.create.orderItems' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>{{ 'adminOrders.create.productId' | translate }}</th>
                        <th class="text-center">{{ 'adminOrders.create.quantity' | translate }}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of items(); track $index; let i = $index) {
                        <tr>
                          <td>
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              [(ngModel)]="item.productId"
                              name="productId{{ i }}"
                              [placeholder]="'adminOrders.create.productIdPlaceholder' | translate"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              class="form-control form-control-sm text-center"
                              [(ngModel)]="item.quantity"
                              name="quantity{{ i }}"
                              min="1"
                              value="1"
                              required
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              class="btn btn-outline-danger btn-sm"
                              (click)="removeItem(i)"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm" (click)="addItem()">
                  <i class="bi bi-plus-lg"></i> {{ 'adminOrders.create.addItem' | translate }}
                </button>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.create.shippingAddress' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-12 mb-3">
                    <label class="form-label">{{ 'adminOrders.create.street' | translate }}</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="shippingAddress.street"
                      name="shippingStreet"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'adminOrders.create.city' | translate }}</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="shippingAddress.city"
                      name="shippingCity"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'adminOrders.create.zip' | translate }}</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="shippingAddress.zip"
                      name="shippingZip"
                      required
                    />
                  </div>
                  <div class="col-md-4 mb-3">
                    <label class="form-label">{{ 'adminOrders.create.country' | translate }}</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="shippingAddress.country"
                      name="shippingCountry"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Billing Address -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.create.billingAddress' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="form-check mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    [(ngModel)]="sameAsShipping"
                    name="sameAsShipping"
                    (change)="copyShippingToBilling()"
                  />
                  <label class="form-check-label">{{
                    'adminOrders.create.sameAsShipping' | translate
                  }}</label>
                </div>
                @if (!sameAsShipping()) {
                  <div class="row">
                    <div class="col-12 mb-3">
                      <label class="form-label">{{
                        'adminOrders.create.street' | translate
                      }}</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="billingAddress.street"
                        name="billingStreet"
                        required
                      />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">{{ 'adminOrders.create.city' | translate }}</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="billingAddress.city"
                        name="billingCity"
                        required
                      />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">{{ 'adminOrders.create.zip' | translate }}</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="billingAddress.zip"
                        name="billingZip"
                        required
                      />
                    </div>
                    <div class="col-md-4 mb-3">
                      <label class="form-label">{{
                        'adminOrders.create.country' | translate
                      }}</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="billingAddress.country"
                        name="billingCountry"
                        required
                      />
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Payment & Notes -->
            <div class="card shadow-sm mb-4">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.create.paymentNotes' | translate }}</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label">{{
                    'adminOrders.create.paymentMethod' | translate
                  }}</label>
                  <select
                    class="form-select"
                    [(ngModel)]="paymentMethod"
                    name="paymentMethod"
                    required
                  >
                    <option value="">{{ 'adminOrders.create.selectPayment' | translate }}</option>
                    <option value="card">{{ 'adminOrders.create.creditCard' | translate }}</option>
                    <option value="paypal">{{ 'adminOrders.create.paypal' | translate }}</option>
                    <option value="cash">{{ 'adminOrders.create.cod' | translate }}</option>
                    <option value="bank">
                      {{ 'adminOrders.create.bankTransfer' | translate }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">{{ 'adminOrders.create.notes' | translate }}</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    [(ngModel)]="notes"
                    name="notes"
                    [placeholder]="'adminOrders.create.notesPlaceholder' | translate"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">{{ 'adminOrders.create.title' | translate }}</h5>
              </div>
              <div class="card-body">
                <p class="text-muted">
                  Review the order details and click "Create Order" to proceed.
                </p>
                @if (error()) {
                  <div class="alert alert-danger">
                    {{ error() }}
                  </div>
                }
              </div>
              <div class="card-footer">
                <button type="submit" class="btn btn-primary w-100" [disabled]="facade.isLoading()">
                  @if (facade.isLoading()) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  {{ 'adminOrders.create.createBtn' | translate }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderCreateComponent {
  readonly facade = inject(AdminOrderFacadeService);
  private readonly router = inject(Router);

  userId = '';
  items = signal<Array<{ productId: string; quantity: number }>>([{ productId: '', quantity: 1 }]);
  shippingAddress: ShippingAddress = this.getEmptyAddress();
  billingAddress: ShippingAddress = this.getEmptyAddress();
  sameAsShipping = signal(true);
  paymentMethod = '';
  notes = '';
  error = signal<string | null>(null);

  getEmptyAddress(): ShippingAddress {
    return {
      street: '',
      city: '',
      country: '',
      zip: '',
    };
  }

  addItem(): void {
    this.items.update((items) => [...items, { productId: '', quantity: 1 }]);
  }

  removeItem(index: number): void {
    this.items.update((items) => items.filter((_, i) => i !== index));
  }

  copyShippingToBilling(): void {
    if (this.sameAsShipping()) {
      this.billingAddress = { ...this.shippingAddress };
    }
  }

  createOrder(): void {
    this.error.set(null);

    const validItems = this.items().filter((item) => item.productId && item.quantity > 0);

    if (!this.userId) {
      this.error.set('User ID is required');
      return;
    }

    if (validItems.length === 0) {
      this.error.set('At least one item is required');
      return;
    }

    const request: CreateOrderRequest = {
      userId: this.userId,
      items: validItems,
      shippingAddress: this.shippingAddress,
      billingAddress: this.sameAsShipping() ? this.shippingAddress : this.billingAddress,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
    };

    this.facade.createOrder$(request).subscribe((result) => {
      if (result) {
        this.router.navigate(['/admin/orders', result._id]);
      } else {
        this.error.set(this.facade.error() || 'Failed to create order');
      }
    });
  }
}
