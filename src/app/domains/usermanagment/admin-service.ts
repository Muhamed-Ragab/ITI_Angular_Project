import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '@app/core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);
  private readonly endpoint = '/users';

  // جلب كل المستخدمين
  getUsers(params: any): Observable<any> {
    return this.api.get<any>(this.endpoint, params);
  }

  // جلب مستخدم واحد
  getUserById(id: string): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/admin/${id}`);
  }

  // تحديث بيانات مستخدم
  updateUser(id: string, userData: any): Observable<any> {
    return this.api.put(`${this.endpoint}/admin/${id}`, userData);
  }

  // حذف مستخدم (Soft Delete)
  softDeleteUser(id: string): Observable<any> {
    return this.api.delete(`${this.endpoint}/admin/${id}`);
  }

  // حظر أو إلغاء حظر
  toggleBan(id: string, isRestricted: boolean): Observable<any> {
    return this.api.patch(`${this.endpoint}/admin/${id}/restriction`, { isRestricted });
  }

  // منح نقاط ولاء
  grantLoyaltyPoints(id: string, points: number): Observable<any> {
    return this.api.patch(`${this.endpoint}/admin/${id}/loyalty`, { points });
  }
}