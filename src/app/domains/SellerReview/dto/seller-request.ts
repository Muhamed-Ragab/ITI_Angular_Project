// Actual API response shape from GET /users/admin/seller-requests
// data is a direct array of full user objects (not data.requests)

export interface SellerProfile {
  store_name: string;
  bio?: string;
  payout_method: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_note?: string;
  requested_at?: string;
  reviewed_at?: string | null;
  payout_requests?: any[];
}

export interface SellerRequestUser {
  _id: string;           // user id — used for PATCH /users/admin/seller-requests/:id
  name: string;
  email: string;
  phone?: string;
  role: string;
  seller_profile: SellerProfile;
}

export interface SellerRequestsResponse {
  success: boolean;
  data: SellerRequestUser[];   // direct array, NOT { requests: [] }
  message?: string;
}