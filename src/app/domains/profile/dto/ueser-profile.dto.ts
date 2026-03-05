import { CartItem } from "@app/domains/cart/dto";
import { WishlistApiItem } from "@app/domains/wishlist/dto";

export interface UeserProfileDto {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'seller' | 'admin';
  wallet_balance: number;
  loyalty_points: number;
  preferred_language: string;
  marketing_preferences: {
    push_notifications: boolean;
    email_newsletter: boolean;
    promotional_notifications: boolean;
  };
  referral_code?: string;
  referrals_count: number;
  referred_by: string | null;
  isEmailVerified: boolean;
  isRestricted: boolean;
  tokenVersion: number;
  cart: CartItem[];
  wishlist: WishlistApiItem[];
  saved_payment_methods: any[];
}