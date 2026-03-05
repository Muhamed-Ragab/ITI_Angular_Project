export interface UeserProfileDto {
    id: string;
    name: string;
    email: string;
    phone: string;
    wallet_balance: number;
    loyalty_points: number;
    referral_code?: string;
    marketing_preferences?: {
    push_notifications: boolean;
    email_newsletter: boolean;
    promotional_notifications: boolean;
  };
  preferred_language?: string;
  role: 'customer' | 'seller' | 'admin';
}
