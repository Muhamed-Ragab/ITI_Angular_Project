import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { SellerRequestUser } from '../dto/seller-request';

@Component({
  selector: 'app-admin-seller-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="container mt-4">


  @if(isLoading()) {
  <div class="text-center py-5">
    <div class="spinner-border text-primary"></div>
    <p class="mt-2">Loading seller requests...</p>
  </div>
} 
@else {
 <div class="card shadow">

      <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Seller Onboarding Requests</h5>
        <span class="badge bg-warning text-dark">
          {{ requests().length }} Requests
        </span>
      </div>

      <div class="card-body p-0">

        <table class="table table-hover table-striped mb-0">

          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Seller</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Store</th>
              <th>Bio</th>
              <th>Payout</th>
              <th>Status</th>
              <th style="width:200px">Admin Note</th>
              <th style="width:180px">Actions</th>
            </tr>
          </thead>

          <tbody>

            <tr *ngFor="let req of requests(); let i = index">

              <td>{{ i + 1 }}</td>

              <td class="fw-bold">{{ req.name }}</td>
              <td>{{ req.email }}</td>
              <td>{{ req.phone }}</td>
              <td>{{ req.seller_profile.store_name }}</td>
              <td>{{ req.seller_profile.bio }}</td>
              <td>
                <span class="badge bg-info">{{ req.seller_profile.payout_method }}</span>
              </td>
              <td>
                <span 
                  *ngIf="req.seller_profile.approval_status === 'pending'" 
                  class="badge bg-warning text-dark">Pending</span>
                <span 
                  *ngIf="req.seller_profile.approval_status === 'approved'" 
                  class="badge bg-success">Approved</span>
                <span 
                  *ngIf="req.seller_profile.approval_status === 'rejected'" 
                  class="badge bg-danger">Rejected</span>
              </td>
              <td>
                <input 
                  type="text" 
                  class="form-control form-control-sm" 
                  placeholder="Admin note..." 
                  [(ngModel)]="notes[req._id]" />
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-sm btn-success" 
                    (click)="approve(req._id)" 
                    [disabled]="req.seller_profile.approval_status !== 'pending'">
                    Approve
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    (click)="reject(req._id)" 
                    [disabled]="req.seller_profile.approval_status !== 'pending'">
                    Reject
                  </button>
                </div>
              </td>

            </tr>

            <tr *ngIf="requests().length === 0">
              <td colspan="10" class="text-center py-4 text-muted">
                No seller requests found
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>  
}
   </div>
  `
})
export class AdminSellerRequestsComponent implements OnInit {

  private adminService = inject(AdminService);
  requests = signal<SellerRequestUser[]>([]);
  notes: { [key: string]: string } = {};
  isLoading = signal(true);

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading.set(true);
    this.adminService.getSellerRequests().subscribe({
      next: (res) => {
        console.log("Seller Requests:", res);
        this.requests.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.requests.set([]);
        this.isLoading.set(false);
      }
    });
  }

  approve(id: string) {
    const note = this.notes[id] || '';
    this.adminService.reviewSellerRequest(id, 'approved', note).subscribe({
    next: () => {
      this.adminService.updateUserRole(id, 'seller').subscribe({
        next: () => {
          this.loadRequests();
        },
        error: (err) => console.error('Error updating role:', err)
      });
    },
    error: (err) => console.error('Error approving request:', err)
  });
  }
  
  reject(id: string) {
    const note = this.notes[id] || '';
    this.adminService.reviewSellerRequest(id, 'rejected', note).subscribe(() => {
      this.loadRequests();
    });
  }

}




