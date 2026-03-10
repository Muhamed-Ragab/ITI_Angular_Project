import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerService } from '../../services/seller.services';
import { ProfileService } from '@domains/profile/Services/profile.service';
import { AuthService } from '@core/services/auth.service';
import { SellerProduct, SellerOrder } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, TitleCasePipe, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-3 p-md-4">

      <!-- Welcome Banner -->
      <div class="rounded-4 p-4 mb-4 text-white position-relative overflow-hidden"
        style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)">
        <div class="position-relative" style="z-index:1">
          <p class="mb-1 opacity-75 small fw-semibold text-uppercase" style="letter-spacing:0.08em">
            Seller Dashboard
          </p>
          <h3 class="fw-bold mb-1">Welcome back, {{ userName() }} 👋</h3>
          @if (storeName()) {
            <p class="mb-0 opacity-75 small">
              <i class="bi bi-shop me-1"></i>{{ storeName() }}
            </p>
          }
        </div>
        <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.03)"></div>
        <div style="position:absolute;bottom:-60px;right:60px;width:150px;height:150px;border-radius:50%;background:rgba(74,222,128,0.07)"></div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-3 mb-4">

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-start justify-content-between">
                <div>
                  <p class="text-muted small fw-semibold mb-1 text-uppercase" style="font-size:0.7rem;letter-spacing:0.05em">Total Products</p>
                  <h3 class="fw-bold mb-0 text-primary">
                    @if (isLoadingProducts()) {
                      <span class="placeholder col-4 rounded"></span>
                    } @else {
                      {{ totalProducts() }}
                    }
                  </h3>
                </div>
                <div class="rounded-3 p-2" style="background:#eff6ff">
                  <i class="bi bi-box-seam text-primary" style="font-size:1.4rem"></i>
                </div>
              </div>
              <a routerLink="/seller/products" class="small text-primary text-decoration-none d-block mt-2">Manage →</a>
            </div>
          </div>
        </div>

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-start justify-content-between">
                <div>
                  <p class="text-muted small fw-semibold mb-1 text-uppercase" style="font-size:0.7rem;letter-spacing:0.05em">Total Orders</p>
                  <h3 class="fw-bold mb-0 text-success">
                    @if (isLoadingOrders()) {
                      <span class="placeholder col-4 rounded"></span>
                    } @else {
                      {{ totalOrders() }}
                    }
                  </h3>
                </div>
                <div class="rounded-3 p-2" style="background:#f0fdf4">
                  <i class="bi bi-bag-check text-success" style="font-size:1.4rem"></i>
                </div>
              </div>
              <a routerLink="/seller/orders" class="small text-success text-decoration-none d-block mt-2">View all →</a>
            </div>
          </div>
        </div>

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-start justify-content-between">
                <div>
                  <p class="text-muted small fw-semibold mb-1 text-uppercase" style="font-size:0.7rem;letter-spacing:0.05em">Pending Orders</p>
                  <h3 class="fw-bold mb-0" style="color:#d97706">
                    @if (isLoadingOrders()) {
                      <span class="placeholder col-4 rounded"></span>
                    } @else {
                      {{ pendingOrders() }}
                    }
                  </h3>
                </div>
                <div class="rounded-3 p-2" style="background:#fffbeb">
                  <i class="bi bi-clock" style="font-size:1.4rem;color:#d97706"></i>
                </div>
              </div>
              <span class="small text-muted d-block mt-2">Need attention</span>
            </div>
          </div>
        </div>

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-start justify-content-between">
                <div>
                  <p class="text-muted small fw-semibold mb-1 text-uppercase" style="font-size:0.7rem;letter-spacing:0.05em">Wallet Balance</p>
                  <h3 class="fw-bold mb-0" style="color:#7c3aed">
                    {{ walletBalance() | number:'1.2-2' }}
                  </h3>
                </div>
                <div class="rounded-3 p-2" style="background:#faf5ff">
                  <i class="bi bi-wallet2" style="font-size:1.4rem;color:#7c3aed"></i>
                </div>
              </div>
              <a routerLink="/seller/payouts" class="small text-decoration-none d-block mt-2" style="color:#7c3aed">Request payout →</a>
            </div>
          </div>
        </div>

      </div>

      <!-- Low Stock Alert -->
      @if (!isLoadingProducts() && lowStockProducts().length > 0) {
        <div class="rounded-4 p-3 mb-4 d-flex align-items-start gap-3"
          style="background:#fffbeb;border:1px solid #fde68a">
          <i class="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0" style="color:#d97706;font-size:1.1rem"></i>
          <div class="flex-grow-1">
            <strong style="color:#92400e">Low Stock Warning</strong>
            <p class="small mb-2" style="color:#78350f">{{ lowStockProducts().length }} product(s) running low</p>
            <div class="d-flex flex-wrap gap-2">
              @for (p of lowStockProducts().slice(0, 5); track p._id) {
                <span class="badge rounded-pill fw-normal px-3" style="background:#fde68a;color:#92400e">
                  {{ p.title | slice:0:20 }}{{ p.title.length > 20 ? '...' : '' }} ({{ p.stock_quantity }} left)
                </span>
              }
            </div>
          </div>
          <a routerLink="/seller/products" class="btn btn-sm rounded-pill flex-shrink-0"
            style="background:#f59e0b;color:#fff;border:none">Fix Now</a>
        </div>
      }

      <div class="row g-4">

        <!-- Recent Orders -->
        <div class="col-12 col-xl-7">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0">Recent Orders</h5>
              <a routerLink="/seller/orders" class="btn btn-sm btn-outline-primary rounded-pill px-3">View All</a>
            </div>
            <div class="card-body p-0">

              @if (isLoadingOrders()) {
                <div class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-muted"></div>
                  <p class="text-muted small mt-2 mb-0">Loading orders...</p>
                </div>
              } @else if (recentOrders().length === 0) {
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-bag d-block mb-2 fs-2"></i>
                  <p class="small mb-0">No orders yet</p>
                </div>
              } @else {
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead style="background:#f8fafc">
                      <tr class="text-muted" style="font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em">
                        <th class="ps-4 py-3">Order</th>
                        <th class="py-3">Items</th>
                        <th class="py-3">Total</th>
                        <th class="pe-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (o of recentOrders(); track o._id) {
                        <tr style="border-bottom:1px solid #f1f5f9">
                          <td class="ps-4 py-3">
                            <span class="fw-bold font-monospace small">#{{ o._id.slice(-8).toUpperCase() }}</span>
                            <div class="text-muted" style="font-size:0.75rem">{{ o.createdAt | date:'MMM d' }}</div>
                          </td>
                          <td class="py-3 text-muted small">{{ o.items.length }}</td>
                          <td class="py-3 fw-semibold text-success">{{ o.total_amount | number:'1.2-2' }}</td>
                          <td class="pe-4 py-3">
                            <span class="badge rounded-pill" [ngClass]="statusClass(o.status)">
                              {{ o.status | titlecase }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12 col-xl-5">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <h5 class="fw-bold mb-0">Quick Actions</h5>
            </div>
            <div class="card-body d-flex flex-column gap-2">

              <a routerLink="/seller/products" class="card border-0 rounded-3 p-3 text-decoration-none d-flex flex-row align-items-center gap-3" style="background:#eff6ff">
                <div class="rounded-3 p-2 flex-shrink-0" style="background:#dbeafe">
                  <i class="bi bi-plus-circle text-primary" style="font-size:1.2rem"></i>
                </div>
                <div>
                  <div class="fw-semibold text-primary small">Add New Product</div>
                  <div class="text-muted" style="font-size:0.75rem">List a new item in your store</div>
                </div>
                <i class="bi bi-chevron-right text-muted ms-auto"></i>
              </a>

              <a routerLink="/seller/orders" class="card border-0 rounded-3 p-3 text-decoration-none d-flex flex-row align-items-center gap-3" style="background:#f0fdf4">
                <div class="rounded-3 p-2 flex-shrink-0" style="background:#dcfce7">
                  <i class="bi bi-truck text-success" style="font-size:1.2rem"></i>
                </div>
                <div>
                  <div class="fw-semibold text-success small">Manage Orders</div>
                  <div class="text-muted" style="font-size:0.75rem">Ship or update order status</div>
                </div>
                <i class="bi bi-chevron-right text-muted ms-auto"></i>
              </a>

              <a routerLink="/seller/payouts" class="card border-0 rounded-3 p-3 text-decoration-none d-flex flex-row align-items-center gap-3" style="background:#faf5ff">
                <div class="rounded-3 p-2 flex-shrink-0" style="background:#ede9fe">
                  <i class="bi bi-cash-coin" style="font-size:1.2rem;color:#7c3aed"></i>
                </div>
                <div>
                  <div class="fw-semibold small" style="color:#7c3aed">Request Payout</div>
                  <div class="text-muted" style="font-size:0.75rem">Balance: {{ walletBalance() | number:'1.2-2' }}</div>
                </div>
                <i class="bi bi-chevron-right text-muted ms-auto"></i>
              </a>

              <a routerLink="/profile" class="card border-0 rounded-3 p-3 text-decoration-none d-flex flex-row align-items-center gap-3" style="background:#fff7ed">
                <div class="rounded-3 p-2 flex-shrink-0" style="background:#ffedd5">
                  <i class="bi bi-person-circle" style="font-size:1.2rem;color:#ea580c"></i>
                </div>
                <div>
                  <div class="fw-semibold small" style="color:#ea580c">My Profile</div>
                  <div class="text-muted" style="font-size:0.75rem">Update store info and settings</div>
                </div>
                <i class="bi bi-chevron-right text-muted ms-auto"></i>
              </a>

            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class SellerDashboardComponent implements OnInit {
  private readonly sellerService  = inject(SellerService);
  private readonly profileService = inject(ProfileService);
  private readonly authService    = inject(AuthService);

  readonly isLoadingOrders   = signal(true);
  readonly isLoadingProducts = signal(true);
  readonly totalProducts     = signal(0);
  readonly totalOrders       = signal(0);
  readonly pendingOrders     = signal(0);
  readonly walletBalance     = signal(0);
  readonly recentOrders      = signal<SellerOrder[]>([]);
  readonly lowStockProducts  = signal<SellerProduct[]>([]);

  userName(): string { return this.authService.currentUser()?.name ?? 'Seller'; }
  storeName(): string {
    return (this.authService.currentUser() as any)?.seller_profile?.store_name ?? '';
  }

  private get sellerId(): string {
    const u: any = this.authService.currentUser();
    return u?._id ?? u?.id ?? '';
  }

  ngOnInit(): void {
    this.profileService.getUserProfile().subscribe({
      next: (p) => this.walletBalance.set(p.wallet_balance ?? 0),
    });

    this.sellerService.getMyProducts(this.sellerId, { limit: 100 }).subscribe({
      next: (res) => {
        this.totalProducts.set(res.data?.pagination?.total ?? 0);
        const low = (res.data?.products ?? []).filter(
          p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 10
        );
        this.lowStockProducts.set(low);
        this.isLoadingProducts.set(false);
      },
      error: () => this.isLoadingProducts.set(false),
    });

    this.sellerService.getMyOrders().subscribe({
      next: (res) => {
        const all: SellerOrder[] = res.data?.orders ?? [];
        this.totalOrders.set(all.length);
        this.pendingOrders.set(
          all.filter(o => o.status === 'pending' || o.status === 'processing').length
        );
        this.recentOrders.set(all.slice(0, 5));
        this.isLoadingOrders.set(false);
      },
      error: () => {
        this.recentOrders.set([]);
        this.isLoadingOrders.set(false);
      },
    });
  }

  statusClass(status: string): Record<string, boolean> {
    return {
      'bg-warning text-dark': status === 'pending',
      'bg-info text-white':   status === 'processing',
      'bg-primary':           status === 'shipped',
      'bg-success':           status === 'delivered',
      'bg-danger':            status === 'cancelled',
    };
  }
}