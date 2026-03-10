import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';

export interface Payment {
  _id: string;
  user: string;           
  total_amount: number;  
  status: string;
  createdAt: string;
}

export interface AdminPaymentsResponse {
  payments: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminPaymentService {
  private api = inject(ApiService);

  getAdminPayments(): Observable<AdminPaymentsResponse> {
    return this.api
      .get<{ success: boolean; data: AdminPaymentsResponse }>('/payments?status=paid&page=1&limit=10')
      .pipe(map(res => res.data));
  }
}