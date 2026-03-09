export interface SellerProfile {
  store_name: string;
  bio: string;
  payout_method: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_note: string;
}


export interface SellerRequestUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  seller_profile: SellerProfile;
}