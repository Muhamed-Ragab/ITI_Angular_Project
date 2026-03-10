import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Adminpayoutservicereview {
    private api = inject(ApiService);

    getAllSellers(): Observable<any[]> {
    return this.api.get<{ success: boolean; data: any[] }>('/users?role=seller')
      .pipe(map(res => res.data));
  }

  reviewPayout(userId: string, payoutId: string, body: { status: string, note: string }) {
    console.log('Sending to Backend:', { userId, payoutId, body }); // أضف هذا السطر
    return this.api.patch(`/users/admin/seller-payouts/${userId}/${payoutId}`, body);
  }
}
