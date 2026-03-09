import { SellerProfile } from '../../SellerReview/dto/seller-request';
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
  seller_profile: SellerProfile | null;
}
export type UserRole = 'customer' | 'seller' | 'admin';

export interface MarketingPreferences {
  push_notifications: boolean;
  email_newsletter: boolean;
  promotional_notifications: boolean;
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
  requested_at: string;      
  reviewed_at?: string | null;
}