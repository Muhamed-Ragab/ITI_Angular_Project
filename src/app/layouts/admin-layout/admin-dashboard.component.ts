import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="mb-4">Admin Dashboard</h2>
      
      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        @for (stat of stats(); track stat.title) {
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="text-muted mb-1">{{ stat.title }}</p>
                    <h3 class="mb-0">{{ stat.value }}</h3>
                    @if (stat.change) {
                      <small [class]="stat.changeType === 'positive' ? 'text-success' : stat.changeType === 'negative' ? 'text-danger' : 'text-muted'">
                        <i [class]="stat.changeType === 'positive' ? 'bi-arrow-up' : stat.changeType === 'negative' ? 'bi-arrow-down' : ''"></i>
                        {{ stat.change }}
                      </small>
                    }
                  </div>
                  <div class="stat-icon" [style.background]="stat.color + '20'" [style.color]="stat.color">
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
              <h5 class="mb-0"><i class="bi bi-lightning-charge me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-6">
                  <a routerLink="/admin/orders" class="btn btn-outline-primary w-100 py-3">
                    <i class="bi bi-cart3 d-block fs-4 mb-1"></i>
                    Manage Orders
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/products" class="btn btn-outline-success w-100 py-3">
                    <i class="bi bi-box-seam d-block fs-4 mb-1"></i>
                    Manage Products
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/coupons" class="btn btn-outline-warning w-100 py-3">
                    <i class="bi bi-percent d-block fs-4 mb-1"></i>
                    Manage Coupons
                  </a>
                </div>
                <div class="col-6">
                  <a routerLink="/admin/categories" class="btn btn-outline-info w-100 py-3">
                    <i class="bi bi-tags d-block fs-4 mb-1"></i>
                    Manage Categories
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity placeholder -->
        <div class="col-12 col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-white">
              <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Recent Activity</h5>
            </div>
            <div class="card-body">
              <div class="text-center text-muted py-4">
                <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                <p class="mb-0">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders Preview -->
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-cart3 me-2"></i>Recent Orders</h5>
          <a routerLink="/admin/orders" class="btn btn-sm btn-primary">View All</a>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-inbox d-block fs-1 mb-2"></i>
                    No orders yet
                  </td>
                </tr>
              </tbody>
            </table>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  readonly stats = signal<StatCard[]>([
    { title: 'Total Orders', value: '0', icon: 'bi-cart3', color: '#3498db', change: '0%', changeType: 'neutral' },
    { title: 'Total Products', value: '0', icon: 'bi-box-seam', color: '#27ae60', change: '0%', changeType: 'neutral' },
    { title: 'Total Coupons', value: '0', icon: 'bi-percent', color: '#f39c12', change: '0%', changeType: 'neutral' },
    { title: 'Total Users', value: '0', icon: 'bi-people', color: '#9b59b6', change: '0%', changeType: 'neutral' },
  ]);
}
