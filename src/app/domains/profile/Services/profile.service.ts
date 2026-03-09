import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';
import { 
  UserProfile,  
  PayoutRequest, 
  PayoutResponse, 
  ReferralSummary, 
} from '../dto/user-profile.dto';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private api = inject(ApiService);


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


  updateLanguage(lang: string): Observable<any> {
    return this.api
      .patch<{ success: boolean; data: any }>('/users/preferences/language', { language: lang })
      .pipe(map(res => res.data));
  }


  updateMarketing(prefs: { push_notifications: boolean; email_newsletter: boolean; promotional_notifications: boolean }): Observable<any> {
    return this.api
      .patch<{ success: boolean; data: any }>('/users/preferences/marketing', prefs)
      .pipe(map(res => res.data));
  }



requestSellerOnboarding(data: { store_name: string; bio: string; payout_method: string }): Observable<any> {
  return this.api.post<any>('/users/seller/onboarding', data);
}
  // PAYOUTS
  requestPayout(data: PayoutRequest): Observable<PayoutResponse[]> {
  return this.api
    .post<{ success: boolean; data: PayoutResponse[] }>('/users/seller/payouts', data)
    .pipe(map(res => res.data));  

  }
  // REFERRALS

  getReferralSummary(): Observable<ReferralSummary> {
    return this.api
      .get<{ success: boolean; data: ReferralSummary }>('/users/referrals')
      .pipe(map(res => res.data));
  }
  getSellerPayouts(): Observable<PayoutResponse[]> {
  return this.api
    .get<{ success: boolean; data: PayoutResponse[] }>('/users/seller/payouts')
    .pipe(map(res => res.data));
  }
}