import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminCouponService } from '@domains/coupons/admin/services/admin-coupon.service';
import { AdminOrderService } from '@domains/orders/admin/services/admin-order.service';
import { AdminProductService } from '@domains/products/admin/services/admin-product.service';
import { AdminService } from '@domains/usermanagment/admin-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'product' | 'coupon';
  message: string;
  timestamp: string;
}

interface RecentOrder {
  _id: string;
  user: string | null;
  guest_info: { name: string } | null;
  total_amount: number;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="mb-4">{{ 'adminDashboard.title' | translate }}</h2>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        @for (stat of stats(); track stat.title) {
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1">{{ stat.title | translate }}</p>
                    <h3 class="mb-0">{{ stat.value }}</h3>
                  </div>
                  <div
                    class="stat-icon"
                    [style.background]="stat.color + '20'"
                    [style.color]="stat.color"
                  >
                    <i class="bi" [class]="stat.icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0">
                <i class="bi bi-lightning-charge me-2"></i
                >{{ 'adminDashboard.quickActions' | translate }}
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6">
                  <a routerLink="/admin/users" class="btn btn-outline-primary w-100 py-3">
                    <i class="bi bi-person-fill-gear d-block fs-4 mb-1"></i>
                    {{ 'adminDashboard.manageUsers' | translate }}
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/orders" class="btn btn-outline-primary w-100 py-3">
                    <i class="bi bi-cart3 d-block fs-4 mb-1"></i>
                    {{ 'adminDashboard.manageOrders' | translate }}
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/products" class="btn btn-outline-success w-100 py-3">
                    <i class="bi bi-box-seam d-block fs-4 mb-1"></i>
                    {{ 'adminDashboard.manageProducts' | translate }}
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/coupons" class="btn btn-outline-warning w-100 py-3">
                    <i class="bi bi-percent d-block fs-4 mb-1"></i>
                    {{ 'adminDashboard.manageCoupons' | translate }}
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/categories" class="btn btn-outline-info w-100 py-3">
                    <i class="bi bi-tags d-block fs-4 mb-1"></i>
                    {{ 'adminDashboard.manageCategories' | translate }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-12 col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0">
                <i class="bi bi-clock-history me-2"></i
                >{{ 'adminDashboard.recentActivity' | translate }}
              </h5>
            </div>
            <div class="card-body">
              @if (isLoading()) {
                <div class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">{{ 'adminDashboard.loading' | translate }}</span>
                  </div>
                </div>
              } @else if (recentActivities().length > 0) {
                <div class="list-group list-group-flush">
                  @for (activity of recentActivities(); track activity.id) {
                    <div class="list-group-item border-0 px-0">
                      <div class="d-flex w-100 justify-content-between">
                        <small class="text-muted">{{ activity.type | titlecase }}</small>
                        <small class="text-muted">{{ activity.timestamp | date: 'short' }}</small>
                      </div>
                      <p class="mb-0 small">{{ activity.message }}</p>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center text-muted py-4">
                  <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                  <p class="mb-0">{{ 'adminDashboard.noActivity' | translate }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Preview -->
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-cart3 me-2"></i>{{ 'adminDashboard.recentOrders' | translate }}
          </h5>
          <a routerLink="/admin/orders" class="btn btn-sm btn-primary">{{
            'adminDashboard.viewAll' | translate
          }}</a>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>{{ 'adminDashboard.orderNumber' | translate }}</th>
                  <th>{{ 'adminDashboard.customer' | translate }}</th>
                  <th>{{ 'adminDashboard.total' | translate }}</th>
                  <th>{{ 'adminDashboard.status' | translate }}</th>
                  <th>{{ 'adminDashboard.date' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @if (recentOrders().length > 0) {
                  @for (order of recentOrders(); track order._id) {
                    <tr>
                      <td>#{{ order._id.slice(-6) }}</td>
                      <td>{{ getCustomerName(order) }}</td>
                      <td>{{ order.total_amount | currency }}</td>
                      <td>
                        <span class="badge" [class]="getStatusBadgeClass(order.status)">
                          {{ adminOrderStatusKey(order.status) | translate }}
                        </span>
                      </td>
                      <td>{{ order.createdAt | date: 'medium' }}</td>
                    </tr>
                  }
                } @else {
                  <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                      {{ 'adminDashboard.noOrders' | translate }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminProductService = inject(AdminProductService);
  private readonly adminOrderService = inject(AdminOrderService);
  private readonly adminCouponService = inject(AdminCouponService);
  private readonly adminService = inject(AdminService);
  private readonly translate = inject(TranslateService);

  readonly stats = signal<StatCard[]>([
    { title: 'adminDashboard.totalOrders', value: '0', icon: 'bi-cart3', color: '#3498db' },
    { title: 'adminDashboard.totalProducts', value: '0', icon: 'bi-box-seam', color: '#27ae60' },
    { title: 'adminDashboard.totalCoupons', value: '0', icon: 'bi-percent', color: '#f39c12' },
    { title: 'adminDashboard.totalUsers', value: '0', icon: 'bi-people', color: '#9b59b6' },
  ]);

  readonly recentActivities = signal<RecentActivity[]>([]);
  readonly recentOrders = signal<RecentOrder[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    // Load all statistics in parallel
    this.adminOrderService.getOrders({ limit: 1 }).subscribe({
      next: (response) => {
        const totalOrders = response.data?.pagination?.total ?? 0;
        this.updateStat('adminDashboard.totalOrders', totalOrders);
      },
      error: () => this.updateStat('adminDashboard.totalOrders', 0),
    });

    this.adminProductService.getProducts({ limit: 1 }).subscribe({
      next: (response) => {
        const totalProducts = response.data?.pagination?.total ?? 0;
        this.updateStat('adminDashboard.totalProducts', totalProducts);
      },
      error: () => this.updateStat('adminDashboard.totalProducts', 0),
    });

    this.adminCouponService.getCoupons({ limit: 1 }).subscribe({
      next: (response) => {
        const totalCoupons = response.data?.pagination?.total ?? 0;
        this.updateStat('adminDashboard.totalCoupons', totalCoupons);
      },
      error: () => this.updateStat('adminDashboard.totalCoupons', 0),
    });

    this.adminService.getUsers().subscribe({
      next: (response) => {
        const totalUsers = response.data?.length ?? 0;
        this.updateStat('adminDashboard.totalUsers', totalUsers);
      },
      error: () => this.updateStat('adminDashboard.totalUsers', 0),
    });

    // Load recent orders
    this.adminOrderService.getOrders({ limit: 5, sort: 'createdAt_desc' }).subscribe({
      next: (response) => {
        this.recentOrders.set(response.data?.orders ?? []);
        this.generateRecentActivities(response.data?.orders ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private updateStat(title: string, value: number): void {
    this.stats.update((stats) =>
      stats.map((stat) =>
        stat.title === title ? { ...stat, value: value.toLocaleString() } : stat,
      ),
    );
  }

  private generateRecentActivities(orders: RecentOrder[]): void {
    const activities: RecentActivity[] = orders.slice(0, 5).map((order) => ({
      id: order._id,
      type: 'order' as const,
      message: `New order #${order._id.slice(-6)} - ${order.total_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
      timestamp: order.createdAt,
    }));
    this.recentActivities.set(activities);
  }

  getCustomerName(order: RecentOrder): string {
    if (order.guest_info?.name) {
      return order.guest_info.name;
    }
    return this.translate.instant('adminDashboard.guest');
  }

  adminOrderStatusKey(status: string): string {
    const map: Record<string, string> = {
      pending: 'adminOrders.pending',
      paid: 'adminOrders.paid',
      shipped: 'adminOrders.shipped',
      delivered: 'adminOrders.delivered',
      cancelled: 'adminOrders.cancelled',
    };
    return map[status] ?? status;
  }

  getStatusBadgeClass(status: string): string {
    const statusClasses: Record<string, string> = {
      pending: 'bg-warning',
      shipped: 'bg-info',
      delivered: 'bg-success',
      cancelled: 'bg-danger',
      paid: 'bg-success',
    };
    return statusClasses[status] || 'bg-secondary';
  }
}
