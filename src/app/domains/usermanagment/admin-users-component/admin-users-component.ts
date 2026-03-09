import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin-service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-5">
      <!-- Header + Search -->
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
              (input)="onSearch($event)">
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="isLoading(); else userTable" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading users...</p>
      </div>

      <!-- Users Table -->
      <ng-template #userTable>
        <div *ngIf="users().length > 0; else noUsers" class="card shadow-sm rounded-4 overflow-hidden">
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
                <tr *ngFor="let user of users(); trackBy: trackById" [class.table-secondary]="user.isDeleted">
                  <td class="ps-4">
                    <div class="d-flex align-items-center">
                      <div class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3" style="width:40px;height:40px;">
                        {{ user.name[0] }}
                      </div>
                      <div>
                        <div class="fw-bold">{{ user.name }}</div>
                        <div class="text-muted small">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge rounded-pill" [ngClass]="user.role==='admin'?'bg-primary':'bg-secondary'">{{ user.role }}</span>
                  </td>
                  <td>
                    <span class="badge rounded-pill" 
                          [ngClass]="user.isDeleted?'bg-secondary':user.isRestricted?'bg-danger':'bg-success'">
                      {{ user.isDeleted?'Deleted':user.isRestricted?'Banned':'Active' }}
                    </span>
                  </td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-warning me-1" (click)="openPointsModal(user)">
                      <i class="bi bi-star-fill"></i> Points
                    </button>
                    <button class="btn btn-sm" [ngClass]="user.isRestricted?'btn-success':'btn-outline-danger'" 
                            (click)="openConfirmModal('Ban/Unban User', user)">
                      {{ user.isRestricted?'Unban':'Ban' }}
                    </button>
                    <button class="btn btn-sm btn-danger ms-1" (click)="openConfirmModal('Delete User', user)" [disabled]="user.isDeleted">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-template>

      <!-- No Users Found -->
      <ng-template #noUsers>
        <div class="text-center py-5">
          <p class="text-muted mt-3">No users found matching your criteria.</p>
        </div>
      </ng-template>

      <!-- Toast Notifications -->
      <div class="position-fixed top-0 end-0 p-3" style="z-index:1050">
        <ng-container *ngFor="let toast of toasts">
          <div class="toast show align-items-center text-bg-{{toast.type}} border-0 mb-2" role="alert">
            <div class="d-flex">
              <div class="toast-body">{{ toast.message }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="removeToast(toast)"></button>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Grant Points Modal -->
      <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': showPointsModal}" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Grant Points to {{ selectedUser?.name }}</h5>
              <button type="button" class="btn-close" (click)="closePointsModal()"></button>
            </div>
            <div class="modal-body">
              <input type="number" class="form-control" placeholder="Enter points" [(ngModel)]="pointsToAdd">
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closePointsModal()">Cancel</button>
              <button class="btn btn-primary" (click)="submitPoints()">Grant</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Modal -->
      <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': showConfirmModal}" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ confirmTitle }}</h5>
              <button type="button" class="btn-close" (click)="closeConfirmModal()"></button>
            </div>
            <div class="modal-body">
              <p>{{ confirmMessage }}</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeConfirmModal()">Cancel</button>
              <button class="btn btn-danger" (click)="confirmAction()">Yes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-responsive { overflow-x: auto; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<any[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  searchTimeout: any;

  // Toasts
  toasts: {message:string,type:'success'|'danger'|'warning'}[] = [];

  // Grant Points Modal
  showPointsModal = false;
  selectedUser: any = null;
  pointsToAdd: number | null = null;

  // Confirm Modal
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmCallback: (()=>void) | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    const params = { page:1, limit:50, search:this.searchTerm() };
    this.adminService.getUsers(params).subscribe({
      next: (res:any) => {
        const data = res.data || res;
        this.users.set(Array.isArray(data)?data:[]);
        this.isLoading.set(false);
      },
      error: (err) => { this.showToast(err.error?.message || 'Error fetching users','danger'); this.isLoading.set(false); }
    });
  }

  onSearch(event:any){
    const value = event.target.value;
    this.searchTerm.set(value);
    if(this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(()=>this.loadData(),300);
  }

  trackById(index:number,user:any){ return user._id; }

  // Toasts
  showToast(message:string,type:'success'|'danger'|'warning'='success'){
    this.toasts.push({message,type});
    setTimeout(()=>this.toasts.shift(),4000);
  }
  removeToast(toast:any){
    const idx = this.toasts.indexOf(toast);
    if(idx>-1) this.toasts.splice(idx,1);
  }

  // Grant Points Modal
  openPointsModal(user:any){
    this.selectedUser = user;
    this.pointsToAdd = null;
    this.showPointsModal = true;
  }
  closePointsModal(){ this.showPointsModal = false; }
  submitPoints(){
    if(this.pointsToAdd && !isNaN(this.pointsToAdd)){
      this.adminService.grantLoyaltyPoints(this.selectedUser._id,this.pointsToAdd).subscribe({
        next: ()=> this.showToast('Points added!','success'),
        error: (err)=> this.showToast(err.error?.message||'Error','danger'),
        complete: ()=> { this.loadData(); this.closePointsModal(); }
      });
    } else this.showToast('Enter a valid number','warning');
  }

  // Confirm Modal
  openConfirmModal(action:string,user:any){
    this.selectedUser = user;
    this.confirmTitle = action;
    this.confirmMessage = action==='Delete User'?`Delete ${user.name}?`:`${user.isRestricted?'Unban':'Ban'} ${user.name}?`;
    this.confirmCallback = ()=> {
      if(action==='Delete User'){
        this.adminService.softDeleteUser(user._id).subscribe({
          next:()=> { this.showToast(`${user.name} deleted!`,'warning'); this.loadData(); },
          error:(err)=> this.showToast(err.error?.message||'Error','danger')
        });
      } else {
        this.adminService.toggleBan(user._id,!user.isRestricted).subscribe({
          next:()=> this.showToast(user.isRestricted?'User unbanned':'User banned','success'),
          error:(err)=> this.showToast(err.error?.message||'Error','danger'),
          complete: ()=> this.loadData()
        });
      }
    };
    this.showConfirmModal = true;
  }
  closeConfirmModal(){ this.showConfirmModal=false; }
  confirmAction(){ if(this.confirmCallback) this.confirmCallback(); this.closeConfirmModal(); }
}