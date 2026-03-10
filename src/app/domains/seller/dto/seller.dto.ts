// ─── Products ─────────────────────────────────────────────────────────────────

export interface SellerProduct {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id?: { _id?: string; id?: string; name: string } | string;
  images: string[];
  average_rating?: number;
  ratings_count?: number;
  is_active?: boolean;
  seller_id?: string;
}

export interface SellerProductListResponse {
  success: boolean;
  data: {
    products: SellerProduct[];
    pagination: SellerPagination;
  };
}

export interface SellerPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SellerCreateProductDto {
  title: string;
  description: string;
  price: number;
  category_id: string;
  stock_quantity: number;
  images?: string[];
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
  product?: string;
  product_id?: { _id?: string; title?: string; images?: string[] };
  seller_id?: string;
  title: string;
  price: number;
  quantity: number;
  images?: string[];
}

export interface SellerOrder {
  _id: string;
  status: string;
  items: SellerOrderItem[];
  total_amount: number;       // ← backend uses total_amount (not total_price)
  total_price?: number;       // fallback alias
  createdAt: string;
  shipping_address?: {
    street?: string;
    city?: string;
    country?: string;
    zip?: string;
  };
}

// ─── FIXED: backend wraps orders in data.orders, not data directly ─────────
export interface SellerOrdersResponse {
  success: boolean;
  data: {
    orders: SellerOrder[];
    pagination: SellerPagination;
  };
  message?: string;
}

export type SellerUpdateStatus = 'shipped' | 'delivered' | 'cancelled';

// ─── Payouts ──────────────────────────────────────────────────────────────────

export interface SellerPayoutItem {
  _id?: string;
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
  sort?: string;
}