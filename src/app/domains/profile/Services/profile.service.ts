import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';
import { UserProfile } from '../dto/user-profile.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private api=inject(ApiService)

  getUserProfile(): Observable<UserProfile> {
    return this.api
      .get<{ success: boolean; data: UserProfile }>('/users/profile')
      .pipe(map(res => res.data));
  }
  updateProfile(data: { name: string; phone: string }): Observable<UserProfile> {
    return this.api
      .put<{ success: boolean; data: UserProfile }>('/users/profile', data)
      .pipe(map(res => res.data));
  }
}
