import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin-service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-5">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div class="mb-3 mb-md-0">
          <h2 class="fw-bold text-dark m-0">User Management</h2>
          <p class="text-muted small m-0">Control permissions, roles, and engagement for SouqMasr users.</p>
        </div>
        <div class="w-100 w-md-auto">
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control border-start-0"
              placeholder="Search by name or email..."
              (input)="onSearch($event)"
            />
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="text-muted mt-2">Loading users...</p>
        </div>
      } @else {
        @if (users().length > 0) {
          <div class="card shadow-sm rounded-4 overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">User Profile</th>
                    <th>Account Role</th>
                    <th>Status</th>
                    <th class="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user._id) {
                    <tr [class.table-secondary]="user.isDeleted">
                      <td class="ps-4">
                        <div class="d-flex align-items-center">
                          <div
                            class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3 shadow-sm"
                            style="width:40px;height:40px; font-weight: bold;"
                          >
                            {{ user.name[0]?.toUpperCase() }}
                          </div>
                          <div>
                            <div class="fw-bold">{{ user.name }}</div>
                            <div class="text-muted small">{{ user.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select 
                          class="form-select form-select-sm fw-bold border-0 shadow-none px-3"
                          [ngClass]="{
                            'text-primary bg-primary-subtle': user.role === 'admin',
                            'text-success bg-success-subtle': user.role === 'seller',
                            'text-secondary bg-light': user.role === 'customer'
                          }"
                          style="width: 130px; border-radius: 20px;"
                          [disabled]="user.isDeleted"
                          (change)="onRoleChange(user._id, $any($event.target).value)"
                        >
                          <option value="customer" [selected]="user.role === 'customer'">Customer</option>
                          <option value="seller" [selected]="user.role === 'seller'">Seller</option>
                          <option value="admin" [selected]="user.role === 'admin'"> Admin</option>
                        </select>
                      </td>
                      <td>
                        <span
                          class="badge rounded-pill px-3"
                          [ngClass]="
                            user.isDeleted ? 'bg-secondary' : 
                            user.isRestricted ? 'bg-danger' : 'bg-success'
                          "
                        >
                          {{ user.isDeleted ? 'Deleted' : user.isRestricted ? 'Banned' : 'Active' }}
                        </span>
                      </td>
                      <td class="text-end pe-4">
                        <button
                          class="btn btn-sm btn-outline-warning me-1 shadow-sm"
                          (click)="openPointsModal(user)"
                          [disabled]="user.isDeleted"
                        >
                          <i class="bi bi-star-fill"></i>
                        </button>
                        <button
                          class="btn btn-sm shadow-sm"
                          [ngClass]="user.isRestricted ? 'btn-success' : 'btn-outline-danger'"
                          (click)="openConfirmModal('Ban/Unban User', user)"
                          [disabled]="user.isDeleted"
                        >
                          {{ user.isRestricted ? 'Unban' : 'Ban' }}
                        </button>
                        <button
                          class="btn btn-sm btn-danger ms-1 shadow-sm"
                          (click)="openConfirmModal('Delete User', user)"
                          [disabled]="user.isDeleted"
                        >
                          <i class="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <div class="text-center py-5">
            <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
            <p class="text-muted mt-3">No users found matching your criteria.</p>
          </div>
        }
      }

      <div class="position-fixed top-0 end-0 p-3" style="z-index:2000">
        @for (toast of toasts; track $index) {
          <div class="toast show align-items-center text-bg-{{ toast.type }} border-0 mb-2 shadow-lg">
            <div class="d-flex">
              <div class="toast-body">{{ toast.message }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="removeToast(toast)"></button>
            </div>
          </div>
        }
      </div>

      @if (showPointsModal) {
        <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
              <div class="modal-header bg-warning text-dark">
                <h5 class="modal-title fw-bold"><i class="bi bi-award me-2"></i>Loyalty Points</h5>
                <button type="button" class="btn-close" (click)="closePointsModal()"></button>
              </div>
              <div class="modal-body p-4">
                <p>Grant points to <strong>{{ selectedUser?.name }}</strong></p>
                <input type="number" class="form-control form-control-lg rounded-3" placeholder="Enter amount..." [(ngModel)]="pointsToAdd" />
              </div>
              <div class="modal-footer border-0">
                <button class="btn btn-light px-4" (click)="closePointsModal()">Cancel</button>
                <button class="btn btn-warning px-4 fw-bold" (click)="submitPoints()">Grant Points</button>
              </div>
            </div>
          </div>
        </div>
      }

      @if (showConfirmModal) {
        <div class="modal fade show d-block" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
              <div class="modal-header" [ngClass]="confirmTitle.includes('Delete') ? 'bg-danger text-white' : 'bg-primary text-white'">
                <h5 class="modal-title fw-bold">{{ confirmTitle }}</h5>
                <button type="button" class="btn-close btn-close-white" (click)="closeConfirmModal()"></button>
              </div>
              <div class="modal-body py-4 text-center">
                <p class="m-0 fs-5">{{ confirmMessage }}</p>
              </div>
              <div class="modal-footer border-0 justify-content-center">
                <button class="btn btn-light px-4" (click)="closeConfirmModal()">Cancel</button>
                <button class="btn px-4 fw-bold" [ngClass]="confirmTitle.includes('Delete') ? 'btn-danger' : 'btn-primary'" (click)="confirmAction()">
                  Yes, Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .table-responsive { overflow-x: auto; }
    .bg-primary-subtle { background-color: #cfe2ff !important; color: #084298 !important; }
    .bg-success-subtle { background-color: #d1e7dd !important; color: #0f5132 !important; }
    .form-select-sm { cursor: pointer; transition: all 0.2s; }
    .toast { min-width: 280px; border-radius: 12px; }
    .card { border: none; border-radius: 15px; }
  `],
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<any[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  searchTimeout: any;

  toasts: { message: string; type: string }[] = [];
  showPointsModal = false;
  showConfirmModal = false;
  selectedUser: any = null;
  pointsToAdd: number | null = null;
  confirmTitle = '';
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.adminService.getUsers().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        this.users.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Error fetching users', 'danger');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadData(), 300);
  }

  onRoleChange(userId: string, newRole: string) {
    this.adminService.updateUserRole(userId, newRole).subscribe({
      next: () => {
        this.showToast(`User role updated to ${newRole.toUpperCase()}`, 'success');
        this.users.update(list => list.map(u => u._id === userId ? { ...u, role: newRole } : u));
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to update role', 'danger');
        this.loadData();
      }
    });
  }

  showToast(message: string, type: string = 'success') {
    const toast = { message, type };
    this.toasts.push(toast);
    setTimeout(() => this.removeToast(toast), 4000);
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  openPointsModal(user: any) {
    this.selectedUser = user;
    this.pointsToAdd = null;
    this.showPointsModal = true;
  }

  closePointsModal() { this.showPointsModal = false; }

  submitPoints() {
    if (this.pointsToAdd && !isNaN(this.pointsToAdd)) {
      this.adminService.grantLoyaltyPoints(this.selectedUser._id, this.pointsToAdd).subscribe({
        next: () => {
          this.showToast(`${this.pointsToAdd} points added to ${this.selectedUser.name}`, 'success');
          this.closePointsModal();
          this.loadData();
        },
        error: (err) => this.showToast(err.error?.message || 'Error', 'danger')
      });
    }
  }

  openConfirmModal(action: string, user: any) {
    this.selectedUser = user;
    this.confirmTitle = action;
    this.confirmMessage = action === 'Delete User' ? `Are you sure? This will delete ${user.name} permanently.` : `Toggle restriction for ${user.name}?`;
    this.confirmCallback = () => {
      if (action === 'Delete User') {
        this.adminService.softDeleteUser(user._id).subscribe({
          next: () => { this.showToast('User deleted', 'warning'); this.loadData(); },
          error: (err) => this.showToast(err.error?.message || 'Error', 'danger')
        });
      } else {
        this.adminService.toggleBan(user._id, !user.isRestricted).subscribe({
          next: () => { this.showToast('User status updated', 'success'); this.loadData(); },
          error: (err) => this.showToast(err.error?.message || 'Error', 'danger')
        });
      }
    };
    this.showConfirmModal = true;
  }

  closeConfirmModal() { this.showConfirmModal = false; }

  confirmAction() {
    if (this.confirmCallback) this.confirmCallback();
    this.closeConfirmModal();
  }
}