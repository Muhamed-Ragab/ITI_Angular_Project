import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacadeService } from '../../domains/auth/services/auth-facade.service';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seller-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div class="sidebar-overlay" (click)="closeSidebar()"></div>
      }

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <div class="d-flex align-items-center justify-content-between">
            @if (!sidebarCollapsed()) {
              <div>
                <h4 class="mb-0">Seller Panel</h4>
                @if (storeName()) {
                  <small class="opacity-50">{{ storeName() }}</small>
                }
              </div>
            } @else {
              <i class="bi bi-shop" style="font-size:1.3rem"></i>
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
              [routerLinkActiveOptions]="{ exact: item.route === '/seller' }"
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
              <div class="d-flex align-items-center gap-2">
                <div class="seller-avatar">{{ userInitial() }}</div>
                <div class="overflow-hidden">
                  <div class="text-white small fw-semibold text-truncate">{{ currentUser()?.name }}</div>
                  <div class="opacity-50" style="font-size:0.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    {{ currentUser()?.email }}
                  </div>
                </div>
              </div>
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
      <main class="seller-content">
        <!-- Top Header -->
        <header class="seller-header">
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
        <div class="seller-page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .seller-layout {
      display: flex;
      min-height: 100vh;
      background: #f8f9fa;
      position: relative;
    }

    /* Sidebar Styles */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1a2e1a 0%, #1a3a1e 50%, #0f2d14 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      height: 100vh;
      height: 100dvh;
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
        top: 0; left: 0; right: 0; bottom: 0;
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
      color: white;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }

    .sidebar-nav::-webkit-scrollbar { width: 6px; }
    .sidebar-nav::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
    .sidebar-nav::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

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
      background: rgba(74, 222, 128, 0.2);
      color: #4ade80;
      border-left-color: #4ade80;
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

    .seller-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4ade80, #22c55e);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #1a2e1a; font-size: 0.85rem;
      flex-shrink: 0;
    }

    /* Main Content */
    .seller-content {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
      width: calc(100% - 260px);
    }

    .sidebar-collapsed .seller-content {
      margin-left: 70px;
      width: calc(100% - 70px);
    }

    @media (max-width: 991.98px) {
      .seller-content {
        margin-left: 0 !important;
        width: 100% !important;
      }
    }

    .seller-header {
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

    .seller-page-content {
      flex: 1;
      padding: 0;
      overflow-x: hidden;
    }

    @media (max-width: 767.98px) {
      .seller-header { padding: 0.75rem 1rem; }
    }

    @media (max-width: 991.98px) {
      body:has(.sidebar.open) { overflow: hidden; }
    }
  `],
})
export class SellerLayoutComponent {
  private readonly authFacade  = inject(AuthFacadeService);
  private readonly authService = inject(AuthService);

  readonly currentUser      = this.authService.currentUser;
  readonly sidebarOpen      = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly today            = new Date();

  readonly navItems: NavItem[] = [
    { label: 'Profile Data',  icon: 'bi bi-person-circle', route: '/seller/profile' },
    { label: 'Dashboard',     icon: 'bi-grid-1x2',         route: '/seller' },
    { label: 'My Products',   icon: 'bi-box-seam',         route: '/seller/products' },
    { label: 'My Orders',     icon: 'bi-bag-check',        route: '/seller/orders' },
    { label: 'Payouts',       icon: 'bi-cash-coin',        route: '/seller/payouts' },
  ];

  storeName(): string {
    return (this.authService.currentUser() as any)?.seller_profile?.store_name ?? '';
  }

  userInitial(): string {
    return (this.authService.currentUser()?.name ?? 'S').charAt(0).toUpperCase();
  }

  toggleSidebar(): void         { this.sidebarOpen.update(v => !v); }
  closeSidebar(): void          { this.sidebarOpen.set(false); }
  toggleSidebarCollapse(): void { this.sidebarCollapsed.update(v => !v); }

  onNavClick(): void {
    if (window.innerWidth < 992) this.closeSidebar();
  }

  logout(): void { this.authFacade.logout(); }
}