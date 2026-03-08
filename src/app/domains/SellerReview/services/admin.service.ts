import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';
import { SellerRequestUser } from '../dto/seller-request';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private api = inject(ApiService);

  // GET SELLER REQUESTS
  getSellerRequests(): Observable<SellerRequestUser[]> {
    return this.api
      .get<{ success: boolean; data: SellerRequestUser[] }>('/users/admin/seller-requests')
      .pipe(map(res => res.data));
  }

  // REVIEW REQUEST
  reviewSellerRequest(
    id: string,
    status: 'approved' | 'rejected',
    note?: string
  ): Observable<any> {

    return this.api
      .patch<{ success: boolean; data: any }>(
        `/users/admin/seller-requests/${id}`,
        { status, note }
      )
      .pipe(map(res => res.data));
  }


  updateUserRole(userId: string, role: 'seller') {
  return this.api.put<{ success: boolean; data: any }>(
    `/users/admin/${userId}/role`,
    { role }
  );
}

}