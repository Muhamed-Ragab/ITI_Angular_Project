export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductSeller {
  id: string;
  store_name: string;
  bio?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  images: string[];
  average_rating: number;
  ratings_count: number;
  seller: ProductSeller;
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
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sellerId?: string;
  inStock?: string;
  minRatingCount?: number;
  sort?: string;
}

export interface ProductListResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: ProductPagination;
  };
}
export interface ReviewUser {
  name: string;
  verified_purchase: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: ReviewUser;
  createdAt: string;
}
export interface ProductDetail extends Product {
  // ProductDetail has everything Product has, plus:
  reviews: Review[];
  // seller.bio is already optional in ProductSeller ✅
}

export interface ProductDetailResponse {
  success: boolean;
  data: ProductDetail;
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment: string;
}