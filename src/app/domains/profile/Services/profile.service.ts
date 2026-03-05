import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';
import { UeserProfileDto } from '../dto/ueser-profile.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private api=inject(ApiService)

  getUserProfile(): Observable<UeserProfileDto> {
    return this.api
      .get<{ success: boolean; data: UeserProfileDto }>('/users/profile')
      .pipe(map(res => res.data));
  }
  updateProfile(data: { name: string; phone: string }): Observable<UeserProfileDto> {
    return this.api
      .put<{ success: boolean; data: UeserProfileDto }>('/users/profile', data)
      .pipe(map(res => res.data));
  }
}
