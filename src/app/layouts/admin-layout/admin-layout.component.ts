import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacadeService } from '../../domains/auth/services/auth-facade.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="closeSidebar()"></div>
      }

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <div class="d-flex align-items-center justify-content-between">
            @if (!sidebarCollapsed()) {
              <h4 class="mb-0">Admin Panel</h4>
            }
            <button class="btn btn-sm btn-outline-light d-lg-none" (click)="closeSidebar()">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/admin' }"
              class="nav-item"
              (click)="onNavClick()"
            >
              <i class="bi" [class]="item.icon"></i>
              @if (!sidebarCollapsed()) {
                <span>{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          @if (!sidebarCollapsed()) {
            <div class="user-info mb-3">
              <small class="text-muted">Logged in as Admin</small>
            </div>
          }
          <button (click)="logout()" class="btn btn-outline-light w-100" [class.btn-sm]="sidebarCollapsed()">
            <i class="bi bi-box-arrow-right"></i>
            @if (!sidebarCollapsed()) {
              <span class="ms-2">Logout</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="admin-content">
        <!-- Top Header -->
        <header class="admin-header">
          <div class="d-flex align-items-center">
            <button class="btn btn-link text-dark d-lg-none me-2" (click)="toggleSidebar()">
              <i class="bi bi-list fs-4"></i>
            </button>
            <button
              class="btn btn-link text-dark me-3 d-none d-lg-inline-block"
              (click)="toggleSidebarCollapse()"
            >
              <i class="bi" [class]="sidebarCollapsed() ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
            </button>
            <h5 class="mb-0 d-none d-md-block">Dashboard</h5>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="text-muted d-none d-sm-inline">{{ today | date:'fullDate' }}</span>
          </div>
        </header>

        <!-- Page Content -->
        <div class="admin-page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
      position: relative;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      height: 100vh;
      height: 100dvh; /* Use dynamic viewport height for better mobile support */
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .sidebar-collapsed .sidebar {
      width: 70px;
    }

    .sidebar-overlay {
      display: none;
    }

    @media (max-width: 991.98px) {
      .sidebar {
        transform: translateX(-100%);
        width: 260px !important;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
      }
    }

    .sidebar-header {
      padding: 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      min-height: 60px;
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .sidebar-header h4 {
      margin: 0;
      font-weight: 600;
      font-size: 1.1rem;
      white-space: nowrap;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
    }

    /* Custom scrollbar for sidebar */
    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.3);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      margin: 2px 0;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-item.active {
      background: rgba(52, 152, 219, 0.2);
      color: white;
      border-left-color: #3498db;
    }

    .nav-item i {
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
      flex-shrink: 0;
    }

    .sidebar-collapsed .nav-item {
      justify-content: center;
      padding: 0.875rem;
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      flex-shrink: 0;
    }

    .sidebar-collapsed .sidebar-footer {
      padding: 1rem 0.5rem;
    }

    .user-info {
      padding: 0.5rem 0;
      text-align: center;
    }

    /* Main Content */
    .admin-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
      width: calc(100% - 260px);
    }

    .sidebar-collapsed .admin-content {
      margin-left: 70px;
      width: calc(100% - 70px);
    }

    @media (max-width: 991.98px) {
      .admin-content {
        margin-left: 0 !important;
        width: 100% !important;
      }
    }

    .admin-header {
      background: white;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }

    .admin-page-content {
      flex: 1;
      padding: 0;
      overflow-x: hidden;
    }

    /* Responsive adjustments */
    @media (max-width: 767.98px) {
      .admin-header {
        padding: 0.75rem 1rem;
      }

      .admin-page-content {
        padding: 0;
      }
    }

    /* Prevent body scroll when sidebar is open on mobile */
    @media (max-width: 991.98px) {
      body:has(.sidebar.open) {
        overflow: hidden;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  readonly navItems: NavItem[] = [
    { label: 'Profile Data', icon: 'bi bi-person-circle', route: '/admin/profile' },
    { label: 'Dashboard', icon: 'bi-grid-1x2', route: '/admin' },
    { label: 'User Management', icon: 'bi bi-person-fill-gear', route: '/admin/users' },
    { label: 'Orders', icon: 'bi-cart3', route: '/admin/orders' },
    { label: 'Products', icon: 'bi-box-seam', route: '/admin/products' },
    { label: 'Categories', icon: 'bi-tags', route: '/admin/categories' },
    { label: 'Coupons', icon: 'bi-percent', route: '/admin/coupons' },
    { label: 'Seller Requests', icon: 'bi bi-terminal-plus', route: '/admin/sellerrequest' },
    { label: 'Payment Done', icon: 'bi bi-credit-card-2-front', route: '/admin/payment' },
    { label: 'Marketing Brodcust', icon: 'bi bi-send-check-fill', route: '/admin/brodcust' },
    { label: 'Seller Payout', icon: 'bi bi-sign-turn-slight-left', route: '/admin/payout' },


  ];

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly today = new Date();

  constructor(
    private readonly authFacade: AuthFacadeService
  ) { }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  onNavClick(): void {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 992) {
      this.closeSidebar();
    }
  }

  logout(): void {
    this.authFacade.logout();
  }
}
