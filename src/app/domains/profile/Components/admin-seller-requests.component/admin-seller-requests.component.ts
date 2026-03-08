import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-seller-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card border-0 shadow-sm mt-4 bg-white border-top border-4 border-warning">
      <div class="card-body p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark">Admin: Pending Seller Requests</h5>

          <button class="btn btn-warning btn-sm fw-bold" (click)="refresh.emit()">
            Refresh List
          </button>
        </div>

        @if (requests.length > 0) {
          <div class="list-group list-group-flush border rounded shadow-sm bg-white p-2">
            @for (req of requests; track req._id) {
              <div class="list-group-item d-flex justify-content-between align-items-start py-3">
                <div class="ms-2 me-auto">
                  <div class="fw-bold text-primary">
                    {{ req.name }}
                  </div>

                  <div class="small text-muted mb-1">
                    {{ req.email }}
                  </div>

                  <div class="small fw-bold">Store: {{ req.store_name || 'Not Provided' }}</div>

                  <div class="small text-secondary">
                    {{ req.phone }}
                  </div>
                </div>

                <div class="text-end">
                  <span class="badge bg-warning text-dark px-3 py-2"> PENDING </span>

                  <div class="mt-2">
                    <button class="btn btn-sm btn-success me-1">Approve</button>
                    <button class="btn btn-sm btn-outline-danger">Reject</button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="alert alert-light text-center border">No requests to show.</div>
        }
      </div>
    </div>
  `,
})
export class AdminSellerRequestsComponent {
  @Input() requests: any[] = [];
  @Output() refresh = new EventEmitter();
  
}
