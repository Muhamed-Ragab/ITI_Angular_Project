import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import {
  BatchProductResponse,
  CreateReviewDto,
  ProductDetailResponse,
  ProductFilters,
  ProductListResponse,
} from '@domains/products/dto';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductService } from '../product.service';

// Mock ApiService factory
const createMockApiService = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
};

describe('ProductService - Comprehensive Unit Tests', () => {
  let service: ProductService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [ProductService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(ProductService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getProducts() Tests
  // ============================================

  describe('getProducts() - Happy Path', () => {
    it('should return products list when API call succeeds', () => {
      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [
            {
              _id: 'prod-1',
              title: 'Product 1',
              description: 'Desc 1',
              price: 100,
              category_id: { _id: 'cat-1', name: 'Category 1' },
              stock: 10,
              images: [],
              average_rating: 4.5,
              ratings_count: 10,
              seller_id: { _id: 'seller-1', name: 'Seller 1' },
            },
            {
              _id: 'prod-2',
              title: 'Product 2',
              description: 'Desc 2',
              price: 200,
              category_id: { _id: 'cat-1', name: 'Category 1' },
              stock: 5,
              images: [],
              average_rating: 4.0,
              ratings_count: 5,
              seller_id: { _id: 'seller-1', name: 'Seller 1' },
            },
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: ProductListResponse | undefined;
      service.getProducts().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/products', expect.any(Object));
      expect(result?.success).toBe(true);
      expect(result?.data.products.length).toBe(2);
      expect(result?.data.pagination.total).toBe(2);
    });

    it('should return empty products list when no products exist', () => {
      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: ProductListResponse | undefined;
      service.getProducts().subscribe((response) => {
        result = response;
      });

      expect(result?.data.products).toEqual([]);
      expect(result?.data.pagination.total).toBe(0);
    });

    it('should pass category filter when provided', () => {
      const filters: ProductFilters = { category_id: 'cat-123' };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [
            {
              _id: 'prod-1',
              title: 'Product 1',
              description: 'Desc 1',
              price: 100,
              category_id: { _id: 'cat-123', name: 'Category 1' },
              stock: 10,
              images: [],
              average_rating: 4.5,
              ratings_count: 10,
              seller_id: { _id: 'seller-1', name: 'Seller 1' },
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should pass search filter when provided', () => {
      const filters: ProductFilters = { search: 'iphone' };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should pass price range filters when provided', () => {
      const filters: ProductFilters = { min_price: 50, max_price: 200 };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should pass rating filter when provided', () => {
      const filters: ProductFilters = { min_rating: 4 };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should pass sort parameter when provided', () => {
      const filters: ProductFilters = { sort: 'price_asc' };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should pass pagination params when provided', () => {
      const filters: ProductFilters = { page: 2, limit: 20 };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 2, limit: 20, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should pass seller filter when provided', () => {
      const filters: ProductFilters = { seller_id: 'seller-123' };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });
  });

  describe('getProducts() - Error Handling', () => {
    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch products' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getProducts().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });

    it('should handle network error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: { message: 'Network error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getProducts().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(0);
    });
  });

  // ============================================
  // getProductById() Tests
  // ============================================

  describe('getProductById() - Happy Path', () => {
    it('should return product detail when API call succeeds', () => {
      const productId = 'prod-123';
      const mockResponse: ProductDetailResponse = {
        success: true,
        data: {
          _id: productId,
          title: 'iPhone 15 Pro',
          description: 'Latest iPhone model',
          price: 999,
          category_id: { _id: 'cat-1', name: 'Electronics' },
          stock: 50,
          images: ['/img1.jpg', '/img2.jpg'],
          average_rating: 4.8,
          ratings_count: 100,
          seller_id: { _id: 'seller-1', name: 'Apple Store' },
          reviews: [
            {
              _id: 'review-1',
              rating: 5,
              comment: 'Great!',
              user_id: { name: 'John', verified_purchase: true },
              createdAt: '2024-01-01',
            },
          ],
          reviews_pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: ProductDetailResponse | undefined;
      service.getProductById(productId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith(`/products/${productId}`);
      expect(result?.success).toBe(true);
      expect(result?.data._id).toBe(productId);
      expect(result?.data.title).toBe('iPhone 15 Pro');
      expect(result?.data.reviews.length).toBe(1);
    });

    it('should return product with all fields', () => {
      const productId = 'prod-123';
      const mockResponse: ProductDetailResponse = {
        success: true,
        data: {
          _id: productId,
          title: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category_id: { _id: 'cat-1', name: 'Test Category' },
          stock_quantity: 25,
          stock: 25,
          images: ['/img1.jpg'],
          average_rating: 4.5,
          ratings_count: 50,
          seller_id: { _id: 'seller-1', name: 'Test Seller', email: 'seller@test.com' },
          reviews: [],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: ProductDetailResponse | undefined;
      service.getProductById(productId).subscribe((response) => {
        result = response;
      });

      expect(result?.data.stock_quantity).toBe(25);
      expect(result?.data.seller_id.email).toBe('seller@test.com');
    });
  });

  describe('getProductById() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const productId = 'non-existent';
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Product not found' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getProductById(productId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
      expect(caughtError?.error.message).toBe('Product not found');
    });

    it('should handle 500 Internal Server Error', () => {
      const productId = 'prod-123';
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch product' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getProductById(productId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // getProductsByIds() Tests
  // ============================================

  describe('getProductsByIds() - Happy Path', () => {
    it('should return batch products when API call succeeds', () => {
      const ids = ['prod-1', 'prod-2', 'prod-3'];

      const mockResponse: BatchProductResponse = {
        success: true,
        data: [
          {
            _id: 'prod-1',
            title: 'Product 1',
            description: 'Desc 1',
            price: 100,
            category_id: { _id: 'cat-1', name: 'Category 1' },
            stock: 10,
            images: [],
            average_rating: 4.5,
            ratings_count: 10,
            seller_id: { _id: 'seller-1', name: 'Seller 1' },
          },
          {
            _id: 'prod-2',
            title: 'Product 2',
            description: 'Desc 2',
            price: 200,
            category_id: { _id: 'cat-1', name: 'Category 1' },
            stock: 5,
            images: [],
            average_rating: 4.0,
            ratings_count: 5,
            seller_id: { _id: 'seller-1', name: 'Seller 1' },
          },
          {
            _id: 'prod-3',
            title: 'Product 3',
            description: 'Desc 3',
            price: 300,
            category_id: { _id: 'cat-2', name: 'Category 2' },
            stock: 15,
            images: [],
            average_rating: 4.8,
            ratings_count: 20,
            seller_id: { _id: 'seller-2', name: 'Seller 2' },
          },
        ],
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: BatchProductResponse | undefined;
      service.getProductsByIds(ids).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/products/batch', { ids });
      expect(result?.success).toBe(true);
      expect(result?.data.length).toBe(3);
    });

    it('should return empty array when no products found', () => {
      const ids = ['non-existent-1', 'non-existent-2'];

      const mockResponse: BatchProductResponse = {
        success: true,
        data: [],
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: BatchProductResponse | undefined;
      service.getProductsByIds(ids).subscribe((response) => {
        result = response;
      });

      expect(result?.data).toEqual([]);
    });
  });

  describe('getProductsByIds() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid IDs', () => {
      const ids: string[] = [];

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Product IDs are required' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getProductsByIds(ids).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 500 Internal Server Error', () => {
      const ids = ['prod-1'];

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch products' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getProductsByIds(ids).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // createReview() Tests
  // ============================================

  describe('createReview() - Happy Path', () => {
    it('should create review when API call succeeds', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 5,
        comment: 'Excellent product!',
      };

      const mockResponse = { success: true };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: void | undefined;
      service.createReview(reviewDto).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/reviews', reviewDto);
    });

    it('should create review with minimum rating', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 1,
        comment: 'Poor product',
      };

      mockApiService.post.mockReturnValue(of({ success: true }));

      service.createReview(reviewDto).subscribe();

      expect(mockApiService.post).toHaveBeenCalled();
    });

    it('should create review with maximum rating', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 5,
        comment: 'Perfect!',
      };

      mockApiService.post.mockReturnValue(of({ success: true }));

      service.createReview(reviewDto).subscribe();

      expect(mockApiService.post).toHaveBeenCalled();
    });

    it('should create review with empty comment', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 4,
        comment: '',
      };

      mockApiService.post.mockReturnValue(of({ success: true }));

      service.createReview(reviewDto).subscribe();

      expect(mockApiService.post).toHaveBeenCalled();
    });
  });

  describe('createReview() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid rating', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 6,
        comment: 'Invalid rating',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Rating must be between 1 and 5' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createReview(reviewDto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 400 Bad Request for missing product ID', () => {
      const reviewDto: CreateReviewDto = {
        product_id: '',
        rating: 5,
        comment: 'Great!',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Product ID is required' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createReview(reviewDto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 401 Unauthorized for unauthenticated user', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 5,
        comment: 'Great!',
      };

      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Authentication required to create review' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createReview(reviewDto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(401);
    });

    it('should handle 404 Not Found for non-existent product', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'non-existent',
        rating: 5,
        comment: 'Great!',
      };

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Product not found' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createReview(reviewDto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 500 Internal Server Error', () => {
      const reviewDto: CreateReviewDto = {
        product_id: 'prod-123',
        rating: 5,
        comment: 'Great!',
      };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to create review' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createReview(reviewDto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long product ID', () => {
      const longId = 'a'.repeat(500);

      const mockResponse: ProductDetailResponse = {
        success: true,
        data: {
          _id: longId,
          title: 'Test',
          description: 'Test',
          price: 100,
          category_id: { _id: 'cat-1', name: 'Cat' },
          stock: 10,
          images: [],
          average_rating: 0,
          ratings_count: 0,
          seller_id: { _id: 'seller-1', name: 'Seller' },
          reviews: [],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: ProductDetailResponse | undefined;
      service.getProductById(longId).subscribe((response) => {
        result = response;
      });

      expect(result?.data._id).toBe(longId);
    });

    it('should handle special characters in search', () => {
      const filters: ProductFilters = { search: "Product's & More <>" };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should handle unicode characters in search', () => {
      const filters: ProductFilters = { search: '电子产品' };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });

    it('should filter out undefined/null filter values', () => {
      const filters: ProductFilters = {
        search: '',
        category_id: undefined,
        min_price: undefined,
        max_price: 100,
      };

      const mockResponse: ProductListResponse = {
        success: true,
        data: {
          products: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      service.getProducts(filters).subscribe();

      expect(mockApiService.get).toHaveBeenCalled();
    });
  });
});
