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

// ─── Product (as returned by GET /products list) ──────────────────────────────

export interface AdminProduct {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;           // best-sellers uses "title"
  description: string;
  price: number;
  category?: AdminProductCategory;
  category_id?: AdminProductCategory;
  stock?: number;
  stock_quantity?: number;
  images: string[];
  average_rating: number;
  ratings_count: number;
  seller?: AdminProductSeller;
  seller_id?: AdminProductSeller;
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

// ─── Single product response ──────────────────────────────────────────────────

export interface AdminProductDetailResponse {
  success: boolean;
  data: AdminProduct;
}

// ─── Action response ──────────────────────────────────────────────────────────

export interface AdminProductActionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    seller_id?: string;
  };
}

// ─── Seller (from GET /users?role=seller) ────────────────────────────────────

export interface SellerUser {
  id: string;
  name: string;
  email: string;
}

export interface SellerListResponse {
  success: boolean;
  data: {
    users: SellerUser[];
    pagination: AdminProductPagination;
  };
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface AdminCreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;   // category _id
  stock: number;
  seller: string;     // seller user _id
  images: string[];
}

export interface AdminUpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface AdminProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;   // ← was: category?: string
  sellerId?: string;
  inStock?: boolean;
  sort?: string;
}