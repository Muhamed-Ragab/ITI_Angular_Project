import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GuestWishlistService } from './guest-wishlist.service';

describe('GuestWishlistService - Comprehensive Unit Tests', () => {
  let service: GuestWishlistService;

  const clearLocalStorage = (): void => {
    localStorage.clear();
  };

  beforeEach(() => {
    clearLocalStorage();
    service = new GuestWishlistService();
  });

  afterEach(() => {
    clearLocalStorage();
  });

  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - addToWishlist()', () => {
    it('should add product to wishlist', () => {
      const productId = 'product-123';
      service.addToWishlist(productId);
      expect(service.isInWishlist(productId)).toBe(true);
      expect(service.getItemCount()).toBe(1);
    });

    it('should add multiple products to wishlist', () => {
      service.addToWishlist('product-1');
      service.addToWishlist('product-2');
      service.addToWishlist('product-3');
      expect(service.getItemCount()).toBe(3);
      expect(service.isInWishlist('product-1')).toBe(true);
      expect(service.isInWishlist('product-2')).toBe(true);
      expect(service.isInWishlist('product-3')).toBe(true);
    });

    it('should persist to localStorage', () => {
      service.addToWishlist('product-123');
      const stored = localStorage.getItem('guest_wishlist');
      expect(stored).toBe(JSON.stringify(['product-123']));
    });
  });

  describe('Happy Path - removeFromWishlist()', () => {
    it('should remove product from wishlist', () => {
      service.addToWishlist('product-1');
      service.addToWishlist('product-2');
      service.removeFromWishlist('product-1');
      expect(service.isInWishlist('product-1')).toBe(false);
      expect(service.isInWishlist('product-2')).toBe(true);
      expect(service.getItemCount()).toBe(1);
    });

    it('should handle removing non-existent product', () => {
      service.addToWishlist('product-1');
      expect(() => service.removeFromWishlist('non-existent')).not.toThrow();
      expect(service.getItemCount()).toBe(1);
    });
  });

  describe('Happy Path - isInWishlist()', () => {
    it('should return true for product in wishlist', () => {
      service.addToWishlist('product-123');
      expect(service.isInWishlist('product-123')).toBe(true);
    });

    it('should return false for product not in wishlist', () => {
      expect(service.isInWishlist('product-123')).toBe(false);
    });
  });

  describe('Happy Path - getWishlistItems()', () => {
    it('should return all wishlist items', () => {
      service.addToWishlist('product-1');
      service.addToWishlist('product-2');
      expect(service.getWishlistItems()).toEqual(['product-1', 'product-2']);
    });

    it('should return empty array for empty wishlist', () => {
      expect(service.getWishlistItems()).toEqual([]);
    });
  });

  describe('Happy Path - getItemCount()', () => {
    it('should return correct count', () => {
      service.addToWishlist('product-1');
      service.addToWishlist('product-2');
      service.addToWishlist('product-3');
      expect(service.getItemCount()).toBe(3);
    });

    it('should return 0 for empty wishlist', () => {
      expect(service.getItemCount()).toBe(0);
    });
  });

  describe('Happy Path - clearWishlist()', () => {
    it('should clear all items', () => {
      service.addToWishlist('product-1');
      service.addToWishlist('product-2');
      service.clearWishlist();
      expect(service.getItemCount()).toBe(0);
      expect(service.getWishlistItems()).toEqual([]);
    });

    it('should clear localStorage', () => {
      service.addToWishlist('product-1');
      service.clearWishlist();
      expect(localStorage.getItem('guest_wishlist')).toBeNull();
    });
  });

  // ============================================
  // NULL/EMPTY INPUT TESTS
  // ============================================

  describe('Null/Empty Input Tests', () => {
    it('should handle empty string product ID', () => {
      service.addToWishlist('');
      expect(service.isInWishlist('')).toBe(true);
      expect(service.getItemCount()).toBe(1);
    });

    it('should handle duplicate add', () => {
      service.addToWishlist('product-1');
      service.addToWishlist('product-1');
      expect(service.getItemCount()).toBe(1);
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe('Error Handling Tests', () => {
    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('guest_wishlist', 'not-valid-json');
      const newService = new GuestWishlistService();
      expect(() => newService.getItemCount()).not.toThrow();
      expect(newService.getItemCount()).toBe(0);
    });

    it('should handle non-array localStorage data', () => {
      localStorage.setItem('guest_wishlist', JSON.stringify({ product: '123' }));
      const newService = new GuestWishlistService();
      expect(() => newService.getItemCount()).not.toThrow();
      expect(newService.getItemCount()).toBe(0);
    });
  });

  // ============================================
  // EDGE CASES - Large Data
  // ============================================

  describe('Edge Cases - Large Data', () => {
    it('should handle 1000 products', () => {
      for (let i = 0; i < 1000; i++) {
        service.addToWishlist(`product-${i}`);
      }
      expect(service.getItemCount()).toBe(1000);
    });

    it('should handle very long product ID', () => {
      const longId = 'a'.repeat(10000);
      service.addToWishlist(longId);
      expect(service.isInWishlist(longId)).toBe(true);
    });
  });

  // ============================================
  // CONCURRENCY TESTS
  // ============================================

  describe('Concurrency Edge Cases', () => {
    it('should handle rapid add operations', () => {
      for (let i = 0; i < 100; i++) {
        service.addToWishlist(`product-${i}`);
      }
      expect(service.getItemCount()).toBe(100);
    });

    it('should handle rapid remove operations', () => {
      for (let i = 0; i < 50; i++) {
        service.addToWishlist(`product-${i}`);
      }
      for (let i = 0; i < 50; i++) {
        service.removeFromWishlist(`product-${i}`);
      }
      expect(service.getItemCount()).toBe(0);
    });
  });

  // ============================================
  // SIGNAL TESTS
  // ============================================

  describe('Signal Tests', () => {
    it('should update signal when items change', () => {
      service.addToWishlist('product-1');
      expect(service.wishlistItems().length).toBe(1);
    });

    it('should reflect changes in signal after operations', () => {
      service.addToWishlist('p1');
      expect(service.wishlistItems()).toContain('p1');
      service.removeFromWishlist('p1');
      expect(service.wishlistItems()).not.toContain('p1');
      service.clearWishlist();
      expect(service.wishlistItems().length).toBe(0);
    });
  });

  // ============================================
  // PERSISTENCE TESTS
  // ============================================

  describe('Persistence Tests', () => {
    it('should load wishlist from localStorage on initialization', () => {
      localStorage.setItem('guest_wishlist', JSON.stringify(['existing-1', 'existing-2']));
      const newService = new GuestWishlistService();
      expect(newService.getItemCount()).toBe(2);
      expect(newService.isInWishlist('existing-1')).toBe(true);
      expect(newService.isInWishlist('existing-2')).toBe(true);
    });
  });
});
