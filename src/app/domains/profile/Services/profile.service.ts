import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map, Observable } from 'rxjs';
import { 
  UserProfile, 
  PaymentMethod, 
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

  // SELLER ONBOARDING
getAdminSellerRequests(status?: string, page: number = 1, limit: number = 50): Observable<any> {
  let url = `/users/admin/seller-requests?page=${page}&limit=${limit}`;
  
  if (status) {
    url += `&status=${status}`;
  }
  
  return this.api.get<any>(url);
}

requestSellerOnboarding(data: { store_name: string; bio: string; payout_method: string }): Observable<any> {
  return this.api.post<any>('/users/seller/onboarding', data);
}
  // PAYOUTS
  requestPayout(data: PayoutRequest): Observable<PayoutResponse> {
    return this.api
      .post<{ success: boolean; data: PayoutResponse }>('/users/seller/payouts', data)
      .pipe(map(res => res.data));
  }


  // REFERRALS

  getReferralSummary(): Observable<ReferralSummary> {
    return this.api
      .get<{ success: boolean; data: ReferralSummary }>('/users/referrals')
      .pipe(map(res => res.data));
  }

  // PAYMENT METHODS
  getPaymentMethods(): Observable<PaymentMethod[]> {
  return this.api
    .get<{ success: boolean; data: { methods: PaymentMethod[] } }>('/users/payment-methods')
    .pipe(map(res => res.data.methods));
}
  addPaymentMethod(data: any): Observable<PaymentMethod> {
    return this.api
      .post<{ success: boolean; data: PaymentMethod }>('/users/payment-methods', data)
      .pipe(map(res => res.data));
  }

  removePaymentMethod(methodId: string): Observable<boolean> {
    return this.api
      .delete<{ success: boolean }>(`/users/payment-methods/${methodId}`)
      .pipe(map(res => res.success));
  }

  setDefaultPaymentMethod(methodId: string): Observable<boolean> {
    return this.api
      .patch<{ success: boolean }>(`/users/payment-methods/${methodId}/default`, {})
      .pipe(map(res => res.success));
  }

}