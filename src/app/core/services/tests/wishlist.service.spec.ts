import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import {
  AddToWishlistDto,
  RemoveFromWishlistResponse,
  WishlistResponse,
} from '@domains/wishlist/dto';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WishlistService } from '../wishlist.service';

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

describe('WishlistService - Comprehensive Unit Tests', () => {
  let service: WishlistService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [WishlistService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(WishlistService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getWishlist() Tests
  // ============================================

  describe('getWishlist() - Happy Path', () => {
    it('should return wishlist when API call succeeds', () => {
      const mockResponse: WishlistResponse = {
        success: true,
        data: [
          { productId: 'prod-1', name: 'Product 1', price: 100, image: '/img1.jpg' },
          { productId: 'prod-2', name: 'Product 2', price: 200, image: '/img2.jpg' },
        ],
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.getWishlist().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/users/wishlist');
      expect(result?.success).toBe(true);
      expect(result?.data.length).toBe(2);
      expect(result?.data[0].name).toBe('Product 1');
    });

    it('should return empty wishlist when no items exist', () => {
      const mockResponse: WishlistResponse = {
        success: true,
        data: [],
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.getWishlist().subscribe((response) => {
        result = response;
      });

      expect(result?.data).toEqual([]);
    });

    it('should return wishlist with all fields', () => {
      const mockResponse: WishlistResponse = {
        success: true,
        data: [
          {
            productId: 'prod-1',
            _id: 'wishlist-item-1',
            name: 'Product 1',
            title: 'Product 1 Title',
            price: 99.99,
            image: '/img1.jpg',
            images: ['/img1.jpg', '/img2.jpg'],
            addedAt: '2024-01-01T00:00:00Z',
          },
        ],
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.getWishlist().subscribe((response) => {
        result = response;
      });

      expect(result?.data[0].title).toBe('Product 1 Title');
      expect(result?.data[0].images?.length).toBe(2);
    });
  });

  describe('getWishlist() - Error Handling', () => {
    it('should handle 401 Unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Authentication required' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getWishlist().subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(401);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to fetch wishlist' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getWishlist().subscribe({
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
      service.getWishlist().subscribe({
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
  // addToWishlist() Tests
  // ============================================

  describe('addToWishlist() - Happy Path', () => {
    it('should add product to wishlist when API call succeeds', () => {
      const dto: AddToWishlistDto = { productId: 'prod-123' };

      const mockResponse: WishlistResponse = {
        success: true,
        data: [{ productId: 'prod-123', name: 'Product 1', price: 100, image: '/img1.jpg' }],
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.addToWishlist(dto).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/users/wishlist', dto);
      expect(result?.success).toBe(true);
      expect(result?.data.length).toBe(1);
    });

    it('should add product and return updated wishlist', () => {
      const dto: AddToWishlistDto = { productId: 'prod-456' };

      const mockResponse: WishlistResponse = {
        success: true,
        data: [
          { productId: 'prod-123', name: 'Existing Product', price: 50, image: '/img0.jpg' },
          { productId: 'prod-456', name: 'New Product', price: 100, image: '/img1.jpg' },
        ],
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.addToWishlist(dto).subscribe((response) => {
        result = response;
      });

      expect(result?.data.length).toBe(2);
      expect(result?.data[1].productId).toBe('prod-456');
    });
  });

  describe('addToWishlist() - Error Handling', () => {
    it('should handle 400 Bad Request for invalid product ID', () => {
      const dto: AddToWishlistDto = { productId: '' };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Product ID is required' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.addToWishlist(dto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 404 Not Found for non-existent product', () => {
      const dto: AddToWishlistDto = { productId: 'non-existent' };

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Product not found' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.addToWishlist(dto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 409 Conflict for duplicate product', () => {
      const dto: AddToWishlistDto = { productId: 'prod-123' };

      const errorResponse = new HttpErrorResponse({
        status: 409,
        statusText: 'Conflict',
        error: { message: 'Product already in wishlist' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.addToWishlist(dto).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(409);
      expect(caughtError?.error.message).toBe('Product already in wishlist');
    });

    it('should handle 500 Internal Server Error', () => {
      const dto: AddToWishlistDto = { productId: 'prod-123' };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to add to wishlist' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.addToWishlist(dto).subscribe({
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
  // removeFromWishlist() Tests
  // ============================================

  describe('removeFromWishlist() - Happy Path', () => {
    it('should remove product from wishlist when API call succeeds', () => {
      const productId = 'prod-123';

      const mockResponse: RemoveFromWishlistResponse = {
        success: true,
        message: 'Product removed from wishlist',
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: RemoveFromWishlistResponse | undefined;
      service.removeFromWishlist(productId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.delete).toHaveBeenCalledWith(`/users/wishlist/${productId}`);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Product removed from wishlist');
    });

    it('should remove product and return remaining wishlist', () => {
      const productId = 'prod-1';

      const mockResponse: RemoveFromWishlistResponse = {
        success: true,
        message: 'Product removed from wishlist',
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: RemoveFromWishlistResponse | undefined;
      service.removeFromWishlist(productId).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });
  });

  describe('removeFromWishlist() - Error Handling', () => {
    it('should handle 404 Not Found when product not in wishlist', () => {
      const productId = 'non-existent';

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Product not found in wishlist' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.removeFromWishlist(productId).subscribe({
        next: () => {
          throw new Error('should have thrown an error');
        },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
      expect(caughtError?.error.message).toBe('Product not found in wishlist');
    });

    it('should handle 500 Internal Server Error', () => {
      const productId = 'prod-123';

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to remove from wishlist' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.removeFromWishlist(productId).subscribe({
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

      const mockResponse: WishlistResponse = {
        success: true,
        data: [],
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      service.removeFromWishlist(longId).subscribe();

      expect(mockApiService.delete).toHaveBeenCalledWith(`/users/wishlist/${longId}`);
    });

    it('should handle wishlist with mixed product ID formats', () => {
      const mockResponse: WishlistResponse = {
        success: true,
        data: [
          { productId: 'prod-1', name: 'Product 1', price: 100, image: '/img1.jpg' },
          {
            _id: 'item-2',
            product_id: 'prod-2',
            name: 'Product 2',
            price: 200,
            image: '/img2.jpg',
          },
          { id: 'item-3', productId: 'prod-3', name: 'Product 3', price: 300, image: '/img3.jpg' },
        ],
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.getWishlist().subscribe((response) => {
        result = response;
      });

      expect(result?.data.length).toBe(3);
    });

    it('should handle special characters in product names', () => {
      const mockResponse: WishlistResponse = {
        success: true,
        data: [
          { productId: 'prod-1', name: "Product's & More <Tag>", price: 100, image: '/img1.jpg' },
        ],
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.getWishlist().subscribe((response) => {
        result = response;
      });

      expect(result?.data[0].name).toBe("Product's & More <Tag>");
    });

    it('should handle unicode characters in product names', () => {
      const mockResponse: WishlistResponse = {
        success: true,
        data: [{ productId: 'prod-1', name: '电子产品', price: 100, image: '/img1.jpg' }],
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: WishlistResponse | undefined;
      service.getWishlist().subscribe((response) => {
        result = response;
      });

      expect(result?.data[0].name).toBe('电子产品');
    });
  });
});
