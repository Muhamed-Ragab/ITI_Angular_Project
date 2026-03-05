export interface ProductCategory {
  _id: string;
  name: string;
  slug?: string;
}

export interface ProductSeller {
  _id: string;
  name: string;
  email?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category_id: ProductCategory;
  stock: number;
  stock_quantity?: number;
  images: string[];
  average_rating: number;
  ratings_count: number;
  seller_id: ProductSeller;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  seller_id?: string;
  min_rating_count?: number;
  sort?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: ProductPagination;
  };
}

export interface BatchProductResponse {
  success: boolean;
  data: Product[];
}

export interface ReviewUser {
  _id?: string;
  name: string;
  email?: string;
  verified_purchase: boolean;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user_id: ReviewUser;
  createdAt: string;
  deletedAt?: string | null;
}

export interface ReviewsPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductDetail extends Product {
  reviews: Review[];
  reviews_pagination?: ReviewsPagination;
}

export interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
  message?: string;
}

export interface CreateReviewDto {
  product_id: string;
  rating: number;
  comment: string;
}
