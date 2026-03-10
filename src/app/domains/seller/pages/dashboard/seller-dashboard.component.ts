import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerService } from '../../services/seller.services';
import { ProfileService } from '@domains/profile/Services/profile.service';
import { AuthService } from '@core/services/auth.service';
import { SellerProduct, SellerOrder } from '../../dto/seller.dto';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  route?: string;
  routeLabel?: string;
  loading: boolean;
}

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container-fluid py-4">
      <h2 class="mb-1">Seller Dashboard</h2>
      <p class="text-muted mb-4 small">
        Welcome back, <strong>{{ userName() }}</strong>
        @if (storeName()) { &nbsp;·&nbsp; <i class="bi bi-shop me-1"></i>{{ storeName() }} }
      </p>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Total Products</p>
                  @if (isLoadingProducts()) {
                    <div class="placeholder-glow"><span class="placeholder col-6 rounded"></span></div>
                  } @else {
                    <h3 class="mb-0">{{ totalProducts() }}</h3>
                  }
                  <small class="text-primary">
                    <a routerLink="/seller/products" class="text-decoration-none">Manage →</a>
                  </small>
                </div>
                <div class="stat-icon" style="background:#3498db20;color:#3498db">
                  <i class="bi bi-box-seam"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Total Orders</p>
                  @if (isLoadingOrders()) {
                    <div class="placeholder-glow"><span class="placeholder col-6 rounded"></span></div>
                  } @else {
                    <h3 class="mb-0">{{ totalOrders() }}</h3>
                  }
                  <small class="text-success">
                    <a routerLink="/seller/orders" class="text-decoration-none">View all →</a>
                  </small>
                </div>
                <div class="stat-icon" style="background:#27ae6020;color:#27ae60">
                  <i class="bi bi-bag-check"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Pending Orders</p>
                  @if (isLoadingOrders()) {
                    <div class="placeholder-glow"><span class="placeholder col-6 rounded"></span></div>
                  } @else {
                    <h3 class="mb-0">{{ pendingOrders() }}</h3>
                  }
                  <small class="text-warning">Need attention</small>
                </div>
                <div class="stat-icon" style="background:#f39c1220;color:#f39c12">
                  <i class="bi bi-clock"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted mb-1">Wallet Balance</p>
                  <h3 class="mb-0">\${{ walletBalance() | number:'1.2-2' }}</h3>
                  <small>
                    <a routerLink="/seller/payouts" class="text-decoration-none" style="color:#9b59b6">Request payout →</a>
                  </small>
                </div>
                <div class="stat-icon" style="background:#9b59b620;color:#9b59b6">
                  <i class="bi bi-wallet2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Low Stock Alert -->
      @if (!isLoadingProducts() && lowStockProducts().length > 0) {
        <div class="alert alert-warning d-flex align-items-start gap-2 mb-4">
          <i class="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0"></i>
          <div>
            <strong>Low Stock Warning</strong> — {{ lowStockProducts().length }} product(s) running low.
            <a routerLink="/seller/products" class="alert-link ms-1">Fix Now →</a>
          </div>
        </div>
      }

      <!-- Quick Actions + Recent Orders -->
      <div class="row g-4 mb-4">

        <!-- Quick Actions -->
        <div class="col-12 col-lg-5">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="bi bi-lightning-charge me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6">
                  <a routerLink="/seller/products" class="btn btn-outline-primary w-100 py-3">
                    <i class="bi bi-plus-circle d-block fs-4 mb-1"></i>
                    Add Product
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/seller/orders" class="btn btn-outline-success w-100 py-3">
                    <i class="bi bi-truck d-block fs-4 mb-1"></i>
                    Manage Orders
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/seller/payouts" class="btn btn-outline-warning w-100 py-3">
                    <i class="bi bi-cash-coin d-block fs-4 mb-1"></i>
                    Request Payout
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/seller/profile" class="btn btn-outline-secondary w-100 py-3">
                    <i class="bi bi-person-circle d-block fs-4 mb-1"></i>
                    My Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="col-12 col-lg-7">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-bag-check me-2"></i>Recent Orders</h5>
              <a routerLink="/seller/orders" class="btn btn-sm btn-primary">View All</a>
            </div>
            <div class="card-body p-0">

              @if (isLoadingOrders()) {
                <div class="text-center py-5 text-muted">
                  <div class="spinner-border spinner-border-sm mb-2"></div>
                  <p class="small mb-0">Loading orders...</p>
                </div>
              } @else if (recentOrders().length === 0) {
                <div class="text-center py-5 text-muted">
                  <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                  <p class="mb-0">No orders yet</p>
                </div>
              } @else {
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Order #</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (o of recentOrders(); track o._id) {
                        <tr>
                          <td class="fw-bold font-monospace small">#{{ o._id.slice(-8).toUpperCase() }}</td>
                          <td>{{ o.items.length }}</td>
                          <td class="fw-semibold">\${{ o.total_amount | number:'1.2-2' }}</td>
                          <td>
                            <span class="badge rounded-pill" [ngClass]="statusClass(o.status)">
                              {{ o.status | titlecase }}
                            </span>
                          </td>
                          <td class="text-muted small">{{ o.createdAt | date:'MMM d' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }

            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
  `],
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