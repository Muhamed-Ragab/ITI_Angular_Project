import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SellerService } from '../../services/seller.services';
import { AuthService } from '@core/services/auth.service';
import { SellerProduct, SellerOrder } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4">

      <!-- Welcome -->
      <div class="mb-4">
        <h4 class="fw-bold mb-0">Welcome back, {{ currentUser()?.name ?? 'Seller' }} 👋</h4>
        <p class="text-muted small mb-0">
          {{ storeName() ? 'Store: ' + storeName() : 'Heres whats happening in your store.' }}
        </p>
      </div>

      <!-- Stats cards -->
      <div class="row g-3 mb-4">

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100"
            style="background:linear-gradient(135deg,#dbeafe,#bfdbfe)">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="small text-muted mb-1 fw-semibold">Total Products</p>
                  <h3 class="fw-bold mb-0 text-primary">{{ totalProducts() }}</h3>
                </div>
                <div class="rounded-3 p-2" style="background:rgba(59,130,246,0.15)">
                  <i class="bi bi-box-seam text-primary fs-4"></i>
                </div>
              </div>
              <a routerLink="/seller/products" class="small text-primary text-decoration-none mt-2 d-block">
                Manage products →
              </a>
            </div>
          </div>
        </div>

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100"
            style="background:linear-gradient(135deg,#dcfce7,#bbf7d0)">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="small text-muted mb-1 fw-semibold">Total Orders</p>
                  <h3 class="fw-bold mb-0 text-success">{{ totalOrders() }}</h3>
                </div>
                <div class="rounded-3 p-2" style="background:rgba(34,197,94,0.15)">
                  <i class="bi bi-bag-check text-success fs-4"></i>
                </div>
              </div>
              <a routerLink="/seller/orders" class="small text-success text-decoration-none mt-2 d-block">
                View orders →
              </a>
            </div>
          </div>
        </div>

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100"
            style="background:linear-gradient(135deg,#fef3c7,#fde68a)">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="small text-muted mb-1 fw-semibold">Pending Orders</p>
                  <h3 class="fw-bold mb-0" style="color:#92400e">{{ pendingOrders() }}</h3>
                </div>
                <div class="rounded-3 p-2" style="background:rgba(245,158,11,0.15)">
                  <i class="bi bi-clock fs-4" style="color:#d97706"></i>
                </div>
              </div>
              <span class="small text-muted mt-2 d-block">Need attention</span>
            </div>
          </div>
        </div>

        <div class="col-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 h-100"
            style="background:linear-gradient(135deg,#ede9fe,#ddd6fe)">
            <div class="card-body p-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="small text-muted mb-1 fw-semibold">Wallet Balance</p>
                  <h3 class="fw-bold mb-0" style="color:#7c3aed">\${{ walletBalance() | number:'1.2-2' }}</h3>
                </div>
                <div class="rounded-3 p-2" style="background:rgba(124,58,237,0.15)">
                  <i class="bi bi-wallet2 fs-4" style="color:#7c3aed"></i>
                </div>
              </div>
              <a routerLink="/seller/payouts" class="small text-decoration-none mt-2 d-block" style="color:#7c3aed">
                Request payout →
              </a>
            </div>
          </div>
        </div>

      </div>

      <!-- Low Stock Alert -->
      @if (lowStockProducts().length > 0) {
        <div class="alert border-0 rounded-4 mb-4 d-flex align-items-start gap-3"
          style="background:#fef3c7">
          <i class="bi bi-exclamation-triangle-fill mt-1" style="color:#d97706;font-size:1.2rem"></i>
          <div class="flex-grow-1">
            <strong style="color:#92400e">Low Stock Warning</strong>
            <p class="mb-2 small" style="color:#78350f">
              {{ lowStockProducts().length }} product(s) running low on stock
            </p>
            <div class="d-flex flex-wrap gap-2">
              @for (p of lowStockProducts().slice(0,5); track p._id) {
                <span class="badge rounded-pill px-3" style="background:#fde68a;color:#92400e">
                  {{ p.title }} ({{ p.stock_quantity }} left)
                </span>
              }
            </div>
          </div>
          <a routerLink="/seller/products" class="btn btn-sm rounded-pill"
            style="background:#f59e0b;color:#fff;border:none;white-space:nowrap">
            Manage Stock
          </a>
        </div>
      }

      <!-- Recent Orders -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0">Recent Orders</h5>
          <a routerLink="/seller/orders" class="btn btn-sm btn-outline-primary rounded-pill px-3">
            View All
          </a>
        </div>
        <div class="card-body p-0">
          @if (isLoading()) {
            <div class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></div>
          } @else if (recentOrders().length === 0) {
            <div class="text-center py-4 text-muted">
              <i class="bi bi-bag d-block mb-2 fs-3"></i>
              <p class="mb-0 small">No orders yet</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead style="background:#f8fafc">
                  <tr class="text-muted small text-uppercase">
                    <th class="ps-4">Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th class="pe-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  @for (o of recentOrders(); track o._id) {
                    <tr>
                      <td class="ps-4 font-monospace small fw-bold">#{{ o._id.slice(-8).toUpperCase() }}</td>
                      <td class="small text-muted">{{ o.items.length }} item(s)</td>
                      <td class="fw-semibold text-success">\${{ o.total_price | number:'1.2-2' }}</td>
                      <td>
                        <span class="badge rounded-pill px-3" [ngClass]="statusClass(o.status)">
                          {{ o.status | titlecase }}
                        </span>
                      </td>
                      <td class="pe-4 small text-muted">{{ o.createdAt | date:'MMM d, y' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card border-0 shadow-sm rounded-4">
        <div class="card-header bg-transparent border-0 pt-4 px-4">
          <h5 class="fw-bold mb-0">Quick Actions</h5>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <a routerLink="/seller/products" class="card border-0 rounded-4 text-center p-3 text-decoration-none h-100"
                style="background:#f0f9ff;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                <i class="bi bi-plus-circle d-block mb-2 fs-3 text-primary"></i>
                <span class="small fw-semibold text-primary">Add Product</span>
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a routerLink="/seller/orders" class="card border-0 rounded-4 text-center p-3 text-decoration-none h-100"
                style="background:#f0fdf4;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                <i class="bi bi-truck d-block mb-2 fs-3 text-success"></i>
                <span class="small fw-semibold text-success">Ship Orders</span>
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a routerLink="/seller/payouts" class="card border-0 rounded-4 text-center p-3 text-decoration-none h-100"
                style="background:#faf5ff;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                <i class="bi bi-cash-coin d-block mb-2 fs-3" style="color:#7c3aed"></i>
                <span class="small fw-semibold" style="color:#7c3aed">Request Payout</span>
              </a>
            </div>
            <div class="col-6 col-md-3">
              <a routerLink="/profile" class="card border-0 rounded-4 text-center p-3 text-decoration-none h-100"
                style="background:#fff7ed;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                <i class="bi bi-person-circle d-block mb-2 fs-3" style="color:#ea580c"></i>
                <span class="small fw-semibold" style="color:#ea580c">My Profile</span>
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class SellerDashboardComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly authService   = inject(AuthService);

  readonly currentUser  = this.authService.currentUser;
  readonly isLoading    = signal(false);
  readonly totalProducts   = signal(0);
  readonly totalOrders     = signal(0);
  readonly pendingOrders   = signal(0);
  readonly walletBalance   = signal(0);
  readonly recentOrders    = signal<SellerOrder[]>([]);
  readonly lowStockProducts = signal<SellerProduct[]>([]);
  readonly storeName = signal<string>('');

  ngOnInit(): void {
    const user: any = this.authService.currentUser();
    if (user?.wallet_balance !== undefined) this.walletBalance.set(user.wallet_balance);
    if (user?.seller_profile?.store_name) this.storeName.set(user.seller_profile.store_name);

    this.loadStats();
  }

  private loadStats(): void {
    this.isLoading.set(true);

    // Load products stats
    this.sellerService.getMyProducts({ limit: 100 }).subscribe({
      next: (res) => {
        const products = res.data.products;
        this.totalProducts.set(res.data.pagination.total);
        this.lowStockProducts.set(products.filter(p => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 10));
      },
    });

    // Load orders stats
    this.sellerService.getMyOrders().subscribe({
      next: (res) => {
        const orders = res.data;
        this.totalOrders.set(orders.length);
        this.pendingOrders.set(orders.filter(o => o.status === 'pending' || o.status === 'processing').length);
        this.recentOrders.set(orders.slice(0, 5));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
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
