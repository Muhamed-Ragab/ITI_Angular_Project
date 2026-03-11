import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiService } from '@app/core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { SellerRequestUser, SellerRequestsResponse } from '../dto/seller-request';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private api = inject(ApiService);
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // GET seller requests
  getSellerRequests(): Observable<SellerRequestUser[]> {
  return this.http
    .get<SellerRequestsResponse>(
      `${this.baseUrl}/users/admin/seller-requests`
    )
    .pipe(map(res => res.data ?? []));
}

  // PATCH review request
  reviewSellerRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    note?: string
  ): Observable<any> {
    return this.api
      .patch<{ success: boolean; data: any }>(
        `/users/admin/seller-requests/${requestId}`,
        { status, ...(note ? { note } : {}) }
      )
      .pipe(map(res => res.data));
  }

}