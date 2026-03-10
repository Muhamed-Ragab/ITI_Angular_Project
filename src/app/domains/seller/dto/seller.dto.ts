// ─── Product ──────────────────────────────────────────────────────────────────

export interface SellerProduct {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id?: { _id?: string; id?: string; name: string };
  images: string[];
  average_rating?: number;
  ratings_count?: number;
  is_active?: boolean;
}

export interface SellerProductListResponse {
  success: boolean;
  data: {
    products: SellerProduct[];
    pagination: SellerPagination;
  };
}

export interface SellerProductDetailResponse {
  success: boolean;
  data: SellerProduct;
}

export interface SellerProductActionResponse {
  success: boolean;
  message: string;
  data?: { _id?: string; id?: string; title?: string };
}

// ─── Create / Update DTOs — field names match backend validation exactly ───────

export interface SellerCreateProductDto {
  title: string;           // min 3, max 100
  description: string;     // min 10, max 2000
  price: number;           // >= 0
  category_id: string;     // objectId
  stock_quantity: number;  // int >= 0
  images?: string[];       // array of URLs
}

export interface SellerUpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  category_id?: string;
  stock_quantity?: number;
  images?: string[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface SellerOrderItem {
  product_id?: { _id?: string; title?: string; images?: string[] };
  seller_id?: string;
  title: string;
  price: number;
  quantity: number;
  images?: string[];
}

export interface SellerOrder {
  _id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: SellerOrderItem[];
  total_price: number;
  createdAt: string;
  customer?: { name?: string; email?: string };
  shipping_address?: {
    street?: string;
    city?: string;
    country?: string;
  };
}

export interface SellerOrdersResponse {
  success: boolean;
  data: SellerOrder[];
}

// Seller can set: shipped | delivered | cancelled
export type SellerUpdateStatus = 'shipped' | 'delivered' | 'cancelled';

// ─── Payouts ──────────────────────────────────────────────────────────────────

export interface SellerPayoutRequest {
  _id?: string;
  id?: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  requested_at: string;
  reviewed_at?: string | null;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface SellerProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  sort?: string;
}

export interface SellerPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
