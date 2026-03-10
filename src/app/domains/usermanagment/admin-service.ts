import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = inject(ApiService);
  private readonly endpoint = '/users';

  getUsers(): Observable<any> {
    return this.api.get<any>(this.endpoint);
  }

  getUserById(id: string): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/admin/${id}`);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.api.put(`${this.endpoint}/admin/${id}`, userData);
  }

  softDeleteUser(id: string): Observable<any> {
    return this.api.delete(`${this.endpoint}/admin/${id}`);
  }

  toggleBan(id: string, isRestricted: boolean): Observable<any> {
    return this.api.patch(`${this.endpoint}/admin/${id}/restriction`, { isRestricted });
  }

  grantLoyaltyPoints(id: string, points: number): Observable<any> {
    return this.api.patch(`${this.endpoint}/admin/${id}/loyalty`, { points });
  }

  updateUserRole(id: string, role: string): Observable<any> {
  return this.api.put(`${this.endpoint}/admin/${id}/role`, { role });
}
}
