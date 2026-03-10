// ─── Shared sub-shapes ────────────────────────────────────────────────────────

export interface AdminProductCategory {
  id?: string;
  _id?: string;
  name: string;
}

export interface AdminProductSeller {
  id?: string;
  _id?: string;
  name?: string;
  store_name?: string;
}

// ─── Product (as returned by GET /products) ───────────────────────────────────
// Backend uses: title, stock_quantity, category_id, seller_id

export interface AdminProduct {
  id?: string;
  _id?: string;
  title?: string;             // backend field name
  name?: string;              // fallback alias
  description: string;
  price: number;
  category_id?: AdminProductCategory;
  category?: AdminProductCategory;  // fallback alias
  stock_quantity?: number;    // backend field name
  stock?: number;             // fallback alias
  images: string[];
  average_rating: number;
  ratings_count: number;
  seller_id?: AdminProductSeller;
  seller?: AdminProductSeller;  // fallback alias
  is_active?: boolean;
}

// ─── List response ────────────────────────────────────────────────────────────

export interface AdminProductListResponse {
  success: boolean;
  data: {
    products: AdminProduct[];
    pagination: AdminProductPagination;
  };
}

export interface AdminProductPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── Single / action responses ────────────────────────────────────────────────

export interface AdminProductDetailResponse {
  success: boolean;
  data: AdminProduct;
}

export interface AdminProductActionResponse {
  success: boolean;
  message: string;
  data?: { id: string; title?: string; seller_id?: string };
}

// ─── Seller dropdown ──────────────────────────────────────────────────────────

export interface SellerUser {
  id: string;
  name: string;
  email: string;
}

// ─── Request DTOs — names match backend validation schema exactly ─────────────

export interface AdminUpdateProductDto {
  title?: string;           // backend: title
  description?: string;
  price?: number;
  category_id?: string;     // backend: category_id
  stock_quantity?: number;  // backend: stock_quantity
  images?: string[];
}

// ─── Filters — names match backend query schema exactly ──────────────────────

export interface AdminProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  seller_id?: string;
  in_stock?: boolean;       // backend: in_stock
  sort?: string;
}