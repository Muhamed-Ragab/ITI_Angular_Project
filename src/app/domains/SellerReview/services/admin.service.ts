import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ApiService } from '@app/core/services/api.service';
import { SellerRequestUser, SellerRequestsResponse } from '../dto/seller-request';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // GET /users/admin/seller-requests
  // Returns { success, data: SellerRequestUser[] } — data is a direct array
  getSellerRequests(): Observable<SellerRequestUser[]> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    });
    return this.http
      .get<SellerRequestsResponse>(
        `${this.baseUrl}/users/admin/seller-requests`,
        { headers }
      )
      .pipe(map(res => res.data));  // data IS the array directly
  }

  // PATCH /users/admin/seller-requests/:id
  // :id is the USER's _id (not a separate request id)
  reviewSellerRequest(
    userId: string,
    status: 'approved' | 'rejected',
    note?: string
  ): Observable<any> {
    return this.api
      .patch<{ success: boolean; data: any }>(
        `/users/admin/seller-requests/${userId}`,
        { status, ...(note ? { note } : {}) }
      )
      .pipe(map(res => res.data));
  }
}