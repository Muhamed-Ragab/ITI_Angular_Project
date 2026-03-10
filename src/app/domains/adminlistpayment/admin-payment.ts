import { Injectable, inject } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';

export interface Payment {
  _id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  paymentMethod: string;
  customerName?: string;
  createdAt: string;
}

export interface AdminPaymentsResponse {
  payments: Payment[];
  totalRevenue: number;
  pagination: {
    total: number;
    page: number;
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
      .get<{ success: boolean; data: AdminPaymentsResponse }>('/payments/admin')
      .pipe(map(res => res.data));
  }
}