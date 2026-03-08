
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  wallet_balance: number;
  loyalty_points: number;
  referral_code?: string;
  marketing_preferences?: MarketingPreferences;
  preferred_language?: string;
  role: UserRole;
}
export type UserRole = 'customer' | 'seller' | 'admin';

export interface MarketingPreferences {
  push_notifications: boolean;
  email_newsletter: boolean;
  promotional_notifications: boolean;
}



export interface PaymentMethod {
  id: string;
  provider: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  isDefault: boolean;
}

export interface AddPaymentMethodRequest {
  provider: string;
  provider_token: string;
  brand: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
}


export interface ReferralSummary {
  referralCode: string;
  referralsCount: number;
  totalPointsEarned: number;
}



export interface SellerOnboardingRequest {
  store_name: string;
  bio: string;
  payout_method: 'bank_transfer' | 'stripe' | 'paypal';
}

export interface SellerOnboardingResponse {
  status: 'pending' | 'approved' | 'rejected';
  store_name: string;
}


export interface PayoutRequest {
  amount: number;
  note?: string;
}

export interface PayoutResponse {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}